import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { parseGeo } from "@/lib/collect/enrich";
import { FREE_PLAN_REVIEW_LIMIT, type ReviewTemplateId } from "@/lib/mock-data";

/**
 * Soumission d'un avis depuis le widget.
 *
 * Route publique, non authentifiée : elle utilise donc la clé service_role et
 * doit valider elle-même tout ce que RLS garantirait normalement.
 */

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

type Payload = {
  k?: string; // clé publique
  name?: string;
  email?: string;
  comment?: string;
  rating?: number;
  thumbsUp?: boolean;
  nps?: number;
  url?: string;
  hp?: string; // honeypot — doit rester vide
};

function clean(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, max) : null;
}

/**
 * Vérifie que la charge utile correspond bien au template du site.
 * Sans ça, un client malveillant pourrait envoyer une note 5 étoiles à un
 * site configuré en pouce, et la contrainte SQL rejetterait l'insertion
 * avec une erreur peu parlante.
 */
function buildReviewFields(templateId: ReviewTemplateId, body: Payload) {
  const comment = clean(body.comment, 2000);

  switch (templateId) {
    case "star_rating":
    case "star_comment": {
      const rating = Math.round(Number(body.rating));
      if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
        return { error: "A rating between 1 and 5 is required." };
      }
      return {
        fields: {
          rating,
          comment: templateId === "star_comment" ? comment : null,
        },
      };
    }

    case "thumbs": {
      if (typeof body.thumbsUp !== "boolean") {
        return { error: "A thumbs up or down is required." };
      }
      return { fields: { thumbs_up: body.thumbsUp, comment } };
    }

    case "nps": {
      const nps = Math.round(Number(body.nps));
      if (!Number.isFinite(nps) || nps < 0 || nps > 10) {
        return { error: "A score between 0 and 10 is required." };
      }
      return { fields: { nps_score: nps, comment } };
    }

    case "testimonial": {
      if (!comment) return { error: "Please write a few words." };
      return { fields: { comment } };
    }

    default:
      return { error: "Unsupported template." };
  }
}

export async function POST(request: NextRequest) {
  let body: Payload;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400, headers: CORS });
  }

  // Honeypot : champ invisible pour un humain, rempli par la plupart des bots.
  if (body.hp) {
    // On répond 204 plutôt qu'une erreur : inutile d'informer le bot.
    return new NextResponse(null, { status: 204, headers: CORS });
  }

  const publicKey = body.k;
  if (!publicKey || !/^wz_[a-z0-9]{6,32}$/i.test(publicKey)) {
    return NextResponse.json({ error: "invalid_key" }, { status: 400, headers: CORS });
  }

  const supabase = createAdminClient();

  const { data: site } = await supabase
    .from("sites")
    .select("id, user_id, domain, mode, template_id")
    .eq("public_key", publicKey)
    .is("archived_at", null)
    .maybeSingle();

  if (!site) {
    return NextResponse.json({ error: "not_found" }, { status: 404, headers: CORS });
  }

  if (site.mode !== "reviews" || !site.template_id) {
    return NextResponse.json(
      { error: "reviews_disabled" },
      { status: 409, headers: CORS },
    );
  }

  const built = buildReviewFields(site.template_id as ReviewTemplateId, body);
  if ("error" in built) {
    return NextResponse.json({ error: built.error }, { status: 400, headers: CORS });
  }

  // --- Quota du plan -------------------------------------------------------
  // La FAQ promet que les avis ne sont jamais perdus au-delà de la limite :
  // on enregistre donc l'avis, mais il reste en attente jusqu'à l'upgrade.
  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", site.user_id)
    .maybeSingle();

  let overQuota = false;
  if ((profile?.plan ?? "free") === "free") {
    const { count } = await supabase
      .from("reviews")
      .select("id", { count: "exact", head: true })
      .eq("site_id", site.id);

    overQuota = (count ?? 0) >= FREE_PLAN_REVIEW_LIMIT;
  }

  const { country, city } = parseGeo(request.headers);

  const { error } = await supabase.from("reviews").insert({
    site_id: site.id,
    template_id: site.template_id,
    // Modération manuelle par défaut : rien n'apparaît sur le site du client
    // sans une action explicite de sa part.
    status: "pending",
    author_name: clean(body.name, 80),
    author_email: clean(body.email, 160),
    country,
    city,
    source_url: clean(body.url, 500),
    ...built.fields,
  });

  if (error) {
    console.error("[submit]", error.message);
    return NextResponse.json({ error: "insert_failed" }, { status: 500, headers: CORS });
  }

  return NextResponse.json({ ok: true, queued: overQuota }, { headers: CORS });
}

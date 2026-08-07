import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Configuration publique d'un site, lue par w.js au chargement.
 *
 * Un seul aller-retour : mode, réglages du widget et (plus tard) avis publiés.
 * Appelée depuis n'importe quel domaine → CORS ouvert, mais la réponse ne
 * contient que des données déjà publiques par nature.
 */

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ key: string }> },
) {
  const { key } = await params;

  if (!key || !/^wz_[a-z0-9]{6,32}$/i.test(key)) {
    return NextResponse.json({ error: "invalid_key" }, { status: 400, headers: CORS });
  }

  const supabase = createAdminClient();

  // Service role : RLS est contournée, donc on filtre explicitement —
  // par la clé publique, et uniquement sur les sites non archivés.
  const { data: site, error } = await supabase
    .from("sites")
    .select("id, mode, domain, template_id, template_config, widget_config")
    .eq("public_key", key)
    .is("archived_at", null)
    .maybeSingle();

  if (error || !site) {
    return NextResponse.json({ error: "not_found" }, { status: 404, headers: CORS });
  }

  // Avis à afficher sur le site du client.
  //
  // ⚠️ Filtre `status = published` : les avis en attente ou masqués ne quittent
  // jamais la base. C'est ce qui donne son sens à la modération.
  // author_email n'est jamais exposé.
  let reviews: unknown[] = [];

  if (site.mode === "reviews") {
    const { data } = await supabase
      .from("reviews")
      .select("id, author_name, comment, rating, thumbs_up, nps_score, city, country, created_at")
      .eq("site_id", site.id)
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(24);

    reviews = (data ?? []).map((review) => ({
      id: review.id,
      name: review.author_name?.trim() || "Anonymous",
      comment: review.comment,
      rating: review.rating,
      thumbsUp: review.thumbs_up,
      nps: review.nps_score,
      city: review.city,
      country: review.country,
      date: review.created_at,
    }));
  }

  return NextResponse.json(
    {
      siteId: site.id,
      mode: site.mode,
      // En mode analytics_only, aucune information de template n'est exposée :
      // le widget n'a alors aucune interface à construire.
      template: site.mode === "reviews" ? site.template_id : null,
      templateConfig: site.mode === "reviews" ? site.template_config : null,
      widget: site.widget_config,
      reviews,
    },
    {
      headers: {
        ...CORS,
        // Compromis entre coût de service et fraîcheur.
        //
        // Cette réponse contient les avis publiés : après une modération, le
        // client doit voir le changement sur son site en moins d'une minute.
        // Un stale-while-revalidate long (300 s) rendait la boucle
        // « publier → vérifier » incompréhensible pendant 5 minutes.
        //
        // 30 s de fraîcheur + 30 s de tolérance : le CDN absorbe toujours
        // l'essentiel du trafic, sans donner l'impression d'un bug.
        "Cache-Control": "public, max-age=30, stale-while-revalidate=30",
      },
    },
  );
}

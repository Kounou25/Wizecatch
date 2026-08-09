import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  parseDevice,
  parseOs,
  parseBrowser,
  parseSource,
  parseGeo,
  computeVisitorHash,
} from "@/lib/collect/enrich";

/**
 * Ingestion des visites.
 *
 * Deux événements, un seul point d'entrée :
 *   - "start" : début de visite → crée la ligne de session
 *   - "end"   : pagehide       → complète durée et nombre de pages
 *
 * L'id de session est généré par le widget, ce qui permet un upsert et évite
 * toute logique de rapprochement côté serveur.
 */

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Bornes de sécurité : une session ne peut pas durer plus de 6 heures. */
const MAX_DURATION_SECONDS = 6 * 60 * 60;
const MAX_PAGEVIEWS = 500;

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function POST(request: NextRequest) {
  let body: {
    k?: string; // clé publique du site
    s?: string; // id de session
    e?: string; // "start" | "page" | "end"
    p?: string; // chemin
    r?: string; // referrer
    d?: number; // durée en secondes
    v?: number; // nombre de pages vues
    l?: string; // langue du navigateur
    us?: string; // utm_source
    um?: string; // utm_medium
    uc?: string; // utm_campaign
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400, headers: CORS });
  }

  const { k: publicKey, s: sessionId, e: event } = body;

  if (!publicKey || !/^wz_[a-z0-9]{6,32}$/i.test(publicKey)) {
    return NextResponse.json({ error: "invalid_key" }, { status: 400, headers: CORS });
  }
  if (!sessionId || !UUID_PATTERN.test(sessionId)) {
    return NextResponse.json({ error: "invalid_session" }, { status: 400, headers: CORS });
  }

  const supabase = createAdminClient();

  // Résolution clé publique → site. RLS étant contournée, c'est ce filtre
  // explicite qui garantit qu'on n'écrit jamais sur le site d'un autre.
  const { data: site } = await supabase
    .from("sites")
    .select("id, domain")
    .eq("public_key", publicKey)
    .is("archived_at", null)
    .maybeSingle();

  if (!site) {
    return NextResponse.json({ error: "not_found" }, { status: 404, headers: CORS });
  }

  const requestPath = typeof body.p === "string" ? body.p.slice(0, 512) : "/";

  // -------------------------------------------------------------------------
  // Page vue. Envoyée à chaque page, y compris la première, et à chaque
  // navigation interne d'une application monopage.
  // -------------------------------------------------------------------------
  if (event === "page") {
    const { error: pageError } = await supabase.from("pageviews").insert({
      site_id: site.id,
      session_id: sessionId,
      path: requestPath,
    });

    if (pageError) console.error("[collect:page]", pageError.message);
    return new NextResponse(null, { status: 204, headers: CORS });
  }

  // -------------------------------------------------------------------------
  // Fin de visite : on complète la ligne existante.
  // -------------------------------------------------------------------------
  if (event === "end") {
    const duration = Math.min(
      Math.max(Math.round(Number(body.d) || 0), 0),
      MAX_DURATION_SECONDS,
    );
    const pageviews = Math.min(Math.max(Math.round(Number(body.v) || 1), 1), MAX_PAGEVIEWS);

    await supabase
      .from("sessions")
      .update({
        duration_seconds: duration,
        pageview_count: pageviews,
        last_seen_at: new Date().toISOString(),
      })
      .eq("id", sessionId)
      .eq("site_id", site.id); // ceinture et bretelles

    return new NextResponse(null, { status: 204, headers: CORS });
  }

  // -------------------------------------------------------------------------
  // Début de visite : création de la session enrichie.
  // -------------------------------------------------------------------------
  const userAgent = request.headers.get("user-agent") ?? "";
  const { country, city } = parseGeo(request.headers);
  const visitorHash = await computeVisitorHash(request.headers, site.id, userAgent);

  // Nouveau visiteur = aucune session sous cette empreinte aujourd'hui.
  // Le sel du hash tournant chaque nuit, la portée est nécessairement la journée.
  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);

  const { count: seenToday } = await supabase
    .from("sessions")
    .select("id", { count: "exact", head: true })
    .eq("site_id", site.id)
    .eq("visitor_hash", visitorHash)
    .gte("started_at", startOfDay.toISOString());

  // Valeurs libres issues de l'URL : on les borne avant insertion.
  const tag = (value: unknown, max = 120): string | null => {
    if (typeof value !== "string") return null;
    const trimmed = value.trim().slice(0, max);
    return trimmed.length > 0 ? trimmed : null;
  };

  const { error } = await supabase.from("sessions").upsert(
    {
      id: sessionId,
      site_id: site.id,
      visitor_hash: visitorHash,
      entry_path: requestPath,
      country,
      city,
      device: parseDevice(userAgent),
      os: parseOs(userAgent),
      browser: parseBrowser(userAgent),
      source: parseSource(body.r ?? null, site.domain),
      language: tag(body.l, 8),
      utm_source: tag(body.us),
      utm_medium: tag(body.um),
      utm_campaign: tag(body.uc),
      is_new: (seenToday ?? 0) === 0,
      started_at: new Date().toISOString(),
      last_seen_at: new Date().toISOString(),
      duration_seconds: 0,
      pageview_count: 1,
    },
    // Un rechargement de page ne doit pas écraser une session en cours.
    { onConflict: "id", ignoreDuplicates: true },
  );

  if (error) {
    console.error("[collect]", error.message);
    return NextResponse.json({ error: "insert_failed" }, { status: 500, headers: CORS });
  }

  return new NextResponse(null, { status: 204, headers: CORS });
}

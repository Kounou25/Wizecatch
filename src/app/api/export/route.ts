import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { toCsv, exportFilename } from "@/lib/export/csv";
import { EXPORT_PLANS } from "@/lib/export/plans";

/**
 * Export CSV des données d'un site.
 *
 * Route authentifiée qui utilise le client NORMAL, pas le service role : RLS
 * s'applique donc, et un identifiant de site étranger ne renvoie rien. C'est
 * la base qui garantit l'isolation, pas ce fichier.
 *
 * L'export est annoncé sur les offres payantes : la vérification du plan est
 * faite ici, sans quoi la grille tarifaire promettrait une restriction que
 * personne n'applique.
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const siteId = request.nextUrl.searchParams.get("siteId");
  const kind = request.nextUrl.searchParams.get("type") ?? "reviews";

  if (!siteId) {
    return NextResponse.json({ error: "missing_site" }, { status: 400 });
  }
  if (kind !== "reviews" && kind !== "visits") {
    return NextResponse.json({ error: "unknown_type" }, { status: 400 });
  }

  const { data: profile } = await supabase.from("profiles").select("plan").single();
  const plan = profile?.plan ?? "free";

  if (!EXPORT_PLANS.includes(plan)) {
    return NextResponse.json({ error: "upgrade_required" }, { status: 402 });
  }

  // RLS filtre déjà, mais on récupère le domaine pour nommer le fichier.
  const { data: site } = await supabase
    .from("sites")
    .select("id, domain")
    .eq("id", siteId)
    .maybeSingle();

  if (!site) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  let csv: string;

  if (kind === "reviews") {
    const { data } = await supabase
      .from("reviews")
      .select(
        "created_at, status, template_id, author_name, author_email, rating, thumbs_up, nps_score, comment, country, city, device, os, browser",
      )
      .eq("site_id", siteId)
      .order("created_at", { ascending: false });

    const rows = (data ?? []) as Record<string, unknown>[];

    csv = toCsv(
      [
        "date", "status", "template", "author", "email", "rating",
        "thumbs_up", "nps", "comment", "country", "city",
        "device", "os", "browser",
      ],
      rows.map((row) => [
        row.created_at, row.status, row.template_id, row.author_name,
        row.author_email, row.rating, row.thumbs_up, row.nps_score,
        row.comment, row.country, row.city, row.device, row.os, row.browser,
      ]),
    );
  } else {
    const { data } = await supabase
      .from("sessions")
      .select(
        "started_at, duration_seconds, pageview_count, entry_path, country, city, device, os, browser, source, utm_source, utm_campaign, language, is_new",
      )
      .eq("site_id", siteId)
      .order("started_at", { ascending: false })
      // Une session par ligne : sur un site actif, tout exporter saturerait la
      // mémoire de la fonction. On borne, et on l'indique à l'utilisateur.
      .limit(50_000);

    const rows = (data ?? []) as Record<string, unknown>[];

    csv = toCsv(
      [
        "date", "duration_seconds", "pageviews", "entry_path", "country",
        "city", "device", "os", "browser", "source", "utm_source",
        "utm_campaign", "language", "new_visitor",
      ],
      rows.map((row) => [
        row.started_at, row.duration_seconds, row.pageview_count,
        row.entry_path, row.country, row.city, row.device, row.os,
        row.browser, row.source, row.utm_source, row.utm_campaign,
        row.language, row.is_new,
      ]),
    );
  }

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${exportFilename(kind, site.domain)}"`,
      "Cache-Control": "no-store",
    },
  });
}

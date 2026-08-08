import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createZip } from "@/lib/wordpress/zip";
import {
  buildPluginPhp,
  buildReadme,
  PLUGIN_VERSION,
} from "@/lib/wordpress/plugin-template";

/**
 * Génère le plugin WordPress avec la clé du site déjà inscrite dedans.
 *
 * Route authentifiée : la clé publique n'est pas un secret, mais rien ne
 * justifie de laisser un inconnu fabriquer un plugin pour le site d'autrui.
 * RLS garantit qu'on ne trouve que ses propres sites.
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
  if (!siteId) {
    return NextResponse.json({ error: "missing_site" }, { status: 400 });
  }

  const { data: site } = await supabase
    .from("sites")
    .select("public_key, name, domain")
    .eq("id", siteId)
    .is("archived_at", null)
    .maybeSingle();

  if (!site) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  // Origine réelle de la requête : le plugin doit pointer vers le domaine
  // depuis lequel il a été téléchargé, jamais vers une valeur d'environnement
  // qui pourrait être restée sur localhost.
  const forwardedHost = request.headers.get("x-forwarded-host");
  const origin = forwardedHost
    ? `${request.headers.get("x-forwarded-proto") ?? "https"}://${forwardedHost}`
    : new URL(request.url).origin;

  const zip = createZip([
    {
      name: "wizecatch/wizecatch.php",
      content: buildPluginPhp({
        siteKey: site.public_key,
        origin,
        siteName: site.name,
      }),
    },
    {
      name: "wizecatch/readme.txt",
      content: buildReadme(site.domain),
    },
  ]);

  // Nom de fichier lisible, dérivé du domaine pour distinguer plusieurs sites.
  const slug = site.domain.replace(/[^a-z0-9]+/gi, "-").toLowerCase();

  return new NextResponse(zip as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="wizecatch-${slug}-${PLUGIN_VERSION}.zip"`,
      "Content-Length": String(zip.length),
      "Cache-Control": "no-store",
    },
  });
}

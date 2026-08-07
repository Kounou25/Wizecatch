import { createClient } from "@/lib/supabase/server";
import { toSite, type SiteRow } from "@/lib/sites/mapper";
import type { Site } from "@/lib/mock-data";

const SITE_COLUMNS =
  "id, public_key, name, domain, mode, template_id, template_config, widget_config, created_at, sessions(count)";

/**
 * Sites de l'utilisateur connecté.
 *
 * Aucun filtre `user_id` ici : RLS s'en charge côté base. Si la politique
 * venait à être désactivée, cette requête ne fuiterait pas silencieusement —
 * elle échouerait, ce qui est le comportement souhaité.
 */
export async function getUserSites(): Promise<Site[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("sites")
    .select(SITE_COLUMNS)
    .is("archived_at", null)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[sites] getUserSites:", error.message);
    return [];
  }

  return (data as unknown as SiteRow[]).map(toSite);
}

/** Un site par son id. Renvoie null s'il n'existe pas ou n'appartient pas à l'utilisateur. */
export async function getUserSite(siteId: string): Promise<Site | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("sites")
    .select(SITE_COLUMNS)
    .eq("id", siteId)
    .is("archived_at", null)
    .maybeSingle();

  if (error || !data) return null;

  return toSite(data as unknown as SiteRow);
}

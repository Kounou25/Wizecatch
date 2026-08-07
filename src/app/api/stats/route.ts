import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStats } from "@/lib/stats/queries";
import { EMPTY_STATS } from "@/lib/stats/types";

/**
 * Statistiques d'un site, lues par TanStack Query depuis l'onglet Stats.
 *
 * Route authentifiée : RLS filtre les sessions selon l'utilisateur connecté.
 * Un identifiant de site étranger renverra donc des données vides plutôt que
 * celles d'un autre compte.
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
  const days = Number(request.nextUrl.searchParams.get("days") ?? 30);

  if (!siteId) {
    return NextResponse.json({ error: "missing_site" }, { status: 400 });
  }

  // Vérification explicite de propriété : évite de lancer cinq agrégations
  // pour un site qui ne renverrait rien de toute façon.
  const { data: site } = await supabase
    .from("sites")
    .select("id")
    .eq("id", siteId)
    .maybeSingle();

  if (!site) {
    return NextResponse.json(EMPTY_STATS);
  }

  const stats = await getStats([siteId], Number.isFinite(days) ? days : 30);

  return NextResponse.json(stats);
}

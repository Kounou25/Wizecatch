import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSiteReviews } from "@/lib/reviews/queries";

/**
 * Avis d'un site, lus par TanStack Query depuis l'onglet Avis.
 * Route authentifiée : RLS filtre selon l'utilisateur connecté.
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

  return NextResponse.json(await getSiteReviews(siteId));
}

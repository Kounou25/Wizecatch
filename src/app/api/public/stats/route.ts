import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Chiffres publics de la plateforme, pour la preuve sociale de la page d'accueil.
 *
 * Route ouverte, mais elle ne renvoie que des TOTAUX. Aucune donnée
 * personnelle ne sort d'ici : ni nom, ni email, ni avatar, ni site. Le client
 * service_role est nécessaire parce que RLS interdit — à raison — toute lecture
 * anonyme de `profiles` et `reviews`.
 *
 * Mise en cache longue : ces nombres bougent lentement, et la page d'accueil
 * ne doit pas dépendre d'un aller-retour base de données à chaque visite.
 */
export const revalidate = 3600;

export async function GET() {
  const supabase = createAdminClient();
  const rows = { count: "exact" as const, head: true };

  const [users, reviews, sites] = await Promise.all([
    supabase.from("profiles").select("id", rows),
    supabase.from("reviews").select("id", rows),
    supabase.from("sites").select("id", rows).is("archived_at", null),
  ]);

  return NextResponse.json(
    {
      users: users.count ?? 0,
      reviews: reviews.count ?? 0,
      sites: sites.count ?? 0,
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    },
  );
}

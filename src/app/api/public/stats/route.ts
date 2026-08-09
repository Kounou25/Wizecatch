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

  const [users, reviews, sites, avatars] = await Promise.all([
    supabase.from("profiles").select("id", rows),
    supabase.from("reviews").select("id", rows),
    supabase.from("sites").select("id", rows).is("archived_at", null),
    // Uniquement l'URL de l'image, et rien d'autre : ni identifiant, ni nom,
    // ni email. Une photo isolée sur une page publique reste attribuable, mais
    // on n'y ajoute pas de quoi identifier la personne nommément.
    supabase
      .from("profiles")
      .select("avatar_url")
      .not("avatar_url", "is", null)
      .order("created_at", { ascending: true })
      .limit(8),
  ]);

  return NextResponse.json(
    {
      users: users.count ?? 0,
      reviews: reviews.count ?? 0,
      sites: sites.count ?? 0,
      avatars: ((avatars.data ?? []) as { avatar_url: string }[])
        .map((row) => row.avatar_url)
        .filter(Boolean),
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    },
  );
}

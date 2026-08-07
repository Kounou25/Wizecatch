import { createClient } from "@/lib/supabase/server";
import type { CurrentUser } from "@/components/providers/user-provider";

function deriveInitials(fullName: string, email: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

/**
 * Utilisateur connecté + son profil applicatif.
 * Renvoie null si aucune session (le proxy redirige déjà, ceci est un filet).
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // RLS restreint déjà la lecture à sa propre ligne — pas de filtre à écrire.
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url, plan, created_at, email")
    .single();

  const email = profile?.email ?? user.email ?? "";
  // Repli sur les métadonnées OAuth si le profil n'existe pas encore
  // (script SQL pas encore exécuté, par exemple).
  const fullName =
    profile?.full_name ??
    (user.user_metadata?.full_name as string | undefined) ??
    (user.user_metadata?.name as string | undefined) ??
    email.split("@")[0] ??
    "";

  return {
    id: user.id,
    email,
    fullName,
    initials: deriveInitials(fullName, email),
    avatarUrl:
      profile?.avatar_url ??
      (user.user_metadata?.avatar_url as string | undefined) ??
      null,
    plan: (profile?.plan as "free" | "pro") ?? "free",
    joinedAt: profile?.created_at ?? user.created_at,
  };
}

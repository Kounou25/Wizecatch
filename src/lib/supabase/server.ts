import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Client Supabase pour Server Components, Server Actions et Route Handlers.
 *
 * `cookies()` est asynchrone dans cette version de Next.js, d'où le `await`.
 * À créer à chaque requête — ne jamais le stocker dans une variable de module,
 * sinon la session d'un utilisateur fuiterait vers un autre.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Appelé depuis un Server Component : l'écriture de cookies y est
            // interdite. Sans gravité, c'est le proxy qui rafraîchit la session.
          }
        },
      },
    },
  );
}

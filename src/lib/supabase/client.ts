import { createBrowserClient } from "@supabase/ssr";

/**
 * Client Supabase pour les Client Components.
 * Utilise la clé anon : tout accès aux données reste filtré par RLS.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

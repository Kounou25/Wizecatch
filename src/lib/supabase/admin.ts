import { createClient } from "@supabase/supabase-js";

/**
 * Client Supabase en service role — contourne totalement RLS.
 *
 * ⚠️ Réservé aux routes publiques de collecte : un visiteur anonyme sur le site
 * d'un client n'a aucune session Supabase, RLS bloquerait donc l'écriture.
 *
 * Règles absolues :
 *   - jamais importé depuis un composant client
 *   - toujours filtrer explicitement par site_id, puisque la base ne le fait plus
 */
export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!key) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY manquante — la collecte ne peut pas écrire en base.",
    );
  }

  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

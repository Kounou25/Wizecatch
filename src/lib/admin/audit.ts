import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { AdminUser } from "@/lib/admin/guard";

/**
 * Journalisation des actions d'administration.
 *
 * Dès lors qu'une interface contourne RLS pour lire les données de tous les
 * clients, un accès légitime et une fuite deviennent indistinguables. Ce
 * journal est ce qui permet de répondre à « qui a modifié ce compte, et quand ».
 *
 * L'écriture ne doit jamais faire échouer l'action elle-même : on trace, on
 * signale en cas d'échec, mais on ne bloque pas un changement de plan parce que
 * le journal est indisponible.
 */
export async function logAdminAction(
  client: SupabaseClient,
  actor: AdminUser,
  action: string,
  target: { type: string; id: string },
  details?: Record<string, unknown>,
) {
  const { error } = await client.from("audit_log").insert({
    actor_id: actor.id,
    // L'adresse est figée à l'instant de l'action : un compte supprimé plus
    // tard laisserait sinon une ligne anonyme.
    actor_email: actor.email,
    action,
    target_type: target.type,
    target_id: target.id,
    details: details ?? null,
  });

  if (error) console.error("[audit]", action, error.message);
}

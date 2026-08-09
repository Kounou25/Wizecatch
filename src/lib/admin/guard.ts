import "server-only";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Contrôle d'accès au back-office.
 *
 * POURQUOI CE FICHIER EST SENSIBLE
 *
 * Le back-office lit les données de tous les comptes. Il ne peut donc pas
 * passer par le client normal, sur lequel RLS s'applique. Il utilise le client
 * `service_role`, qui contourne RLS entièrement.
 *
 * Ce contournement est acceptable à une condition : que la vérification du
 * droit d'accès soit faite ici, à un seul endroit, et jamais recopiée. Un
 * contrôle oublié dans une seule route exposerait la totalité de la base.
 *
 * D'où la règle : `adminClient()` ne renvoie un client privilégié qu'après
 * avoir vérifié l'appelant. Il n'existe aucun moyen d'obtenir ce client depuis
 * une page d'administration sans passer par cette vérification.
 *
 * `import "server-only"` garantit qu'une importation accidentelle depuis un
 * composant client casse la compilation plutôt que de fuiter la clé.
 */

export type AdminUser = {
  id: string;
  email: string;
  fullName: string | null;
};

/**
 * L'utilisateur connecté, s'il est administrateur. `null` sinon.
 *
 * Ne lève pas d'exception : les pages l'utilisent pour rediriger, le proxy
 * pour refuser. C'est `requireAdmin` qui impose la présence.
 */
export async function getAdminUser(): Promise<AdminUser | null> {
  const supabase = await createClient();

  // getUser() revalide le jeton auprès de Supabase, contrairement à
  // getSession() qui se contente de lire le cookie.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // La lecture du drapeau passe par le service role : la politique RLS de
  // `profiles` autorise l'utilisateur à lire sa propre ligne, mais on ne veut
  // pas dépendre d'une politique pour une décision de sécurité.
  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("id, email, full_name, is_admin")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.is_admin) return null;

  return {
    id: profile.id,
    email: profile.email,
    fullName: profile.full_name,
  };
}

/** Vrai si l'utilisateur connecté est administrateur. */
export async function isAdmin(): Promise<boolean> {
  return (await getAdminUser()) !== null;
}

/**
 * Client privilégié — accessible uniquement après vérification.
 *
 * Renvoie aussi l'administrateur, que les actions doivent inscrire au journal.
 * Lève une exception plutôt que de renvoyer un client dégradé : un back-office
 * qui échoue silencieusement est pire qu'un back-office en erreur.
 */
export async function requireAdmin() {
  const user = await getAdminUser();

  if (!user) {
    throw new Error("forbidden: admin access required");
  }

  return { admin: createAdminClient(), user };
}

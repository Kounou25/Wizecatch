/**
 * Correspondance entre les produits Dodo et les plans Wizecatch.
 *
 * Les identifiants sont propres à chaque mode : un `prod_...` créé en test ne
 * fonctionne pas en production. Ils viennent donc de l'environnement, jamais
 * du code.
 *
 * Facturation MENSUELLE uniquement pour l'instant. Ajouter l'annuel demandera
 * deux produits de plus et le rétablissement du bascule sur la page tarifaire.
 */

export type BillablePlan = "starter" | "scale" | "lifetime";

/** Le lifetime est un paiement unique : ni renouvellement, ni expiration. */
export const LIFETIME_PLAN: BillablePlan = "lifetime";

export function productIdFor(plan: BillablePlan): string | null {
  const ids: Record<BillablePlan, string | undefined> = {
    starter: process.env.DODO_PRODUCT_STARTER,
    scale: process.env.DODO_PRODUCT_SCALE,
    lifetime: process.env.DODO_PRODUCT_LIFETIME,
  };

  return ids[plan] || null;
}

/**
 * Plan correspondant à un produit reçu dans un webhook.
 *
 * Renvoie `null` pour un produit inconnu — un produit créé chez Dodo mais pas
 * encore déclaré ici ne doit pas silencieusement accorder un plan arbitraire.
 */
export function planForProduct(productId: string | null | undefined): BillablePlan | null {
  if (!productId) return null;

  const table: Record<string, BillablePlan> = {};

  const starter = process.env.DODO_PRODUCT_STARTER;
  const scale = process.env.DODO_PRODUCT_SCALE;
  const lifetime = process.env.DODO_PRODUCT_LIFETIME;

  if (starter) table[starter] = "starter";
  if (scale) table[scale] = "scale";
  if (lifetime) table[lifetime] = "lifetime";

  return table[productId] ?? null;
}

/**
 * Statuts Dodo qui donnent droit à l'accès payant.
 *
 * `on_hold` en fait partie volontairement : c'est un échec de prélèvement, le
 * client doit mettre à jour sa carte. Couper l'accès immédiatement ferait fuir
 * quelqu'un dont la carte a simplement expiré — le cas le plus courant.
 * On l'avertit, on ne le sanctionne pas.
 */
const ENTITLING_STATUSES = new Set(["active", "on_hold", "paused"]);

export function statusGrantsAccess(status: string): boolean {
  return ENTITLING_STATUSES.has(status);
}

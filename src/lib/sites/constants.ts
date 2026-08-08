import type { ReviewTemplateId } from "@/lib/mock-data";

/**
 * Constantes et types partagés autour des sites.
 *
 * Volontairement séparé de `actions.ts` : un module de Server Actions ne peut
 * exporter que des fonctions async — toute constante ou objet exporté y
 * déclenche une erreur d'exécution.
 */

/** Nombre de sites autorisés par plan (cohérent avec la grille tarifaire). */
/**
 * Nombre de sites par palier — doit rester aligné avec `pricingPlans`.
 * `pro` est conservé comme alias de `scale` pour les comptes déjà créés.
 */
/**
 * Le nombre de sites n'est pas le vrai facteur de coût — les visites le sont,
 * et elles sont déjà plafonnées par ailleurs. On peut donc être généreux ici
 * sans risque : 3 sites à 10 000 visites au total coûtent exactement autant
 * qu'un seul site à 10 000 visites.
 */
export const SITE_LIMITS: Record<string, number> = {
  free: 1,
  starter: 3,
  lifetime: 5,
  scale: 25,
  // Alias conservé pour les comptes créés avant le renommage des offres.
  pro: 25,
};

export const TEMPLATE_IDS: ReviewTemplateId[] = [
  "star_rating",
  "star_comment",
  "thumbs",
  "nps",
  "testimonial",
];

export type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string };

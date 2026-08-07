import type { ReviewTemplateId } from "@/lib/mock-data";

/**
 * Constantes et types partagés autour des sites.
 *
 * Volontairement séparé de `actions.ts` : un module de Server Actions ne peut
 * exporter que des fonctions async — toute constante ou objet exporté y
 * déclenche une erreur d'exécution.
 */

/** Nombre de sites autorisés par plan (cohérent avec la grille tarifaire). */
export const SITE_LIMITS: Record<"free" | "pro", number> = {
  free: 1,
  pro: 10,
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

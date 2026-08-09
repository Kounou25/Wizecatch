/**
 * Plans acceptés par la contrainte `profiles_plan_check`.
 *
 * Dans un fichier à part : un module « use server » ne peut exporter que des
 * fonctions asynchrones, et cette liste est aussi lue par les composants.
 *
 * « pro » est conservé pour les comptes antérieurs à l'alignement des plans sur
 * la grille tarifaire ; il n'est plus vendu.
 */
export const ALLOWED_PLANS = ["free", "starter", "scale", "lifetime", "pro"];

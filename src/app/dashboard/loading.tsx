import { Skeleton } from "@/components/dashboard/skeleton";

/**
 * État de chargement du tableau de bord.
 *
 * Ces pages lisent les cookies de session : elles sont donc rendues à la
 * demande et ne peuvent pas être préchargées. Sans frontière Suspense, un
 * changement d'onglet laissait l'écran précédent figé le temps de la requête.
 *
 * Placé sur le segment `/dashboard`, ce fichier couvre toutes ses sous-pages.
 */
export default function DashboardLoading() {
  return (
    <div className="animate-pulse">
      <Skeleton className="h-7 w-48" />
      <Skeleton className="mt-2 h-4 w-80" />

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-[92px] w-full rounded-xl" />
        ))}
      </div>

      <Skeleton className="mt-4 h-72 w-full rounded-xl" />

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-56 w-full rounded-xl" />
        <Skeleton className="h-56 w-full rounded-xl" />
      </div>
    </div>
  );
}

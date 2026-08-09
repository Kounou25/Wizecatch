import { Skeleton } from "@/components/dashboard/skeleton";

/**
 * État de chargement du back-office.
 *
 * Sans ce fichier, cliquer sur une entrée de la navigation laissait la page
 * précédente figée jusqu'à ce que le serveur ait fini : sur une connexion
 * lente, l'interface paraissait bloquée et l'utilisateur recliquait.
 *
 * Les pages `/admin` sont en `force-dynamic` — elles ne peuvent donc pas être
 * préchargées, et c'est précisément le cas où la documentation recommande une
 * frontière Suspense au niveau de la route. Placé sur le segment `/admin`, ce
 * fichier couvre aussi toutes ses sous-pages.
 */
export default function AdminLoading() {
  return (
    <div className="animate-pulse">
      <Skeleton className="h-7 w-40" />
      <Skeleton className="mt-2 h-4 w-72" />

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-[104px] w-full rounded-xl" />
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Skeleton className="h-64 w-full rounded-xl lg:col-span-2" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    </div>
  );
}

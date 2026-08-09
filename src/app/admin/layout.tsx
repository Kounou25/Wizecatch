import { notFound } from "next/navigation";
import { getAdminUser } from "@/lib/admin/guard";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

/**
 * Le back-office.
 *
 * Ce layout est la première barrière : sans droit d'administration, la section
 * entière renvoie un 404 — pas une page « accès refusé », qui confirmerait
 * l'existence de l'interface à qui la cherche.
 *
 * Il ne remplace pas les vérifications individuelles : chaque page et chaque
 * action appelle `requireAdmin()`. Un layout ne protège pas les Server Actions,
 * qui sont des points d'entrée à part entière.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getAdminUser();
  if (!admin) notFound();

  return (
    <div className="min-h-screen bg-zinc-50 lg:flex">
      <AdminSidebar email={admin.email} />

      {/* min-w-0 : sans lui, un tableau large pousse la colonne et fait
          défiler la page entière horizontalement. */}
      <main className="min-w-0 flex-1 lg:h-screen lg:overflow-y-auto">
        <div className="mx-auto max-w-6xl px-6 py-8">{children}</div>
      </main>
    </div>
  );
}

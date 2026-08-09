import { notFound } from "next/navigation";
import Link from "next/link";
import { getAdminUser } from "@/lib/admin/guard";

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

  const links = [
    { href: "/admin", label: "Overview" },
    { href: "/admin/users", label: "Users" },
    { href: "/admin/sites", label: "Sites" },
    { href: "/admin/reviews", label: "Reviews" },
    { href: "/admin/audit", label: "Audit log" },
  ];

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-2 px-6 py-3">
          <span className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
            Wizecatch
            {/* Repère visuel permanent : on ne regarde pas ses propres
                données ici, mais celles de tous les clients. */}
            <span className="rounded-md bg-red-50 px-1.5 py-0.5 text-[11px] font-medium text-red-600 ring-1 ring-red-100">
              Admin
            </span>
          </span>

          <nav className="flex flex-wrap items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-md px-2.5 py-1.5 text-sm text-zinc-600 transition-colors duration-150 hover:bg-zinc-100 hover:text-zinc-900"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <span className="hidden text-xs text-zinc-400 sm:inline">{admin.email}</span>
            <Link
              href="/dashboard"
              className="text-sm text-zinc-500 transition-colors duration-150 hover:text-purple-600"
            >
              Exit
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
    </div>
  );
}

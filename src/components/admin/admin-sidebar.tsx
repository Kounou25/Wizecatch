"use client";

import Link, { useLinkStatus } from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboardIcon,
  UsersIcon,
  GlobeIcon,
  MessageSquareIcon,
  ActivityIcon,
  LogOutIcon,
} from "@/components/icons";

const LINKS = [
  { href: "/admin", label: "Overview", icon: LayoutDashboardIcon },
  { href: "/admin/users", label: "Users", icon: UsersIcon },
  { href: "/admin/sites", label: "Sites", icon: GlobeIcon },
  { href: "/admin/reviews", label: "Reviews", icon: MessageSquareIcon },
  { href: "/admin/audit", label: "Audit log", icon: ActivityIcon },
];

/**
 * Point d'attente sur le lien cliqué.
 *
 * Complète `loading.tsx` : le squelette confirme l'arrivée, ce point confirme
 * le clic. Il doit être rendu en permanence et ne varier que par l'opacité —
 * l'afficher conditionnellement décalerait le libellé au moment du clic.
 *
 * Doit être un descendant du <Link> pour que le hook voie son état.
 */
function LinkPending() {
  const { pending } = useLinkStatus();

  return (
    <span
      aria-hidden="true"
      className={cn(
        "ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-current transition-opacity duration-150",
        pending ? "animate-pulse opacity-70" : "opacity-0",
      )}
    />
  );
}

export function AdminSidebar({ email }: { email: string }) {
  const pathname = usePathname();

  return (
    <aside className="flex w-full shrink-0 flex-col border-b border-zinc-800 bg-zinc-900 lg:h-screen lg:w-60 lg:border-b-0 lg:border-r">
      <div className="flex items-center gap-2 px-5 py-4">
        <span className="text-sm font-semibold text-white">Wizecatch</span>
        {/* Rappel permanent : ici on regarde les données de tous les clients. */}
        <span className="rounded-md bg-red-500/15 px-1.5 py-0.5 text-[10px] font-medium text-red-400 ring-1 ring-red-500/20">
          Admin
        </span>
      </div>

      <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:overflow-visible lg:pb-0">
        {LINKS.map((link) => {
          // « /admin » ne doit pas rester actif sur ses sous-pages.
          const active =
            link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href);
          const Icon = link.icon;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors duration-150",
                active
                  ? "bg-zinc-800 font-medium text-white"
                  : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {link.label}
              <LinkPending />
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto hidden border-t border-zinc-800 px-3 py-3 lg:block">
        <p className="truncate px-2 pb-2 text-[11px] text-zinc-500" title={email}>
          {email}
        </p>
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-zinc-400 transition-colors duration-150 hover:bg-zinc-800/50 hover:text-zinc-200"
        >
          <LogOutIcon className="h-4 w-4" />
          Back to app
        </Link>
      </div>
    </aside>
  );
}

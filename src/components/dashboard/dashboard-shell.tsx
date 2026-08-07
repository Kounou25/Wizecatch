"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/logo";
import { LanguageToggle } from "@/components/language-toggle";
import { useSites } from "@/components/providers/sites-provider";
import {
  LayoutDashboardIcon,
  SettingsIcon,
  LogOutIcon,
  MenuIcon,
  XIcon,
  GlobeIcon,
  MessageSquareIcon,
  BarChartIcon,
  PlusIcon,
  InboxIcon,
} from "@/components/icons";
import { getReviewsBySiteId, FREE_PLAN_REVIEW_LIMIT } from "@/lib/mock-data";
import { cn, interpolate } from "@/lib/utils";
import { useLanguage } from "@/components/providers/language-provider";
import { useCurrentUser } from "@/components/providers/user-provider";
import { signOut } from "@/lib/auth/actions";

function isActive(pathname: string, href: string, exact: boolean) {
  return exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

function SidebarContent({
  pathname,
  onClose,
}: {
  pathname: string;
  onClose?: () => void;
}) {
  const { dict } = useLanguage();
  const { sites } = useSites();
  const user = useCurrentUser();

  const totalReviews = sites.reduce(
    (sum, site) => sum + (site.mode === "reviews" ? getReviewsBySiteId(site.id).length : 0),
    0,
  );
  const usageRatio = Math.min(1, totalReviews / FREE_PLAN_REVIEW_LIMIT);

  const groups = [
    {
      label: dict.sidebar.groupMain,
      items: [
        { href: "/dashboard", label: dict.sidebar.dashboard, icon: LayoutDashboardIcon, exact: true },
        { href: "/dashboard/sites", label: dict.sidebar.sites, icon: GlobeIcon, exact: false, badge: sites.length },
        { href: "/dashboard/reviews", label: dict.sidebar.reviews, icon: MessageSquareIcon, exact: false, badge: totalReviews },
        { href: "/dashboard/analytics", label: dict.sidebar.analytics, icon: BarChartIcon, exact: false },
      ],
    },
    {
      label: dict.sidebar.groupAccount,
      items: [
        { href: "/dashboard/settings", label: dict.sidebar.settings, icon: SettingsIcon, exact: false },
      ],
    },
  ];

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-zinc-200 px-5">
        <Logo />
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100"
            aria-label="Close menu"
          >
            <XIcon className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="px-3 pt-4">
        <Link
          href="/dashboard/sites/new"
          onClick={onClose}
          className="flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-purple-600 text-sm font-medium text-white shadow-sm transition-colors duration-150 hover:bg-purple-700"
        >
          <PlusIcon className="h-4 w-4" />
          {dict.sidebar.addSite}
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {groups.map((group) => (
          <div key={group.label} className="mb-5">
            <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(pathname, item.href, item.exact);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150",
                      active
                        ? "bg-purple-50 text-purple-700"
                        : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="flex-1">{item.label}</span>
                    {typeof item.badge === "number" && item.badge > 0 && (
                      <span
                        className={cn(
                          "rounded-full px-1.5 py-0.5 text-[11px] font-semibold",
                          active ? "bg-purple-100 text-purple-700" : "bg-zinc-100 text-zinc-500",
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {user.plan === "free" && (
        <div className="mx-3 mb-3 rounded-xl bg-zinc-50 p-3 ring-1 ring-zinc-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-700">{dict.sidebar.freePlan}</span>
            <Link
              href="/#pricing"
              className="text-xs font-semibold text-purple-600 hover:text-purple-700"
            >
              {dict.sidebar.upgrade}
            </Link>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-200">
            <div
              className="h-full rounded-full bg-purple-600 transition-all duration-300"
              style={{ width: `${usageRatio * 100}%` }}
            />
          </div>
          <p className="mt-1.5 text-[11px] text-zinc-500">
            {interpolate(dict.sidebar.planUsage, {
              used: totalReviews,
              limit: FREE_PLAN_REVIEW_LIMIT,
            })}
          </p>
        </div>
      )}

      <div className="shrink-0 border-t border-zinc-200 p-3">
        <Link
          href="/#faq"
          className="mb-1 flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition-colors duration-150 hover:bg-zinc-100 hover:text-zinc-900"
        >
          <InboxIcon className="h-4 w-4" />
          {dict.sidebar.help}
        </Link>

        <div className="flex items-center justify-between px-3 py-2">
          <LanguageToggle />
        </div>

        <div className="flex items-center gap-3 rounded-lg px-3 py-2">
          {user.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.avatarUrl}
              alt=""
              className="h-8 w-8 shrink-0 rounded-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-xs font-semibold text-white">
              {user.initials}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-zinc-900">{user.fullName}</p>
            <p className="truncate text-xs text-zinc-500">{user.email}</p>
          </div>
          <form action={signOut}>
            <button
              type="submit"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
              aria-label={dict.sidebar.logout}
              title={dict.sidebar.logout}
            >
              <LogOutIcon className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-50">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-zinc-200 bg-white lg:block">
        <SidebarContent pathname={pathname} />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-zinc-900/40"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-64 bg-white shadow-xl">
            <SidebarContent pathname={pathname} onClose={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        <div className="flex h-16 items-center gap-3 border-b border-zinc-200 bg-white px-4 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-700 hover:bg-zinc-100"
            aria-label="Open menu"
          >
            <MenuIcon className="h-5 w-5" />
          </button>
          <Logo />
        </div>

        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

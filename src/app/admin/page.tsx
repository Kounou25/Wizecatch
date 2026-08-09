import { getOverview, getSeries, getGeo, listUsers } from "@/lib/admin/queries";
import { FlagIcon } from "@/components/flag-icon";
import { UserAvatar } from "@/components/admin/user-avatar";
import { countryName } from "@/lib/geo/countries";
import { StatsLineChart } from "@/components/dashboard/stats-line-chart";
import { SegmentFilter, buildHref } from "@/components/admin/filter-bar";
import {
  PageTitle,
  Panel,
  KpiCard,
  SplitBars,
  Badge,
} from "@/components/admin/admin-ui";
import {
  UsersIcon,
  GlobeIcon,
  ActivityIcon,
  MessageSquareIcon,
} from "@/components/icons";

export const dynamic = "force-dynamic";

const PERIODS = [
  { value: "7", label: "7 days" },
  { value: "30", label: "30 days" },
  { value: "90", label: "90 days" },
];

export default async function AdminOverviewPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  const { days: raw } = await searchParams;
  // Périodes fermées : une valeur libre ferait agréger toute la table.
  const days = ["7", "30", "90"].includes(raw ?? "") ? Number(raw) : 30;
  // Les trois lectures sont indépendantes : les lancer en parallèle évite
  // d'empiler trois allers-retours avant le premier octet rendu.
  const [data, series, geo, recent] = await Promise.all([
    getOverview(days),
    getSeries(days),
    getGeo(days),
    listUsers(),
  ]);

  // La barre est proportionnelle au premier rang : avec un pays dominant,
  // rapporter au total réduirait tous les autres à un trait invisible.
  const maxCountry = Math.max(...geo.countries.map((c) => c.count), 1);
  const maxCity = Math.max(...geo.cities.map((c) => c.count), 1);

  const conversion =
    data.users > 0
      ? Math.round(((data.users - (data.planSplit.find((p) => p.plan === "free")?.count ?? 0)) /
          data.users) *
          100)
      : 0;

  return (
    <>
      <PageTitle
        title="Overview"
        subtitle={`The whole platform at a glance — last ${days} days.`}
        action={
          <SegmentFilter
            options={PERIODS}
            current={String(days)}
            hrefFor={(value) => buildHref("/admin", { days: value })}
          />
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Accounts"
          value={data.users}
          icon={UsersIcon}
          hint={`+${data.newUsers7d} this week`}
        />
        <KpiCard
          label="Active sites"
          value={data.activeSites}
          icon={GlobeIcon}
          tone="emerald"
          hint={`${data.sites} created in total`}
        />
        <KpiCard
          label="Visits"
          value={data.sessionsInPeriod}
          icon={ActivityIcon}
          tone="amber"
          hint={`last ${days} days`}
        />
        <KpiCard
          label="Reviews"
          value={data.reviewsInPeriod}
          icon={MessageSquareIcon}
          hint={`last ${days} days`}
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Panel
          title="Signups"
          hint="New accounts per day"
          className="lg:col-span-2"
        >
          <StatsLineChart data={series.signups} color="#7c3aed" />
        </Panel>

        <Panel
          title="Plans"
          hint={`${conversion}% of accounts on a paid plan`}
        >
          <SplitBars
            data={data.planSplit.map((entry) => ({
              label: entry.plan,
              count: entry.count,
            }))}
            emptyLabel="No accounts yet."
          />
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Panel title="Visits collected" hint="Across every site">
          <StatsLineChart data={series.sessions} color="#0ea5e9" />
        </Panel>
        <Panel title="Reviews collected" hint="Across every site">
          <StatsLineChart data={series.reviews} color="#10b981" />
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Panel title="Top countries" hint={`All traffic, last ${days} days`}>
          {geo.countries.length === 0 ? (
            <p className="py-6 text-center text-sm text-zinc-400">No traffic yet.</p>
          ) : (
            <ul className="space-y-1">
              {geo.countries.map((entry) => (
                <li
                  key={entry.label}
                  className="relative flex h-9 items-center rounded-md"
                >
                  <div
                    className="absolute inset-y-0 left-0 rounded-md bg-purple-100/70"
                    style={{ width: `${Math.max((entry.count / maxCountry) * 100, 4)}%` }}
                    aria-hidden="true"
                  />
                  <div className="relative flex w-full items-center justify-between gap-3 px-2.5">
                    <span className="flex min-w-0 items-center gap-2">
                      <FlagIcon country={entry.label} className="h-3.5 w-5" />
                      <span className="truncate text-sm text-zinc-700">
                        {countryName(entry.label)}
                      </span>
                    </span>
                    <span className="shrink-0 text-sm font-medium tabular-nums text-zinc-900">
                      {entry.count.toLocaleString("en-US")}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Top cities" hint={`All traffic, last ${days} days`}>
          {geo.cities.length === 0 ? (
            <p className="py-6 text-center text-sm text-zinc-400">No city data yet.</p>
          ) : (
            <ul className="space-y-1">
              {geo.cities.map((entry) => (
                <li
                  key={entry.label}
                  className="relative flex h-9 items-center rounded-md"
                >
                  <div
                    className="absolute inset-y-0 left-0 rounded-md bg-sky-100/70"
                    style={{ width: `${Math.max((entry.count / maxCity) * 100, 4)}%` }}
                    aria-hidden="true"
                  />
                  <div className="relative flex w-full items-center justify-between gap-3 px-2.5">
                    <span className="truncate text-sm text-zinc-700">{entry.label}</span>
                    <span className="shrink-0 text-sm font-medium tabular-nums text-zinc-900">
                      {entry.count.toLocaleString("en-US")}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <Panel title="Latest signups" className="mt-4">
        {recent.length === 0 ? (
          <p className="py-6 text-center text-sm text-zinc-400">No accounts yet.</p>
        ) : (
          <ul className="divide-y divide-zinc-100">
            {recent.slice(0, 8).map((user) => (
              <li key={user.id} className="flex items-center justify-between gap-3 py-2.5">
                <span className="flex min-w-0 items-center gap-2.5">
                  <UserAvatar
                    name={user.fullName}
                    email={user.email}
                    src={user.avatarUrl}
                  />
                  <span className="truncate text-sm text-zinc-800">{user.email}</span>
                  {user.isAdmin && <Badge tone="red">admin</Badge>}
                </span>
                <span className="flex shrink-0 items-center gap-3">
                  <Badge tone={user.plan === "free" ? "zinc" : "purple"}>{user.plan}</Badge>
                  <span className="w-20 text-right text-xs tabular-nums text-zinc-400">
                    {new Date(user.createdAt).toLocaleDateString("en-GB")}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </>
  );
}

import { getOverview, getSeries, listUsers } from "@/lib/admin/queries";
import { StatsLineChart } from "@/components/dashboard/stats-line-chart";
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

export default async function AdminOverviewPage() {
  // Les trois lectures sont indépendantes : les lancer en parallèle évite
  // d'empiler trois allers-retours avant le premier octet rendu.
  const [data, series, recent] = await Promise.all([
    getOverview(),
    getSeries(30),
    listUsers(),
  ]);

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
        subtitle="The whole platform at a glance — last 30 days."
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
          value={data.sessions30d}
          icon={ActivityIcon}
          tone="amber"
          hint="last 30 days"
        />
        <KpiCard
          label="Reviews"
          value={data.reviews30d}
          icon={MessageSquareIcon}
          hint="last 30 days"
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

      <Panel title="Latest signups" className="mt-4">
        {recent.length === 0 ? (
          <p className="py-6 text-center text-sm text-zinc-400">No accounts yet.</p>
        ) : (
          <ul className="divide-y divide-zinc-100">
            {recent.slice(0, 8).map((user) => (
              <li key={user.id} className="flex items-center justify-between gap-3 py-2.5">
                <span className="flex min-w-0 items-center gap-2">
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

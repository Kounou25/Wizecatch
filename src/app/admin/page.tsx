import { getOverview } from "@/lib/admin/queries";
import { AdminStat, PageTitle } from "@/components/admin/admin-table";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const data = await getOverview();

  return (
    <>
      <PageTitle title="Overview" subtitle="The whole platform at a glance." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AdminStat label="Accounts" value={data.users} />
        <AdminStat label="New this week" value={data.newUsers7d} />
        <AdminStat label="Active sites" value={data.activeSites} />
        <AdminStat label="Sites created" value={data.sites} />
        <AdminStat label="Visits (30 d)" value={data.sessions30d} />
        <AdminStat label="Reviews (30 d)" value={data.reviews30d} />
      </div>

      <h2 className="mt-8 mb-3 text-sm font-semibold text-zinc-900">Plans</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {data.planSplit.map((entry) => (
          <AdminStat key={entry.plan} label={entry.plan} value={entry.count} />
        ))}
      </div>
    </>
  );
}

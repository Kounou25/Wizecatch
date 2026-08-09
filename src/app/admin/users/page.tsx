import { listUsers } from "@/lib/admin/queries";
import { AdminTable, Cell, PageTitle } from "@/components/admin/admin-table";
import { PlanSelect } from "@/components/admin/plan-select";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage({
  searchParams,
}: {
  // searchParams est asynchrone dans cette version de Next.
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const users = await listUsers(q);

  return (
    <>
      <PageTitle title="Users" subtitle="Every account on the platform." />

      <form className="mb-4" action="/admin/users">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search by email or name"
          className="w-full max-w-sm rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-800 placeholder:text-zinc-400 focus:border-purple-500 focus:outline-none"
        />
      </form>

      <AdminTable
        headers={["Email", "Name", "Sites", "Plan", "Joined"]}
        isEmpty={users.length === 0}
        empty={q ? "No account matches this search." : "No accounts yet."}
      >
        {users.map((user) => (
          <tr key={user.id}>
            <Cell>
              <span className="flex items-center gap-2">
                {user.email}
                {user.isAdmin && (
                  <span className="rounded bg-red-50 px-1.5 py-0.5 text-[10px] font-medium text-red-600">
                    admin
                  </span>
                )}
              </span>
            </Cell>
            <Cell muted>{user.fullName ?? "—"}</Cell>
            <Cell muted>{user.siteCount}</Cell>
            <Cell>
              <PlanSelect userId={user.id} plan={user.plan} email={user.email} />
            </Cell>
            <Cell muted>{new Date(user.createdAt).toLocaleDateString("en-GB")}</Cell>
          </tr>
        ))}
      </AdminTable>
    </>
  );
}

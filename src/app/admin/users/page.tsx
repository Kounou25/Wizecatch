import { listUsers } from "@/lib/admin/queries";
import { AdminTable, Row, Cell, PageTitle, Badge } from "@/components/admin/admin-ui";
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

  const paid = users.filter((user) => user.plan !== "free").length;

  return (
    <>
      <PageTitle
        title="Users"
        subtitle={`${users.length} accounts shown · ${paid} on a paid plan`}
      />

      <form className="mb-4 flex gap-2" action="/admin/users">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search by email or name"
          className="w-full max-w-sm rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-800 placeholder:text-zinc-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/15"
        />
        <button
          type="submit"
          className="rounded-lg bg-zinc-900 px-3.5 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-zinc-800"
        >
          Search
        </button>
      </form>

      <AdminTable
        headers={["Email", "Name", "Sites", "Plan", "Joined"]}
        isEmpty={users.length === 0}
        empty={q ? "No account matches this search." : "No accounts yet."}
      >
        {users.map((user) => (
          <Row key={user.id}>
            <Cell>
              <span className="flex items-center gap-2">
                {user.email}
                {user.isAdmin && <Badge tone="red">admin</Badge>}
              </span>
            </Cell>
            <Cell muted>{user.fullName ?? "—"}</Cell>
            <Cell muted>
              <span className="tabular-nums">{user.siteCount}</span>
            </Cell>
            <Cell>
              <PlanSelect userId={user.id} plan={user.plan} email={user.email} />
            </Cell>
            <Cell muted>
              <span className="tabular-nums">
                {new Date(user.createdAt).toLocaleDateString("en-GB")}
              </span>
            </Cell>
          </Row>
        ))}
      </AdminTable>
    </>
  );
}

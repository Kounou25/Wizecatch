import { listAudit } from "@/lib/admin/queries";
import { AdminTable, Row, Cell, PageTitle } from "@/components/admin/admin-ui";

export const dynamic = "force-dynamic";

export default async function AdminAuditPage() {
  const entries = await listAudit();

  return (
    <>
      <PageTitle
        title="Audit log"
        subtitle="Every administrative action, with who performed it."
      />

      <AdminTable
        headers={["When", "Admin", "Action", "Target", "Details"]}
        isEmpty={entries.length === 0}
        empty="No administrative action recorded yet."
      >
        {entries.map((entry) => (
          <Row key={entry.id}>
            <Cell muted>
              <span className="whitespace-nowrap tabular-nums">
                {new Date(entry.createdAt).toLocaleString("en-GB")}
              </span>
            </Cell>
            <Cell muted>{entry.actorEmail ?? "—"}</Cell>
            <Cell>
              <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs text-zinc-700">
                {entry.action}
              </code>
            </Cell>
            <Cell muted>
              {entry.targetType ? `${entry.targetType}:${entry.targetId?.slice(0, 8)}` : "—"}
            </Cell>
            <Cell muted>
              {entry.details ? (
                <span className="text-xs">{JSON.stringify(entry.details)}</span>
              ) : (
                "—"
              )}
            </Cell>
          </Row>
        ))}
      </AdminTable>
    </>
  );
}

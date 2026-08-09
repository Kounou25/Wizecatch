import { listSites } from "@/lib/admin/queries";
import { AdminTable, Cell, PageTitle } from "@/components/admin/admin-table";

export const dynamic = "force-dynamic";

export default async function AdminSitesPage() {
  const sites = await listSites();

  return (
    <>
      <PageTitle title="Sites" subtitle="Every site connected to the platform." />

      <AdminTable
        headers={["Site", "Domain", "Owner", "Mode", "Created"]}
        isEmpty={sites.length === 0}
        empty="No sites yet."
      >
        {sites.map((site) => (
          <tr key={site.id}>
            <Cell>
              <span className="flex items-center gap-2">
                {site.name}
                {site.archived && (
                  <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] text-zinc-500">
                    archived
                  </span>
                )}
              </span>
            </Cell>
            <Cell muted>{site.domain}</Cell>
            <Cell muted>{site.ownerEmail}</Cell>
            <Cell muted>{site.mode}</Cell>
            <Cell muted>{new Date(site.createdAt).toLocaleDateString("en-GB")}</Cell>
          </tr>
        ))}
      </AdminTable>
    </>
  );
}

import { listSites } from "@/lib/admin/queries";
import { AdminTable, Row, Cell, PageTitle, Badge } from "@/components/admin/admin-ui";

export const dynamic = "force-dynamic";

export default async function AdminSitesPage() {
  const sites = await listSites();
  const active = sites.filter((site) => !site.archived).length;

  return (
    <>
      <PageTitle
        title="Sites"
        subtitle={`${sites.length} sites shown · ${active} active`}
      />

      <AdminTable
        headers={["Site", "Domain", "Owner", "Mode", "Created"]}
        isEmpty={sites.length === 0}
        empty="No sites yet."
      >
        {sites.map((site) => (
          <Row key={site.id}>
            <Cell>
              <span className="flex items-center gap-2">
                {site.name}
                {site.archived && <Badge>archived</Badge>}
              </span>
            </Cell>
            <Cell muted>{site.domain}</Cell>
            <Cell muted>{site.ownerEmail}</Cell>
            <Cell>
              <Badge tone={site.mode === "reviews" ? "purple" : "zinc"}>{site.mode}</Badge>
            </Cell>
            <Cell muted>
              <span className="tabular-nums">
                {new Date(site.createdAt).toLocaleDateString("en-GB")}
              </span>
            </Cell>
          </Row>
        ))}
      </AdminTable>
    </>
  );
}

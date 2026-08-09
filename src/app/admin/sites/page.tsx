import Link from "next/link";
import { listSites } from "@/lib/admin/queries";
import { AdminTable, Row, Cell, PageTitle, Badge } from "@/components/admin/admin-ui";

export const dynamic = "force-dynamic";

export default async function AdminSitesPage({
  searchParams,
}: {
  searchParams: Promise<{ user?: string }>;
}) {
  const { user } = await searchParams;
  const sites = await listSites(user);
  const active = sites.filter((site) => !site.archived).length;

  return (
    <>
      <PageTitle
        title="Sites"
        subtitle={
          user
            ? `${sites.length} sites for this account`
            : `${sites.length} sites shown · ${active} active`
        }
        action={
          user ? (
            <Link
              href="/admin/sites"
              className="rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-zinc-600 ring-1 ring-zinc-200 transition-colors duration-150 hover:bg-zinc-50"
            >
              Clear filter
            </Link>
          ) : undefined
        }
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

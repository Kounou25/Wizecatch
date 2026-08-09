import Link from "next/link";
import { listSites } from "@/lib/admin/queries";
import { AdminTable, Row, Cell, PageTitle, Badge } from "@/components/admin/admin-ui";
import { SearchForm, SegmentFilter, buildHref } from "@/components/admin/filter-bar";
import { SiteActions } from "@/components/admin/site-actions";
import { SiteFavicon } from "@/components/dashboard/site-favicon";

export const dynamic = "force-dynamic";

const MODES = [
  { value: "all", label: "All modes" },
  { value: "reviews", label: "Reviews" },
  { value: "analytics_only", label: "Analytics" },
];

const STATUSES = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "archived", label: "Archived" },
];

export default async function AdminSitesPage({
  searchParams,
}: {
  // searchParams est asynchrone dans cette version de Next.
  searchParams: Promise<{ user?: string; q?: string; mode?: string; status?: string }>;
}) {
  const { user, q = "", mode = "all", status = "all" } = await searchParams;

  const sites = await listSites({ userId: user, search: q, mode, status });
  const active = sites.filter((site) => !site.archived).length;

  // Les filtres se combinent : changer l'un conserve les autres.
  const href = (changed: Record<string, string | undefined>) =>
    buildHref("/admin/sites", { user, q, mode, status, ...changed });

  const filtered = Boolean(user || q || mode !== "all" || status !== "all");

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
          filtered ? (
            <Link
              href="/admin/sites"
              className="rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-zinc-600 ring-1 ring-zinc-200 transition-colors duration-150 hover:bg-zinc-50"
            >
              Clear filters
            </Link>
          ) : undefined
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <SearchForm
          action="/admin/sites"
          value={q}
          placeholder="Search by name or domain"
          hidden={{ user, mode, status }}
        />
        <SegmentFilter
          options={MODES}
          current={mode}
          hrefFor={(value) => href({ mode: value })}
        />
        <SegmentFilter
          options={STATUSES}
          current={status}
          hrefFor={(value) => href({ status: value })}
        />
      </div>

      <AdminTable
        headers={["Site", "Owner", "Mode", "Created", ""]}
        isEmpty={sites.length === 0}
        empty={filtered ? "No site matches these filters." : "No sites yet."}
      >
        {sites.map((site) => (
          <Row key={site.id}>
            <Cell>
              <span className="flex items-center gap-2.5">
                <SiteFavicon domain={site.domain} size="sm" />
                <span className="min-w-0">
                  <span className="flex items-center gap-2">
                    <span className="truncate font-medium">{site.name}</span>
                    {site.archived && <Badge>archived</Badge>}
                  </span>
                  <span className="block truncate text-xs text-zinc-400">
                    {site.domain}
                  </span>
                </span>
              </span>
            </Cell>
            <Cell muted>{site.ownerEmail}</Cell>
            <Cell>
              <Badge tone={site.mode === "reviews" ? "purple" : "zinc"}>
                {site.mode === "reviews" ? "reviews" : "analytics"}
              </Badge>
            </Cell>
            <Cell muted>
              <span className="tabular-nums">
                {new Date(site.createdAt).toLocaleDateString("en-GB")}
              </span>
            </Cell>
            <Cell>
              <SiteActions
                domain={site.domain}
                publicKey={site.publicKey}
                ownerEmail={site.ownerEmail}
              />
            </Cell>
          </Row>
        ))}
      </AdminTable>
    </>
  );
}

import Link from "next/link";
import { listReviews, listSiteOptions } from "@/lib/admin/queries";
import { AdminTable, Row, Cell, PageTitle, Badge } from "@/components/admin/admin-ui";
import { SearchForm, SegmentFilter, buildHref } from "@/components/admin/filter-bar";
import { ReviewModeration } from "@/components/admin/review-moderation";

export const dynamic = "force-dynamic";

const STATUSES = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "published", label: "Published" },
  { value: "hidden", label: "Hidden" },
];

const TONES: Record<string, "amber" | "emerald" | "zinc"> = {
  pending: "amber",
  published: "emerald",
  hidden: "zinc",
};

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; site?: string }>;
}) {
  const { status = "all", q = "", site = "all" } = await searchParams;

  const [reviews, siteOptions] = await Promise.all([
    listReviews({ status, search: q, siteId: site }),
    listSiteOptions(),
  ]);

  const href = (changed: Record<string, string | undefined>) =>
    buildHref("/admin/reviews", { status, q, site, ...changed });

  const filtered = status !== "all" || Boolean(q) || site !== "all";
  const pending = reviews.filter((review) => review.status === "pending").length;

  return (
    <>
      <PageTitle
        title="Reviews"
        subtitle={`${reviews.length} shown · ${pending} awaiting moderation`}
        action={
          filtered ? (
            <Link
              href="/admin/reviews"
              className="rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-zinc-600 ring-1 ring-zinc-200 transition-colors duration-150 hover:bg-zinc-50"
            >
              Clear filters
            </Link>
          ) : undefined
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <SearchForm
          action="/admin/reviews"
          value={q}
          placeholder="Search content or author"
          hidden={{ status, site }}
        />
        <SegmentFilter
          options={STATUSES}
          current={status}
          hrefFor={(value) => href({ status: value })}
        />

        {/* Un menu déroulant plutôt que des segments : le nombre de sites
            grandit sans limite, contrairement aux statuts. */}
        <form action="/admin/reviews" className="flex gap-2">
          <input type="hidden" name="status" value={status} />
          {q && <input type="hidden" name="q" value={q} />}
          <select
            name="site"
            defaultValue={site}
            className="rounded-lg border border-zinc-300 bg-white px-2.5 py-2 text-xs text-zinc-700 focus:border-purple-500 focus:outline-none"
          >
            <option value="all">All sites</option>
            {siteOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-lg bg-white px-2.5 py-2 text-xs font-medium text-zinc-600 ring-1 ring-inset ring-zinc-300 transition-colors duration-150 hover:bg-zinc-50"
          >
            Apply
          </button>
        </form>
      </div>

      <AdminTable
        headers={["Site", "Author", "Content", "Status", "Date", ""]}
        isEmpty={reviews.length === 0}
        empty={filtered ? "No review matches these filters." : "No reviews yet."}
      >
        {reviews.map((review) => (
          <Row key={review.id}>
            <Cell>{review.siteName}</Cell>
            <Cell muted>
              <span className="block truncate">{review.authorName ?? "—"}</span>
              {review.authorEmail && (
                <span className="block truncate text-xs text-zinc-400">
                  {review.authorEmail}
                </span>
              )}
            </Cell>
            <Cell>
              <span className="flex items-center gap-2">
                {review.rating !== null && (
                  <span className="shrink-0 text-xs font-medium tabular-nums text-amber-600">
                    {review.rating}/5
                  </span>
                )}
                {/* Tronqué : la table doit rester lisible même avec un pavé. */}
                <span className="line-clamp-2 max-w-sm text-xs text-zinc-600">
                  {review.comment ?? "—"}
                </span>
              </span>
            </Cell>
            <Cell>
              <Badge tone={TONES[review.status] ?? "zinc"}>{review.status}</Badge>
            </Cell>
            <Cell muted>
              <span className="tabular-nums">
                {new Date(review.createdAt).toLocaleDateString("en-GB")}
              </span>
            </Cell>
            <Cell>
              <ReviewModeration reviewId={review.id} status={review.status} />
            </Cell>
          </Row>
        ))}
      </AdminTable>
    </>
  );
}

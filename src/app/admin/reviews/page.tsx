import Link from "next/link";
import { listReviews } from "@/lib/admin/queries";
import { AdminTable, Cell, PageTitle } from "@/components/admin/admin-table";
import { ReviewModeration } from "@/components/admin/review-moderation";

export const dynamic = "force-dynamic";

const FILTERS = ["all", "pending", "published", "hidden"];

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status = "all" } = await searchParams;
  const current = FILTERS.includes(status) ? status : "all";
  const reviews = await listReviews(current);

  return (
    <>
      <PageTitle
        title="Reviews"
        subtitle="Moderation across every site — for spam and abuse."
      />

      <div className="mb-4 flex flex-wrap gap-1">
        {FILTERS.map((filter) => (
          <Link
            key={filter}
            href={`/admin/reviews?status=${filter}`}
            className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors duration-150 ${
              filter === current
                ? "bg-zinc-900 text-white"
                : "bg-white text-zinc-600 ring-1 ring-zinc-200 hover:bg-zinc-50"
            }`}
          >
            {filter}
          </Link>
        ))}
      </div>

      <AdminTable
        headers={["Site", "Author", "Content", "Status", "Date", ""]}
        isEmpty={reviews.length === 0}
        empty="No reviews match this filter."
      >
        {reviews.map((review) => (
          <tr key={review.id}>
            <Cell>{review.siteName}</Cell>
            <Cell muted>{review.authorName ?? "—"}</Cell>
            <Cell>
              <span className="flex items-center gap-2">
                {review.rating !== null && (
                  <span className="shrink-0 text-xs text-amber-600">{review.rating}/5</span>
                )}
                {/* Tronqué : la table doit rester lisible même avec un pavé. */}
                <span className="line-clamp-2 max-w-md text-xs text-zinc-600">
                  {review.comment ?? "—"}
                </span>
              </span>
            </Cell>
            <Cell muted>{review.status}</Cell>
            <Cell muted>{new Date(review.createdAt).toLocaleDateString("en-GB")}</Cell>
            <Cell>
              <ReviewModeration reviewId={review.id} status={review.status} />
            </Cell>
          </tr>
        ))}
      </AdminTable>
    </>
  );
}

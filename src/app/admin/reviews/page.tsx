import Link from "next/link";
import { listReviews } from "@/lib/admin/queries";
import { AdminTable, Row, Cell, PageTitle, Badge } from "@/components/admin/admin-ui";
import { ReviewModeration } from "@/components/admin/review-moderation";

export const dynamic = "force-dynamic";

const FILTERS = ["all", "pending", "published", "hidden"];

const TONES: Record<string, "amber" | "emerald" | "zinc"> = {
  pending: "amber",
  published: "emerald",
  hidden: "zinc",
};

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

      <div className="mb-4 inline-flex gap-0.5 rounded-lg bg-zinc-100 p-0.5">
        {FILTERS.map((filter) => (
          <Link
            key={filter}
            href={`/admin/reviews?status=${filter}`}
            className={`rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors duration-150 ${
              filter === current
                ? "bg-white text-zinc-900 shadow-sm"
                : "text-zinc-500 hover:text-zinc-800"
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
          <Row key={review.id}>
            <Cell>{review.siteName}</Cell>
            <Cell muted>{review.authorName ?? "—"}</Cell>
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

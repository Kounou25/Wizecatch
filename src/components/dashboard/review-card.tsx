import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/star-rating";
import { ThumbsRating } from "@/components/thumbs-rating";
import { NPSDisplay } from "@/components/nps-display";
import { MapPinIcon, QuoteIcon } from "@/components/icons";
import type { Review, ReviewStatus } from "@/lib/mock-data";

const statusVariant: Record<ReviewStatus, "green" | "yellow" | "neutral"> = {
  published: "green",
  pending: "yellow",
  hidden: "neutral",
};

const statusLabel: Record<ReviewStatus, string> = {
  published: "Published",
  pending: "Pending",
  hidden: "Hidden",
};

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const avatarColors = [
  "bg-purple-100 text-purple-700",
  "bg-blue-100 text-blue-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-emerald-100 text-emerald-700",
];

function avatarColor(seed: string) {
  const index = seed.charCodeAt(0) % avatarColors.length;
  return avatarColors[index];
}

function RatingIndicator({ review }: { review: Review }) {
  switch (review.templateId) {
    case "star_rating":
    case "star_comment":
      return typeof review.rating === "number" ? (
        <StarRating rating={review.rating} size="sm" />
      ) : null;
    case "thumbs":
      return typeof review.thumbsUp === "boolean" ? (
        <ThumbsRating up={review.thumbsUp} label={review.thumbsUp ? "Positive" : "Negative"} />
      ) : null;
    case "nps":
      return typeof review.npsScore === "number" ? (
        <NPSDisplay score={review.npsScore} />
      ) : null;
    default:
      return null;
  }
}

export function ReviewCard({ review }: { review: Review }) {
  const isTestimonial = review.templateId === "testimonial";

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${avatarColor(review.authorName)}`}
          >
            {review.authorInitial}
          </span>
          <div>
            <p className="text-sm font-medium text-zinc-900">{review.authorName}</p>
            <div className="mt-0.5 flex items-center gap-1 text-xs text-zinc-500">
              <MapPinIcon className="h-3.5 w-3.5" />
              {review.city}, {review.country}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <RatingIndicator review={review} />
          <Badge variant={statusVariant[review.status]}>{statusLabel[review.status]}</Badge>
        </div>
      </div>

      {review.comment && (
        <p
          className={
            isTestimonial
              ? "relative mt-4 pl-6 text-sm italic leading-relaxed text-zinc-700"
              : "mt-3 text-sm leading-relaxed text-zinc-600"
          }
        >
          {isTestimonial && (
            <QuoteIcon className="absolute left-0 top-0.5 h-4 w-4 text-purple-300" />
          )}
          {review.comment}
        </p>
      )}

      <p className="mt-3 text-xs text-zinc-400">{formatDate(review.date)}</p>
    </Card>
  );
}

import { StarRating } from "@/components/star-rating";
import { reviews } from "@/lib/mock-data";

const preview = reviews.slice(0, 3);

const avatarColors = [
  "bg-purple-100 text-purple-700",
  "bg-blue-100 text-blue-700",
  "bg-amber-100 text-amber-700",
];

export function WidgetMockup() {
  return (
    <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-zinc-200">
      <div className="flex items-center gap-1.5 border-b border-zinc-100 bg-zinc-50 px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-red-300" />
        <span className="h-2.5 w-2.5 rounded-full bg-yellow-300" />
        <span className="h-2.5 w-2.5 rounded-full bg-green-300" />
        <span className="ml-3 rounded-md bg-white px-3 py-1 text-xs text-zinc-400 ring-1 ring-zinc-200">
          launchbase.app
        </span>
      </div>

      <div className="space-y-4 p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-zinc-900">
            What our customers say
          </h3>
          <StarRating rating={4.8} size="sm" showValue />
        </div>

        <div className="space-y-3">
          {preview.map((review, index) => (
            <div
              key={review.id}
              className="rounded-xl bg-zinc-50 p-3 ring-1 ring-zinc-100"
            >
              <div className="flex items-start gap-3">
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${avatarColors[index % avatarColors.length]}`}
                >
                  {review.authorInitial}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-medium text-zinc-900">
                      {review.authorName}
                    </span>
                    <StarRating rating={review.rating ?? 0} size="sm" />
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-zinc-500">
                    {review.comment}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center pt-1">
          <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-medium text-zinc-400">
            ⚡ Powered by Wizecatch
          </span>
        </div>
      </div>
    </div>
  );
}

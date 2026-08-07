import { StarRating } from "@/components/star-rating";
import { QuoteIcon } from "@/components/icons";
import { Reveal } from "@/components/reveal";
import { Spotlight } from "@/components/spotlight";
import { cn } from "@/lib/utils";
import type { ProductTestimonial } from "@/lib/mock-data";

const avatarColors = [
  "bg-purple-100 text-purple-700",
  "bg-blue-100 text-blue-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-emerald-100 text-emerald-700",
];

function avatarColor(seed: string) {
  return avatarColors[seed.charCodeAt(0) % avatarColors.length];
}

export function WallOfLove({ testimonials }: { testimonials: ProductTestimonial[] }) {
  return (
    <div className="columns-1 gap-5 sm:columns-2 lg:columns-3">
      {testimonials.map((testimonial, index) => (
        <Reveal key={testimonial.id} delay={(index % 3) * 90} className="mb-5 break-inside-avoid">
          <Spotlight
            className={cn(
              "rounded-2xl p-6 shadow-sm ring-1 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg",
              testimonial.featured
                ? "bg-zinc-900 text-white ring-zinc-800"
                : "bg-white text-zinc-900 ring-zinc-200",
            )}
          >
            <QuoteIcon
              className={cn(
                "h-5 w-5",
                testimonial.featured ? "text-purple-400" : "text-purple-300",
              )}
            />
            <p
              className={cn(
                "mt-3 text-sm leading-relaxed",
                testimonial.featured ? "text-zinc-200" : "text-zinc-700",
              )}
            >
              {testimonial.quote}
            </p>

            <div className="mt-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                    avatarColor(testimonial.authorName),
                  )}
                >
                  {testimonial.authorInitial}
                </span>
                <div>
                  <p
                    className={cn(
                      "text-sm font-medium",
                      testimonial.featured ? "text-white" : "text-zinc-900",
                    )}
                  >
                    {testimonial.authorName}
                  </p>
                  <p
                    className={cn(
                      "text-xs",
                      testimonial.featured ? "text-zinc-400" : "text-zinc-500",
                    )}
                  >
                    {testimonial.authorRole}
                  </p>
                </div>
              </div>
              {testimonial.rating && <StarRating rating={testimonial.rating} size="sm" />}
            </div>
          </Spotlight>
        </Reveal>
      ))}
    </div>
  );
}

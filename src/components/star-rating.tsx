import { StarIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

export function StarRating({
  rating,
  size = "md",
  showValue = false,
  className,
}: {
  rating: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  className?: string;
}) {
  const rounded = Math.round(rating);
  const starSize = size === "sm" ? "h-3.5 w-3.5" : size === "lg" ? "h-5 w-5" : "h-4 w-4";

  return (
    <div className={cn("inline-flex items-center gap-1", className)}>
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((position) => (
          <StarIcon
            key={position}
            filled={position <= rounded}
            className={cn(starSize, position <= rounded ? "text-purple-600" : "text-zinc-200")}
          />
        ))}
      </div>
      {showValue && (
        <span className="text-sm font-medium text-zinc-700">{rating.toFixed(1)}</span>
      )}
    </div>
  );
}

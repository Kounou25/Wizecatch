import { ThumbsUpIcon, ThumbsDownIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

export function ThumbsRating({ up, label }: { up: boolean; label?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        up ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700",
      )}
    >
      {up ? (
        <ThumbsUpIcon className="h-3.5 w-3.5" />
      ) : (
        <ThumbsDownIcon className="h-3.5 w-3.5" />
      )}
      {label}
    </span>
  );
}

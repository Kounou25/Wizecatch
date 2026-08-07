import { cn } from "@/lib/utils";

function npsColor(score: number) {
  if (score >= 9) return "bg-green-50 text-green-700";
  if (score >= 7) return "bg-yellow-50 text-yellow-700";
  return "bg-red-50 text-red-700";
}

export function NPSDisplay({ score, className }: { score: number; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
        npsColor(score),
        className,
      )}
    >
      {score}
      <span className="font-normal opacity-70">/10</span>
    </span>
  );
}

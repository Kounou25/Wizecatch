import { cn } from "@/lib/utils";

type BadgeVariant = "neutral" | "purple" | "green" | "yellow" | "red";

const variantClasses: Record<BadgeVariant, string> = {
  neutral: "bg-zinc-100 text-zinc-700",
  purple: "bg-purple-50 text-purple-700",
  green: "bg-green-50 text-green-700",
  yellow: "bg-yellow-50 text-yellow-700",
  red: "bg-red-50 text-red-700",
};

export function Badge({
  variant = "neutral",
  className,
  children,
}: {
  variant?: BadgeVariant;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}

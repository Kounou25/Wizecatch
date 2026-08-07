import { cn } from "@/lib/utils";

export function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-xl bg-white shadow-sm ring-1 ring-zinc-200",
        className,
      )}
    >
      {children}
    </div>
  );
}

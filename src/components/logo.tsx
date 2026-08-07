import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({
  href = "/",
  className,
}: {
  href?: string | null;
  className?: string;
}) {
  const content = (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-600 text-sm font-bold text-white">
        W
      </span>
      <span className="text-base font-semibold tracking-tight text-zinc-900">
        Wizecatch
      </span>
    </span>
  );

  if (!href) return content;

  return <Link href={href}>{content}</Link>;
}

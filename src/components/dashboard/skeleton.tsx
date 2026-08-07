import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-lg bg-zinc-200", className)} />;
}

export function SiteCardSkeleton() {
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-zinc-200">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <div className="mt-5 flex items-center justify-between border-t border-zinc-100 pt-4">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-16" />
      </div>
    </div>
  );
}

export function ReviewCardSkeleton() {
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-zinc-200">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Skeleton className="h-9 w-9 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
        <Skeleton className="h-4 w-16" />
      </div>
      <div className="mt-4 space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
      </div>
    </div>
  );
}

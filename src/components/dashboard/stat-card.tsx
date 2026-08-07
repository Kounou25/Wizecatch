import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon: Icon,
  iconClassName,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  iconClassName?: string;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-purple-600",
            iconClassName,
          )}
        >
          <Icon className="h-4 w-4" />
        </span>
        <div>
          <p className="text-sm text-zinc-500">{label}</p>
          <p className="text-xl font-semibold text-zinc-900">{value}</p>
        </div>
      </div>
    </Card>
  );
}

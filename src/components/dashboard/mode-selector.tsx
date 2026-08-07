import { cn } from "@/lib/utils";
import type { SiteMode } from "@/lib/mock-data";

export type ModeOption = {
  mode: SiteMode;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
};

export function ModeSelector({
  value,
  onChange,
  options,
}: {
  value: SiteMode;
  onChange: (mode: SiteMode) => void;
  options: ModeOption[];
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {options.map((option) => {
        const active = value === option.mode;
        return (
          <button
            type="button"
            key={option.mode}
            onClick={() => onChange(option.mode)}
            className={cn(
              "rounded-2xl p-5 text-left ring-1 transition-all duration-150",
              active
                ? "bg-purple-50/60 ring-2 ring-purple-600"
                : "bg-white ring-1 ring-zinc-200 hover:ring-zinc-300",
            )}
          >
            <span
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-lg transition-colors duration-150",
                active ? "bg-purple-600 text-white" : "bg-zinc-100 text-zinc-500",
              )}
            >
              <option.icon className="h-5 w-5" />
            </span>
            <h3 className="mt-3 font-semibold text-zinc-900">{option.title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-zinc-500">
              {option.description}
            </p>
          </button>
        );
      })}
    </div>
  );
}

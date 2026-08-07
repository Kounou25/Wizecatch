import { cn } from "@/lib/utils";

export function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-1">
      <div>
        <p className="text-sm font-medium text-zinc-800">{label}</p>
        {description && <p className="mt-0.5 text-xs text-zinc-500">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-150",
          checked ? "bg-purple-600" : "bg-zinc-200",
        )}
      >
        <span
          className={cn(
            "inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-150",
            checked ? "translate-x-6" : "translate-x-1",
          )}
        />
      </button>
    </div>
  );
}

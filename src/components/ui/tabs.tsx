import { cn } from "@/lib/utils";

export type TabItem = {
  id: string;
  label: string;
};

export function Tabs({
  items,
  active,
  onChange,
}: {
  items: TabItem[];
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="border-b border-zinc-200">
      <nav className="-mb-px flex gap-6 overflow-x-auto">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onChange(item.id)}
            className={cn(
              "whitespace-nowrap border-b-2 px-1 py-3 text-sm font-medium transition-colors duration-150",
              active === item.id
                ? "border-purple-600 text-purple-600"
                : "border-transparent text-zinc-500 hover:border-zinc-300 hover:text-zinc-800",
            )}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  );
}

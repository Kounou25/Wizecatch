import { cn } from "@/lib/utils";
import { templateIcons } from "@/components/template-icon";
import type { ReviewTemplateDef } from "@/lib/mock-data";

export function TemplateCard({
  template,
  selected,
  onClick,
}: {
  template: ReviewTemplateDef;
  selected: boolean;
  onClick: () => void;
}) {
  const Icon = templateIcons[template.id];

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-xl p-4 text-left ring-1 transition-all duration-150",
        selected
          ? "bg-purple-50/60 ring-2 ring-purple-600"
          : "bg-white ring-1 ring-zinc-200 hover:ring-zinc-300",
      )}
    >
      <span
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-lg transition-colors duration-150",
          selected ? "bg-purple-600 text-white" : "bg-zinc-100 text-zinc-500",
        )}
      >
        <Icon className="h-4 w-4" />
      </span>
      <h4 className="mt-3 text-sm font-semibold text-zinc-900">{template.name}</h4>
      <p className="mt-1 text-xs leading-relaxed text-zinc-500">{template.description}</p>
    </button>
  );
}

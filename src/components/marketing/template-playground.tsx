"use client";

import { useState } from "react";
import { TemplatePreviewForm } from "@/components/dashboard/template-preview-form";
import { templateIcons } from "@/components/template-icon";
import { Badge } from "@/components/ui/badge";
import { ActivityIcon, CheckIcon } from "@/components/icons";
import { cn } from "@/lib/utils";
import { type ReviewTemplateId } from "@/lib/mock-data";
import { getReviewTemplates } from "@/lib/i18n/content";
import { useLanguage } from "@/components/providers/language-provider";

type Selection = ReviewTemplateId | "analytics_only";

export function TemplatePlayground({
  analyticsTitle,
  analyticsDesc,
  analyticsBadge,
  previewLabel,
  hint,
}: {
  analyticsTitle: string;
  analyticsDesc: string;
  analyticsBadge: string;
  previewLabel: string;
  hint: string;
}) {
  const { dict } = useLanguage();
  const [selected, setSelected] = useState<Selection>("star_comment");

  const options: {
    id: Selection;
    name: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    ...getReviewTemplates(dict).map((template) => ({
      id: template.id as Selection,
      name: template.name,
      description: template.description,
      icon: templateIcons[template.id],
    })),
    {
      id: "analytics_only" as Selection,
      name: analyticsTitle,
      description: analyticsDesc,
      icon: ActivityIcon,
    },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="grid gap-3 sm:grid-cols-2">
        {options.map((option) => {
          const active = selected === option.id;
          const Icon = option.icon;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => setSelected(option.id)}
              aria-pressed={active}
              className={cn(
                "group relative rounded-2xl p-5 text-left ring-1 transition-all duration-200",
                active
                  ? "bg-white ring-2 ring-purple-600 shadow-lg"
                  : "bg-white/70 ring-zinc-200 hover:-translate-y-0.5 hover:shadow-md hover:ring-zinc-300",
              )}
            >
              {active && (
                <span className="absolute right-4 top-4 flex h-5 w-5 items-center justify-center rounded-full bg-purple-600 text-white">
                  <CheckIcon className="h-3 w-3" />
                </span>
              )}
              <span
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-lg transition-colors duration-200",
                  active ? "bg-purple-600 text-white" : "bg-purple-50 text-purple-600",
                )}
              >
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-semibold text-zinc-900">{option.name}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-zinc-600">
                {option.description}
              </p>
            </button>
          );
        })}
      </div>

      {/* Sticky live preview panel */}
      <div className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-2xl bg-zinc-900 p-5 shadow-xl ring-1 ring-zinc-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wide text-zinc-400">
              {previewLabel}
            </span>
            <span className="flex items-center gap-1.5 text-[11px] text-zinc-500">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping-dot absolute inline-flex h-full w-full rounded-full bg-green-500" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-500" />
              </span>
              live
            </span>
          </div>

          <div className="mt-4">
            {selected === "analytics_only" ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-700 px-6 py-12 text-center">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/5 text-zinc-400">
                  <ActivityIcon className="h-5 w-5" />
                </span>
                <p className="mt-4 text-sm font-medium text-zinc-200">{analyticsTitle}</p>
                <p className="mt-1.5 text-xs leading-relaxed text-zinc-500">{analyticsBadge}</p>
                <Badge variant="purple" className="mt-4 bg-purple-500/20 text-purple-300">
                  0 KB of UI
                </Badge>
              </div>
            ) : (
              <div key={selected} className="animate-slide-up-fade">
                <TemplatePreviewForm templateId={selected} />
              </div>
            )}
          </div>

          <p className="mt-4 text-center text-[11px] text-zinc-500">{hint}</p>
        </div>
      </div>
    </div>
  );
}

"use client";

import { cn } from "@/lib/utils";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/** Périodes fermées — la route API rejette toute autre valeur. */
export const PERIODS = [7, 30, 90] as const;
export type Period = (typeof PERIODS)[number];

export function PeriodSelector({
  value,
  onChange,
  dict,
}: {
  value: Period;
  onChange: (period: Period) => void;
  dict: Dictionary;
}) {
  const labels: Record<Period, string> = {
    7: dict.stats.period7,
    30: dict.stats.period30,
    90: dict.stats.period90,
  };

  return (
    <div className="inline-flex items-center gap-0.5 rounded-lg bg-zinc-100 p-0.5">
      {PERIODS.map((period) => (
        <button
          key={period}
          type="button"
          onClick={() => onChange(period)}
          className={cn(
            "rounded-md px-3 py-1.5 text-xs font-medium transition-colors duration-150",
            period === value
              ? "bg-white text-zinc-900 shadow-sm"
              : "text-zinc-500 hover:text-zinc-800",
          )}
        >
          {labels[period]}
        </button>
      ))}
    </div>
  );
}

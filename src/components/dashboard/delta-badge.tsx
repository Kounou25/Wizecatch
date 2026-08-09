import { cn } from "@/lib/utils";
import type { Delta } from "@/lib/stats/types";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/**
 * Variation par rapport à la période précédente.
 *
 * `inverted` sert aux métriques où la baisse est une bonne nouvelle — le taux
 * de rebond. Sans cela, un rebond en recul s'afficherait en rouge.
 */
export function DeltaBadge({
  delta,
  dict,
  inverted = false,
}: {
  delta: Delta;
  dict: Dictionary;
  inverted?: boolean;
}) {
  // Période précédente vide : passer de 0 à 40 n'est pas « +∞ % ».
  if (delta.percent === null) {
    if (delta.direction !== "up") return null;
    return (
      <span className="text-xs font-medium text-purple-600">{dict.stats.newMetric}</span>
    );
  }

  const isGood = inverted ? delta.percent < 0 : delta.percent > 0;
  const isNeutral = delta.percent === 0;

  return (
    <span
      className={cn(
        "text-xs font-medium tabular-nums",
        isNeutral ? "text-zinc-400" : isGood ? "text-emerald-600" : "text-red-500",
      )}
      title={dict.stats.vsPrevious}
    >
      {delta.percent > 0 ? "+" : ""}
      {delta.percent}%
    </span>
  );
}

import { FlagIcon } from "@/components/flag-icon";
import { platformIcon } from "@/components/dashboard/platform-icons";
import { countryName } from "@/lib/geo/countries";
import type { RatingByEntry } from "@/lib/stats/types";

/**
 * Note moyenne par dimension de trafic.
 *
 * C'est le croisement qu'aucun outil d'analytics seul ne peut produire :
 * savoir *qui* est insatisfait, et pas seulement combien.
 */
export function RatingByList({
  data,
  kind,
  emptyLabel,
}: {
  data: RatingByEntry[];
  kind: "country" | "device";
  emptyLabel: string;
}) {
  if (data.length === 0) {
    return <p className="py-6 text-center text-sm text-zinc-400">{emptyLabel}</p>;
  }

  return (
    <ul className="space-y-1">
      {data.map((entry) => {
        const icon = kind === "device" ? platformIcon("device", entry.label) : null;
        // Sous 3, la couleur signale un problème plutôt qu'un simple écart.
        const tone =
          entry.avgRating >= 4
            ? "text-emerald-600"
            : entry.avgRating >= 3
              ? "text-amber-600"
              : "text-red-500";

        return (
          <li key={entry.label} className="flex h-9 items-center justify-between gap-3 px-1">
            <span className="flex min-w-0 items-center gap-2">
              {kind === "country" ? (
                <FlagIcon country={entry.label} className="h-3.5 w-5" />
              ) : (
                icon && (
                  <svg
                    viewBox="0 0 24 24"
                    className="h-[15px] w-[15px] shrink-0"
                    fill={icon.color}
                    aria-hidden="true"
                  >
                    <path d={icon.path} />
                  </svg>
                )
              )}
              <span className="truncate text-sm text-zinc-700">
                {kind === "country" ? countryName(entry.label) : entry.label}
              </span>
            </span>

            <span className="flex shrink-0 items-baseline gap-2">
              <span className={`text-sm font-semibold tabular-nums ${tone}`}>
                {entry.avgRating.toFixed(1)}
              </span>
              <span className="w-12 text-right text-xs tabular-nums text-zinc-400">
                {entry.count}
              </span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}

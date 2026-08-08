import { platformIcon, type IconSet } from "@/components/dashboard/platform-icons";
import type { BreakdownEntry } from "@/lib/stats/types";

/**
 * Répartition en liste proportionnelle.
 *
 * Un graphique à barres recharts gaspillait la place pour trois valeurs : axe
 * chiffré inutile, grand vide entre le libellé et sa barre, hauteur fixe quel
 * que soit le nombre de lignes. Ici la barre est le fond de la ligne — le
 * libellé, la marque et le total tiennent sur la même ligne, et la carte se
 * dimensionne d'elle-même.
 */
export function BreakdownList({
  data,
  iconSet,
  emptyLabel,
}: {
  data: BreakdownEntry[];
  iconSet?: IconSet;
  emptyLabel: string;
}) {
  if (data.length === 0) {
    return <p className="py-6 text-center text-sm text-zinc-400">{emptyLabel}</p>;
  }

  const total = data.reduce((sum, entry) => sum + entry.count, 0);
  // La barre est relative au premier rang, pas au total : avec une valeur
  // dominante, tout le reste serait sinon réduit à un trait invisible.
  const max = Math.max(...data.map((entry) => entry.count), 1);

  return (
    <ul className="space-y-1">
      {data.map((entry) => {
        const icon = iconSet ? platformIcon(iconSet, entry.label) : null;
        const share = total > 0 ? Math.round((entry.count / total) * 100) : 0;

        return (
          <li key={entry.label} className="relative flex h-9 items-center rounded-md">
            <div
              className="absolute inset-y-0 left-0 rounded-md bg-purple-100/70 transition-[width] duration-500 ease-out"
              style={{ width: `${Math.max((entry.count / max) * 100, 4)}%` }}
              aria-hidden="true"
            />

            <div className="relative flex w-full items-center justify-between gap-3 px-2.5">
              <span className="flex min-w-0 items-center gap-2">
                {icon && (
                  <svg
                    viewBox="0 0 24 24"
                    className="h-[15px] w-[15px] shrink-0"
                    fill={icon.color}
                    aria-hidden="true"
                  >
                    <path d={icon.path} />
                  </svg>
                )}
                <span className="truncate text-sm text-zinc-700">{entry.label}</span>
              </span>

              <span className="flex shrink-0 items-baseline gap-1.5">
                <span className="text-sm font-medium tabular-nums text-zinc-900">
                  {entry.count.toLocaleString("en-US")}
                </span>
                <span className="w-9 text-right text-xs tabular-nums text-zinc-400">
                  {share}%
                </span>
              </span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

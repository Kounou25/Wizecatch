import type { NpsBreakdown } from "@/lib/stats/types";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/**
 * Net Promoter Score — promoteurs (9-10) moins détracteurs (0-6).
 *
 * Le score était collecté depuis l'origine sans jamais être calculé : les
 * réponses dormaient en base.
 */
export function NpsCard({ nps, dict }: { nps: NpsBreakdown; dict: Dictionary }) {
  if (nps.responses === 0) {
    return <p className="py-6 text-center text-sm text-zinc-400">{dict.stats.noData}</p>;
  }

  const segments = [
    { label: dict.stats.npsPromoters, value: nps.promoters, color: "bg-emerald-500" },
    { label: dict.stats.npsPassives, value: nps.passives, color: "bg-zinc-300" },
    { label: dict.stats.npsDetractors, value: nps.detractors, color: "bg-red-400" },
  ];

  // Le NPS va de -100 à +100 : positif est bon, au-dessus de 50 excellent.
  const tone =
    nps.score >= 50 ? "text-emerald-600" : nps.score >= 0 ? "text-amber-600" : "text-red-500";

  return (
    <div>
      <div className="flex items-baseline gap-2">
        <span className={`text-3xl font-semibold tabular-nums ${tone}`}>
          {nps.score > 0 ? "+" : ""}
          {nps.score}
        </span>
        <span className="text-xs text-zinc-400">
          {dict.stats.npsResponses.replace("{count}", String(nps.responses))}
        </span>
      </div>

      <div className="mt-4 flex h-2 overflow-hidden rounded-full bg-zinc-100">
        {segments.map((segment) => (
          <div
            key={segment.label}
            className={segment.color}
            style={{ width: `${(segment.value / nps.responses) * 100}%` }}
          />
        ))}
      </div>

      <ul className="mt-3 space-y-1.5">
        {segments.map((segment) => (
          <li key={segment.label} className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-2 text-zinc-600">
              <span className={`h-2 w-2 rounded-full ${segment.color}`} />
              {segment.label}
            </span>
            <span className="tabular-nums text-zinc-500">{segment.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

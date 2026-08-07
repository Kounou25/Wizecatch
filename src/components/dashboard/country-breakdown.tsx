import { FlagIcon } from "@/components/flag-icon";
import { countryName } from "@/lib/geo/countries";

export function CountryBreakdown({ data }: { data: { country: string; visits: number }[] }) {
  const max = Math.max(...data.map((item) => item.visits), 1);

  return (
    <div className="space-y-2.5">
      {data.map((item) => (
        <div key={item.country} className="flex items-center gap-3">
          <span className="flex w-36 shrink-0 items-center gap-2 truncate text-sm text-zinc-700">
            <FlagIcon country={item.country} />
            {/* La base stocke un code ISO ; on affiche le nom lisible. */}
            <span className="truncate">{countryName(item.country)}</span>
          </span>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-100">
            <div
              className="h-full rounded-full bg-purple-600 transition-all duration-300"
              style={{ width: `${(item.visits / max) * 100}%` }}
            />
          </div>
          <span className="w-10 shrink-0 text-right text-sm font-medium text-zinc-500">
            {item.visits}
          </span>
        </div>
      ))}
    </div>
  );
}

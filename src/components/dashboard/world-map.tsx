"use client";

import { useMemo, useState } from "react";
import { geoNaturalEarth1, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import type { Topology } from "topojson-specification";
import type { Feature, Geometry } from "geojson";
import worldTopo from "world-atlas/countries-110m.json";
import { FlagIcon } from "@/components/flag-icon";
import { countryName, countryMapName } from "@/lib/geo/countries";

const WIDTH = 800;
const HEIGHT = 400;

type CountryProps = { name: string };
type CountryFeature = Feature<Geometry, CountryProps>;

// Built once at module scope: same output on server and client, so no hydration drift.
const countries = (() => {
  const topology = worldTopo as unknown as Topology;
  const collection = feature(topology, topology.objects.countries) as unknown as {
    features: CountryFeature[];
  };

  // Antarctica eats a third of the canvas for no analytical value.
  const features = collection.features.filter(
    (item) => item.properties?.name !== "Antarctica",
  );

  const projection = geoNaturalEarth1().fitExtent(
    [
      [8, 8],
      [WIDTH - 8, HEIGHT - 8],
    ],
    { type: "FeatureCollection", features } as never,
  );

  const generator = geoPath(projection);

  return features.map((item, index) => ({
    id: `${item.properties?.name ?? "unknown"}-${index}`,
    name: item.properties?.name ?? "",
    d: generator(item) ?? "",
  }));
})();

const EMPTY_FILL = "#f1f1f3";
const BORDER = "#ffffff";

/** Light lavender → deep purple, driven by share of the busiest country. */
function fillForRatio(ratio: number): string {
  const stops: [number, number, number][] = [
    [237, 233, 254], // violet-100
    [196, 181, 253], // violet-300
    [139, 92, 246], // violet-500
    [109, 40, 217], // violet-700
  ];
  const scaled = Math.min(0.999, Math.max(0, ratio)) * (stops.length - 1);
  const index = Math.floor(scaled);
  const t = scaled - index;
  const from = stops[index];
  const to = stops[Math.min(stops.length - 1, index + 1)];
  const channel = (i: number) => Math.round(from[i] + (to[i] - from[i]) * t);
  return `rgb(${channel(0)}, ${channel(1)}, ${channel(2)})`;
}

export function WorldMap({ data }: { data: { country: string; visits: number }[] }) {
  const [hovered, setHovered] = useState<{ name: string; visits: number } | null>(null);

  // Les données portent des codes ISO ("NE"), le jeu cartographique des noms
  // ("Niger") : on convertit une fois pour indexer les deux sens.
  const { visitsByMapName, maxVisits } = useMemo(() => {
    const lookup = new Map<string, number>();
    for (const row of data) {
      lookup.set(countryMapName(row.country), row.visits);
    }
    return {
      visitsByMapName: lookup,
      maxVisits: Math.max(...data.map((row) => row.visits), 1),
    };
  }, [data]);

  /** Nom de la carte → code ISO, pour retrouver le drapeau au survol. */
  const codeForMapName = useMemo(() => {
    const reverse = new Map<string, string>();
    for (const row of data) {
      reverse.set(countryMapName(row.country), row.country);
    }
    return reverse;
  }, [data]);

  return (
    <div className="relative overflow-hidden rounded-xl bg-white ring-1 ring-zinc-100">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="aspect-[2/1] w-full"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="Visitors by country"
      >
        <g>
          {countries.map((country) => {
            const visits = visitsByMapName.get(country.name);
            const hasData = typeof visits === "number";
            const isHovered = hovered?.name === country.name;

            return (
              <path
                key={country.id}
                d={country.d}
                fill={hasData ? fillForRatio(visits / maxVisits) : EMPTY_FILL}
                stroke={BORDER}
                strokeWidth={isHovered ? 1.1 : 0.5}
                className={
                  hasData
                    ? "cursor-pointer transition-[filter] duration-150"
                    : "transition-[filter] duration-150"
                }
                style={isHovered ? { filter: "brightness(1.12)" } : undefined}
                onMouseEnter={() =>
                  hasData && setHovered({ name: country.name, visits })
                }
                onMouseLeave={() => setHovered(null)}
              />
            );
          })}
        </g>
      </svg>

      {hovered && (
        <div className="pointer-events-none absolute right-3 top-3 flex items-center gap-2 rounded-lg bg-white px-3 py-1.5 text-sm shadow-md ring-1 ring-zinc-200">
          <FlagIcon
            country={codeForMapName.get(hovered.name) ?? ""}
            className="h-3.5 w-5"
          />
          <span className="font-medium text-zinc-800">
            {countryName(codeForMapName.get(hovered.name)) || hovered.name}
          </span>
          <span className="text-zinc-400">{hovered.visits} visits</span>
        </div>
      )}

      <div className="flex items-center justify-between border-t border-zinc-100 px-4 py-2.5">
        <span className="text-xs text-zinc-400">Darker = more visits</span>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-zinc-400">0</span>
          {[0, 0.33, 0.66, 1].map((ratio) => (
            <span
              key={ratio}
              className="h-2.5 w-6 rounded-sm"
              style={{ backgroundColor: fillForRatio(ratio) }}
            />
          ))}
          <span className="text-[11px] text-zinc-400">{maxVisits}</span>
        </div>
      </div>
    </div>
  );
}

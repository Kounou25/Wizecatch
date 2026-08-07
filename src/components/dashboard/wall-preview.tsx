"use client";

import { StarIcon } from "@/components/icons";
import { cn } from "@/lib/utils";
import type { WidgetFormat } from "@/lib/mock-data";

const SAMPLE = [
  { initial: "M", name: "Maya Torres", text: "Set this up in four minutes. Looks like our own team built it.", rating: 5 },
  { initial: "J", name: "Jonas Weber", text: "Doesn't slow the page down at all.", rating: 5 },
  { initial: "P", name: "Priya Nair", text: "Does exactly what it says.", rating: 4 },
];

function MiniCard({ item }: { item: (typeof SAMPLE)[number] }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-2.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-100 text-[9px] font-semibold text-purple-700">
            {item.initial}
          </span>
          <span className="truncate text-[10px] font-medium text-zinc-800">{item.name}</span>
        </div>
        <span className="flex shrink-0 gap-px">
          {[1, 2, 3, 4, 5].map((n) => (
            <StarIcon
              key={n}
              filled={n <= item.rating}
              className={cn("h-2 w-2", n <= item.rating ? "text-purple-600" : "text-zinc-200")}
            />
          ))}
        </span>
      </div>
      <p className="mt-1.5 line-clamp-2 text-[9px] leading-snug text-zinc-500">{item.text}</p>
    </div>
  );
}

/**
 * Aperçu à l'échelle de la mise en page choisie.
 *
 * Ce n'est pas le widget réel — c'est une maquette fidèle qui permet de
 * comprendre le rendu sans avoir à publier puis recharger son propre site.
 */
export function WallPreview({ format }: { format: WidgetFormat }) {
  return (
    <div className="rounded-xl bg-zinc-50 p-3 ring-1 ring-zinc-100">
      {format === "list" && (
        <div className="flex flex-col gap-2">
          {SAMPLE.map((item) => (
            <MiniCard key={item.name} item={item} />
          ))}
        </div>
      )}

      {format === "grid" && (
        <div className="grid grid-cols-2 gap-2">
          {SAMPLE.map((item) => (
            <MiniCard key={item.name} item={item} />
          ))}
        </div>
      )}

      {format === "carousel" && (
        <div>
          <div className="flex gap-2 overflow-hidden">
            {SAMPLE.slice(0, 2).map((item) => (
              <div key={item.name} className="w-1/2 shrink-0">
                <MiniCard item={item} />
              </div>
            ))}
          </div>
          <div className="mt-2 flex items-center justify-center gap-1">
            <span className="h-1 w-4 rounded-full bg-purple-600" />
            <span className="h-1 w-1 rounded-full bg-zinc-300" />
            <span className="h-1 w-1 rounded-full bg-zinc-300" />
          </div>
        </div>
      )}

      {format === "popup" && (
        <div className="relative h-[104px] rounded-lg border border-dashed border-zinc-300 bg-white">
          <span className="absolute left-2 top-2 text-[9px] text-zinc-400">
            Your page
          </span>
          <div className="absolute bottom-2 right-2 w-[62%]">
            <MiniCard item={SAMPLE[0]} />
          </div>
        </div>
      )}
    </div>
  );
}

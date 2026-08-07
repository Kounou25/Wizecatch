"use client";

import { useEffect, useState } from "react";
import { StarRating } from "@/components/star-rating";
import { FlagIcon } from "@/components/flag-icon";
import { reviews } from "@/lib/mock-data";

/** A fixed rotation of real-looking events; first item renders on the server too. */
const feed = reviews
  .filter((review) => review.city && review.country)
  .slice(0, 6)
  .map((review) => ({
    id: review.id,
    initial: review.authorInitial,
    name: review.authorName,
    city: review.city,
    country: review.country,
    rating: review.rating ?? 5,
  }));

export function LiveActivity({ label }: { label: string }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % feed.length);
    }, 3200);
    return () => clearInterval(timer);
  }, []);

  const event = feed[index];

  return (
    <div className="inline-flex items-center gap-3 rounded-full bg-white/90 py-1.5 pl-2 pr-4 shadow-lg ring-1 ring-zinc-200 backdrop-blur">
      <span className="relative flex h-2 w-2 shrink-0">
        <span className="animate-ping-dot absolute inline-flex h-full w-full rounded-full bg-green-500" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
      </span>

      <div key={event.id} className="animate-slide-up-fade flex items-center gap-2.5">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-100 text-[11px] font-semibold text-purple-700">
          {event.initial}
        </span>
        <div className="flex items-center gap-2 whitespace-nowrap text-xs">
          <span className="font-medium text-zinc-800">{event.name}</span>
          <StarRating rating={event.rating} size="sm" />
          <span className="hidden items-center gap-1 text-zinc-400 sm:flex">
            <FlagIcon country={event.country} className="h-2.5 w-3.5" />
            {event.city}
          </span>
        </div>
      </div>

      <span className="border-l border-zinc-200 pl-3 text-[11px] font-medium uppercase tracking-wide text-zinc-400">
        {label}
      </span>
    </div>
  );
}

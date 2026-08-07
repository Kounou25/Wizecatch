"use client";

import { useState } from "react";
import { ChevronDownIcon } from "@/components/icons";
import { cn } from "@/lib/utils";
import type { FaqEntry } from "@/lib/mock-data";

export function FaqAccordion({ items }: { items: FaqEntry[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="divide-y divide-zinc-200 rounded-2xl bg-white shadow-sm ring-1 ring-zinc-200">
      {items.map((item, index) => {
        const open = openIndex === index;
        return (
          <div key={item.question}>
            <button
              type="button"
              onClick={() => setOpenIndex(open ? null : index)}
              className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors duration-150 hover:bg-zinc-50"
              aria-expanded={open}
            >
              <span className="text-sm font-medium text-zinc-900">{item.question}</span>
              <ChevronDownIcon
                className={cn(
                  "h-4 w-4 shrink-0 text-zinc-400 transition-transform duration-300",
                  open && "rotate-180 text-purple-600",
                )}
              />
            </button>
            <div
              className={cn(
                "grid transition-all duration-300 ease-in-out",
                open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
              )}
            >
              <div className="overflow-hidden">
                <p className="px-6 pb-5 text-sm leading-relaxed text-zinc-600">{item.answer}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

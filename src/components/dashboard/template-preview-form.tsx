"use client";

import { useState } from "react";
import { StarIcon, ThumbsUpIcon, ThumbsDownIcon } from "@/components/icons";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { defaultTemplateCustomization, type ReviewTemplateId } from "@/lib/mock-data";

export function TemplatePreviewForm({
  templateId,
  title,
  buttonLabel,
}: {
  templateId: ReviewTemplateId;
  title?: string;
  buttonLabel?: string;
}) {
  const [stars, setStars] = useState(0);
  const [thumbs, setThumbs] = useState<"up" | "down" | null>(null);
  const [nps, setNps] = useState<number | null>(null);

  const defaults = defaultTemplateCustomization[templateId];
  const resolvedTitle = title?.trim() || defaults.title;
  const resolvedButtonLabel = buttonLabel?.trim() || defaults.buttonLabel;

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
      {(templateId === "star_rating" || templateId === "star_comment") && (
        <>
          <p className="text-sm font-medium text-zinc-800">{resolvedTitle}</p>
          <div className="mt-2 flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} type="button" onClick={() => setStars(n)} className="p-0.5">
                <StarIcon
                  filled={n <= stars}
                  className={cn("h-6 w-6", n <= stars ? "text-purple-600" : "text-zinc-200")}
                />
              </button>
            ))}
          </div>
          {templateId === "star_comment" && (
            <Textarea className="mt-3" rows={3} placeholder="Tell us more (optional)" />
          )}
        </>
      )}

      {templateId === "thumbs" && (
        <>
          <p className="text-sm font-medium text-zinc-800">{resolvedTitle}</p>
          <div className="mt-3 flex gap-3">
            <button
              type="button"
              onClick={() => setThumbs("up")}
              className={cn(
                "flex h-11 w-11 items-center justify-center rounded-lg ring-1 transition-colors duration-150",
                thumbs === "up"
                  ? "bg-green-50 text-green-600 ring-green-200"
                  : "text-zinc-400 ring-zinc-200 hover:bg-zinc-50",
              )}
            >
              <ThumbsUpIcon className="h-5 w-5" filled={thumbs === "up"} />
            </button>
            <button
              type="button"
              onClick={() => setThumbs("down")}
              className={cn(
                "flex h-11 w-11 items-center justify-center rounded-lg ring-1 transition-colors duration-150",
                thumbs === "down"
                  ? "bg-red-50 text-red-600 ring-red-200"
                  : "text-zinc-400 ring-zinc-200 hover:bg-zinc-50",
              )}
            >
              <ThumbsDownIcon className="h-5 w-5" filled={thumbs === "down"} />
            </button>
          </div>
        </>
      )}

      {templateId === "nps" && (
        <>
          <p className="text-sm font-medium text-zinc-800">{resolvedTitle}</p>
          <div className="mt-3 grid grid-cols-11 gap-1">
            {Array.from({ length: 11 }).map((_, n) => (
              <button
                key={n}
                type="button"
                onClick={() => setNps(n)}
                className={cn(
                  "flex h-8 items-center justify-center rounded text-xs font-medium ring-1 transition-colors duration-150",
                  nps === n
                    ? "bg-purple-600 text-white ring-purple-600"
                    : "text-zinc-500 ring-zinc-200 hover:bg-zinc-50",
                )}
              >
                {n}
              </button>
            ))}
          </div>
          <Textarea
            className="mt-3"
            rows={2}
            placeholder="What's the reason for your score? (optional)"
          />
        </>
      )}

      {templateId === "testimonial" && (
        <>
          <p className="text-sm font-medium text-zinc-800">{resolvedTitle}</p>
          <Input className="mt-2" placeholder="Your name" />
          <Textarea className="mt-2" rows={3} placeholder="Write your testimonial..." />
        </>
      )}

      <div className="mt-4 flex items-center justify-between">
        <Button size="sm" disabled className="opacity-60">
          {resolvedButtonLabel}
        </Button>
        <span className="text-xs text-zinc-400">Preview only</span>
      </div>
    </div>
  );
}

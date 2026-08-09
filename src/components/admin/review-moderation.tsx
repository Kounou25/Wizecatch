"use client";

import { useState, useTransition } from "react";
import { setReviewStatus } from "@/lib/admin/actions";
import { CheckIcon, XIcon, LoaderIcon } from "@/components/icons";

/**
 * Modération globale — pour le spam et les contenus abusifs.
 *
 * Ne remplace pas la modération du client sur son propre tableau de bord :
 * elle sert quand un contenu doit disparaître sans attendre que le
 * propriétaire du site s'en occupe.
 */
export function ReviewModeration({
  reviewId,
  status,
}: {
  reviewId: string;
  status: string;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function apply(next: string) {
    if (next === status) return;
    setError(null);

    startTransition(async () => {
      const result = await setReviewStatus(reviewId, next);
      // Sans cela, un échec laissait croire que la modération avait pris effet.
      if (result.error) setError(result.error);
    });
  }

  const actions = [
    {
      value: "published",
      label: "Publish",
      icon: CheckIcon,
      tone: "text-emerald-700 ring-emerald-200 hover:bg-emerald-50",
    },
    {
      value: "hidden",
      label: "Hide",
      icon: XIcon,
      tone: "text-red-600 ring-red-200 hover:bg-red-50",
    },
  ];

  if (pending) {
    return (
      <span className="flex items-center gap-1.5 text-xs text-zinc-400">
        <LoaderIcon className="h-3.5 w-3.5 animate-spin" />
        Saving
      </span>
    );
  }

  return (
    <span className="flex items-center gap-1.5">
      {actions
        .filter((action) => action.value !== status)
        .map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.value}
              type="button"
              onClick={() => apply(action.value)}
              className={`inline-flex items-center gap-1 rounded-md bg-white px-2 py-1 text-xs font-medium ring-1 ring-inset transition-colors duration-150 ${action.tone}`}
            >
              <Icon className="h-3 w-3" />
              {action.label}
            </button>
          );
        })}

      {error && <span className="text-xs text-red-500">{error}</span>}
    </span>
  );
}

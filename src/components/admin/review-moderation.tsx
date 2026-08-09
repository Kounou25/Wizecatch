"use client";

import { useTransition } from "react";
import { setReviewStatus } from "@/lib/admin/actions";

/**
 * Modération globale — pour le spam et les contenus abusifs.
 *
 * Ne remplace pas la modération du client sur son propre tableau de bord :
 * elle sert quand un contenu doit disparaître sans attendre que le
 * propriétaire du site s'en occupe.
 */
export function ReviewModeration({ reviewId, status }: { reviewId: string; status: string }) {
  const [pending, startTransition] = useTransition();

  function apply(next: string) {
    if (next === status) return;
    startTransition(async () => {
      await setReviewStatus(reviewId, next);
    });
  }

  const actions = [
    { value: "published", label: "Publish", tone: "text-emerald-600 hover:bg-emerald-50" },
    { value: "hidden", label: "Hide", tone: "text-red-600 hover:bg-red-50" },
  ];

  return (
    <span className="flex gap-1">
      {actions
        .filter((action) => action.value !== status)
        .map((action) => (
          <button
            key={action.value}
            type="button"
            disabled={pending}
            onClick={() => apply(action.value)}
            className={`rounded-md px-2 py-1 text-xs font-medium transition-colors duration-150 disabled:opacity-40 ${action.tone}`}
          >
            {action.label}
          </button>
        ))}
    </span>
  );
}

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckIcon, XIcon, LoaderIcon } from "@/components/icons";
import { setReviewStatus } from "@/lib/reviews/actions";
import type { ReviewStatus } from "@/lib/mock-data";

/**
 * Boutons de modération d'un avis.
 *
 * ⚠️ La Server Action appelle revalidatePath, ce qui rafraîchit les Server
 * Components — mais pas le cache de TanStack Query utilisé par l'onglet Avis.
 * Sans l'invalidation explicite ci-dessous, la base était bien mise à jour
 * mais la liste affichait l'ancien statut : l'action semblait sans effet.
 */
export function ReviewModeration({
  reviewId,
  status,
}: {
  reviewId: string;
  status: ReviewStatus;
}) {
  const queryClient = useQueryClient();

  const { mutate, isPending, error } = useMutation({
    mutationFn: async (next: ReviewStatus) => {
      const result = await setReviewStatus(reviewId, next);
      if (!result.ok) throw new Error(result.error ?? "Update failed");
      return result;
    },
    onSuccess: () => {
      // Les avis changent de statut, et les compteurs de stats en dépendent.
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });

  const base =
    "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors duration-150 disabled:opacity-50";

  return (
    <div className="mt-3 border-t border-zinc-100 pt-3">
      <div className="flex items-center gap-2">
        {isPending && <LoaderIcon className="h-3.5 w-3.5 text-zinc-400" />}

        {status !== "published" && (
          <button
            type="button"
            onClick={() => mutate("published")}
            disabled={isPending}
            className={`${base} bg-green-50 text-green-700 hover:bg-green-100`}
          >
            <CheckIcon className="h-3.5 w-3.5" />
            Publish
          </button>
        )}

        {status !== "hidden" && (
          <button
            type="button"
            onClick={() => mutate("hidden")}
            disabled={isPending}
            className={`${base} bg-zinc-100 text-zinc-600 hover:bg-zinc-200`}
          >
            <XIcon className="h-3.5 w-3.5" />
            Hide
          </button>
        )}

        {status !== "pending" && (
          <button
            type="button"
            onClick={() => mutate("pending")}
            disabled={isPending}
            className={`${base} text-zinc-500 hover:bg-zinc-100`}
          >
            Move to pending
          </button>
        )}
      </div>

      {error && (
        <p className="mt-2 text-xs text-red-600">{(error as Error).message}</p>
      )}
    </div>
  );
}

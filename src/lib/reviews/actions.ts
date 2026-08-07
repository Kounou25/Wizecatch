"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ReviewStatus } from "@/lib/mock-data";

/**
 * Modération d'un avis.
 *
 * Aucun contrôle de propriété écrit ici : la politique RLS sur `reviews`
 * n'autorise la mise à jour que si le site appartient à l'utilisateur
 * connecté. Une tentative sur l'avis d'un autre compte ne modifie aucune ligne.
 */
export async function setReviewStatus(
  reviewId: string,
  status: ReviewStatus,
): Promise<{ ok: boolean; error?: string }> {
  if (!["pending", "published", "hidden"].includes(status)) {
    return { ok: false, error: "Invalid status." };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("reviews")
    .update({
      status,
      // Date de publication renseignée à la première mise en ligne.
      published_at: status === "published" ? new Date().toISOString() : null,
    })
    .eq("id", reviewId);

  if (error) {
    console.error("[reviews] setReviewStatus:", error.message);
    return { ok: false, error: error.message };
  }

  revalidatePath("/dashboard", "layout");
  return { ok: true };
}

export async function deleteReview(
  reviewId: string,
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase.from("reviews").delete().eq("id", reviewId);

  if (error) {
    console.error("[reviews] deleteReview:", error.message);
    return { ok: false, error: error.message };
  }

  revalidatePath("/dashboard", "layout");
  return { ok: true };
}

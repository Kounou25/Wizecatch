"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/guard";
import { logAdminAction } from "@/lib/admin/audit";
import { ALLOWED_PLANS } from "@/lib/admin/plans";

/**
 * Actions du back-office.
 *
 * Chaque action rappelle `requireAdmin()` : un layout ne protège pas les Server
 * Actions, qui sont des points d'entrée HTTP à part entière. Un utilisateur qui
 * connaîtrait l'identifiant d'une action pourrait l'appeler directement.
 *
 * Chaque écriture est inscrite au journal d'audit.
 */

export async function setUserPlan(userId: string, plan: string) {
  const { admin, user } = await requireAdmin();

  // Liste fermée : la contrainte SQL rejetterait une valeur inconnue, mais on
  // préfère un refus explicite à une erreur de base remontée à l'écran.
  if (!ALLOWED_PLANS.includes(plan)) {
    return { error: "Unknown plan" };
  }

  const { data: before } = await admin
    .from("profiles")
    .select("email, plan")
    .eq("id", userId)
    .maybeSingle();

  if (!before) return { error: "User not found" };

  const { error } = await admin
    .from("profiles")
    .update({ plan })
    .eq("id", userId);

  if (error) {
    console.error("[admin] setUserPlan:", error.message);
    return { error: "Could not update the plan" };
  }

  await logAdminAction(
    admin,
    user,
    "user.plan_changed",
    { type: "user", id: userId },
    { email: before.email, from: before.plan, to: plan },
  );

  revalidatePath("/admin/users");
  return { error: null };
}

export async function setReviewStatus(reviewId: string, status: string) {
  const { admin, user } = await requireAdmin();

  if (!["pending", "published", "hidden"].includes(status)) {
    return { error: "Unknown status" };
  }

  const { error } = await admin
    .from("reviews")
    .update({
      status,
      // Cohérent avec la modération côté client : publier date la publication.
      published_at: status === "published" ? new Date().toISOString() : null,
    })
    .eq("id", reviewId);

  if (error) {
    console.error("[admin] setReviewStatus:", error.message);
    return { error: "Could not update the review" };
  }

  await logAdminAction(
    admin,
    user,
    "review.status_changed",
    { type: "review", id: reviewId },
    { to: status },
  );

  revalidatePath("/admin/reviews");
  return { error: null };
}

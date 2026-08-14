import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { planForProduct, statusGrantsAccess, LIFETIME_PLAN } from "@/lib/billing/products";

/**
 * Traduction d'un événement Dodo en droit d'accès Wizecatch.
 *
 * Ce fichier contient toute la logique métier de la facturation. Il est séparé
 * de la route pour rester testable sans avoir à fabriquer une requête signée.
 */

type DodoEvent = { type: string; data?: Record<string, unknown> };

/**
 * Retrouve le compte concerné.
 *
 * Trois pistes, dans cet ordre de fiabilité :
 *   1. `metadata.user_id` — posé par nous à la création du paiement, c'est le
 *      lien le plus sûr ;
 *   2. l'abonnement déjà enregistré, pour les renouvellements ;
 *   3. l'email du client, en dernier recours — un client peut payer avec une
 *      autre adresse que celle de son compte, d'où le rang.
 */
async function resolveUserId(
  admin: SupabaseClient,
  data: Record<string, unknown>,
): Promise<string | null> {
  const metadata = (data.metadata ?? {}) as Record<string, unknown>;
  const fromMetadata = metadata.user_id;
  if (typeof fromMetadata === "string" && fromMetadata.length > 0) {
    return fromMetadata;
  }

  const subscriptionId = data.subscription_id;
  if (typeof subscriptionId === "string") {
    const { data: existing } = await admin
      .from("subscriptions")
      .select("user_id")
      .eq("provider_subscription_id", subscriptionId)
      .maybeSingle();

    if (existing?.user_id) return existing.user_id as string;
  }

  const customer = (data.customer ?? {}) as Record<string, unknown>;
  const email = customer.email;
  if (typeof email === "string" && email.length > 0) {
    const { data: profile } = await admin
      .from("profiles")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (profile?.id) return profile.id as string;
  }

  return null;
}

/**
 * Écrit le plan sur le profil.
 *
 * Un plan posé à la main par un administrateur n'est jamais écrasé : c'est
 * tout l'objet de `plan_source`. Sans cette protection, un geste commercial
 * serait annulé au premier webhook de renouvellement.
 */
async function setPlan(admin: SupabaseClient, userId: string, plan: string) {
  const { data: profile } = await admin
    .from("profiles")
    .select("plan, plan_source")
    .eq("id", userId)
    .maybeSingle();

  if (profile?.plan_source === "manual") {
    console.log(`[dodo] plan manuel préservé pour ${userId}`);
    return;
  }

  if (profile?.plan === plan) return;

  await admin
    .from("profiles")
    .update({ plan, plan_source: plan === "free" ? "system" : "dodo" })
    .eq("id", userId);
}

export async function applySubscriptionEvent(admin: SupabaseClient, event: DodoEvent) {
  const data = (event.data ?? {}) as Record<string, unknown>;
  const payloadType = data.payload_type;

  // --- Paiement unique : l'offre à vie ------------------------------------
  // Elle n'émet aucun événement `subscription.*` : ni renouvellement, ni
  // expiration. Sans ce traitement distinct, un client à vie n'obtiendrait
  // jamais son accès.
  if (payloadType === "Payment" && event.type === "payment.succeeded") {
    const cart = data.product_cart;
    const products = Array.isArray(cart) ? (cart as Record<string, unknown>[]) : [];
    const isLifetime = products.some(
      (item) => planForProduct(item.product_id as string) === LIFETIME_PLAN,
    );

    // Les paiements d'abonnement passent aussi par ici : on ne réagit qu'au
    // produit à vie, le reste est traité par les événements `subscription.*`.
    if (!isLifetime) return;

    const userId = await resolveUserId(admin, data);
    if (!userId) throw new Error("compte introuvable pour le paiement à vie");

    await setPlan(admin, userId, LIFETIME_PLAN);
    return;
  }

  if (payloadType !== "Subscription") return;

  const subscriptionId = data.subscription_id;
  if (typeof subscriptionId !== "string") return;

  const userId = await resolveUserId(admin, data);
  if (!userId) throw new Error(`compte introuvable pour ${subscriptionId}`);

  const status = String(data.status ?? "");
  const productId = data.product_id as string | undefined;
  const plan = planForProduct(productId);

  if (!plan) {
    throw new Error(`produit inconnu : ${productId ?? "aucun"}`);
  }

  // On enregistre d'abord l'état brut, quel que soit le statut : c'est ce qui
  // permet d'expliquer après coup pourquoi un compte est dans tel état.
  await admin.from("subscriptions").upsert(
    {
      user_id: userId,
      provider_subscription_id: subscriptionId,
      provider_customer_id:
        ((data.customer ?? {}) as Record<string, unknown>).customer_id ?? null,
      provider_product_id: productId ?? null,
      plan,
      status,
      current_period_end: (data.next_billing_date as string) ?? null,
      cancel_at_period_end: Boolean(data.cancel_at_next_billing_date),
    },
    { onConflict: "provider_subscription_id" },
  );

  // --- Puis le droit d'accès ----------------------------------------------
  if (statusGrantsAccess(status)) {
    await setPlan(admin, userId, plan);
    return;
  }

  // Annulation ou expiration. Une annulation programmée conserve l'accès
  // jusqu'à la fin de la période déjà payée — le client a payé ce mois-là.
  const periodEnd = data.next_billing_date;
  const stillPaid =
    typeof periodEnd === "string" && new Date(periodEnd).getTime() > Date.now();

  if (stillPaid) return;

  // Un achat à vie ne doit jamais être révoqué par l'expiration d'un
  // abonnement mensuel souscrit auparavant.
  const { data: lifetime } = await admin
    .from("subscriptions")
    .select("id")
    .eq("user_id", userId)
    .eq("plan", LIFETIME_PLAN)
    .maybeSingle();

  if (lifetime) return;

  await setPlan(admin, userId, "free");
}

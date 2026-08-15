import "server-only";

import { requireAdmin } from "@/lib/admin/guard";
import { createDodoClient } from "@/lib/billing/dodo";

/**
 * Lecture des paiements depuis l'API Dodo.
 *
 * POURQUOI L'API PLUTÔT QUE NOTRE BASE
 *
 * `payment_events` ne contient que ce que nos webhooks ont reçu. Un webhook
 * perdu, une signature refusée, une panne de quelques minutes — et la ligne
 * manque, sans que rien ne le signale. L'API de Dodo, elle, fait autorité :
 * elle connaît tous les paiements, y compris ceux que nous n'avons jamais vus.
 *
 * C'est aussi ce qui rend cette page utile pour la réconciliation : comparer
 * ce que Dodo a encaissé à ce que notre base a enregistré.
 *
 * Toutes les fonctions passent par `requireAdmin()`.
 */

export type AdminPayment = {
  id: string;
  createdAt: string;
  customerEmail: string;
  customerName: string;
  /** Montant en unité principale (dollars, pas cents). */
  amount: number;
  currency: string;
  status: string;
  cardBrand: string | null;
  cardLast4: string | null;
  refundStatus: string | null;
  disputeStatus: string | null;
  invoiceUrl: string | null;
  subscriptionId: string | null;
  /** Compte Wizecatch, lorsqu'il a été transmis à la création du paiement. */
  userId: string | null;
};

/**
 * Dodo exprime les montants dans la plus petite unité de la devise.
 *
 * La division par 100 vaut pour l'USD et l'EUR, pas pour les devises sans
 * décimales (JPY, KRW). Tant que vous facturez en dollars, c'est exact ; le
 * jour où ce ne sera plus le cas, ce calcul devra tenir compte de la devise.
 */
function toMajorUnit(amount: number): number {
  return amount / 100;
}

export async function listPayments(
  status?: string,
  limit = 50,
): Promise<{ payments: AdminPayment[]; error: string | null }> {
  await requireAdmin();

  try {
    const dodo = createDodoClient();

    const page = await dodo.payments.list({
      page_size: limit,
      ...(status && status !== "all"
        ? { status: status as "succeeded" | "failed" | "cancelled" | "processing" }
        : {}),
    });

    const rows = (page.items ?? []) as unknown as Record<string, unknown>[];

    return {
      payments: rows.map((row) => {
        const customer = (row.customer ?? {}) as Record<string, unknown>;
        const metadata = (row.metadata ?? {}) as Record<string, unknown>;

        return {
          id: String(row.payment_id ?? ""),
          createdAt: String(row.created_at ?? ""),
          customerEmail: String(customer.email ?? "—"),
          customerName: String(customer.name ?? ""),
          amount: toMajorUnit(Number(row.total_amount ?? 0)),
          currency: String(row.currency ?? "USD"),
          status: String(row.status ?? "unknown"),
          cardBrand: (row.card_network as string) ?? null,
          cardLast4: (row.card_last_four as string) ?? null,
          refundStatus: (row.refund_status as string) ?? null,
          disputeStatus: (row.dispute_status as string) ?? null,
          invoiceUrl: (row.invoice_url as string) ?? null,
          subscriptionId: (row.subscription_id as string) ?? null,
          userId: typeof metadata.user_id === "string" ? metadata.user_id : null,
        };
      }),
      error: null,
    };
  } catch (error) {
    // Une clé absente ou un mode mal configuré ne doit pas casser la page :
    // l'administrateur doit voir POURQUOI la liste est vide.
    const message = (error as Error).message;
    console.error("[admin] listPayments:", message);
    return { payments: [], error: message };
  }
}

export type BillingSummary = {
  grossRevenue: number;
  succeeded: number;
  failed: number;
  refunded: number;
  currency: string;
};

/** Chiffres calculés sur la page ramenée, donc sur les N derniers paiements. */
export function summarize(payments: AdminPayment[]): BillingSummary {
  const succeeded = payments.filter((p) => p.status === "succeeded");

  return {
    // Les paiements remboursés sont exclus : afficher un encaissement qui a
    // été rendu donnerait une image fausse du chiffre réalisé.
    grossRevenue: succeeded
      .filter((p) => p.refundStatus !== "succeeded" && p.refundStatus !== "full")
      .reduce((sum, p) => sum + p.amount, 0),
    succeeded: succeeded.length,
    failed: payments.filter((p) => p.status === "failed").length,
    refunded: payments.filter((p) => p.refundStatus).length,
    currency: payments[0]?.currency ?? "USD",
  };
}

export type LocalSubscription = {
  email: string;
  plan: string;
  status: string;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  providerSubscriptionId: string;
};

/**
 * Les abonnements tels que NOTRE base les connaît.
 *
 * C'est volontairement la vue locale : confrontée aux paiements venus de Dodo,
 * elle révèle les écarts — un paiement encaissé sans abonnement enregistré
 * signale un webhook perdu.
 */
export async function listLocalSubscriptions(): Promise<LocalSubscription[]> {
  const { admin } = await requireAdmin();

  const { data, error } = await admin
    .from("subscriptions")
    .select(
      "plan, status, current_period_end, cancel_at_period_end, provider_subscription_id, profiles(email)",
    )
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    console.error("[admin] listLocalSubscriptions:", error.message);
    return [];
  }

  return ((data ?? []) as unknown[]).map((row) => {
    const sub = row as {
      plan: string;
      status: string;
      current_period_end: string | null;
      cancel_at_period_end: boolean;
      provider_subscription_id: string;
      profiles: { email: string } | { email: string }[] | null;
    };
    const owner = Array.isArray(sub.profiles) ? sub.profiles[0] : sub.profiles;

    return {
      email: owner?.email ?? "—",
      plan: sub.plan,
      status: sub.status,
      currentPeriodEnd: sub.current_period_end,
      cancelAtPeriodEnd: sub.cancel_at_period_end,
      providerSubscriptionId: sub.provider_subscription_id,
    };
  });
}

export type FailedEvent = {
  id: number;
  eventType: string;
  error: string;
  createdAt: string;
};

/**
 * Webhooks reçus mais non appliqués.
 *
 * C'est l'alerte opérationnelle de cette page : un paiement encaissé dont
 * l'effet n'a pas été appliqué signifie un client qui a payé sans obtenir son
 * plan. Rien d'autre ne le signalerait.
 */
export async function listFailedEvents(): Promise<FailedEvent[]> {
  const { admin } = await requireAdmin();

  const { data, error } = await admin
    .from("payment_events")
    .select("id, event_type, error, created_at")
    .not("error", "is", null)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    console.error("[admin] listFailedEvents:", error.message);
    return [];
  }

  return ((data ?? []) as { id: number; event_type: string; error: string; created_at: string }[]).map(
    (row) => ({
      id: row.id,
      eventType: row.event_type,
      error: row.error,
      createdAt: row.created_at,
    }),
  );
}

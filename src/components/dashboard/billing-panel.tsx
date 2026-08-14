"use client";

import { useEffect, useState, useTransition } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoaderIcon, ExternalLinkIcon } from "@/components/icons";
import { startCheckout, openBillingPortal } from "@/lib/billing/actions";
import type { BillablePlan } from "@/lib/billing/products";

type Subscription = {
  plan: string;
  status: string;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
} | null;

/**
 * Panneau de facturation.
 *
 * Il ouvre des sessions Dodo ; il n'accorde jamais de plan. Le droit d'accès
 * n'est écrit que par le webhook signé — un bouton ne peut pas donner un
 * abonnement, quelle que soit la manière dont on l'appelle.
 */
type BillingState = {
  plan: string;
  planSource: string;
  subscription: Subscription;
};

export function BillingPanel() {
  const [state, setState] = useState<BillingState | null>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Le panneau est autonome : la page de réglages est un composant client, et
  // lui faire porter cette lecture aurait imposé de la restructurer entière.
  useEffect(() => {
    let cancelled = false;

    fetch("/api/billing/state")
      .then((response) => (response.ok ? response.json() : null))
      .then((data: BillingState | null) => {
        if (!cancelled && data) setState(data);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  function go(action: () => Promise<{ url: string | null; error: string | null }>) {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (result.url) {
        window.location.href = result.url;
        return;
      }
      setError(result.error ?? "Une erreur est survenue.");
    });
  }

  if (!state) {
    return (
      <Card className="p-5">
        <div className="h-5 w-32 animate-pulse rounded bg-zinc-100" />
        <div className="mt-3 h-4 w-48 animate-pulse rounded bg-zinc-100" />
      </Card>
    );
  }

  const { plan, planSource, subscription } = state;
  const isPaid = plan !== "free";
  const offers: { id: BillablePlan; name: string; price: string; note: string }[] = [
    { id: "starter", name: "Starter", price: "12 $", note: "par mois" },
    { id: "scale", name: "Scale", price: "39 $", note: "par mois" },
    { id: "lifetime", name: "Lifetime", price: "199 $", note: "une seule fois" },
  ];

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-zinc-900">Abonnement</h2>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-zinc-500">
            Offre actuelle
            <Badge variant={isPaid ? "purple" : "neutral"}>{plan}</Badge>
            {/* Un plan accordé à la main doit se voir : sinon on cherchera en
                vain le paiement correspondant. */}
            {planSource === "manual" && (
              <span className="text-xs text-zinc-400">accordée manuellement</span>
            )}
          </p>
        </div>

        {subscription?.plan && (
          <button
            type="button"
            disabled={pending}
            onClick={() => go(openBillingPortal)}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-white px-3 text-sm font-medium text-zinc-700 ring-1 ring-inset ring-zinc-300 transition-colors duration-150 hover:bg-zinc-50 disabled:opacity-60"
          >
            {pending ? (
              <LoaderIcon className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <ExternalLinkIcon className="h-3.5 w-3.5" />
            )}
            Gérer mon abonnement
          </button>
        )}
      </div>

      {/* Un prélèvement échoué n'entraîne pas de coupure : on prévient, et le
          client garde son accès le temps de mettre sa carte à jour. */}
      {subscription?.status === "on_hold" && (
        <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800 ring-1 ring-amber-100">
          Votre dernier paiement a échoué. Mettez à jour votre moyen de paiement
          pour éviter l&apos;interruption — votre accès reste actif d&apos;ici là.
        </p>
      )}

      {subscription?.cancelAtPeriodEnd && subscription.currentPeriodEnd && (
        <p className="mt-4 rounded-lg bg-zinc-50 px-3 py-2 text-xs text-zinc-600 ring-1 ring-zinc-200">
          Abonnement annulé. Votre accès reste actif jusqu&apos;au{" "}
          {new Date(subscription.currentPeriodEnd).toLocaleDateString("fr-FR")}.
        </p>
      )}

      {!isPaid && (
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {offers.map((offer) => (
            <button
              key={offer.id}
              type="button"
              disabled={pending}
              onClick={() => go(() => startCheckout(offer.id))}
              className="rounded-xl p-4 text-left ring-1 ring-inset ring-zinc-200 transition-all duration-150 hover:-translate-y-0.5 hover:ring-purple-300 disabled:opacity-60"
            >
              <p className="text-sm font-semibold text-zinc-900">{offer.name}</p>
              <p className="mt-1 text-lg font-semibold text-zinc-900">{offer.price}</p>
              <p className="text-xs text-zinc-400">{offer.note}</p>
            </button>
          ))}
        </div>
      )}

      {error && <p className="mt-3 text-xs text-red-500">{error}</p>}
    </Card>
  );
}

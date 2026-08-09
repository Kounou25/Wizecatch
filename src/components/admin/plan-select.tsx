"use client";

import { useState, useTransition } from "react";
import { setUserPlan } from "@/lib/admin/actions";
import { ALLOWED_PLANS } from "@/lib/admin/plans";

/**
 * Changement de plan depuis la liste des utilisateurs.
 *
 * Tant que Stripe n'est pas branché, c'est le seul moyen d'encaisser un client :
 * on reçoit le paiement, on bascule le plan ici.
 */
export function PlanSelect({
  userId,
  plan,
  email,
}: {
  userId: string;
  plan: string;
  email: string;
}) {
  const [pending, startTransition] = useTransition();
  const [value, setValue] = useState(plan);
  const [error, setError] = useState<string | null>(null);

  function change(next: string) {
    if (next === value) return;

    // Une modification de facturation ne doit pas tenir à un clic mal placé.
    if (!window.confirm(`Change ${email} from "${value}" to "${next}"?`)) return;

    const previous = value;
    setValue(next);
    setError(null);

    startTransition(async () => {
      const result = await setUserPlan(userId, next);
      if (result.error) {
        // On rétablit l'affichage : laisser la nouvelle valeur ferait croire
        // que le changement a été enregistré.
        setValue(previous);
        setError(result.error);
      }
    });
  }

  return (
    <span className="flex items-center gap-2">
      <select
        value={value}
        disabled={pending}
        onChange={(event) => change(event.target.value)}
        className="rounded-md border border-zinc-300 bg-white px-2 py-1 text-xs text-zinc-800 disabled:opacity-50"
      >
        {ALLOWED_PLANS.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </span>
  );
}

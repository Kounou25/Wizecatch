import { Button } from "@/components/ui/button";
import { Spotlight } from "@/components/spotlight";
import { CheckIcon, XIcon } from "@/components/icons";
import { cn } from "@/lib/utils";
import type { PricingPlan } from "@/lib/mock-data";

export function PricingCard({
  plan,
  yearly,
  limitsLabel,
  perMonth,
  billedYearly,
  onceLabel,
  soonLabel,
}: {
  plan: PricingPlan;
  yearly: boolean;
  limitsLabel: string;
  perMonth: string;
  billedYearly: string;
  onceLabel: string;
  soonLabel: string;
}) {
  const isFree = plan.priceMonthly === 0;
  const isOneTime = plan.oneTime === true;

  // Sur l'offre annuelle on affiche le coût mensuel équivalent : comparer
  // « 22 $/mois » à « 27 $/mois » est immédiat, « 270 $/an » ne l'est pas.
  // Le paiement unique échappe à cette bascule : son prix ne varie jamais.
  const displayed =
    isOneTime || isFree
      ? plan.priceMonthly
      : yearly
        ? Math.round(plan.priceYearly / 12)
        : plan.priceMonthly;

  return (
    <Spotlight
      className={cn(
        "flex h-full flex-col rounded-2xl p-7 ring-1 transition-all duration-200 hover:-translate-y-1",
        plan.highlighted
          ? "bg-zinc-900 text-white ring-zinc-900 shadow-xl hover:shadow-2xl"
          : "bg-white text-zinc-900 ring-zinc-200 shadow-sm hover:shadow-lg",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-lg font-semibold">{plan.name}</h3>
        {plan.badge && (
          <span className="animate-pulse-ring rounded-full bg-purple-500/20 px-2.5 py-0.5 text-xs font-medium text-purple-300">
            {plan.badge}
          </span>
        )}
      </div>

      <p
        className={cn(
          "mt-1 text-sm font-medium",
          plan.highlighted ? "text-purple-300" : "text-purple-600",
        )}
      >
        {plan.tagline}
      </p>

      <div className="mt-5 flex items-baseline gap-1">
        <span className="text-4xl font-semibold tracking-tight">${displayed}</span>
        <span className={cn("text-sm", plan.highlighted ? "text-zinc-400" : "text-zinc-500")}>
          {isOneTime ? onceLabel : perMonth}
        </span>
      </div>

      {/* Réserve la hauteur même quand la ligne est absente, pour que les
          trois cartes restent alignées. */}
      <p
        className={cn(
          "mt-1 h-4 text-xs",
          plan.highlighted ? "text-zinc-500" : "text-zinc-400",
        )}
      >
        {isOneTime
          ? ""
          : yearly && !isFree
            ? `$${plan.priceYearly} ${billedYearly}`
            : ""}
      </p>

      <p className={cn("mt-4 text-sm leading-relaxed", plan.highlighted ? "text-zinc-400" : "text-zinc-500")}>
        {plan.description}
      </p>

      <Button
        href="/signup"
        variant={plan.highlighted ? "primary" : "outline"}
        size="lg"
        className={cn("mt-6 w-full", !plan.highlighted && "bg-white")}
      >
        {plan.cta}
      </Button>

      <ul className="mt-7 space-y-2.5">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5 text-sm">
            <CheckIcon
              className={cn(
                "mt-0.5 h-4 w-4 shrink-0",
                plan.highlighted ? "text-purple-400" : "text-purple-600",
              )}
            />
            <span className={plan.highlighted ? "text-zinc-300" : "text-zinc-600"}>
              {feature}
            </span>
          </li>
        ))}

        {/* Annoncé mais pas encore livré : la pastille évite de laisser croire
            que c'est disponible aujourd'hui. */}
        {plan.comingSoon?.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5 text-sm">
            <CheckIcon
              className={cn(
                "mt-0.5 h-4 w-4 shrink-0",
                plan.highlighted ? "text-zinc-600" : "text-zinc-300",
              )}
            />
            <span className={cn("flex flex-wrap items-center gap-1.5", plan.highlighted ? "text-zinc-500" : "text-zinc-400")}>
              {feature}
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                  plan.highlighted
                    ? "bg-zinc-800 text-zinc-400"
                    : "bg-zinc-100 text-zinc-500",
                )}
              >
                {soonLabel}
              </span>
            </span>
          </li>
        ))}
      </ul>

      {/* Les limites en bas, visuellement en retrait mais bien présentes. */}
      <div
        className={cn(
          "mt-auto border-t pt-5",
          plan.highlighted ? "border-zinc-800" : "border-zinc-100",
        )}
        style={{ marginTop: "1.75rem" }}
      >
        <p
          className={cn(
            "text-xs font-semibold uppercase tracking-wide",
            plan.highlighted ? "text-zinc-500" : "text-zinc-400",
          )}
        >
          {limitsLabel}
        </p>
        <ul className="mt-2.5 space-y-2">
          {plan.limits.map((limit) => (
            <li key={limit} className="flex items-start gap-2.5 text-sm">
              <XIcon
                className={cn(
                  "mt-0.5 h-3.5 w-3.5 shrink-0",
                  plan.highlighted ? "text-zinc-600" : "text-zinc-300",
                )}
              />
              <span className={plan.highlighted ? "text-zinc-500" : "text-zinc-400"}>
                {limit}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </Spotlight>
  );
}

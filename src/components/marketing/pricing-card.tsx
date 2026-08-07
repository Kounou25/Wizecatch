import { Button } from "@/components/ui/button";
import { Spotlight } from "@/components/spotlight";
import { CheckIcon } from "@/components/icons";
import { cn } from "@/lib/utils";
import type { PricingPlan } from "@/lib/mock-data";

export function PricingCard({ plan }: { plan: PricingPlan }) {
  return (
    <Spotlight
      className={cn(
        "flex h-full flex-col rounded-2xl p-8 ring-1 transition-all duration-200 hover:-translate-y-1",
        plan.highlighted
          ? "bg-zinc-900 text-white ring-zinc-900 shadow-xl hover:shadow-2xl"
          : "bg-white text-zinc-900 ring-zinc-200 shadow-sm hover:shadow-lg",
      )}
    >
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-semibold">{plan.name}</h3>
        {plan.highlighted && (
          <span className="animate-pulse-ring rounded-full bg-purple-500/20 px-2.5 py-0.5 text-xs font-medium text-purple-300">
            Popular
          </span>
        )}
      </div>

      <p className={cn("mt-2 text-sm", plan.highlighted ? "text-zinc-400" : "text-zinc-500")}>
        {plan.description}
      </p>

      <div className="mt-6 flex items-baseline gap-1">
        <span className="text-4xl font-semibold tracking-tight">{plan.price}</span>
        <span className={cn("text-sm", plan.highlighted ? "text-zinc-400" : "text-zinc-500")}>
          {plan.period}
        </span>
      </div>

      <Button
        href="/signup"
        variant={plan.highlighted ? "primary" : "outline"}
        size="lg"
        className={cn("mt-6 w-full", !plan.highlighted && "bg-white")}
      >
        {plan.cta}
      </Button>

      <ul className="mt-8 space-y-3">
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
      </ul>
    </Spotlight>
  );
}

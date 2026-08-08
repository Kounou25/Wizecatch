import { Button } from "@/components/ui/button";
import { CheckIcon } from "@/components/icons";
import { lifetimeOffer } from "@/lib/mock-data";

/**
 * Offre à vie, présentée à part de la grille.
 *
 * Fond sombre et pleine largeur : elle se lit comme une proposition
 * exceptionnelle et limitée, pas comme un quatrième palier permanent.
 */
export function LifetimeOffer({
  spotsLabel,
  onceLabel,
}: {
  spotsLabel: string;
  onceLabel: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-zinc-950 p-8 ring-1 ring-zinc-800 sm:p-10">
      <div
        aria-hidden="true"
        className="animate-float pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-purple-600/20 blur-3xl"
      />

      <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-xl font-semibold text-white">{lifetimeOffer.name}</h3>
            <span className="animate-pulse-ring rounded-full bg-purple-500/20 px-3 py-1 text-xs font-semibold text-purple-300">
              {spotsLabel}
            </span>
          </div>

          <p className="mt-1 text-sm font-medium text-purple-300">
            {lifetimeOffer.tagline}
          </p>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-zinc-400">
            {lifetimeOffer.description}
          </p>

          <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
            {lifetimeOffer.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2.5 text-sm">
                <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-purple-400" />
                <span className="text-zinc-300">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col items-start gap-4 border-zinc-800 lg:items-center lg:border-l lg:pl-10">
          <div className="flex items-baseline gap-1.5">
            <span className="text-5xl font-semibold tracking-tight text-white">
              ${lifetimeOffer.price}
            </span>
            <span className="text-sm text-zinc-500">{onceLabel}</span>
          </div>

          <Button href="/signup" size="lg" className="w-full whitespace-nowrap lg:w-auto">
            {lifetimeOffer.cta}
          </Button>
        </div>
      </div>
    </div>
  );
}

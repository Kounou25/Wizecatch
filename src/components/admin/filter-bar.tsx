import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Barre de recherche et filtres du back-office.
 *
 * Les filtres passent par l'URL plutôt que par un état local : une vue filtrée
 * reste ainsi partageable, rechargeable, et survit au retour arrière du
 * navigateur. Un formulaire GET suffit — pas de JavaScript nécessaire.
 */

export function SearchForm({
  action,
  value,
  placeholder,
  hidden,
}: {
  action: string;
  value: string;
  placeholder: string;
  /** Champs à conserver pour ne pas perdre les filtres actifs en cherchant. */
  hidden?: Record<string, string | undefined>;
}) {
  return (
    <form action={action} className="flex gap-2">
      {Object.entries(hidden ?? {}).map(([name, val]) =>
        val ? <input key={name} type="hidden" name={name} value={val} /> : null,
      )}

      <input
        type="search"
        name="q"
        defaultValue={value}
        placeholder={placeholder}
        className="w-full max-w-xs rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-800 placeholder:text-zinc-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/15"
      />
      <button
        type="submit"
        className="shrink-0 rounded-lg bg-zinc-900 px-3.5 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-zinc-800"
      >
        Search
      </button>
    </form>
  );
}

export function SegmentFilter({
  options,
  current,
  hrefFor,
}: {
  options: { value: string; label: string }[];
  current: string;
  hrefFor: (value: string) => string;
}) {
  return (
    <div className="inline-flex gap-0.5 rounded-lg bg-zinc-100 p-0.5">
      {options.map((option) => (
        <Link
          key={option.value}
          href={hrefFor(option.value)}
          className={cn(
            "rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors duration-150",
            option.value === current
              ? "bg-white text-zinc-900 shadow-sm"
              : "text-zinc-500 hover:text-zinc-800",
          )}
        >
          {option.label}
        </Link>
      ))}
    </div>
  );
}

/** Construit une URL en conservant les autres paramètres actifs. */
export function buildHref(
  base: string,
  params: Record<string, string | undefined>,
) {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    // « all » est la valeur par défaut : l'inscrire alourdirait l'URL
    // sans rien changer au résultat.
    if (value && value !== "all") search.set(key, value);
  }

  const query = search.toString();
  return query ? `${base}?${query}` : base;
}

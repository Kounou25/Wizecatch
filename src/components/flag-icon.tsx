import { cn } from "@/lib/utils";
import { FLAG_CODES } from "@/lib/geo/flag-codes";

const DEFAULT_SIZE = "h-4 w-6";

/**
 * Drapeau d'un pays, à partir de son code ISO 3166-1 alpha-2.
 *
 * Les drapeaux étaient auparavant dessinés à la main, ce qui n'en couvrait
 * que quinze : tout visiteur venant d'ailleurs tombait sur une pastille grise.
 * Les fichiers proviennent maintenant de `flag-icons`, copiés dans
 * `public/flags/` — auto-hébergés, donc aucune requête vers un tiers depuis
 * le tableau de bord, et rien à re-télécharger hors ligne.
 *
 * (Les emoji drapeaux seraient plus simples, mais Windows ne les rend pas.)
 */
export function FlagIcon({ country, className }: { country: string; className?: string }) {
  const code = (country ?? "").trim().toLowerCase();

  // Sans en-tête de géolocalisation, la base enregistre « Unknown » : un
  // globe neutre est plus honnête qu'un drapeau arbitraire ou un « ? ».
  // On vérifie aussi que le fichier existe, plutôt que de risquer une
  // image cassée sur un code valide mais non fourni.
  if (!FLAG_CODES.has(code)) {
    return (
      <span
        className={cn(
          DEFAULT_SIZE,
          "flex shrink-0 items-center justify-center rounded-[3px] bg-zinc-100 text-zinc-400 ring-1 ring-black/10",
          className,
        )}
        title={country || undefined}
      >
        <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3c2.5 2.7 2.5 15.3 0 18M12 3c-2.5 2.7-2.5 15.3 0 18" />
        </svg>
      </span>
    );
  }

  return (
    // SVG statique déjà dimensionné : next/image n'apporterait qu'une
    // indirection, sans rien à optimiser.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/flags/${code}.svg`}
      alt=""
      loading="lazy"
      className={cn(
        DEFAULT_SIZE,
        "shrink-0 rounded-[3px] object-cover ring-1 ring-black/10",
        className,
      )}
    />
  );
}

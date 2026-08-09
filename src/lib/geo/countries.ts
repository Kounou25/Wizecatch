/**
 * Les visites stockent un code ISO 3166-1 alpha-2 ("NE", "FR", "US"),
 * fourni par l'en-tête de géolocalisation de Vercel.
 *
 * C'est le bon format à conserver : canonique, stable, et deux octets.
 * La conversion en nom lisible se fait à l'affichage.
 */

/**
 * Visite sans géolocalisation.
 *
 * L'en-tête `x-vercel-ip-country` n'existe qu'en production : en local, la
 * fonction SQL retombe sur « Unknown ». C'est une valeur à traiter, pas un
 * code pays — sans quoi elle s'affiche brute dans l'interface.
 */
export function isUnknownCountry(code: string | null | undefined): boolean {
  return !code || code.trim().toLowerCase() === "unknown";
}

/**
 * Nom du pays à partir de son code ISO.
 *
 * Intl.DisplayNames est intégré au runtime — aucune table de 250 pays à
 * maintenir, et le nom suit la langue demandée.
 */
export function countryName(code: string | null | undefined, locale = "en"): string {
  if (!code || isUnknownCountry(code)) return locale === "fr" ? "Inconnu" : "Unknown";

  // Certaines lignes anciennes portent déjà un nom complet plutôt qu'un code.
  if (code.length !== 2) return code;

  try {
    const display = new Intl.DisplayNames([locale], { type: "region" });
    return display.of(code.toUpperCase()) ?? code;
  } catch {
    return code;
  }
}

/**
 * Écarts de nommage entre Intl.DisplayNames et le jeu de données
 * cartographiques (world-atlas / Natural Earth).
 *
 * Sans ces alias, les pays concernés resteraient gris sur la carte alors
 * qu'ils ont bien du trafic.
 */
const MAP_NAME_ALIASES: Record<string, string> = {
  "United States": "United States of America",
  "Myanmar (Burma)": "Myanmar",
  "Congo - Kinshasa": "Dem. Rep. Congo",
  "Congo - Brazzaville": "Congo",
  "Côte d’Ivoire": "Côte d'Ivoire",
  "Bosnia & Herzegovina": "Bosnia and Herz.",
  "Central African Republic": "Central African Rep.",
  "South Sudan": "S. Sudan",
  "Dominican Republic": "Dominican Rep.",
  "Equatorial Guinea": "Eq. Guinea",
  "Solomon Islands": "Solomon Is.",
  "Czechia": "Czechia",
  "Eswatini": "eSwatini",
  "Falkland Islands": "Falkland Is.",
  "Western Sahara": "W. Sahara",
  "North Macedonia": "North Macedonia",
  "Türkiye": "Turkey",
};

/** Nom tel qu'il apparaît dans le jeu de données de la carte. */
export function countryMapName(code: string | null | undefined): string {
  const name = countryName(code);
  return MAP_NAME_ALIASES[name] ?? name;
}

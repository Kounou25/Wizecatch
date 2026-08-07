/** Forme des statistiques consommée par les graphiques. */

export type SeriesPoint = { date: string; value: number };
export type BreakdownEntry = { label: string; count: number };
export type CountryEntry = { country: string; visits: number };
export type HourlyEntry = { hour: number; visits: number };

export type StatsSummary = {
  totalVisits: number;
  avgDuration: number;
  bounceRate: number;
  countriesReached: number;
  newVisitors: number;
};

/** Tout ce dont l'onglet Stats d'un site a besoin, en une seule réponse. */
export type SiteStats = {
  summary: StatsSummary;
  visits: SeriesPoint[];
  countries: CountryEntry[];
  devices: BreakdownEntry[];
  operatingSystems: BreakdownEntry[];
  browsers: BreakdownEntry[];
  sources: BreakdownEntry[];
  topPages: BreakdownEntry[];
  visitorTypes: BreakdownEntry[];
  hourly: HourlyEntry[];
};

export const EMPTY_STATS: SiteStats = {
  summary: {
    totalVisits: 0,
    avgDuration: 0,
    bounceRate: 0,
    countriesReached: 0,
    newVisitors: 0,
  },
  visits: [],
  countries: [],
  devices: [],
  operatingSystems: [],
  browsers: [],
  sources: [],
  topPages: [],
  visitorTypes: [],
  hourly: [],
};

/** Forme des statistiques consommée par les graphiques. */

export type SeriesPoint = { date: string; value: number };
export type BreakdownEntry = { label: string; count: number };
export type CountryEntry = { country: string; visits: number };
export type HourlyEntry = { hour: number; visits: number };

/** Note moyenne d'une dimension de trafic — pays, appareil, navigateur. */
export type RatingByEntry = { label: string; avgRating: number; count: number };

/** Un jour sans avis n'a pas une note de 0 : il n'a pas de note. */
export type RatingPoint = { date: string; value: number | null; count: number };

export type StatsSummary = {
  totalVisits: number;
  uniqueVisitors: number;
  totalPageviews: number;
  avgDuration: number;
  bounceRate: number;
  countriesReached: number;
  newVisitors: number;
};

export type NpsBreakdown = {
  promoters: number;
  passives: number;
  detractors: number;
  responses: number;
  score: number;
};

/**
 * Variation par rapport à la période précédente de même longueur.
 *
 * `percent` est nul quand la période précédente est vide : passer de 0 à 40
 * n'est pas « +∞ % », c'est un démarrage — l'interface doit le dire autrement.
 */
export type Delta = { percent: number | null; direction: "up" | "down" | "flat" };

export type StatsComparison = {
  totalVisits: Delta;
  uniqueVisitors: Delta;
  totalPageviews: Delta;
  avgDuration: Delta;
  bounceRate: Delta;
  reviews: Delta;
};

/** Tout ce dont l'onglet Stats d'un site a besoin, en une seule réponse. */
export type SiteStats = {
  days: number;
  summary: StatsSummary;
  comparison: StatsComparison;
  visits: SeriesPoint[];
  countries: CountryEntry[];
  cities: BreakdownEntry[];
  devices: BreakdownEntry[];
  operatingSystems: BreakdownEntry[];
  browsers: BreakdownEntry[];
  languages: BreakdownEntry[];
  sources: BreakdownEntry[];
  utmSources: BreakdownEntry[];
  utmCampaigns: BreakdownEntry[];
  entryPages: BreakdownEntry[];
  topPages: BreakdownEntry[];
  visitorTypes: BreakdownEntry[];
  hourly: HourlyEntry[];

  // Volet avis — vide pour un site en mode statistiques seules.
  reviewTotal: number;
  ratings: BreakdownEntry[];
  nps: NpsBreakdown;
  ratingByCountry: RatingByEntry[];
  ratingByDevice: RatingByEntry[];
  dailyRating: RatingPoint[];
  /** Avis collectés pour 100 visiteurs uniques. */
  collectionRate: number;
};

const NO_DELTA: Delta = { percent: null, direction: "flat" };

export const EMPTY_STATS: SiteStats = {
  days: 30,
  summary: {
    totalVisits: 0,
    uniqueVisitors: 0,
    totalPageviews: 0,
    avgDuration: 0,
    bounceRate: 0,
    countriesReached: 0,
    newVisitors: 0,
  },
  comparison: {
    totalVisits: NO_DELTA,
    uniqueVisitors: NO_DELTA,
    totalPageviews: NO_DELTA,
    avgDuration: NO_DELTA,
    bounceRate: NO_DELTA,
    reviews: NO_DELTA,
  },
  visits: [],
  countries: [],
  cities: [],
  devices: [],
  operatingSystems: [],
  browsers: [],
  languages: [],
  sources: [],
  utmSources: [],
  utmCampaigns: [],
  entryPages: [],
  topPages: [],
  visitorTypes: [],
  hourly: [],
  reviewTotal: 0,
  ratings: [],
  nps: { promoters: 0, passives: 0, detractors: 0, responses: 0, score: 0 },
  ratingByCountry: [],
  ratingByDevice: [],
  dailyRating: [],
  collectionRate: 0,
};

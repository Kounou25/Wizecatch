import { createClient } from "@/lib/supabase/server";
import {
  EMPTY_STATS,
  type SiteStats,
  type SeriesPoint,
  type BreakdownEntry,
  type CountryEntry,
  type HourlyEntry,
  type StatsSummary,
  type NpsBreakdown,
  type RatingByEntry,
  type RatingPoint,
  type Delta,
  type StatsComparison,
} from "@/lib/stats/types";

type Dimension =
  | "country"
  | "city"
  | "device"
  | "os"
  | "browser"
  | "source"
  | "path"
  | "utm_source"
  | "utm_medium"
  | "utm_campaign"
  | "language"
  | "visitor_type";

/** Dimensions de trafic disponibles sur un avis. */
type RatingDimension = "country" | "device" | "os" | "browser";

/**
 * Les agrégations sont faites par Postgres via des fonctions RPC.
 *
 * Elles sont en SECURITY INVOKER : RLS s'applique donc à l'appelant. Passer
 * l'identifiant du site d'un autre utilisateur ne renvoie rien — l'isolation
 * reste garantie par la base, pas par ce fichier.
 */

async function breakdown(
  siteIds: string[],
  dimension: Dimension,
  days: number,
): Promise<BreakdownEntry[]> {
  if (siteIds.length === 0) return [];

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("stats_breakdown", {
    p_site_ids: siteIds,
    p_dimension: dimension,
    p_days: days,
  });

  if (error) {
    console.error(`[stats] breakdown ${dimension}:`, error.message);
    return [];
  }

  return (data ?? []).map((row: { label: string; count: number }) => ({
    label: row.label,
    count: Number(row.count),
  }));
}

/**
 * @param offset Décale la fenêtre vers le passé, en jours. Avec `offset = days`
 *   on obtient la période précédente — c'est ce qui permet la comparaison sans
 *   dupliquer la logique de calcul.
 */
export async function getSummary(
  siteIds: string[],
  days = 30,
  offset = 0,
): Promise<StatsSummary> {
  if (siteIds.length === 0) return EMPTY_STATS.summary;

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("stats_summary", {
    p_site_ids: siteIds,
    p_days: days,
    p_offset: offset,
  });

  const row = Array.isArray(data) ? data[0] : data;
  if (error || !row) {
    if (error) console.error("[stats] summary:", error.message);
    return EMPTY_STATS.summary;
  }

  return {
    totalVisits: Number(row.total_visits ?? 0),
    uniqueVisitors: Number(row.unique_visitors ?? 0),
    totalPageviews: Number(row.total_pageviews ?? 0),
    avgDuration: Number(row.avg_duration ?? 0),
    bounceRate: Number(row.bounce_rate ?? 0),
    countriesReached: Number(row.countries_reached ?? 0),
    newVisitors: Number(row.new_visitors ?? 0),
  };
}

export async function getDailyVisits(
  siteIds: string[],
  days = 30,
): Promise<SeriesPoint[]> {
  if (siteIds.length === 0) return [];

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("stats_daily_visits", {
    p_site_ids: siteIds,
    p_days: days,
  });

  if (error) {
    console.error("[stats] dailyVisits:", error.message);
    return [];
  }

  return (data ?? []).map((row: { day: string; visits: number }) => ({
    date: row.day,
    value: Number(row.visits),
  }));
}

export async function getDailyReviews(
  siteIds: string[],
  days = 30,
): Promise<SeriesPoint[]> {
  if (siteIds.length === 0) return [];

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("stats_daily_reviews", {
    p_site_ids: siteIds,
    p_days: days,
  });

  if (error) {
    console.error("[stats] dailyReviews:", error.message);
    return [];
  }

  return (data ?? []).map((row: { day: string; reviews: number }) => ({
    date: row.day,
    value: Number(row.reviews),
  }));
}

export async function getHourly(
  siteIds: string[],
  days = 30,
): Promise<HourlyEntry[]> {
  if (siteIds.length === 0) return [];

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("stats_hourly", {
    p_site_ids: siteIds,
    p_days: days,
  });

  if (error) {
    console.error("[stats] hourly:", error.message);
    return [];
  }

  return (data ?? []).map((row: { hour: number; visits: number }) => ({
    hour: Number(row.hour),
    visits: Number(row.visits),
  }));
}

export async function getCountries(
  siteIds: string[],
  days = 30,
): Promise<CountryEntry[]> {
  const rows = await breakdown(siteIds, "country", days);
  return rows.map((row) => ({ country: row.label, visits: row.count }));
}


/** Pages réellement vues, issues de `pageviews` et non de la page d'entrée. */
export async function getPages(siteIds: string[], days = 30): Promise<BreakdownEntry[]> {
  if (siteIds.length === 0) return [];

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("stats_pages", {
    p_site_ids: siteIds,
    p_days: days,
  });

  if (error) {
    console.error("[stats] pages:", error.message);
    return [];
  }

  return (data ?? []).map((row: { label: string; count: number }) => ({
    label: row.label,
    count: Number(row.count),
  }));
}

/** Répartition réelle des notes, de 1 à 5 étoiles. */
export async function getReviewRatings(
  siteIds: string[],
  days = 30,
): Promise<BreakdownEntry[]> {
  if (siteIds.length === 0) return [];

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("stats_review_ratings", {
    p_site_ids: siteIds,
    p_days: days,
  });

  if (error) {
    console.error("[stats] ratings:", error.message);
    return [];
  }

  return (data ?? []).map((row: { rating: number; count: number }) => ({
    label: String(row.rating),
    count: Number(row.count),
  }));
}

export async function getNps(siteIds: string[], days = 30): Promise<NpsBreakdown> {
  if (siteIds.length === 0) return EMPTY_STATS.nps;

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("stats_nps", {
    p_site_ids: siteIds,
    p_days: days,
  });

  const row = Array.isArray(data) ? data[0] : data;
  if (error || !row) {
    if (error) console.error("[stats] nps:", error.message);
    return EMPTY_STATS.nps;
  }

  return {
    promoters: Number(row.promoters ?? 0),
    passives: Number(row.passives ?? 0),
    detractors: Number(row.detractors ?? 0),
    responses: Number(row.responses ?? 0),
    score: Number(row.score ?? 0),
  };
}

/** Note moyenne par pays, appareil, OS ou navigateur. */
export async function getRatingBy(
  siteIds: string[],
  dimension: RatingDimension,
  days = 30,
): Promise<RatingByEntry[]> {
  if (siteIds.length === 0) return [];

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("stats_rating_by", {
    p_site_ids: siteIds,
    p_dimension: dimension,
    p_days: days,
  });

  if (error) {
    console.error(`[stats] ratingBy ${dimension}:`, error.message);
    return [];
  }

  return (data ?? []).map(
    (row: { label: string; avg_rating: number; count: number }) => ({
      label: row.label,
      avgRating: Number(row.avg_rating),
      count: Number(row.count),
    }),
  );
}

export async function getDailyRating(
  siteIds: string[],
  days = 30,
): Promise<RatingPoint[]> {
  if (siteIds.length === 0) return [];

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("stats_daily_rating", {
    p_site_ids: siteIds,
    p_days: days,
  });

  if (error) {
    console.error("[stats] dailyRating:", error.message);
    return [];
  }

  return (data ?? []).map(
    (row: { day: string; avg_rating: number | null; count: number }) => ({
      date: row.day,
      // Une journée sans avis reste nulle : la courbe s'interrompt au lieu
      // de plonger à zéro, ce qui serait une lecture fausse.
      value: row.avg_rating === null ? null : Number(row.avg_rating),
      count: Number(row.count),
    }),
  );
}

export async function getReviewTotal(
  siteIds: string[],
  days = 30,
  offset = 0,
): Promise<number> {
  if (siteIds.length === 0) return 0;

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("stats_review_total", {
    p_site_ids: siteIds,
    p_days: days,
    p_offset: offset,
  });

  const row = Array.isArray(data) ? data[0] : data;
  if (error || !row) {
    if (error) console.error("[stats] reviewTotal:", error.message);
    return 0;
  }
  return Number(row.total ?? 0);
}

/**
 * Variation entre deux périodes de même longueur.
 *
 * Une période précédente vide ne donne pas « +∞ % » : on renvoie `null` et
 * c'est l'interface qui parle de démarrage plutôt que de croissance.
 */
function delta(current: number, previous: number): Delta {
  if (previous === 0) {
    return { percent: null, direction: current > 0 ? "up" : "flat" };
  }

  const percent = Math.round(((current - previous) / previous) * 100);
  return {
    percent,
    direction: percent > 0 ? "up" : percent < 0 ? "down" : "flat",
  };
}

/** Toutes les statistiques d'un ensemble de sites, en parallèle. */
export async function getStats(siteIds: string[], days = 30): Promise<SiteStats> {
  if (siteIds.length === 0) return { ...EMPTY_STATS, days };

  const [
    summary,
    previousSummary,
    visits,
    countries,
    cities,
    devices,
    operatingSystems,
    browsers,
    languages,
    sources,
    utmSources,
    utmCampaigns,
    entryPages,
    topPages,
    visitorTypes,
    hourly,
    reviewTotal,
    previousReviewTotal,
    ratings,
    nps,
    ratingByCountry,
    ratingByDevice,
    dailyRating,
  ] = await Promise.all([
    getSummary(siteIds, days),
    // Même fenêtre, décalée d'une période : c'est la base de la comparaison.
    getSummary(siteIds, days, days),
    getDailyVisits(siteIds, days),
    getCountries(siteIds, days),
    breakdown(siteIds, "city", days),
    breakdown(siteIds, "device", days),
    breakdown(siteIds, "os", days),
    breakdown(siteIds, "browser", days),
    breakdown(siteIds, "language", days),
    breakdown(siteIds, "source", days),
    breakdown(siteIds, "utm_source", days),
    breakdown(siteIds, "utm_campaign", days),
    breakdown(siteIds, "path", days),
    getPages(siteIds, days),
    breakdown(siteIds, "visitor_type", days),
    getHourly(siteIds, days),
    getReviewTotal(siteIds, days),
    getReviewTotal(siteIds, days, days),
    getReviewRatings(siteIds, days),
    getNps(siteIds, days),
    getRatingBy(siteIds, "country", days),
    getRatingBy(siteIds, "device", days),
    getDailyRating(siteIds, days),
  ]);

  // Avis pour 100 visiteurs uniques. Rapporté aux visiteurs et non aux visites :
  // un même visiteur revenu trois fois ne peut laisser qu'un avis.
  const collectionRate =
    summary.uniqueVisitors > 0
      ? Math.round((reviewTotal / summary.uniqueVisitors) * 1000) / 10
      : 0;

  const comparison: StatsComparison = {
    totalVisits: delta(summary.totalVisits, previousSummary.totalVisits),
    uniqueVisitors: delta(summary.uniqueVisitors, previousSummary.uniqueVisitors),
    totalPageviews: delta(summary.totalPageviews, previousSummary.totalPageviews),
    avgDuration: delta(summary.avgDuration, previousSummary.avgDuration),
    bounceRate: delta(summary.bounceRate, previousSummary.bounceRate),
    reviews: delta(reviewTotal, previousReviewTotal),
  };

  return {
    days,
    summary,
    comparison,
    visits,
    countries,
    cities,
    devices,
    operatingSystems,
    browsers,
    languages,
    sources,
    utmSources,
    utmCampaigns,
    entryPages,
    topPages,
    visitorTypes,
    hourly,
    reviewTotal,
    ratings,
    nps,
    ratingByCountry,
    ratingByDevice,
    dailyRating,
    collectionRate,
  };
}

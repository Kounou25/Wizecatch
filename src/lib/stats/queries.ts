import { createClient } from "@/lib/supabase/server";
import {
  EMPTY_STATS,
  type SiteStats,
  type SeriesPoint,
  type BreakdownEntry,
  type CountryEntry,
  type HourlyEntry,
  type StatsSummary,
} from "@/lib/stats/types";

type Dimension =
  | "country"
  | "city"
  | "device"
  | "os"
  | "browser"
  | "source"
  | "path"
  | "visitor_type";

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

export async function getSummary(
  siteIds: string[],
  days = 30,
): Promise<StatsSummary> {
  if (siteIds.length === 0) return EMPTY_STATS.summary;

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("stats_summary", {
    p_site_ids: siteIds,
    p_days: days,
  });

  const row = Array.isArray(data) ? data[0] : data;
  if (error || !row) {
    if (error) console.error("[stats] summary:", error.message);
    return EMPTY_STATS.summary;
  }

  return {
    totalVisits: Number(row.total_visits ?? 0),
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

/** Toutes les statistiques d'un ensemble de sites, en parallèle. */
export async function getStats(siteIds: string[], days = 30): Promise<SiteStats> {
  if (siteIds.length === 0) return EMPTY_STATS;

  const [
    summary,
    visits,
    countries,
    devices,
    operatingSystems,
    browsers,
    sources,
    topPages,
    visitorTypes,
    hourly,
  ] = await Promise.all([
    getSummary(siteIds, days),
    getDailyVisits(siteIds, days),
    getCountries(siteIds, days),
    breakdown(siteIds, "device", days),
    breakdown(siteIds, "os", days),
    breakdown(siteIds, "browser", days),
    breakdown(siteIds, "source", days),
    breakdown(siteIds, "path", days),
    breakdown(siteIds, "visitor_type", days),
    getHourly(siteIds, days),
  ]);

  return {
    summary,
    visits,
    countries,
    devices,
    operatingSystems,
    browsers,
    sources,
    topPages,
    visitorTypes,
    hourly,
  };
}

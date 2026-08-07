"use client";

import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/stat-card";
import { StatsLineChart } from "@/components/dashboard/stats-line-chart";
import { RatingBreakdownChart } from "@/components/dashboard/rating-breakdown-chart";
import { CountryBreakdown } from "@/components/dashboard/country-breakdown";
import { WorldMap } from "@/components/dashboard/world-map";
import { HourlyChart } from "@/components/dashboard/hourly-chart";
import { Skeleton } from "@/components/dashboard/skeleton";
import { EmptyState } from "@/components/dashboard/empty-state";
import {
  ActivityIcon,
  GlobeIcon,
  MessageSquareIcon,
  UsersIcon,
  BarChartIcon,
} from "@/components/icons";
import { formatDuration, getRatingBreakdown, getReviewsBySiteId, type Site } from "@/lib/mock-data";
import type { SiteStats } from "@/lib/stats/types";
import type { Dictionary } from "@/lib/i18n/dictionaries";

async function fetchStats(siteId: string): Promise<SiteStats> {
  const response = await fetch(`/api/stats?siteId=${encodeURIComponent(siteId)}&days=30`);
  if (!response.ok) throw new Error("Failed to load stats");
  return response.json();
}

function ChartSkeleton() {
  return <Skeleton className="h-56 w-full" />;
}

export function StatsTab({ site, dict }: { site: Site; dict: Dictionary }) {
  const isReviews = site.mode === "reviews";

  // Chargé seulement à l'ouverture de l'onglet, et mis en cache : revenir sur
  // l'onglet n'entraîne pas un nouvel appel tant que les données sont fraîches.
  const { data, isPending, isError } = useQuery({
    queryKey: ["stats", site.id, 30],
    queryFn: () => fetchStats(site.id),
  });

  if (isError) {
    return (
      <EmptyState
        icon={BarChartIcon}
        title="Could not load statistics"
        description="Something went wrong while fetching your data. Try reloading the page."
      />
    );
  }

  const summary = data?.summary;
  const hasData = (summary?.totalVisits ?? 0) > 0;

  // Les avis restent sur les données de démonstration jusqu'à l'étape 5.
  const ratingBreakdown = isReviews ? getRatingBreakdown(site.id) : [];
  const reviewCount = isReviews ? getReviewsBySiteId(site.id).length : 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label={dict.siteDetail.visits}
          value={isPending ? "—" : (summary?.totalVisits ?? 0).toLocaleString("en-US")}
          icon={ActivityIcon}
        />
        <StatCard
          label={dict.stats.avgDuration}
          value={isPending ? "—" : formatDuration(summary?.avgDuration ?? 0)}
          icon={UsersIcon}
        />
        <StatCard
          label={dict.stats.bounceRate}
          value={isPending ? "—" : `${summary?.bounceRate ?? 0}%`}
          icon={BarChartIcon}
        />
        <StatCard
          label={dict.stats.countriesReached}
          value={isPending ? "—" : String(summary?.countriesReached ?? 0)}
          icon={GlobeIcon}
        />
        {isReviews && (
          <StatCard
            label={dict.dashboard.totalReviews}
            value={String(reviewCount)}
            icon={MessageSquareIcon}
          />
        )}
      </div>

      {/* Aucune visite : inutile d'afficher huit graphiques vides. */}
      {!isPending && !hasData ? (
        <EmptyState
          icon={ActivityIcon}
          title="No visits yet"
          description="Once the script is live on your site, visits will appear here within seconds."
        />
      ) : (
        <>
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-zinc-900">
              {dict.stats.visitsOverTime}
            </h3>
            <div className="mt-4">
              {isPending ? <ChartSkeleton /> : <StatsLineChart data={data!.visits} color="#7c3aed" />}
            </div>
          </Card>

          {isReviews && ratingBreakdown.length > 0 && (
            <Card className="p-5">
              <h3 className="text-sm font-semibold text-zinc-900">
                {dict.stats.ratingBreakdown}
              </h3>
              <div className="mt-4">
                <RatingBreakdownChart data={ratingBreakdown} />
              </div>
            </Card>
          )}

          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="p-5">
              <h3 className="text-sm font-semibold text-zinc-900">{dict.stats.sources}</h3>
              <div className="mt-4">
                {isPending ? <ChartSkeleton /> : <RatingBreakdownChart data={data!.sources} />}
              </div>
            </Card>
            <Card className="p-5">
              <h3 className="text-sm font-semibold text-zinc-900">{dict.stats.topPages}</h3>
              <div className="mt-4">
                {isPending ? <ChartSkeleton /> : <RatingBreakdownChart data={data!.topPages} />}
              </div>
            </Card>
          </div>

          <Card className="p-5">
            <h3 className="text-sm font-semibold text-zinc-900">{dict.stats.hourly}</h3>
            <div className="mt-4">
              {isPending ? <ChartSkeleton /> : <HourlyChart data={data!.hourly} />}
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="text-sm font-semibold text-zinc-900">{dict.stats.visitorMap}</h3>
            <div className="mt-4">
              {isPending ? (
                <Skeleton className="aspect-[2/1] w-full" />
              ) : (
                <WorldMap data={data!.countries} />
              )}
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="text-sm font-semibold text-zinc-900">
              {dict.stats.countryBreakdown}
            </h3>
            <div className="mt-4">
              {isPending ? <ChartSkeleton /> : <CountryBreakdown data={data!.countries} />}
            </div>
          </Card>

          <div className="grid gap-4 md:grid-cols-3">
            <Card className="p-5">
              <h3 className="text-sm font-semibold text-zinc-900">{dict.stats.device}</h3>
              <div className="mt-4">
                {isPending ? <ChartSkeleton /> : <RatingBreakdownChart data={data!.devices} />}
              </div>
            </Card>
            <Card className="p-5">
              <h3 className="text-sm font-semibold text-zinc-900">{dict.stats.os}</h3>
              <div className="mt-4">
                {isPending ? (
                  <ChartSkeleton />
                ) : (
                  <RatingBreakdownChart data={data!.operatingSystems} />
                )}
              </div>
            </Card>
            <Card className="p-5">
              <h3 className="text-sm font-semibold text-zinc-900">{dict.stats.browser}</h3>
              <div className="mt-4">
                {isPending ? <ChartSkeleton /> : <RatingBreakdownChart data={data!.browsers} />}
              </div>
            </Card>
          </div>

          <Card className="p-5">
            <h3 className="text-sm font-semibold text-zinc-900">{dict.stats.visitorType}</h3>
            <div className="mt-4">
              {isPending ? <ChartSkeleton /> : <RatingBreakdownChart data={data!.visitorTypes} />}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

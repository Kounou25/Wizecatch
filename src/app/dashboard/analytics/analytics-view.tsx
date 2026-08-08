"use client";

import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/stat-card";
import { StatsLineChart } from "@/components/dashboard/stats-line-chart";
import { BreakdownList } from "@/components/dashboard/breakdown-list";
import { RatingBreakdownChart } from "@/components/dashboard/rating-breakdown-chart";
import { CountryBreakdown } from "@/components/dashboard/country-breakdown";
import { WorldMap } from "@/components/dashboard/world-map";
import { HourlyChart } from "@/components/dashboard/hourly-chart";
import { EmptyState } from "@/components/dashboard/empty-state";
import { ActivityIcon, GlobeIcon, BarChartIcon, UsersIcon } from "@/components/icons";
import { useLanguage } from "@/components/providers/language-provider";
import { formatDuration } from "@/lib/mock-data";
import type { SiteStats } from "@/lib/stats/types";

/**
 * Rendu des graphiques agrégés. Séparé de la page parce que Recharts exige
 * un composant client, tandis que la page reste un Server Component qui
 * charge les données sans JavaScript supplémentaire côté navigateur.
 */
export function AnalyticsView({
  stats,
  siteCount,
}: {
  stats: SiteStats;
  siteCount: number;
}) {
  const { dict } = useLanguage();
  const hasData = stats.summary.totalVisits > 0;

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
        {dict.analyticsPage.title}
      </h1>
      <p className="mt-1 text-sm text-zinc-500">{dict.analyticsPage.subtitle}</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label={dict.dashboard.totalVisits}
          value={stats.summary.totalVisits.toLocaleString("en-US")}
          icon={ActivityIcon}
        />
        <StatCard
          label={dict.stats.avgDuration}
          value={formatDuration(stats.summary.avgDuration)}
          icon={UsersIcon}
        />
        <StatCard
          label={dict.stats.bounceRate}
          value={`${stats.summary.bounceRate}%`}
          icon={BarChartIcon}
        />
        <StatCard
          label={dict.stats.countriesReached}
          value={String(stats.summary.countriesReached)}
          icon={GlobeIcon}
        />
      </div>

      {!hasData ? (
        <div className="mt-8">
          <EmptyState
            icon={ActivityIcon}
            title={dict.states.noVisits}
            description={
              siteCount === 0 ? dict.states.noVisitsNoSite : dict.states.noVisitsDesc
            }
          />
        </div>
      ) : (
        <>
          <Card className="mt-4 p-5">
            <h3 className="text-sm font-semibold text-zinc-900">
              {dict.dashboard.visitsChart}
            </h3>
            <div className="mt-4">
              <StatsLineChart data={stats.visits} color="#7c3aed" />
            </div>
          </Card>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <Card className="p-5">
              <h3 className="text-sm font-semibold text-zinc-900">{dict.stats.sources}</h3>
              <div className="mt-4">
                <RatingBreakdownChart data={stats.sources} />
              </div>
            </Card>
            <Card className="p-5">
              <h3 className="text-sm font-semibold text-zinc-900">{dict.stats.topPages}</h3>
              <div className="mt-4">
                <RatingBreakdownChart data={stats.topPages} />
              </div>
            </Card>
          </div>

          <Card className="mt-4 p-5">
            <h3 className="text-sm font-semibold text-zinc-900">{dict.stats.hourly}</h3>
            <div className="mt-4">
              <HourlyChart data={stats.hourly} />
            </div>
          </Card>

          <Card className="mt-4 p-5">
            <h3 className="text-sm font-semibold text-zinc-900">{dict.stats.visitorMap}</h3>
            <div className="mt-4">
              <WorldMap data={stats.countries} />
            </div>
          </Card>

          <Card className="mt-4 p-5">
            <h3 className="text-sm font-semibold text-zinc-900">
              {dict.stats.countryBreakdown}
            </h3>
            <div className="mt-4">
              <CountryBreakdown data={stats.countries} />
            </div>
          </Card>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <Card className="p-5">
              <h3 className="text-sm font-semibold text-zinc-900">{dict.stats.device}</h3>
              <div className="mt-4">
                <BreakdownList data={stats.devices} iconSet="device" emptyLabel={dict.stats.noData} />
              </div>
            </Card>
            <Card className="p-5">
              <h3 className="text-sm font-semibold text-zinc-900">{dict.stats.os}</h3>
              <div className="mt-4">
                <BreakdownList data={stats.operatingSystems} iconSet="os" emptyLabel={dict.stats.noData} />
              </div>
            </Card>
            <Card className="p-5">
              <h3 className="text-sm font-semibold text-zinc-900">{dict.stats.browser}</h3>
              <div className="mt-4">
                <BreakdownList data={stats.browsers} iconSet="browser" emptyLabel={dict.stats.noData} />
              </div>
            </Card>
          </div>

          <Card className="mt-4 p-5">
            <h3 className="text-sm font-semibold text-zinc-900">{dict.stats.visitorType}</h3>
            <div className="mt-4">
              <RatingBreakdownChart data={stats.visitorTypes} />
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

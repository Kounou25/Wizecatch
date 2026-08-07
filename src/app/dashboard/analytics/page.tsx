"use client";

import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/stat-card";
import { StatsLineChart } from "@/components/dashboard/stats-line-chart";
import { RatingBreakdownChart } from "@/components/dashboard/rating-breakdown-chart";
import { CountryBreakdown } from "@/components/dashboard/country-breakdown";
import { WorldMap } from "@/components/dashboard/world-map";
import { HourlyChart } from "@/components/dashboard/hourly-chart";
import { EmptyState } from "@/components/dashboard/empty-state";
import { ActivityIcon, GlobeIcon, BarChartIcon, UsersIcon } from "@/components/icons";
import { useSites } from "@/components/providers/sites-provider";
import { useLanguage } from "@/components/providers/language-provider";
import {
  getAggregateDailyVisits,
  getAggregateCountryBreakdown,
  getAggregateDeviceBreakdown,
  getAggregateOsBreakdown,
  getAggregateBrowserBreakdown,
  getAggregateSourceBreakdown,
  getAggregateTopPages,
  getAggregateVisitorTypeBreakdown,
  getAggregateAvgSessionDuration,
  getAggregateBounceRate,
  getAggregateHourlyDistribution,
  formatDuration,
} from "@/lib/mock-data";

export default function AnalyticsPage() {
  const { sites } = useSites();
  const { dict } = useLanguage();

  const siteIds = useMemo(() => sites.map((site) => site.id), [sites]);

  const visitsSeries = useMemo(
    () =>
      getAggregateDailyVisits(siteIds).map((point) => ({
        date: point.date,
        value: point.visits,
      })),
    [siteIds],
  );
  const countries = useMemo(() => getAggregateCountryBreakdown(siteIds), [siteIds]);
  const devices = useMemo(() => getAggregateDeviceBreakdown(siteIds), [siteIds]);
  const operatingSystems = useMemo(() => getAggregateOsBreakdown(siteIds), [siteIds]);
  const browsers = useMemo(() => getAggregateBrowserBreakdown(siteIds), [siteIds]);
  const sources = useMemo(() => getAggregateSourceBreakdown(siteIds), [siteIds]);
  const topPages = useMemo(() => getAggregateTopPages(siteIds), [siteIds]);
  const visitorTypes = useMemo(() => getAggregateVisitorTypeBreakdown(siteIds), [siteIds]);
  const avgDuration = useMemo(() => getAggregateAvgSessionDuration(siteIds), [siteIds]);
  const bounceRate = useMemo(() => getAggregateBounceRate(siteIds), [siteIds]);
  const hourly = useMemo(() => getAggregateHourlyDistribution(siteIds), [siteIds]);

  const totalVisits = useMemo(
    () => sites.reduce((sum, site) => sum + site.visitCount, 0),
    [sites],
  );

  if (sites.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          {dict.analyticsPage.title}
        </h1>
        <p className="mt-1 text-sm text-zinc-500">{dict.analyticsPage.subtitle}</p>
        <div className="mt-8">
          <EmptyState
            icon={GlobeIcon}
            title={dict.sitesPage.empty}
            description={dict.sitesPage.emptyDesc}
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
        {dict.analyticsPage.title}
      </h1>
      <p className="mt-1 text-sm text-zinc-500">{dict.analyticsPage.subtitle}</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label={dict.dashboard.totalVisits}
          value={totalVisits.toLocaleString("en-US")}
          icon={ActivityIcon}
        />
        <StatCard
          label={dict.stats.avgDuration}
          value={formatDuration(avgDuration)}
          icon={UsersIcon}
        />
        <StatCard
          label={dict.stats.bounceRate}
          value={`${bounceRate}%`}
          icon={BarChartIcon}
        />
        <StatCard
          label={dict.stats.countriesReached}
          value={String(countries.length)}
          icon={GlobeIcon}
        />
      </div>

      <Card className="mt-4 p-5">
        <h3 className="text-sm font-semibold text-zinc-900">{dict.dashboard.visitsChart}</h3>
        <div className="mt-4">
          <StatsLineChart data={visitsSeries} color="#7c3aed" />
        </div>
      </Card>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-zinc-900">{dict.stats.sources}</h3>
          <div className="mt-4">
            <RatingBreakdownChart data={sources} />
          </div>
        </Card>
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-zinc-900">{dict.stats.topPages}</h3>
          <div className="mt-4">
            <RatingBreakdownChart data={topPages} />
          </div>
        </Card>
      </div>

      <Card className="mt-4 p-5">
        <h3 className="text-sm font-semibold text-zinc-900">{dict.stats.hourly}</h3>
        <div className="mt-4">
          <HourlyChart data={hourly} />
        </div>
      </Card>

      <Card className="mt-4 p-5">
        <h3 className="text-sm font-semibold text-zinc-900">{dict.stats.visitorMap}</h3>
        <div className="mt-4">
          <WorldMap data={countries} />
        </div>
      </Card>

      <Card className="mt-4 p-5">
        <h3 className="text-sm font-semibold text-zinc-900">{dict.stats.countryBreakdown}</h3>
        <div className="mt-4">
          <CountryBreakdown data={countries} />
        </div>
      </Card>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-zinc-900">{dict.stats.device}</h3>
          <div className="mt-4">
            <RatingBreakdownChart data={devices} />
          </div>
        </Card>
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-zinc-900">{dict.stats.os}</h3>
          <div className="mt-4">
            <RatingBreakdownChart data={operatingSystems} />
          </div>
        </Card>
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-zinc-900">{dict.stats.browser}</h3>
          <div className="mt-4">
            <RatingBreakdownChart data={browsers} />
          </div>
        </Card>
      </div>

      <Card className="mt-4 p-5">
        <h3 className="text-sm font-semibold text-zinc-900">{dict.stats.visitorType}</h3>
        <div className="mt-4">
          <RatingBreakdownChart data={visitorTypes} />
        </div>
      </Card>
    </div>
  );
}

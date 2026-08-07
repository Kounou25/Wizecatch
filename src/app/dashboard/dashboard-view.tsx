"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/stat-card";
import { SiteCard } from "@/components/dashboard/site-card";
import { StatsLineChart } from "@/components/dashboard/stats-line-chart";
import { RatingBreakdownChart } from "@/components/dashboard/rating-breakdown-chart";
import { EmptyState } from "@/components/dashboard/empty-state";
import { PlusIcon, GlobeIcon, MessageSquareIcon, ActivityIcon } from "@/components/icons";
import { useSites } from "@/components/providers/sites-provider";
import { useLanguage } from "@/components/providers/language-provider";
import { useCurrentUser } from "@/components/providers/user-provider";
import { interpolate } from "@/lib/utils";
import type { SeriesPoint, BreakdownEntry, StatsSummary } from "@/lib/stats/types";

export function DashboardView({
  summary,
  visits,
  reviews,
  visitsBySite,
  totalReviews,
}: {
  summary: StatsSummary;
  visits: SeriesPoint[];
  reviews: SeriesPoint[];
  visitsBySite: BreakdownEntry[];
  totalReviews: number;
}) {
  const { sites } = useSites();
  const { dict } = useLanguage();
  const user = useCurrentUser();

  const firstName = user.fullName.split(" ")[0];
  const hasVisits = summary.totalVisits > 0;

  return (
    <div>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
            {interpolate(dict.dashboard.welcome, { name: firstName })}
          </h1>
          <p className="mt-1 text-sm text-zinc-500">{dict.dashboard.subtitle}</p>
        </div>
        <Button href="/dashboard/sites/new">
          <PlusIcon className="h-4 w-4" />
          {dict.dashboard.addNewSite}
        </Button>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <StatCard
          label={dict.dashboard.totalSites}
          value={String(sites.length)}
          icon={GlobeIcon}
        />
        <StatCard
          label={dict.dashboard.totalVisits}
          value={summary.totalVisits.toLocaleString("en-US")}
          icon={ActivityIcon}
        />
        <StatCard
          label={dict.dashboard.totalReviews}
          value={totalReviews.toLocaleString("en-US")}
          icon={MessageSquareIcon}
        />
      </div>

      {hasVisits && (
        <>
          <div className="mt-10 grid gap-4 lg:grid-cols-2">
            <Card className="p-5">
              <h3 className="text-sm font-semibold text-zinc-900">
                {dict.dashboard.visitsChart}
              </h3>
              <div className="mt-4">
                <StatsLineChart data={visits} color="#7c3aed" />
              </div>
            </Card>

            <Card className="p-5">
              <h3 className="text-sm font-semibold text-zinc-900">
                {dict.dashboard.reviewsChart}
              </h3>
              <div className="mt-4">
                {reviews.some((point) => point.value > 0) ? (
                  <StatsLineChart data={reviews} color="#0ea5e9" />
                ) : (
                  <p className="flex h-56 items-center justify-center text-sm text-zinc-400">
                    {dict.dashboard.noReviewSites}
                  </p>
                )}
              </div>
            </Card>
          </div>

          {visitsBySite.length > 1 && (
            <Card className="mt-4 p-5">
              <h3 className="text-sm font-semibold text-zinc-900">
                {dict.dashboard.visitsBySite}
              </h3>
              <div className="mt-4">
                <RatingBreakdownChart data={visitsBySite} />
              </div>
            </Card>
          )}
        </>
      )}

      <div className="mt-10">
        <h2 className="text-sm font-semibold text-zinc-900">{dict.dashboard.yourSites}</h2>
        <div className="mt-4">
          {sites.length === 0 ? (
            <EmptyState
              icon={GlobeIcon}
              title={dict.sitesPage.empty}
              description={dict.sitesPage.emptyDesc}
              action={
                <Button href="/dashboard/sites/new">
                  <PlusIcon className="h-4 w-4" />
                  {dict.dashboard.addNewSite}
                </Button>
              }
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {sites.map((site) => (
                <SiteCard
                  key={site.id}
                  site={site}
                  reviewsModeLabel={dict.siteCard.reviewsMode}
                  analyticsModeLabel={dict.siteCard.analyticsMode}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

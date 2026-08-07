"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/stat-card";
import { SiteCard } from "@/components/dashboard/site-card";
import { SiteCardSkeleton } from "@/components/dashboard/skeleton";
import { StatsLineChart } from "@/components/dashboard/stats-line-chart";
import { RatingBreakdownChart } from "@/components/dashboard/rating-breakdown-chart";
import { PlusIcon, GlobeIcon, MessageSquareIcon, ActivityIcon } from "@/components/icons";
import { useSites } from "@/components/providers/sites-provider";
import { useLanguage } from "@/components/providers/language-provider";
import { useCurrentUser } from "@/components/providers/user-provider";
import { interpolate } from "@/lib/utils";
import {
  getReviewsBySiteId,
  getAggregateDailyVisits,
  getAggregateDailyReviews,
} from "@/lib/mock-data";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const { sites } = useSites();
  const { dict } = useLanguage();
  const user = useCurrentUser();

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timeout);
  }, []);

  const firstName = user.fullName.split(" ")[0];

  const reviewSites = useMemo(() => sites.filter((site) => site.mode === "reviews"), [sites]);

  const totalVisits = useMemo(
    () => sites.reduce((sum, site) => sum + site.visitCount, 0),
    [sites],
  );
  const totalReviews = useMemo(
    () => reviewSites.reduce((sum, site) => sum + getReviewsBySiteId(site.id).length, 0),
    [reviewSites],
  );

  const visitsSeries = useMemo(
    () =>
      getAggregateDailyVisits(sites.map((site) => site.id)).map((point) => ({
        date: point.date,
        value: point.visits,
      })),
    [sites],
  );
  const reviewsSeries = useMemo(
    () =>
      getAggregateDailyReviews(reviewSites).map((point) => ({
        date: point.date,
        value: point.reviews,
      })),
    [reviewSites],
  );
  const visitsBySite = useMemo(
    () =>
      [...sites]
        .sort((a, b) => b.visitCount - a.visitCount)
        .slice(0, 6)
        .map((site) => ({ label: site.name, count: site.visitCount })),
    [sites],
  );

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
        <StatCard label={dict.dashboard.totalSites} value={String(sites.length)} icon={GlobeIcon} />
        <StatCard
          label={dict.dashboard.totalVisits}
          value={totalVisits.toLocaleString("en-US")}
          icon={ActivityIcon}
        />
        <StatCard
          label={dict.dashboard.totalReviews}
          value={totalReviews.toLocaleString("en-US")}
          icon={MessageSquareIcon}
        />
      </div>

      <div className="mt-10 grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-zinc-900">{dict.dashboard.visitsChart}</h3>
          <div className="mt-4">
            <StatsLineChart data={visitsSeries} color="#7c3aed" />
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="text-sm font-semibold text-zinc-900">{dict.dashboard.reviewsChart}</h3>
          <div className="mt-4">
            {reviewsSeries.some((point) => point.value > 0) ? (
              <StatsLineChart data={reviewsSeries} color="#0ea5e9" />
            ) : (
              <p className="flex h-56 items-center justify-center text-sm text-zinc-400">
                {dict.dashboard.noReviewSites}
              </p>
            )}
          </div>
        </Card>
      </div>

      <div className="mt-4">
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-zinc-900">{dict.dashboard.visitsBySite}</h3>
          <div className="mt-4">
            <RatingBreakdownChart data={visitsBySite} />
          </div>
        </Card>
      </div>

      <div className="mt-10">
        <h2 className="text-sm font-semibold text-zinc-900">{dict.dashboard.yourSites}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {loading
            ? Array.from({ length: sites.length }).map((_, index) => (
                <SiteCardSkeleton key={index} />
              ))
            : sites.map((site) => (
                <SiteCard
                  key={site.id}
                  site={site}
                  reviewsModeLabel={dict.siteCard.reviewsMode}
                  analyticsModeLabel={dict.siteCard.analyticsMode}
                />
              ))}
        </div>
      </div>
    </div>
  );
}

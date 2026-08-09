"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/stat-card";
import { StatsLineChart } from "@/components/dashboard/stats-line-chart";
import { BreakdownList } from "@/components/dashboard/breakdown-list";
import { RatingBreakdownChart } from "@/components/dashboard/rating-breakdown-chart";
import { CountryBreakdown } from "@/components/dashboard/country-breakdown";
import { WorldMap } from "@/components/dashboard/world-map";
import { HourlyChart } from "@/components/dashboard/hourly-chart";
import { Skeleton } from "@/components/dashboard/skeleton";
import { EmptyState } from "@/components/dashboard/empty-state";
import { PeriodSelector, type Period } from "@/components/dashboard/period-selector";
import { DeltaBadge } from "@/components/dashboard/delta-badge";
import { NpsCard } from "@/components/dashboard/nps-card";
import { RatingByList } from "@/components/dashboard/rating-by-list";
import {
  ActivityIcon,
  GlobeIcon,
  MessageSquareIcon,
  UsersIcon,
  BarChartIcon,
} from "@/components/icons";
import { formatDuration, type Site } from "@/lib/mock-data";
import type { SiteStats } from "@/lib/stats/types";
import type { Dictionary } from "@/lib/i18n/dictionaries";

async function fetchStats(siteId: string, days: number): Promise<SiteStats> {
  const response = await fetch(
    `/api/stats?siteId=${encodeURIComponent(siteId)}&days=${days}`,
  );
  if (!response.ok) throw new Error("Failed to load stats");
  return response.json();
}

function ChartSkeleton() {
  return <Skeleton className="h-56 w-full" />;
}

/** Le squelette doit annoncer la forme réelle : trois lignes, pas un bloc. */
function ListSkeleton() {
  return (
    <div className="space-y-1">
      <Skeleton className="h-9 w-full" />
      <Skeleton className="h-9 w-3/5" />
      <Skeleton className="h-9 w-2/5" />
    </div>
  );
}

/** Carte de répartition — même structure répétée une douzaine de fois. */
function PanelCard({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="p-5">
      <h3 className="text-sm font-semibold text-zinc-900">{title}</h3>
      {hint && <p className="mt-1 text-xs text-zinc-400">{hint}</p>}
      <div className="mt-4">{children}</div>
    </Card>
  );
}

export function StatsTab({ site, dict }: { site: Site; dict: Dictionary }) {
  const isReviews = site.mode === "reviews";
  const [period, setPeriod] = useState<Period>(30);

  // La période fait partie de la clé : changer de fenêtre déclenche une
  // nouvelle requête, et revenir sur une période déjà vue la sert du cache.
  const { data, isPending, isError } = useQuery({
    queryKey: ["stats", site.id, period],
    queryFn: () => fetchStats(site.id, period),
  });

  if (isError) {
    return (
      <EmptyState
        icon={BarChartIcon}
        title={dict.states.statsError}
        description={dict.states.statsErrorDesc}
      />
    );
  }

  const summary = data?.summary;
  const compare = data?.comparison;
  const hasData = (summary?.totalVisits ?? 0) > 0;
  const dash = (value: string) => (isPending ? "—" : value);

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <PeriodSelector value={period} onChange={setPeriod} dict={dict} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label={dict.stats.uniqueVisitors}
          value={dash((summary?.uniqueVisitors ?? 0).toLocaleString("en-US"))}
          icon={UsersIcon}
          trend={compare && <DeltaBadge delta={compare.uniqueVisitors} dict={dict} />}
        />
        <StatCard
          label={dict.siteDetail.visits}
          value={dash((summary?.totalVisits ?? 0).toLocaleString("en-US"))}
          icon={ActivityIcon}
          trend={compare && <DeltaBadge delta={compare.totalVisits} dict={dict} />}
        />
        <StatCard
          label={dict.stats.pageviews}
          value={dash((summary?.totalPageviews ?? 0).toLocaleString("en-US"))}
          icon={BarChartIcon}
          trend={compare && <DeltaBadge delta={compare.totalPageviews} dict={dict} />}
        />
        <StatCard
          label={dict.stats.avgDuration}
          value={dash(formatDuration(summary?.avgDuration ?? 0))}
          icon={ActivityIcon}
          trend={compare && <DeltaBadge delta={compare.avgDuration} dict={dict} />}
        />
        <StatCard
          label={dict.stats.bounceRate}
          value={dash(`${summary?.bounceRate ?? 0}%`)}
          icon={BarChartIcon}
          // Un rebond en baisse est une bonne nouvelle : la couleur doit suivre.
          trend={compare && <DeltaBadge delta={compare.bounceRate} dict={dict} inverted />}
        />
        <StatCard
          label={dict.stats.countriesReached}
          value={dash(String(summary?.countriesReached ?? 0))}
          icon={GlobeIcon}
        />
        {isReviews && (
          <>
            <StatCard
              label={dict.stats.reviewsCollected}
              value={dash(String(data?.reviewTotal ?? 0))}
              icon={MessageSquareIcon}
              trend={compare && <DeltaBadge delta={compare.reviews} dict={dict} />}
            />
            <StatCard
              label={dict.stats.collectionRate}
              value={dash(`${data?.collectionRate ?? 0}%`)}
              icon={MessageSquareIcon}
            />
          </>
        )}
      </div>

      {/* Aucune visite : inutile d'afficher quinze graphiques vides. */}
      {!isPending && !hasData ? (
        <EmptyState
          icon={ActivityIcon}
          title={dict.states.noVisits}
          description={dict.states.noVisitsDesc}
        />
      ) : (
        <>
          <PanelCard title={dict.stats.visitsOverTime}>
            {isPending ? (
              <ChartSkeleton />
            ) : (
              <StatsLineChart data={data!.visits} color="#7c3aed" />
            )}
          </PanelCard>

          {/* ---------------------------------------------------------------
              Volet avis — le croisement satisfaction × trafic est ce que la
              plateforme peut produire et qu'un outil d'analytics seul ne peut
              pas. Il passe donc avant les répartitions d'audience.
              --------------------------------------------------------------- */}
          {isReviews && (
            <>
              <div className="grid gap-4 lg:grid-cols-2">
                <PanelCard title={dict.stats.ratingBreakdown}>
                  {isPending ? (
                    <ChartSkeleton />
                  ) : (
                    <RatingBreakdownChart data={data!.ratings} />
                  )}
                </PanelCard>
                <PanelCard title={dict.stats.npsTitle}>
                  {isPending ? <ListSkeleton /> : <NpsCard nps={data!.nps} dict={dict} />}
                </PanelCard>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <PanelCard
                  title={dict.stats.ratingByCountry}
                  hint={dict.stats.ratingCrossHint}
                >
                  {isPending ? (
                    <ListSkeleton />
                  ) : (
                    <RatingByList
                      data={data!.ratingByCountry}
                      kind="country"
                      emptyLabel={dict.stats.noData}
                    />
                  )}
                </PanelCard>
                <PanelCard title={dict.stats.ratingByDevice}>
                  {isPending ? (
                    <ListSkeleton />
                  ) : (
                    <RatingByList
                      data={data!.ratingByDevice}
                      kind="device"
                      emptyLabel={dict.stats.noData}
                    />
                  )}
                </PanelCard>
              </div>
            </>
          )}

          {/* --- Provenance ------------------------------------------------ */}
          <div className="grid gap-4 lg:grid-cols-2">
            <PanelCard title={dict.stats.sources}>
              {isPending ? (
                <ListSkeleton />
              ) : (
                <BreakdownList data={data!.sources} emptyLabel={dict.stats.noData} />
              )}
            </PanelCard>
            <PanelCard title={dict.stats.utmCampaigns}>
              {isPending ? (
                <ListSkeleton />
              ) : (
                <BreakdownList data={data!.utmCampaigns} emptyLabel={dict.stats.noData} />
              )}
            </PanelCard>
          </div>

          {/* --- Pages ----------------------------------------------------- */}
          <div className="grid gap-4 lg:grid-cols-2">
            <PanelCard title={dict.stats.topPagesReal}>
              {isPending ? (
                <ListSkeleton />
              ) : (
                <BreakdownList data={data!.topPages} emptyLabel={dict.stats.noData} />
              )}
            </PanelCard>
            <PanelCard title={dict.stats.entryPages}>
              {isPending ? (
                <ListSkeleton />
              ) : (
                <BreakdownList data={data!.entryPages} emptyLabel={dict.stats.noData} />
              )}
            </PanelCard>
          </div>

          <PanelCard title={dict.stats.hourly}>
            {isPending ? <ChartSkeleton /> : <HourlyChart data={data!.hourly} />}
          </PanelCard>

          <PanelCard title={dict.stats.visitorMap}>
            {isPending ? (
              <Skeleton className="aspect-[2/1] w-full" />
            ) : (
              <WorldMap data={data!.countries} />
            )}
          </PanelCard>

          <div className="grid gap-4 lg:grid-cols-2">
            <PanelCard title={dict.stats.countryBreakdown}>
              {isPending ? (
                <ChartSkeleton />
              ) : (
                <CountryBreakdown data={data!.countries} />
              )}
            </PanelCard>
            <PanelCard title={dict.stats.cities}>
              {isPending ? (
                <ListSkeleton />
              ) : (
                <BreakdownList data={data!.cities} emptyLabel={dict.stats.noData} />
              )}
            </PanelCard>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <PanelCard title={dict.stats.device}>
              {isPending ? (
                <ListSkeleton />
              ) : (
                <BreakdownList
                  data={data!.devices}
                  iconSet="device"
                  emptyLabel={dict.stats.noData}
                />
              )}
            </PanelCard>
            <PanelCard title={dict.stats.os}>
              {isPending ? (
                <ListSkeleton />
              ) : (
                <BreakdownList
                  data={data!.operatingSystems}
                  iconSet="os"
                  emptyLabel={dict.stats.noData}
                />
              )}
            </PanelCard>
            <PanelCard title={dict.stats.browser}>
              {isPending ? (
                <ListSkeleton />
              ) : (
                <BreakdownList
                  data={data!.browsers}
                  iconSet="browser"
                  emptyLabel={dict.stats.noData}
                />
              )}
            </PanelCard>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <PanelCard title={dict.stats.visitorType}>
              {isPending ? (
                <ListSkeleton />
              ) : (
                <BreakdownList data={data!.visitorTypes} emptyLabel={dict.stats.noData} />
              )}
            </PanelCard>
            <PanelCard title={dict.stats.languages}>
              {isPending ? (
                <ListSkeleton />
              ) : (
                <BreakdownList data={data!.languages} emptyLabel={dict.stats.noData} />
              )}
            </PanelCard>
          </div>
        </>
      )}
    </div>
  );
}

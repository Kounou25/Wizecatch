import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/stat-card";
import { StatsLineChart } from "@/components/dashboard/stats-line-chart";
import { RatingBreakdownChart } from "@/components/dashboard/rating-breakdown-chart";
import { CountryBreakdown } from "@/components/dashboard/country-breakdown";
import { WorldMap } from "@/components/dashboard/world-map";
import { HourlyChart } from "@/components/dashboard/hourly-chart";
import {
  ActivityIcon,
  GlobeIcon,
  MessageSquareIcon,
  UsersIcon,
  BarChartIcon,
} from "@/components/icons";
import {
  getDailyVisitCounts,
  getCountryBreakdown,
  getRatingBreakdown,
  getDeviceBreakdown,
  getOsBreakdown,
  getBrowserBreakdown,
  getSourceBreakdown,
  getTopPages,
  getVisitorTypeBreakdown,
  getAvgSessionDuration,
  getBounceRate,
  getHourlyDistribution,
  formatDuration,
  generateDailyMetrics,
  getReviewsBySiteId,
  type Site,
  type ReviewTemplateId,
} from "@/lib/mock-data";
import type { Dictionary } from "@/lib/i18n/dictionaries";

function formatScore(templateId: ReviewTemplateId | undefined, value: number) {
  switch (templateId) {
    case "nps":
      return value.toFixed(1);
    case "thumbs":
      return `${value.toFixed(0)}%`;
    case "star_rating":
    case "star_comment":
      return `${value.toFixed(1)} ★`;
    default:
      return String(value);
  }
}

export function StatsTab({ site, dict }: { site: Site; dict: Dictionary }) {
  const isReviews = site.mode === "reviews";
  const hasScoreTrend = isReviews && site.templateId !== "testimonial";

  const visitSeries = getDailyVisitCounts(site.id).map((point) => ({
    date: point.date,
    value: point.visits,
  }));
  const countries = getCountryBreakdown(site.id);
  const reviewCount = isReviews ? getReviewsBySiteId(site.id).length : 0;

  const dailyMetrics = generateDailyMetrics(site, 30);
  const scoreSeries = dailyMetrics.map((point) => ({ date: point.date, value: point.score }));

  const ratingBreakdown = isReviews ? getRatingBreakdown(site.id) : [];

  const deviceBreakdown = getDeviceBreakdown(site.id);
  const osBreakdown = getOsBreakdown(site.id);
  const browserBreakdown = getBrowserBreakdown(site.id);

  const sourceBreakdown = getSourceBreakdown(site.id);
  const topPages = getTopPages(site.id);
  const visitorTypes = getVisitorTypeBreakdown(site.id);
  const avgDuration = getAvgSessionDuration(site.id);
  const bounceRate = getBounceRate(site.id);
  const hourly = getHourlyDistribution(site.id);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label={dict.siteDetail.visits}
          value={site.visitCount.toLocaleString("en-US")}
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
        {isReviews && (
          <StatCard
            label={dict.dashboard.totalReviews}
            value={String(reviewCount)}
            icon={MessageSquareIcon}
          />
        )}
      </div>

      <Card className="p-5">
        <h3 className="text-sm font-semibold text-zinc-900">{dict.stats.visitsOverTime}</h3>
        <div className="mt-4">
          <StatsLineChart data={visitSeries} color="#7c3aed" />
        </div>
      </Card>

      {hasScoreTrend && (
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-zinc-900">{dict.stats.scoreOverTime}</h3>
          <div className="mt-4">
            <StatsLineChart
              data={scoreSeries}
              color="#0ea5e9"
              valueFormatter={(value) => formatScore(site.templateId, value)}
            />
          </div>
        </Card>
      )}

      {isReviews && (
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-zinc-900">{dict.stats.ratingBreakdown}</h3>
          {ratingBreakdown.length > 0 ? (
            <div className="mt-4">
              <RatingBreakdownChart data={ratingBreakdown} />
            </div>
          ) : (
            <p className="mt-3 text-sm text-zinc-500">{dict.stats.noRatingData}</p>
          )}
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-zinc-900">{dict.stats.sources}</h3>
          <div className="mt-4">
            <RatingBreakdownChart data={sourceBreakdown} />
          </div>
        </Card>
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-zinc-900">{dict.stats.topPages}</h3>
          <div className="mt-4">
            <RatingBreakdownChart data={topPages} />
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <h3 className="text-sm font-semibold text-zinc-900">{dict.stats.hourly}</h3>
        <div className="mt-4">
          <HourlyChart data={hourly} />
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="text-sm font-semibold text-zinc-900">{dict.stats.visitorMap}</h3>
        <div className="mt-4">
          <WorldMap data={countries} />
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="text-sm font-semibold text-zinc-900">{dict.stats.countryBreakdown}</h3>
        <div className="mt-4">
          <CountryBreakdown data={countries} />
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="text-sm font-semibold text-zinc-900">{dict.stats.visitorType}</h3>
        <div className="mt-4">
          <RatingBreakdownChart data={visitorTypes} />
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-zinc-900">{dict.stats.device}</h3>
          <div className="mt-4">
            <RatingBreakdownChart data={deviceBreakdown} />
          </div>
        </Card>
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-zinc-900">{dict.stats.os}</h3>
          <div className="mt-4">
            <RatingBreakdownChart data={osBreakdown} />
          </div>
        </Card>
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-zinc-900">{dict.stats.browser}</h3>
          <div className="mt-4">
            <RatingBreakdownChart data={browserBreakdown} />
          </div>
        </Card>
      </div>
    </div>
  );
}

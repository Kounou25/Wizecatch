"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ReviewCard } from "@/components/dashboard/review-card";
import { EmptyState } from "@/components/dashboard/empty-state";
import { InboxIcon } from "@/components/icons";
import { useSites } from "@/components/providers/sites-provider";
import { useLanguage } from "@/components/providers/language-provider";
import { getReviewsBySiteId, type ReviewStatus } from "@/lib/mock-data";

type StatusFilter = "all" | ReviewStatus;

export default function AllReviewsPage() {
  const { sites } = useSites();
  const { dict } = useLanguage();
  const [siteFilter, setSiteFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const reviewSites = useMemo(() => sites.filter((site) => site.mode === "reviews"), [sites]);

  const siteNameById = useMemo(
    () => new Map(sites.map((site) => [site.id, site.name])),
    [sites],
  );

  const allReviews = useMemo(
    () =>
      reviewSites
        .flatMap((site) => getReviewsBySiteId(site.id))
        .sort((a, b) => b.date.localeCompare(a.date)),
    [reviewSites],
  );

  const filtered = useMemo(
    () =>
      allReviews.filter((review) => {
        if (siteFilter !== "all" && review.siteId !== siteFilter) return false;
        if (statusFilter !== "all" && review.status !== statusFilter) return false;
        return true;
      }),
    [allReviews, siteFilter, statusFilter],
  );

  const hasFilters = siteFilter !== "all" || statusFilter !== "all";

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
        {dict.reviewsPage.title}
      </h1>
      <p className="mt-1 text-sm text-zinc-500">{dict.reviewsPage.subtitle}</p>

      <div className="mt-8 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <p className="text-sm text-zinc-500">
          {filtered.length} / {allReviews.length}
        </p>

        <div className="flex flex-wrap gap-2">
          <Select
            value={siteFilter}
            onChange={(event) => setSiteFilter(event.target.value)}
            className="w-44"
          >
            <option value="all">{dict.reviewsPage.allSites}</option>
            {reviewSites.map((site) => (
              <option key={site.id} value={site.id}>
                {site.name}
              </option>
            ))}
          </Select>

          <Select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
            className="w-40"
          >
            <option value="all">{dict.reviewsTab.allStatuses}</option>
            <option value="published">{dict.reviewsTab.published}</option>
            <option value="pending">{dict.reviewsTab.pending}</option>
            <option value="hidden">{dict.reviewsTab.hidden}</option>
          </Select>
        </div>
      </div>

      <div className="mt-4 space-y-4">
        {allReviews.length === 0 ? (
          <EmptyState
            icon={InboxIcon}
            title={dict.reviewsPage.empty}
            description={dict.reviewsPage.emptyDesc}
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={InboxIcon}
            title={dict.reviewsPage.noMatch}
            description={dict.reviewsPage.noMatchDesc}
            action={
              hasFilters ? (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSiteFilter("all");
                    setStatusFilter("all");
                  }}
                >
                  {dict.reviewsTab.clearFilters}
                </Button>
              ) : undefined
            }
          />
        ) : (
          filtered.map((review) => (
            <div key={review.id}>
              <Link
                href={`/dashboard/sites/${review.siteId}`}
                className="mb-1.5 inline-block text-xs font-medium text-zinc-400 hover:text-purple-600"
              >
                {siteNameById.get(review.siteId) ?? review.siteId}
              </Link>
              <ReviewCard review={review} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

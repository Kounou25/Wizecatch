"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { ReviewCard } from "@/components/dashboard/review-card";
import { EmptyState } from "@/components/dashboard/empty-state";
import { InboxIcon } from "@/components/icons";
import { getReviewsBySiteId, type Site, type ReviewStatus } from "@/lib/mock-data";
import type { Dictionary } from "@/lib/i18n/dictionaries";

type StatusFilter = "all" | ReviewStatus;
type StarFilter = "all" | "5" | "4" | "3" | "2" | "1";
type ThumbsFilter = "all" | "up" | "down";
type NpsFilter = "all" | "promoters" | "passives" | "detractors";

export function ReviewsTab({ site, dict }: { site: Site; dict: Dictionary }) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [starFilter, setStarFilter] = useState<StarFilter>("all");
  const [thumbsFilter, setThumbsFilter] = useState<ThumbsFilter>("all");
  const [npsFilter, setNpsFilter] = useState<NpsFilter>("all");

  const allReviews = useMemo(() => getReviewsBySiteId(site.id), [site.id]);

  const filteredReviews = useMemo(() => {
    return allReviews.filter((review) => {
      if (statusFilter !== "all" && review.status !== statusFilter) return false;

      switch (site.templateId) {
        case "star_rating":
        case "star_comment":
          return starFilter === "all" || review.rating === Number(starFilter);
        case "thumbs":
          if (thumbsFilter === "all") return true;
          return thumbsFilter === "up" ? review.thumbsUp === true : review.thumbsUp === false;
        case "nps": {
          if (npsFilter === "all") return true;
          const score = review.npsScore ?? 0;
          if (npsFilter === "promoters") return score >= 9;
          if (npsFilter === "passives") return score >= 7 && score <= 8;
          return score <= 6;
        }
        default:
          return true;
      }
    });
  }, [allReviews, statusFilter, starFilter, thumbsFilter, npsFilter, site.templateId]);

  function clearFilters() {
    setStatusFilter("all");
    setStarFilter("all");
    setThumbsFilter("all");
    setNpsFilter("all");
  }

  const hasActiveFilters =
    statusFilter !== "all" || starFilter !== "all" || thumbsFilter !== "all" || npsFilter !== "all";

  return (
    <div>
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <h2 className="text-sm font-semibold text-zinc-900">
          {dict.siteDetail.tabs.reviews}
          <span className="ml-2 font-normal text-zinc-400">
            {filteredReviews.length} / {allReviews.length}
          </span>
        </h2>

        <div className="flex flex-wrap gap-2">
          {(site.templateId === "star_rating" || site.templateId === "star_comment") && (
            <Select
              value={starFilter}
              onChange={(event) => setStarFilter(event.target.value as StarFilter)}
              className="w-36"
            >
              <option value="all">{dict.reviewsTab.allRatings}</option>
              <option value="5">5 ★</option>
              <option value="4">4 ★</option>
              <option value="3">3 ★</option>
              <option value="2">2 ★</option>
              <option value="1">1 ★</option>
            </Select>
          )}

          {site.templateId === "thumbs" && (
            <Select
              value={thumbsFilter}
              onChange={(event) => setThumbsFilter(event.target.value as ThumbsFilter)}
              className="w-36"
            >
              <option value="all">{dict.reviewsTab.allRatings}</option>
              <option value="up">👍 Up</option>
              <option value="down">👎 Down</option>
            </Select>
          )}

          {site.templateId === "nps" && (
            <Select
              value={npsFilter}
              onChange={(event) => setNpsFilter(event.target.value as NpsFilter)}
              className="w-40"
            >
              <option value="all">{dict.reviewsTab.allRatings}</option>
              <option value="promoters">Promoters (9–10)</option>
              <option value="passives">Passives (7–8)</option>
              <option value="detractors">Detractors (0–6)</option>
            </Select>
          )}

          <Select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
            className="w-36"
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
            title={dict.reviewsTab.noReviews}
            description={dict.reviewsTab.noReviewsDesc}
          />
        ) : filteredReviews.length === 0 ? (
          <EmptyState
            icon={InboxIcon}
            title={dict.reviewsTab.noMatch}
            description={dict.reviewsTab.noMatchDesc}
            action={
              hasActiveFilters ? (
                <Button variant="outline" onClick={clearFilters}>
                  {dict.reviewsTab.clearFilters}
                </Button>
              ) : undefined
            }
          />
        ) : (
          filteredReviews.map((review) => <ReviewCard key={review.id} review={review} />)
        )}
      </div>
    </div>
  );
}

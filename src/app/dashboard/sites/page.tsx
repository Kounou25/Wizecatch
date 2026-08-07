"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { SiteCard } from "@/components/dashboard/site-card";
import { EmptyState } from "@/components/dashboard/empty-state";
import { PlusIcon, GlobeIcon } from "@/components/icons";
import { useSites } from "@/components/providers/sites-provider";
import { useLanguage } from "@/components/providers/language-provider";
import type { SiteMode } from "@/lib/mock-data";

type ModeFilter = "all" | SiteMode;

export default function SitesPage() {
  const { sites } = useSites();
  const { dict } = useLanguage();
  const [modeFilter, setModeFilter] = useState<ModeFilter>("all");

  const filtered = useMemo(
    () => (modeFilter === "all" ? sites : sites.filter((site) => site.mode === modeFilter)),
    [sites, modeFilter],
  );

  return (
    <div>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
            {dict.sitesPage.title}
          </h1>
          <p className="mt-1 text-sm text-zinc-500">{dict.sitesPage.subtitle}</p>
        </div>
        <Button href="/dashboard/sites/new">
          <PlusIcon className="h-4 w-4" />
          {dict.dashboard.addNewSite}
        </Button>
      </div>

      <div className="mt-8 flex items-center justify-between gap-3">
        <p className="text-sm text-zinc-500">
          {filtered.length} / {sites.length}
        </p>
        <Select
          value={modeFilter}
          onChange={(event) => setModeFilter(event.target.value as ModeFilter)}
          className="w-48"
        >
          <option value="all">{dict.sitesPage.all}</option>
          <option value="reviews">{dict.siteCard.reviewsMode}</option>
          <option value="analytics_only">{dict.siteCard.analyticsMode}</option>
        </Select>
      </div>

      <div className="mt-4">
        {filtered.length === 0 ? (
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
            {filtered.map((site) => (
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
  );
}

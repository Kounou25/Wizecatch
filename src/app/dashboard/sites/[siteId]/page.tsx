"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, type TabItem } from "@/components/ui/tabs";
import { EmptyState } from "@/components/dashboard/empty-state";
import { OverviewTab } from "@/components/dashboard/tabs/overview-tab";
import { StatsTab } from "@/components/dashboard/tabs/stats-tab";
import { ReviewsTab } from "@/components/dashboard/tabs/reviews-tab";
import { TemplateSettingsTab } from "@/components/dashboard/tabs/template-settings-tab";
import { WidgetSettingsTab } from "@/components/dashboard/tabs/widget-settings-tab";
import { GlobeIcon } from "@/components/icons";
import { useSites } from "@/components/providers/sites-provider";
import { useLanguage } from "@/components/providers/language-provider";

type TabId = "overview" | "stats" | "reviews" | "template" | "widget";

export default function SiteDetailPage() {
  const params = useParams<{ siteId: string }>();
  const { getSite } = useSites();
  const { dict } = useLanguage();
  const site = getSite(params.siteId);

  const [activeTab, setActiveTab] = useState<TabId>("overview");

  const tabs: TabItem[] = useMemo(() => {
    if (!site) return [];
    const base: TabItem[] = [
      { id: "overview", label: dict.siteDetail.tabs.overview },
      { id: "stats", label: dict.siteDetail.tabs.stats },
    ];
    if (site.mode === "reviews") {
      base.push(
        { id: "reviews", label: dict.siteDetail.tabs.reviews },
        { id: "template", label: dict.siteDetail.tabs.templateSettings },
      );
    }
    base.push({ id: "widget", label: dict.siteDetail.tabs.widgetSettings });
    return base;
  }, [site, dict]);

  if (!site) {
    return (
      <EmptyState
        icon={GlobeIcon}
        title={dict.siteDetail.notFoundTitle}
        description={dict.siteDetail.notFoundDesc}
        action={
          <Button href="/dashboard" variant="outline">
            {dict.wizard.backToDashboard}
          </Button>
        }
      />
    );
  }

  const isReviews = site.mode === "reviews";
  const currentTab = tabs.some((tab) => tab.id === activeTab) ? activeTab : "overview";

  return (
    <div>
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-500">
          <GlobeIcon className="h-6 w-6" />
        </span>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight text-zinc-900">{site.name}</h1>
            <Badge variant="green">{dict.siteDetail.active}</Badge>
            <Badge variant={isReviews ? "purple" : "neutral"}>
              {isReviews ? dict.siteCard.reviewsMode : dict.siteCard.analyticsMode}
            </Badge>
          </div>
          <p className="mt-0.5 text-sm text-zinc-500">{site.domain}</p>
        </div>
      </div>

      <div className="mt-8">
        <Tabs items={tabs} active={currentTab} onChange={(id) => setActiveTab(id as TabId)} />
      </div>

      <div className="mt-6">
        {currentTab === "overview" && <OverviewTab site={site} dict={dict} />}
        {currentTab === "stats" && <StatsTab site={site} dict={dict} />}
        {currentTab === "reviews" && isReviews && <ReviewsTab site={site} dict={dict} />}
        {currentTab === "template" && isReviews && (
          <TemplateSettingsTab site={site} dict={dict} />
        )}
        {currentTab === "widget" && <WidgetSettingsTab site={site} dict={dict} />}
      </div>

      <div className="mt-10">
        <Link
          href="/dashboard"
          className="text-sm font-medium text-zinc-500 hover:text-zinc-900"
        >
          ← {dict.siteDetail.backToSites}
        </Link>
      </div>
    </div>
  );
}

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SiteEmbedTabs } from "@/components/dashboard/site-embed-tabs";
import { templateIcons } from "@/components/template-icon";
import { ActivityIcon, ExternalLinkIcon } from "@/components/icons";
import { type Site } from "@/lib/mock-data";
import { getTemplate } from "@/lib/i18n/content";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function OverviewTab({ site, dict }: { site: Site; dict: Dictionary }) {
  const isReviews = site.mode === "reviews";
  const template = site.templateId ? getTemplate(dict, site.templateId) : null;
  const TemplateIcon = site.templateId ? templateIcons[site.templateId] : null;
  // La clé publique, jamais l'uuid interne. Les sites de démonstration de la
  // page d'accueil n'en ont pas — on retombe alors sur un identifiant lisible.
  const siteKey = site.publicKey ?? site.id;
  const origin =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://app.wizecatch.com";

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-1">
        <Card className="p-5">
          <p className="text-xs font-medium text-zinc-400">{dict.siteDetail.modeLabel}</p>
          <div className="mt-1.5 flex items-center gap-2">
            <Badge variant={isReviews ? "purple" : "neutral"}>
              {isReviews ? dict.siteCard.reviewsMode : dict.siteCard.analyticsMode}
            </Badge>
          </div>
        </Card>

        {isReviews && template && TemplateIcon && (
          <Card className="p-5">
            <p className="text-xs font-medium text-zinc-400">{dict.siteDetail.templateLabel}</p>
            <div className="mt-2 flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                <TemplateIcon className="h-4 w-4" />
              </span>
              <span className="text-sm font-medium text-zinc-900">{template.name}</span>
            </div>
          </Card>
        )}

        <Card className="p-5">
          <p className="text-xs font-medium text-zinc-400">{dict.siteDetail.visits}</p>
          <p className="mt-1.5 flex items-center gap-1.5 text-lg font-semibold text-zinc-900">
            <ActivityIcon className="h-4 w-4 text-zinc-400" />
            {site.visitCount.toLocaleString("en-US")}
          </p>
        </Card>

        <a
          href={`https://${site.domain}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-purple-600"
        >
          {site.domain}
          <ExternalLinkIcon className="h-3.5 w-3.5" />
        </a>
      </div>

      <div className="space-y-4 lg:col-span-2">
        <Card className="p-5">
          <h2 className="text-sm font-semibold text-zinc-900">{dict.siteDetail.embedScript}</h2>
          <p className="mt-1 text-sm text-zinc-500">
            {isReviews ? dict.siteDetail.embedBothDesc : dict.siteDetail.embedScriptDesc}
          </p>
          <div className="mt-4">
            <SiteEmbedTabs siteKey={siteKey} origin={origin} showWall={isReviews} />
          </div>
          {isReviews && (
            <p className="mt-3 text-xs text-zinc-400">{dict.siteDetail.wallHint}</p>
          )}
        </Card>
      </div>
    </div>
  );
}

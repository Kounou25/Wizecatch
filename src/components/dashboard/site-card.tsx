import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GlobeIcon, ArrowRightIcon, ActivityIcon } from "@/components/icons";
import { getSiteSummary, type Site } from "@/lib/mock-data";

export function SiteCard({
  site,
  reviewsModeLabel = "Reviews",
  analyticsModeLabel = "Analytics only",
}: {
  site: Site;
  reviewsModeLabel?: string;
  analyticsModeLabel?: string;
}) {
  const isReviews = site.mode === "reviews";

  return (
    <Link href={`/dashboard/sites/${site.id}`}>
      <Card className="group p-5 transition-shadow duration-150 hover:shadow-md">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500">
              <GlobeIcon className="h-5 w-5" />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold text-zinc-900">{site.name}</h3>
                <Badge variant={isReviews ? "purple" : "neutral"}>
                  {isReviews ? reviewsModeLabel : analyticsModeLabel}
                </Badge>
              </div>
              <p className="text-sm text-zinc-500">{site.domain}</p>
            </div>
          </div>
          <ArrowRightIcon className="h-4 w-4 shrink-0 text-zinc-300 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-zinc-500" />
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-zinc-100 pt-4 text-sm">
          <div className="flex items-center gap-1.5 text-zinc-600">
            <ActivityIcon className="h-4 w-4 text-zinc-400" />
            {site.visitCount.toLocaleString("en-US")}
          </div>
          {isReviews && (
            <span className="font-medium text-zinc-700">{getSiteSummary(site)}</span>
          )}
        </div>
      </Card>
    </Link>
  );
}

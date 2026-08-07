import { DashboardView } from "@/app/dashboard/dashboard-view";
import { getUserSites } from "@/lib/sites/queries";
import { getSummary, getDailyVisits, getDailyReviews } from "@/lib/stats/queries";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const sites = await getUserSites();
  const siteIds = sites.map((site) => site.id);
  const reviewSiteIds = sites
    .filter((site) => site.mode === "reviews")
    .map((site) => site.id);

  const supabase = await createClient();

  const [summary, visits, reviews, reviewCount] = await Promise.all([
    getSummary(siteIds),
    getDailyVisits(siteIds),
    getDailyReviews(reviewSiteIds),
    supabase.from("reviews").select("id", { count: "exact", head: true }),
  ]);

  // Le compteur de visites de chaque site provient déjà de la base
  // (agrégat sessions), on s'en sert pour le classement par site.
  const visitsBySite = [...sites]
    .sort((a, b) => b.visitCount - a.visitCount)
    .slice(0, 6)
    .map((site) => ({ label: site.name, count: site.visitCount }));

  return (
    <DashboardView
      summary={summary}
      visits={visits}
      reviews={reviews}
      visitsBySite={visitsBySite}
      totalReviews={reviewCount.count ?? 0}
    />
  );
}

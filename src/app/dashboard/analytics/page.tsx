import { AnalyticsView } from "@/app/dashboard/analytics/analytics-view";
import { getUserSites } from "@/lib/sites/queries";
import { getStats } from "@/lib/stats/queries";

/**
 * Server Component : les agrégations sont faites côté base, la page arrive
 * déjà remplie. Aucun état de chargement à gérer, aucun JavaScript de requête
 * envoyé au navigateur.
 */
export default async function AnalyticsPage() {
  const sites = await getUserSites();
  const stats = await getStats(sites.map((site) => site.id));

  return <AnalyticsView stats={stats} siteCount={sites.length} />;
}

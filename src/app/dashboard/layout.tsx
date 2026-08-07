import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { SitesProvider } from "@/components/providers/sites-provider";
import { UserProvider } from "@/components/providers/user-provider";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getUserSites } from "@/lib/sites/queries";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  // Le proxy protège déjà /dashboard ; ceci couvre le cas où la session
  // expire entre la vérification du proxy et le rendu.
  if (!user) redirect("/login");

  const sites = await getUserSites();

  return (
    <UserProvider user={user}>
      <SitesProvider sites={sites}>
        <DashboardShell>{children}</DashboardShell>
      </SitesProvider>
    </UserProvider>
  );
}

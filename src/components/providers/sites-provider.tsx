"use client";

import { createContext, useContext, useMemo } from "react";
import type { Site } from "@/lib/mock-data";

type SitesContextValue = {
  sites: Site[];
  getSite: (id: string) => Site | undefined;
};

const SitesContext = createContext<SitesContextValue | null>(null);

/**
 * Diffuse les sites chargés côté serveur.
 *
 * Plus d'état local ni de mutation ici : les modifications passent par des
 * Server Actions, qui appellent revalidatePath. Next.js recharge alors le
 * layout et ce provider reçoit les données à jour. Une seule source de vérité.
 */
export function SitesProvider({
  sites,
  children,
}: {
  sites: Site[];
  children: React.ReactNode;
}) {
  const value = useMemo<SitesContextValue>(
    () => ({
      sites,
      getSite: (id) => sites.find((site) => site.id === id),
    }),
    [sites],
  );

  return <SitesContext.Provider value={value}>{children}</SitesContext.Provider>;
}

export function useSites() {
  const context = useContext(SitesContext);
  if (!context) {
    throw new Error("useSites must be used within a SitesProvider");
  }
  return context;
}

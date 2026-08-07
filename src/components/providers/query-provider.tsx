"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  // Créé dans un useState plutôt qu'au niveau du module : sur le serveur, un
  // client partagé ferait fuiter le cache d'un utilisateur vers un autre.
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Les statistiques changent lentement — inutile de refetcher
            // à chaque retour d'onglet.
            staleTime: 60_000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

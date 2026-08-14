import "server-only";

import DodoPayments from "dodopayments";

/**
 * Client Dodo Payments.
 *
 * `server-only` : la clé API permet de créer des paiements en votre nom. Une
 * importation accidentelle depuis un composant client casse la compilation
 * plutôt que de l'exposer au navigateur.
 *
 * Le client est construit à la demande et non au chargement du module : sans
 * cela, une variable d'environnement absente ferait échouer le build entier
 * au lieu de la seule route concernée.
 */
export function createDodoClient() {
  const bearerToken = process.env.DODO_API_KEY;

  if (!bearerToken) {
    throw new Error("DODO_API_KEY is missing");
  }

  return new DodoPayments({
    bearerToken,
    webhookKey: process.env.DODO_WEBHOOK_KEY ?? undefined,
    // Les deux modes ont des clés, des produits et des webhooks distincts.
    environment: process.env.DODO_ENVIRONMENT === "live_mode" ? "live_mode" : "test_mode",
  });
}

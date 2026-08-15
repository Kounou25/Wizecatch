"use server";

import { createClient } from "@/lib/supabase/server";
import { createDodoClient } from "@/lib/billing/dodo";
import { productIdFor, type BillablePlan } from "@/lib/billing/products";

/**
 * Actions de facturation.
 *
 * Elles créent des sessions chez Dodo ; elles n'accordent JAMAIS de plan.
 * Seul le webhook signé le fait — sinon il suffirait d'appeler ces actions
 * pour s'offrir un abonnement.
 */

function origin(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  // HTTPS impérativement : c'est l'URL de retour après paiement, et certains
  // navigateurs refusent une redirection vers du HTTP depuis une page sécurisée.
  return configured || "https://wizecatch.vercel.app";
}

/** Ouvre un paiement pour le plan demandé et renvoie l'URL de règlement. */
export async function startCheckout(plan: BillablePlan) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { url: null, error: "Vous devez être connecté." };

  const productId = productIdFor(plan);
  if (!productId) {
    console.error(`[billing] identifiant produit manquant pour ${plan}`);
    return { url: null, error: "Cette offre n'est pas disponible pour le moment." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("email, full_name")
    .eq("id", user.id)
    .maybeSingle();

  try {
    const dodo = createDodoClient();

    const session = await dodo.checkoutSessions.create({
      product_cart: [{ product_id: productId, quantity: 1 }],
      customer: {
        email: profile?.email ?? user.email ?? "",
        name: profile?.full_name ?? "",
      },
      // Le lien le plus fiable entre un paiement et un compte. Sans lui, le
      // webhook devrait se rabattre sur l'email — or un client peut très bien
      // payer avec une autre adresse que celle de son compte.
      metadata: { user_id: user.id, plan },
      return_url: `${origin()}/dashboard/settings?checkout=done`,
    });

    if (!session.checkout_url) {
      return { url: null, error: "Dodo n'a pas renvoyé d'URL de paiement." };
    }

    return { url: session.checkout_url, error: null };
  } catch (error) {
    console.error("[billing] checkout:", (error as Error).message);
    return { url: null, error: "Impossible d'ouvrir le paiement, réessayez." };
  }
}

/**
 * Lien vers le portail client Dodo.
 *
 * Factures, changement de carte, annulation et changement d'offre y sont
 * gérés par Dodo : rien de tout cela n'est à construire ici.
 */
export async function openBillingPortal() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { url: null, error: "Vous devez être connecté." };

  // Client normal, donc RLS : la politique `subscriptions_select_own` suffit à
  // lire son propre abonnement, quel que soit son statut. Contourner RLS ici
  // serait un privilège sans contrepartie.
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("provider_customer_id")
    .eq("user_id", user.id)
    .not("provider_customer_id", "is", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!subscription?.provider_customer_id) {
    return { url: null, error: "Aucun abonnement à gérer pour le moment." };
  }

  try {
    const dodo = createDodoClient();
    const session = await dodo.customers.customerPortal.create(
      subscription.provider_customer_id as string,
    );

    return { url: session.link, error: null };
  } catch (error) {
    console.error("[billing] portail:", (error as Error).message);
    return { url: null, error: "Impossible d'ouvrir le portail, réessayez." };
  }
}

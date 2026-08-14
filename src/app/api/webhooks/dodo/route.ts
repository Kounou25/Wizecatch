import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createDodoClient } from "@/lib/billing/dodo";
import { applySubscriptionEvent } from "@/lib/billing/apply";

/**
 * Réception des webhooks Dodo Payments.
 *
 * TROIS CONTRAINTES DICTENT LA FORME DE CE FICHIER
 *
 * 1. C'EST LA SEULE SOURCE DE VÉRITÉ. La page de retour après paiement est une
 *    simple redirection navigateur : n'importe qui peut l'appeler pour
 *    s'attribuer un plan. Seul ce webhook, signé et reçu de serveur à serveur,
 *    accorde un droit.
 *
 * 2. QUINZE SECONDES. Dodo coupe la connexion au-delà, et réessaie 8 fois.
 *    Tout travail long (emails, appels externes) doit rester hors du chemin de
 *    réponse — sinon un pic de latence produit huit livraisons du même
 *    événement.
 *
 * 3. LES REJEUX SONT LA NORME, PAS L'EXCEPTION. La charge utile de Dodo ne
 *    contient aucun identifiant d'événement : c'est l'en-tête `webhook-id` qui
 *    sert de clé. On l'insère AVANT de traiter ; une violation d'unicité
 *    signifie « déjà vu », et on répond 200 sans rien refaire.
 *
 * Toute réponse non-2xx relance le cycle de reprises. On ne renvoie donc une
 * erreur que lorsqu'une reprise a une chance d'aboutir.
 */
export async function POST(request: NextRequest) {
  // Le corps BRUT, impérativement : la signature porte sur ces octets exacts.
  // Passer par request.json() invaliderait la vérification.
  const raw = await request.text();

  const headers = {
    "webhook-id": request.headers.get("webhook-id") ?? "",
    "webhook-signature": request.headers.get("webhook-signature") ?? "",
    "webhook-timestamp": request.headers.get("webhook-timestamp") ?? "",
  };

  const eventId = headers["webhook-id"];
  if (!eventId) {
    return NextResponse.json({ error: "missing_webhook_id" }, { status: 400 });
  }

  // --- Vérification de signature ------------------------------------------
  // Sans elle, cette route serait un formulaire public d'attribution de plans.
  let event: { type: string; data?: Record<string, unknown> };

  try {
    const dodo = createDodoClient();
    // Le type du SDK est une union discriminée précise ; on la ramène à une
    // forme générique parce que `applySubscriptionEvent` lit les champs par
    // nom et doit tolérer les types d'événements ajoutés plus tard.
    event = dodo.webhooks.unwrap(raw, { headers }) as unknown as typeof event;
  } catch (error) {
    console.error("[dodo] signature refusée:", (error as Error).message);
    // 401 et non 4xx retryable : une signature invalide le restera.
    return NextResponse.json({ error: "invalid_signature" }, { status: 401 });
  }

  const admin = createAdminClient();

  // --- Idempotence ---------------------------------------------------------
  // L'insertion fait office de verrou : si la ligne existe déjà, cet événement
  // a déjà été reçu et il n'y a rien à refaire.
  const { error: insertError } = await admin.from("payment_events").insert({
    event_id: eventId,
    event_type: event.type,
    payload: event as unknown as Record<string, unknown>,
  });

  if (insertError) {
    // 23505 = violation d'unicité, donc un rejeu. C'est le cas nominal après
    // un timeout, pas une anomalie : on acquitte sans retraiter.
    if (insertError.code === "23505") {
      return NextResponse.json({ received: true, duplicate: true });
    }

    console.error("[dodo] journal indisponible:", insertError.message);
    // Là, une reprise a du sens : la base était momentanément indisponible.
    return NextResponse.json({ error: "storage_failed" }, { status: 500 });
  }

  // --- Application de l'effet ---------------------------------------------
  // Une erreur ici ne doit pas provoquer de reprise : l'événement est déjà
  // journalisé, et le rejeu retomberait sur le doublon ci-dessus sans jamais
  // réappliquer l'effet. On enregistre l'erreur et on acquitte.
  try {
    await applySubscriptionEvent(admin, event);

    await admin
      .from("payment_events")
      .update({ processed_at: new Date().toISOString() })
      .eq("event_id", eventId);
  } catch (error) {
    const message = (error as Error).message;
    console.error("[dodo] traitement échoué:", event.type, message);

    await admin
      .from("payment_events")
      .update({ error: message })
      .eq("event_id", eventId);
  }

  return NextResponse.json({ received: true });
}

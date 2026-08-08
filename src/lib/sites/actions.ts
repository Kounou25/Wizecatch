"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  defaultTemplateCustomization,
  type SiteMode,
  type ReviewTemplateId,
  type WidgetSettings,
} from "@/lib/mock-data";
import { SITE_LIMITS, TEMPLATE_IDS, type ActionResult } from "@/lib/sites/constants";

/** Retire le protocole, le www et le chemin — on ne garde que le domaine nu. */
function normalizeDomain(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/.*$/, "")
    .replace(/:\d+$/, "");
}

const DOMAIN_PATTERN = /^[a-z0-9-]+(\.[a-z0-9-]+)+$/;

// ---------------------------------------------------------------------------
// Création
// ---------------------------------------------------------------------------

export async function createSite(input: {
  name: string;
  domain: string;
  mode: SiteMode;
  templateId?: ReviewTemplateId;
}): Promise<ActionResult<{ id: string }>> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, error: "Not authenticated." };

  // --- validation ---
  const name = input.name.trim();
  if (!name) return { ok: false, error: "Site name is required." };
  if (name.length > 60) return { ok: false, error: "Site name is too long." };

  const domain = normalizeDomain(input.domain);
  if (!DOMAIN_PATTERN.test(domain)) {
    return { ok: false, error: "Enter a valid domain, e.g. example.com" };
  }

  if (input.mode !== "reviews" && input.mode !== "analytics_only") {
    return { ok: false, error: "Invalid mode." };
  }

  const templateId = input.mode === "reviews" ? input.templateId : undefined;
  if (input.mode === "reviews" && (!templateId || !TEMPLATE_IDS.includes(templateId))) {
    return { ok: false, error: "Pick a review template." };
  }

  // --- limite de plan ---
  const { data: profile } = await supabase.from("profiles").select("plan").single();
  const plan = (profile?.plan as string) ?? "free";

  const { count } = await supabase
    .from("sites")
    .select("id", { count: "exact", head: true })
    .is("archived_at", null);

  // Repli sur la limite Free si le plan est inconnu : mieux vaut bloquer à
  // tort que d'ouvrir les vannes sur une valeur mal orthographiée en base.
  const limit = SITE_LIMITS[plan] ?? SITE_LIMITS.free;
  if ((count ?? 0) >= limit) {
    return {
      ok: false,
      error:
        plan === "free"
          ? `The Free plan is limited to ${limit} site. Upgrade to add more.`
          : `You have reached the ${limit} site limit.`,
    };
  }

  // --- insertion (public_key généré par la base) ---
  const { data, error } = await supabase
    .from("sites")
    .insert({
      user_id: user.id,
      name,
      domain,
      mode: input.mode,
      template_id: templateId ?? null,
      template_config: templateId
        ? defaultTemplateCustomization[templateId]
        : {},
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("[sites] createSite:", error?.message);
    return { ok: false, error: error?.message ?? "Could not create the site." };
  }

  revalidatePath("/dashboard", "layout");
  return { ok: true, data: { id: data.id } };
}

// ---------------------------------------------------------------------------
// Mise à jour du template
// ---------------------------------------------------------------------------

export async function updateSiteTemplate(input: {
  siteId: string;
  templateId: ReviewTemplateId;
  title?: string;
  buttonLabel?: string;
}): Promise<ActionResult> {
  if (!TEMPLATE_IDS.includes(input.templateId)) {
    return { ok: false, error: "Unknown template." };
  }

  const supabase = await createClient();
  const fallback = defaultTemplateCustomization[input.templateId];

  // RLS garantit que seul le propriétaire du site peut écrire ici.
  const { error } = await supabase
    .from("sites")
    .update({
      template_id: input.templateId,
      template_config: {
        title: input.title?.trim() || fallback.title,
        buttonLabel: input.buttonLabel?.trim() || fallback.buttonLabel,
      },
    })
    .eq("id", input.siteId);

  if (error) {
    console.error("[sites] updateSiteTemplate:", error.message);
    return { ok: false, error: error.message };
  }

  revalidatePath("/dashboard", "layout");
  return { ok: true, data: undefined };
}

// ---------------------------------------------------------------------------
// Mise à jour des réglages du widget
// ---------------------------------------------------------------------------

export async function updateSiteWidget(input: {
  siteId: string;
  settings: WidgetSettings;
}): Promise<ActionResult> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("sites")
    .update({ widget_config: input.settings })
    .eq("id", input.siteId);

  if (error) {
    console.error("[sites] updateSiteWidget:", error.message);
    return { ok: false, error: error.message };
  }

  revalidatePath("/dashboard", "layout");
  return { ok: true, data: undefined };
}

// ---------------------------------------------------------------------------
// Archivage (suppression douce : on ne perd ni les avis ni les statistiques)
// ---------------------------------------------------------------------------

export async function archiveSite(siteId: string): Promise<ActionResult> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("sites")
    .update({ archived_at: new Date().toISOString() })
    .eq("id", siteId);

  if (error) {
    console.error("[sites] archiveSite:", error.message);
    return { ok: false, error: error.message };
  }

  revalidatePath("/dashboard", "layout");
  return { ok: true, data: undefined };
}

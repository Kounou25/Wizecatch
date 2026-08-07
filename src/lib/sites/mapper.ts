import type {
  Site,
  SiteMode,
  ReviewTemplateId,
  WidgetSettings,
  TemplateCustomization,
} from "@/lib/mock-data";
import { defaultTemplateCustomization } from "@/lib/mock-data";

/** Ligne brute renvoyée par Postgres (colonnes en snake_case). */
export type SiteRow = {
  id: string;
  public_key: string;
  name: string;
  domain: string;
  mode: SiteMode;
  template_id: ReviewTemplateId | null;
  template_config: Partial<TemplateCustomization> & {
    requireComment?: boolean;
    showLocation?: boolean;
  } | null;
  widget_config: Partial<WidgetSettings> | null;
  created_at: string;
  // Compte agrégé renvoyé par `select('*, sessions(count)')`.
  sessions?: { count: number }[] | null;
};

const DEFAULT_WIDGET: WidgetSettings = {
  position: "bottom-right",
  trigger: "load",
  format: "carousel",
};

/**
 * Convertit une ligne Postgres en objet Site utilisé par l'interface.
 * Les configs jsonb pouvant être partielles ou nulles, on comble toujours
 * avec des valeurs par défaut plutôt que de laisser passer un undefined.
 */
export function toSite(row: SiteRow): Site {
  const templateId = row.template_id ?? undefined;

  const fallback = templateId ? defaultTemplateCustomization[templateId] : null;

  const templateCustomization: TemplateCustomization | undefined = fallback
    ? {
        title: row.template_config?.title?.trim() || fallback.title,
        buttonLabel: row.template_config?.buttonLabel?.trim() || fallback.buttonLabel,
      }
    : undefined;

  return {
    id: row.id,
    publicKey: row.public_key,
    name: row.name,
    domain: row.domain,
    mode: row.mode,
    templateId,
    templateCustomization,
    widgetSettings: {
      position: row.widget_config?.position ?? DEFAULT_WIDGET.position,
      trigger: row.widget_config?.trigger ?? DEFAULT_WIDGET.trigger,
      format: row.widget_config?.format ?? DEFAULT_WIDGET.format,
    },
    // Nombre réel de visites collectées. Restera à 0 jusqu'à la mise en place
    // du widget de collecte (étape 3).
    visitCount: row.sessions?.[0]?.count ?? 0,
    createdAt: row.created_at,
  };
}

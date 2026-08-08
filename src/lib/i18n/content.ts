import type { Dictionary } from "@/lib/i18n/dictionaries";
import {
  productTestimonials,
  type ReviewTemplateDef,
  type ReviewTemplateId,
  type WidgetPosition,
  type WidgetTrigger,
  type WidgetFormat,
  type ProductTestimonial,
  type FaqEntry,
} from "@/lib/mock-data";

/**
 * Assemble le contenu affiché à partir des données produit (identifiants,
 * ordre, notes) et des dictionnaires (libellés traduits).
 *
 * Les données gardent ce qui ne se traduit pas, l'i18n porte le texte.
 */

const TEMPLATE_ORDER: ReviewTemplateId[] = [
  "star_rating",
  "star_comment",
  "thumbs",
  "nps",
  "testimonial",
];

export function getReviewTemplates(dict: Dictionary): ReviewTemplateDef[] {
  return TEMPLATE_ORDER.map((id) => ({
    id,
    name: dict.templates[id].name,
    description: dict.templates[id].description,
  }));
}

export function getTemplate(dict: Dictionary, id: ReviewTemplateId): ReviewTemplateDef {
  return { id, name: dict.templates[id].name, description: dict.templates[id].description };
}

const POSITION_ORDER: WidgetPosition[] = [
  "bottom-right",
  "bottom-left",
  "top-right",
  "top-left",
  "inline",
];
const TRIGGER_ORDER: WidgetTrigger[] = ["load", "scroll", "delay"];
const FORMAT_ORDER: WidgetFormat[] = ["carousel", "grid", "list", "popup"];

export function getWidgetPositions(dict: Dictionary) {
  return POSITION_ORDER.map((value) => ({
    value,
    label: dict.widgetOptions.positions[value],
  }));
}

export function getWidgetTriggers(dict: Dictionary) {
  return TRIGGER_ORDER.map((value) => ({
    value,
    label: dict.widgetOptions.triggers[value],
  }));
}

export function getWidgetFormats(dict: Dictionary) {
  return FORMAT_ORDER.map((value) => ({
    value,
    label: dict.widgetOptions.formats[value],
  }));
}

export function getFaqs(dict: Dictionary): FaqEntry[] {
  return dict.faqItems;
}

/** Fusionne les métadonnées (nom, note, mise en avant) et le texte traduit. */
export function getTestimonials(dict: Dictionary): ProductTestimonial[] {
  return productTestimonials.map((item) => {
    const translated = dict.testimonials[item.id as keyof typeof dict.testimonials];
    return {
      ...item,
      authorRole: translated?.role ?? item.authorRole,
      quote: translated?.quote ?? item.quote,
    };
  });
}

import { createClient } from "@/lib/supabase/server";
import type { Review, ReviewStatus, ReviewTemplateId } from "@/lib/mock-data";

type ReviewRow = {
  id: string;
  site_id: string;
  template_id: ReviewTemplateId;
  status: ReviewStatus;
  author_name: string | null;
  comment: string | null;
  rating: number | null;
  thumbs_up: boolean | null;
  nps_score: number | null;
  country: string | null;
  city: string | null;
  created_at: string;
};

function toReview(row: ReviewRow): Review {
  const name = row.author_name?.trim() || "Anonymous";

  return {
    id: row.id,
    siteId: row.site_id,
    templateId: row.template_id,
    status: row.status,
    authorName: name,
    authorInitial: name.charAt(0).toUpperCase(),
    comment: row.comment ?? undefined,
    rating: (row.rating as Review["rating"]) ?? undefined,
    thumbsUp: row.thumbs_up ?? undefined,
    npsScore: row.nps_score ?? undefined,
    country: row.country ?? "Unknown",
    city: row.city ?? "",
    date: row.created_at,
  };
}

const COLUMNS =
  "id, site_id, template_id, status, author_name, comment, rating, thumbs_up, nps_score, country, city, created_at";

/** Avis d'un site. RLS garantit qu'il appartient à l'utilisateur connecté. */
export async function getSiteReviews(siteId: string): Promise<Review[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("reviews")
    .select(COLUMNS)
    .eq("site_id", siteId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[reviews] getSiteReviews:", error.message);
    return [];
  }

  return (data as ReviewRow[]).map(toReview);
}

/** Tous les avis de l'utilisateur, tous sites confondus. */
export async function getAllReviews(): Promise<Review[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("reviews")
    .select(COLUMNS)
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    console.error("[reviews] getAllReviews:", error.message);
    return [];
  }

  return (data as ReviewRow[]).map(toReview);
}

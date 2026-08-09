import "server-only";

import { requireAdmin } from "@/lib/admin/guard";

/**
 * Lectures du back-office.
 *
 * Toutes passent par `requireAdmin()`, qui vérifie le droit d'accès avant de
 * livrer le client privilégié. Aucune fonction de ce fichier ne peut donc
 * s'exécuter pour un utilisateur ordinaire, même appelée par erreur.
 */

export type AdminOverview = {
  users: number;
  newUsers7d: number;
  sites: number;
  activeSites: number;
  sessions30d: number;
  reviews30d: number;
  planSplit: { plan: string; count: number }[];
};

export async function getOverview(): Promise<AdminOverview> {
  const { admin } = await requireAdmin();

  const since = (days: number) =>
    new Date(Date.now() - days * 86_400_000).toISOString();

  // `head: true` ne rapatrie aucune ligne : seul le compte traverse le réseau.
  const rows = { count: "exact" as const, head: true };

  const [users, newUsers7d, sites, activeSites, sessions30d, reviews30d, plans] =
    await Promise.all([
      admin.from("profiles").select("id", rows),
      admin.from("profiles").select("id", rows).gte("created_at", since(7)),
      admin.from("sites").select("id", rows),
      admin.from("sites").select("id", rows).is("archived_at", null),
      admin.from("sessions").select("id", rows).gte("started_at", since(30)),
      admin.from("reviews").select("id", rows).gte("created_at", since(30)),
      admin.from("profiles").select("plan"),
    ]);

  const split = new Map<string, number>();
  for (const row of (plans.data ?? []) as { plan: string }[]) {
    split.set(row.plan, (split.get(row.plan) ?? 0) + 1);
  }

  return {
    users: users.count ?? 0,
    newUsers7d: newUsers7d.count ?? 0,
    sites: sites.count ?? 0,
    activeSites: activeSites.count ?? 0,
    sessions30d: sessions30d.count ?? 0,
    reviews30d: reviews30d.count ?? 0,
    planSplit: [...split.entries()]
      .map(([plan, count]) => ({ plan, count }))
      .sort((a, b) => b.count - a.count),
  };
}

export type AdminSeries = {
  signups: { date: string; value: number }[];
  sessions: { date: string; value: number }[];
  reviews: { date: string; value: number }[];
};

/**
 * Courbes d'activité de la plateforme sur N jours.
 *
 * Les trois séries sont comptées en mémoire plutôt que par trois agrégations
 * SQL : on ne récupère que la colonne de date, et le back-office n'a pas le
 * volume qui justifierait des fonctions dédiées.
 *
 * Les jours vides sont comblés à zéro — sans quoi la courbe relierait deux
 * points distants et donnerait une lecture fausse de l'activité.
 */
export async function getSeries(days = 30): Promise<AdminSeries> {
  const { admin } = await requireAdmin();

  const from = new Date(Date.now() - (days - 1) * 86_400_000);
  from.setUTCHours(0, 0, 0, 0);
  const fromIso = from.toISOString();

  const [signups, sessions, reviews] = await Promise.all([
    admin.from("profiles").select("created_at").gte("created_at", fromIso),
    admin.from("sessions").select("started_at").gte("started_at", fromIso),
    admin.from("reviews").select("created_at").gte("created_at", fromIso),
  ]);

  const calendar: string[] = [];
  for (let i = 0; i < days; i++) {
    const day = new Date(from.getTime() + i * 86_400_000);
    calendar.push(day.toISOString().slice(0, 10));
  }

  const tally = (rows: unknown[] | null, field: string) => {
    const counts = new Map<string, number>();
    for (const row of (rows ?? []) as Record<string, string>[]) {
      const day = String(row[field]).slice(0, 10);
      counts.set(day, (counts.get(day) ?? 0) + 1);
    }
    return calendar.map((date) => ({ date, value: counts.get(date) ?? 0 }));
  };

  return {
    signups: tally(signups.data, "created_at"),
    sessions: tally(sessions.data, "started_at"),
    reviews: tally(reviews.data, "created_at"),
  };
}

export type AdminUserRow = {
  id: string;
  email: string;
  fullName: string | null;
  plan: string;
  isAdmin: boolean;
  createdAt: string;
  siteCount: number;
};

export async function listUsers(search = ""): Promise<AdminUserRow[]> {
  const { admin } = await requireAdmin();

  let query = admin
    .from("profiles")
    .select("id, email, full_name, plan, is_admin, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  if (search.trim()) {
    // Échappe les jokers PostgREST pour qu'une recherche sur « % » ne renvoie
    // pas la totalité de la table.
    const term = search.trim().replace(/[%,()]/g, "");
    query = query.or(`email.ilike.%${term}%,full_name.ilike.%${term}%`);
  }

  const { data, error } = await query;
  if (error) {
    console.error("[admin] listUsers:", error.message);
    return [];
  }

  const rows = (data ?? []) as {
    id: string;
    email: string;
    full_name: string | null;
    plan: string;
    is_admin: boolean;
    created_at: string;
  }[];

  // Un seul appel pour tous les sites, puis comptage en mémoire : cent requêtes
  // séparées pour cent lignes seraient inutilement coûteuses.
  const { data: sites } = await admin
    .from("sites")
    .select("user_id")
    .is("archived_at", null);

  const perUser = new Map<string, number>();
  for (const site of (sites ?? []) as { user_id: string }[]) {
    perUser.set(site.user_id, (perUser.get(site.user_id) ?? 0) + 1);
  }

  return rows.map((row) => ({
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    plan: row.plan,
    isAdmin: row.is_admin,
    createdAt: row.created_at,
    siteCount: perUser.get(row.id) ?? 0,
  }));
}

export type AdminSiteRow = {
  id: string;
  name: string;
  domain: string;
  mode: string;
  ownerEmail: string;
  archived: boolean;
  createdAt: string;
};

export async function listSites(): Promise<AdminSiteRow[]> {
  const { admin } = await requireAdmin();

  const { data, error } = await admin
    .from("sites")
    .select("id, name, domain, mode, archived_at, created_at, profiles(email)")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    console.error("[admin] listSites:", error.message);
    return [];
  }

  return ((data ?? []) as unknown[]).map((row) => {
    const site = row as {
      id: string;
      name: string;
      domain: string;
      mode: string;
      archived_at: string | null;
      created_at: string;
      profiles: { email: string } | { email: string }[] | null;
    };
    const owner = Array.isArray(site.profiles) ? site.profiles[0] : site.profiles;

    return {
      id: site.id,
      name: site.name,
      domain: site.domain,
      mode: site.mode,
      ownerEmail: owner?.email ?? "—",
      archived: site.archived_at !== null,
      createdAt: site.created_at,
    };
  });
}

export type AdminReviewRow = {
  id: string;
  siteName: string;
  status: string;
  templateId: string;
  authorName: string | null;
  comment: string | null;
  rating: number | null;
  createdAt: string;
};

export async function listReviews(status = "all"): Promise<AdminReviewRow[]> {
  const { admin } = await requireAdmin();

  let query = admin
    .from("reviews")
    .select("id, status, template_id, author_name, comment, rating, created_at, sites(name)")
    .order("created_at", { ascending: false })
    .limit(100);

  if (status !== "all") query = query.eq("status", status);

  const { data, error } = await query;
  if (error) {
    console.error("[admin] listReviews:", error.message);
    return [];
  }

  return ((data ?? []) as unknown[]).map((row) => {
    const review = row as {
      id: string;
      status: string;
      template_id: string;
      author_name: string | null;
      comment: string | null;
      rating: number | null;
      created_at: string;
      sites: { name: string } | { name: string }[] | null;
    };
    const site = Array.isArray(review.sites) ? review.sites[0] : review.sites;

    return {
      id: review.id,
      siteName: site?.name ?? "—",
      status: review.status,
      templateId: review.template_id,
      authorName: review.author_name,
      comment: review.comment,
      rating: review.rating,
      createdAt: review.created_at,
    };
  });
}

export type AuditRow = {
  id: number;
  actorEmail: string | null;
  action: string;
  targetType: string | null;
  targetId: string | null;
  details: Record<string, unknown> | null;
  createdAt: string;
};

export async function listAudit(): Promise<AuditRow[]> {
  const { admin } = await requireAdmin();

  const { data, error } = await admin
    .from("audit_log")
    .select("id, actor_email, action, target_type, target_id, details, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    console.error("[admin] listAudit:", error.message);
    return [];
  }

  return ((data ?? []) as unknown[]).map((row) => {
    const entry = row as {
      id: number;
      actor_email: string | null;
      action: string;
      target_type: string | null;
      target_id: string | null;
      details: Record<string, unknown> | null;
      created_at: string;
    };

    return {
      id: entry.id,
      actorEmail: entry.actor_email,
      action: entry.action,
      targetType: entry.target_type,
      targetId: entry.target_id,
      details: entry.details,
      createdAt: entry.created_at,
    };
  });
}

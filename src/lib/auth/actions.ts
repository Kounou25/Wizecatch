"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export type AuthState = { error: string | null };

function safeNext(value: FormDataEntryValue | null): string {
  const next = typeof value === "string" ? value : "";
  return next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
}

/** Connexion email + mot de passe. */
export async function signInWithPassword(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = safeNext(formData.get("next"));

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect(next);
}

/** Inscription email + mot de passe. */
export async function signUpWithPassword(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("name") ?? "").trim();

  if (!email || !password) {
    return { error: "Email and password are required." };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    // Repris par le trigger handle_new_user pour remplir profiles.full_name.
    options: { data: { full_name: fullName || null } },
  });

  if (error) {
    return { error: error.message };
  }

  // Si la confirmation par email est activée dans Supabase, aucune session
  // n'est ouverte tant que l'utilisateur n'a pas cliqué le lien reçu.
  if (!data.session) {
    return { error: "Check your inbox to confirm your email address." };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

/**
 * Origine réelle de la requête.
 *
 * En production derrière un proxy (Vercel), l'en-tête `host` est celui de
 * l'instance interne : c'est `x-forwarded-host` qui porte le domaine public.
 * On ne se repose pas sur NEXT_PUBLIC_SITE_URL, qui serait resté sur
 * localhost si on oubliait de le définir dans les variables Vercel.
 */
async function requestOrigin(): Promise<string> {
  const h = await headers();

  const forwardedHost = h.get("x-forwarded-host");
  if (forwardedHost) {
    const protocol = h.get("x-forwarded-proto") ?? "https";
    return `${protocol}://${forwardedHost}`;
  }

  const origin = h.get("origin");
  if (origin) return origin;

  const host = h.get("host");
  if (host) {
    const protocol = host.startsWith("localhost") ? "http" : "https";
    return `${protocol}://${host}`;
  }

  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

/** Démarre le flux OAuth Google — renvoie l'URL fournie par Supabase. */
export async function signInWithGoogle(formData: FormData): Promise<void> {
  const next = safeNext(formData.get("next"));
  const origin = await requestOrigin();

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });

  if (error || !data.url) {
    redirect(`/login?error=${encodeURIComponent(error?.message ?? "oauth_failed")}`);
  }

  redirect(data.url);
}

/** Déconnexion. */
export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

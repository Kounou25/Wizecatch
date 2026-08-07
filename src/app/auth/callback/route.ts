import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Point d'atterrissage après une connexion Google.
 *
 * Enchaînement complet :
 *   /login → Google → https://<ref>.supabase.co/auth/v1/callback → ICI
 *
 * Supabase renvoie un `code` à usage unique que l'on échange contre une session.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  // Derrière le proxy Vercel, request.url porte l'hôte interne : les
  // redirections atterriraient sur une URL inaccessible au visiteur.
  // x-forwarded-host contient le domaine public réel.
  const forwardedHost = request.headers.get("x-forwarded-host");
  const origin = forwardedHost
    ? `${request.headers.get("x-forwarded-proto") ?? "https"}://${forwardedHost}`
    : new URL(request.url).origin;

  // Google peut renvoyer une erreur (consentement refusé, compte non autorisé…)
  const error = searchParams.get("error_description") ?? searchParams.get("error");
  if (error) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error)}`,
    );
  }

  if (code) {
    const supabase = await createClient();
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (!exchangeError) {
      // Ne rediriger que vers un chemin interne : sans cette vérification,
      // `?next=https://site-malveillant.com` deviendrait une redirection ouverte.
      const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
      return NextResponse.redirect(`${origin}${safeNext}`);
    }

    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(exchangeError.message)}`,
    );
  }

  return NextResponse.redirect(`${origin}/login?error=missing_code`);
}

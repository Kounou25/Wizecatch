import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Rafraîchit la session Supabase à chaque requête et protège /dashboard.
 *
 * ⚠️ Ce fichier s'appelle `proxy.ts` et non `middleware.ts` : la convention
 * `middleware` est dépréciée depuis Next.js 16. Les guides Supabase en ligne
 * indiquent encore `middleware.ts` — ne pas les suivre à la lettre ici.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // getUser() revalide le jeton auprès de Supabase, contrairement à
  // getSession() qui se contente de lire le cookie. Sur une frontière de
  // sécurité, on veut la vérification, pas la lecture.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Non connecté sur le dashboard → login, en mémorisant la destination.
  if (!user && pathname.startsWith("/dashboard")) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Déjà connecté sur login/signup → dashboard.
  if (user && (pathname === "/login" || pathname === "/signup")) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    // Tout sauf les assets statiques, les images et le widget public.
    "/((?!_next/static|_next/image|favicon.ico|w.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database.types";

const PUBLIC_PATHS = ["/login", "/auth/callback"];

/**
 * Identity headers the middleware sets after validating the session. They are
 * stripped from the inbound request first so a client can never spoof them —
 * only the middleware (which has just verified the user) may set them.
 */
const IDENTITY_HEADERS = ["x-user-id", "x-user-email", "x-user-name"];

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some((path) => pathname.startsWith(path));
}

/**
 * Refreshes the Supabase auth session on every request, redirects
 * unauthenticated users away from protected pages, and forwards the validated
 * user identity to downstream Server Components via request headers — so pages
 * don't have to call `auth.getUser()` again (a second network round-trip).
 */
export async function updateSession(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  IDENTITY_HEADERS.forEach((header) => requestHeaders.delete(header));

  const cookieWrites: { name: string; value: string; options: CookieOptions }[] = [];

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          cookieWrites.push(...cookiesToSet);
          // Keep the forwarded request's cookie header in sync with refreshed
          // tokens so downstream data queries use the current session.
          requestHeaders.set("cookie", request.cookies.toString());
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  if (!user && !isPublicPath(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user && pathname === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  if (user) {
    requestHeaders.set("x-user-id", user.id);
    if (user.email) requestHeaders.set("x-user-email", user.email);
    const metadata = user.user_metadata as
      | { full_name?: string; name?: string }
      | undefined;
    const name = (metadata?.full_name ?? metadata?.name ?? "").trim();
    if (name) requestHeaders.set("x-user-name", encodeURIComponent(name));
  }

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  cookieWrites.forEach(({ name, value, options }) =>
    response.cookies.set(name, value, options)
  );
  return response;
}

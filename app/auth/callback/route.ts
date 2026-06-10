import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { exchangeCodeForSession } from "@/services/auth.service";

/**
 * OAuth / email-link callback. Supabase redirects here with a `code`
 * that we exchange for a session, then send the user to the dashboard.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    try {
      await exchangeCodeForSession(supabase, code);
      return NextResponse.redirect(`${origin}${next}`);
    } catch {
      // fall through to error redirect
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth-failed`);
}

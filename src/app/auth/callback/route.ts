import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

function isSafeRedirectPath(path: string): boolean {
  // Must be a relative path starting with /. Reject anything with a protocol
  // or double-slash that could smuggle an off-domain redirect.
  return /^\/[^/]/.test(path) || path === "/";
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const rawNext = searchParams.get("next") ?? "/dashboard";
  const next = isSafeRedirectPath(rawNext) ? rawNext : "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}

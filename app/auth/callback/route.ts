import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  const supabase = await createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(new URL(next, request.url));
    }
  }

  // For OAuth flows where Supabase already exchanged the code and set the
  // session cookie (implicit flow via auth/v1/callback intermediary), there
  // will be no `code` param. Check the existing session from cookies instead.
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    return NextResponse.redirect(new URL(next, request.url));
  }

  // Something went wrong — redirect back to landing
  return NextResponse.redirect(new URL("/", request.url));
}

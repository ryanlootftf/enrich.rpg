import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { SupabaseAdapter } from "@auth/supabase-adapter";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const isSupabaseConfigured =
  !!supabaseUrl &&
  !!supabaseServiceRoleKey &&
  (supabaseUrl.startsWith("http://") || supabaseUrl.startsWith("https://"));

// Build-safe: if env vars aren't set or have placeholder values,
// fall back to no adapter. This allows the build to complete without
// real credentials configured yet.
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google],
  adapter: isSupabaseConfigured
    ? SupabaseAdapter({
        url: supabaseUrl!,
        secret: supabaseServiceRoleKey!,
      })
    : undefined,
  pages: {
    signIn: "/login",
  },
  callbacks: {
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
});

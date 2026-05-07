"use client";

import { createClient } from "@/lib/supabase/client";

export default function LandingPage() {
  const supabase = createClient();

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-4">
      {/* Decorative top gradient bar */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-accent via-gold to-teal" />

      <div className="w-full max-w-sm">
        {/* Card */}
        <div className="bg-bg-2 border border-border-subtle rounded-2xl p-8 text-center space-y-6">
          {/* Logo */}
          <div className="space-y-2">
            <h1 className="font-syne text-3xl font-extrabold tracking-tight gradient-text">
              Enrich.rpg
            </h1>
            <p className="text-text-tertiary text-xs uppercase tracking-[0.2em] font-dm-sans">
              Gamify Your Growth
            </p>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border-subtle" />
            <span className="text-text-tertiary text-[10px] uppercase tracking-[0.12em]">
              Sign in
            </span>
            <div className="flex-1 h-px bg-border-subtle" />
          </div>

          {/* Google button */}
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-gray-800 font-dm-sans text-sm font-medium px-5 py-3 rounded-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_20px_rgba(124,106,255,0.15)]"
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62Z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53Z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </button>

          {/* Bottom text */}
          <p className="text-text-tertiary text-[10px] tracking-[0.08em]">
            Your epic quest begins here
          </p>
        </div>
      </div>
    </div>
  );
}
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    getUser();
  }, [supabase]);

  const tabs = [
    { label: "Games", href: "/dashboard" },
  ];

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const initials = user
    ? (user.user_metadata?.full_name ?? user.email ?? "??")
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "??";

  return (
    <nav className="bg-bg-2 border-b border-border-subtle px-6 flex items-center justify-between h-14 sticky top-0 z-[100]">
      <Link href="/dashboard" className="no-underline">
        <span className="font-syne text-lg font-extrabold tracking-tight gradient-text">
          Enrich.rpg
        </span>
      </Link>

      <div className="flex gap-1">
        {tabs.map((tab) => {
          const isActive = pathname === "/dashboard" || pathname.startsWith("/games");

          return (
            <Link key={tab.href} href={tab.href}>
              <span
                className={`px-[14px] py-1.5 rounded-lg text-sm cursor-pointer transition-colors duration-150 ${
                  isActive
                    ? "bg-accent/15 text-accent-2 font-medium"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>

      <div className="flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-teal flex items-center justify-center text-xs font-syne font-bold cursor-default"
          title={user?.email ?? ""}
        >
          {initials}
        </div>
        <button
          onClick={handleSignOut}
          className="text-text-tertiary text-xs hover:text-text-primary transition-colors"
        >
          Sign out
        </button>
      </div>
    </nav>
  );
}
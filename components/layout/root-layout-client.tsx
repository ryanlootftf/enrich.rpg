"use client";

import { usePathname } from "next/navigation";
import { NavBar } from "@/components/layout/nav-bar";

export function RootLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Hide NavBar on public pages
  const isPublic =
    pathname === "/" || pathname.startsWith("/auth/");

  if (isPublic) {
    return <>{children}</>;
  }

  return (
    <>
      <NavBar />
      <main className="max-w-[900px] mx-auto px-4 pt-6 pb-12">{children}</main>
    </>
  );
}
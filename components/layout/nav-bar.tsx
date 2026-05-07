"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavBar() {
  const pathname = usePathname();

  const tabs = [
    { label: "Games", href: "/" },
    { label: "Progress", href: "/progress" },
    { label: "Rewards", href: "/rewards" },
  ];

  return (
    <nav className="bg-bg-2 border-b border-border-subtle px-6 flex items-center justify-between h-14 sticky top-0 z-[100]">
      <Link href="/" className="no-underline">
        <span className="font-syne text-lg font-extrabold tracking-tight gradient-text">
          Questify
        </span>
      </Link>

      <div className="flex gap-1">
        {tabs.map((tab) => {
          const isActive =
            tab.href === "/"
              ? pathname === "/" || pathname.startsWith("/games")
              : pathname.startsWith(tab.href);

          return (
            <Link key={tab.href} href={tab.href}>
              <span
                className={`px-[14px] py-1.5 rounded-lg text-[13px] cursor-pointer transition-colors duration-150 ${
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

      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-teal flex items-center justify-center text-xs font-syne font-bold">
        AJ
      </div>
    </nav>
  );
}
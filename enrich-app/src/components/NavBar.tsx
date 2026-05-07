"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";

export default function NavBar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  if (!session) return null;

  return (
    <nav className="nav-bar">
      <Link href="/" style={{ textDecoration: "none" }}>
        <span className="nav-logo">Questify</span>
      </Link>
      <div className="nav-tabs">
        <Link
          href="/"
          className={`nav-tab ${pathname === "/" ? "active" : ""}`}
        >
          Games
        </Link>
      </div>
      {session.user?.image ? (
        <img
          src={session.user.image}
          alt="Avatar"
          className="nav-avatar"
          style={{ borderRadius: "50%", objectFit: "cover" }}
          onClick={() => signOut()}
          title="Sign out"
        />
      ) : (
        <div
          className="nav-avatar"
          onClick={() => signOut()}
          title="Sign out"
        >
          {session.user?.name?.charAt(0) || "U"}
        </div>
      )}
    </nav>
  );
}
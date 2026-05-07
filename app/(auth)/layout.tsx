import { NavBar } from "@/components/layout/nav-bar";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <NavBar />
      <main className="max-w-[900px] mx-auto px-4 pt-6 pb-12">{children}</main>
    </>
  );
}
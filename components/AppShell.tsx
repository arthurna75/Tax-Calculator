"use client";

import { usePathname } from "next/navigation";
import NavBar from "./NavBar";

const NO_NAV_PREFIXES = ["/login", "/auth"];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideNav = NO_NAV_PREFIXES.some((p) => pathname.startsWith(p));

  return (
    <>
      {!hideNav && <NavBar />}
      <main className="app-main">{children}</main>
    </>
  );
}

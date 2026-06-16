"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function NavBar() {
  const router = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="nav-bar">
      <Link href="/calculator" className="nav-brand">연말정산 계산기</Link>
      <nav className="nav-links">
        <Link href="/calculator">계산기</Link>
        <Link href="/records">내 기록</Link>
        <Link href="/guide">가이드</Link>
        <Link href="/admin/codes">코드 관리</Link>
      </nav>
      <button className="nav-signout" onClick={handleSignOut}>로그아웃</button>
    </header>
  );
}

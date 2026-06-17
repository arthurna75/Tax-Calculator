"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export default function NavBar() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => setUser(data.user));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/calculator");
    router.refresh();
  }

  return (
    <header className="nav-bar">
      <Link href="/calculator" className="nav-brand">연말정산 계산기</Link>
      <nav className="nav-links">
        <Link href="/calculator">계산기</Link>
        {user && <Link href="/records">내 기록</Link>}
        <Link href="/guide">가이드</Link>
        <Link href="/admin/codes">코드 관리</Link>
      </nav>
      {user ? (
        <button className="nav-signout" onClick={handleSignOut}>로그아웃</button>
      ) : (
        <Link href="/login" className="nav-signout">로그인</Link>
      )}
    </header>
  );
}

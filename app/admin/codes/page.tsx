import { getCodes } from "@/lib/tax/codes";
import { createClient } from "@/lib/supabase/server";
import CodeTable from "@/components/admin/CodeTable";

export default async function AdminCodesPage() {
  const [codes, supabase] = await Promise.all([getCodes(), createClient()]);
  const { data: { user } } = await supabase.auth.getUser();

  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    isAdmin = profile?.role === "admin";
  }

  return <CodeTable codes={codes} isAdmin={isAdmin} />;
}

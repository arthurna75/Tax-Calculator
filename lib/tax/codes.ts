"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface TaxCode {
  id: string;
  code: string;
  name: string;
  category: "income" | "deduction" | "credit" | "tax";
  description: string | null;
  rate: number | null;
  limit_amount: number | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export type TaxCodeInput = Omit<TaxCode, "id" | "created_at" | "updated_at">;

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("로그인이 필요합니다.");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") throw new Error("관리자만 접근할 수 있습니다.");
  return supabase;
}

export async function getCodes(): Promise<TaxCode[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tax_codes")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) throw new Error(error.message);
  return data as TaxCode[];
}

export async function createCode(input: TaxCodeInput): Promise<void> {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("tax_codes").insert(input);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/codes");
}

export async function updateCode(id: string, patch: Partial<TaxCodeInput>): Promise<void> {
  const supabase = await requireAdmin();
  const { error } = await supabase
    .from("tax_codes")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/codes");
}

export async function deleteCode(id: string): Promise<void> {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("tax_codes").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/codes");
}

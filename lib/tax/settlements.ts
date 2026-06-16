"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { SettlementInput, SettlementResult } from "./calculations";

export interface SettlementRecord {
  id: string;
  user_id: string;
  title: string;
  tax_year: number;
  data: SettlementInput;
  result: SettlementResult;
  created_at: string;
  updated_at: string;
}

export async function getSettlements(): Promise<SettlementRecord[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("settlements")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data as SettlementRecord[];
}

export async function getSettlement(id: string): Promise<SettlementRecord | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("settlements")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return data as SettlementRecord;
}

export async function createSettlement(
  title: string,
  taxYear: number,
  data: SettlementInput,
  result: SettlementResult,
): Promise<{ id: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("로그인이 필요합니다.");

  const { data: row, error } = await supabase
    .from("settlements")
    .insert({ user_id: user.id, title, tax_year: taxYear, data, result })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  revalidatePath("/records");
  return { id: row.id };
}

export async function updateSettlement(
  id: string,
  patch: Partial<{ title: string; data: SettlementInput; result: SettlementResult }>,
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("settlements")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/records");
  revalidatePath(`/records/${id}`);
}

export async function deleteSettlement(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("settlements").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/records");
}

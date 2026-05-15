"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type TransactionType = "expense" | "income";
export type PaymentMode = "cash" | "card" | "upi" | "bank" | "other";

export type AddTransactionInput = {
  type: TransactionType;
  amount: number;
  category: string;
  payment_mode: PaymentMode;
  date: string;
  note?: string;
};

export type Transaction = {
  id: string;
  user_id: string;
  type: TransactionType;
  amount: number;
  category: string;
  payment_mode: PaymentMode;
  date: string;
  note: string | null;
  created_at: string;
  updated_at: string;
};

const VALID_TYPES = new Set<string>(["expense", "income"]);
const VALID_MODES = new Set<string>(["cash", "card", "upi", "bank", "other"]);

export async function addTransaction(
  input: AddTransactionInput
): Promise<{ ok: true } | { error: string }> {
  if (!VALID_TYPES.has(input.type)) return { error: "Invalid transaction type." };
  if (!VALID_MODES.has(input.payment_mode)) return { error: "Invalid payment mode." };
  if (!input.amount || input.amount <= 0) return { error: "Amount must be greater than zero." };
  if (!input.category?.trim()) return { error: "Category is required." };
  if (!input.date) return { error: "Date is required." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "You must be signed in to add a transaction." };

  const { error } = await supabase.from("transactions").insert({
    user_id: user.id,
    type: input.type,
    amount: input.amount,
    category: input.category.trim(),
    payment_mode: input.payment_mode,
    date: input.date,
    note: input.note?.trim() || null,
  });

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  return { ok: true };
}

export async function updateTransaction(
  id: string,
  input: AddTransactionInput
): Promise<{ ok: true } | { error: string }> {
  if (!id) return { error: "Missing transaction id." };
  if (!VALID_TYPES.has(input.type)) return { error: "Invalid transaction type." };
  if (!VALID_MODES.has(input.payment_mode)) return { error: "Invalid payment mode." };
  if (!input.amount || input.amount <= 0) return { error: "Amount must be greater than zero." };
  if (!input.category?.trim()) return { error: "Category is required." };
  if (!input.date) return { error: "Date is required." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "You must be signed in to update a transaction." };

  const { error } = await supabase
    .from("transactions")
    .update({
      type: input.type,
      amount: input.amount,
      category: input.category.trim(),
      payment_mode: input.payment_mode,
      date: input.date,
      note: input.note?.trim() || null,
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  return { ok: true };
}

export async function deleteTransaction(
  id: string
): Promise<{ ok: true } | { error: string }> {
  if (!id) return { error: "Missing transaction id." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "You must be signed in to delete a transaction." };

  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  return { ok: true };
}

export type RecentTransaction = {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  payment_mode: PaymentMode;
  date: string;
  note: string | null;
};

export async function listRecentTransactions(
  limit = 5
): Promise<RecentTransaction[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("transactions")
    .select("id, type, amount, category, payment_mode, date, note")
    .eq("user_id", user.id)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return [];
  return (data ?? []) as RecentTransaction[];
}

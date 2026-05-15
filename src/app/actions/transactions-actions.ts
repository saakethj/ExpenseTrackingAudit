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

export type MonthlySummary = {
  spent: number;
  income: number;
  net: number;
  savingsRate: number;
  expenseCount: number;
  incomeSourceCount: number;
  deltas: {
    spent: number | null;
    income: number | null;
    net: number | null;
    savingsRatePoints: number | null;
  };
  categories: { label: string; amount: number }[];
  monthLabel: string;
};

function toIsoDate(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export async function getMonthlySummary(): Promise<MonthlySummary> {
  const now = new Date();
  const startOfThis = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfPrev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const startOfNext = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const monthLabel = startOfThis.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  const empty: MonthlySummary = {
    spent: 0,
    income: 0,
    net: 0,
    savingsRate: 0,
    expenseCount: 0,
    incomeSourceCount: 0,
    deltas: { spent: null, income: null, net: null, savingsRatePoints: null },
    categories: [],
    monthLabel,
  };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return empty;

  const { data, error } = await supabase
    .from("transactions")
    .select("type, amount, category, date")
    .eq("user_id", user.id)
    .gte("date", toIsoDate(startOfPrev))
    .lt("date", toIsoDate(startOfNext));

  if (error || !data) return empty;

  const thisStart = toIsoDate(startOfThis);
  let spent = 0;
  let income = 0;
  let expenseCount = 0;
  let prevSpent = 0;
  let prevIncome = 0;
  const categoryMap = new Map<string, number>();
  const incomeSources = new Set<string>();

  for (const row of data) {
    const amt = Number(row.amount);
    if (!Number.isFinite(amt)) continue;
    const inThis = row.date >= thisStart;
    if (inThis) {
      if (row.type === "expense") {
        spent += amt;
        expenseCount += 1;
        categoryMap.set(row.category, (categoryMap.get(row.category) ?? 0) + amt);
      } else if (row.type === "income") {
        income += amt;
        incomeSources.add(row.category);
      }
    } else {
      if (row.type === "expense") prevSpent += amt;
      else if (row.type === "income") prevIncome += amt;
    }
  }

  const net = income - spent;
  const prevNet = prevIncome - prevSpent;
  const savingsRate = income > 0 ? (net / income) * 100 : 0;
  const prevSavingsRate = prevIncome > 0 ? (prevNet / prevIncome) * 100 : null;

  const pctChange = (curr: number, prev: number): number | null => {
    if (prev === 0) return null;
    return ((curr - prev) / Math.abs(prev)) * 100;
  };

  const categories = [...categoryMap.entries()]
    .map(([label, amount]) => ({ label, amount }))
    .sort((a, b) => b.amount - a.amount);

  return {
    spent,
    income,
    net,
    savingsRate,
    expenseCount,
    incomeSourceCount: incomeSources.size,
    deltas: {
      spent: pctChange(spent, prevSpent),
      income: pctChange(income, prevIncome),
      net: pctChange(net, prevNet),
      savingsRatePoints:
        prevSavingsRate === null ? null : savingsRate - prevSavingsRate,
    },
    categories,
    monthLabel,
  };
}

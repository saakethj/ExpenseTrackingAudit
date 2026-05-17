"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type BudgetPeriodType = "monthly" | "quarterly" | "yearly";

export type AddBudgetInput = {
  category: string | null;
  limit_amount: number;
  period_type: BudgetPeriodType;
  period_start: string;
  period_end: string;
};

export type Budget = {
  id: string;
  user_id: string;
  category: string | null;
  limit_amount: number;
  period_type: BudgetPeriodType;
  period_start: string;
  period_end: string;
  created_at: string;
  updated_at: string;
};

export type BudgetWithSpend = Budget & {
  current_spent: number;
  percent_used: number;
  is_over: boolean;
};

const VALID_PERIOD_TYPES = new Set<string>(["monthly", "quarterly", "yearly"]);

function validateInput(input: AddBudgetInput): string | null {
  if (!VALID_PERIOD_TYPES.has(input.period_type)) return "Invalid period type.";
  if (!input.limit_amount || input.limit_amount <= 0)
    return "Limit must be greater than zero.";
  if (!input.period_start) return "Period start date is required.";
  if (!input.period_end) return "Period end date is required.";
  if (input.period_end < input.period_start)
    return "Period end must be on or after period start.";
  if (input.category !== null && !input.category.trim())
    return "Category cannot be empty (use null for overall budget).";
  return null;
}

export async function addBudget(
  input: AddBudgetInput
): Promise<{ ok: true; id: string } | { error: string }> {
  const validationError = validateInput(input);
  if (validationError) return { error: validationError };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "You must be signed in to add a budget." };

  const { data, error } = await supabase
    .from("budgets")
    .insert({
      user_id: user.id,
      category: input.category?.trim() ?? null,
      limit_amount: input.limit_amount,
      period_type: input.period_type,
      period_start: input.period_start,
      period_end: input.period_end,
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      return { error: "A budget already exists for this category and period." };
    }
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/budgets");
  return { ok: true, id: data.id };
}

export async function updateBudget(
  id: string,
  input: AddBudgetInput
): Promise<{ ok: true } | { error: string }> {
  if (!id) return { error: "Missing budget id." };
  const validationError = validateInput(input);
  if (validationError) return { error: validationError };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "You must be signed in to update a budget." };

  const { error } = await supabase
    .from("budgets")
    .update({
      category: input.category?.trim() ?? null,
      limit_amount: input.limit_amount,
      period_type: input.period_type,
      period_start: input.period_start,
      period_end: input.period_end,
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    if (error.code === "23505") {
      return { error: "A budget already exists for this category and period." };
    }
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/budgets");
  return { ok: true };
}

export async function deleteBudget(
  id: string
): Promise<{ ok: true } | { error: string }> {
  if (!id) return { error: "Missing budget id." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "You must be signed in to delete a budget." };

  const { error } = await supabase
    .from("budgets")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/budgets");
  return { ok: true };
}

// Fetch all budgets for the current user along with current-period spend.
// Aggregates expenses client-side in one pass for efficiency.
export async function getBudgets(): Promise<
  { ok: true; budgets: BudgetWithSpend[] } | { error: string }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "You must be signed in to view budgets." };

  const { data: budgetRows, error: budgetError } = await supabase
    .from("budgets")
    .select("*")
    .eq("user_id", user.id)
    .order("period_start", { ascending: false });

  if (budgetError) return { error: budgetError.message };
  if (!budgetRows || budgetRows.length === 0)
    return { ok: true, budgets: [] };

  // Find the overall date range covering every budget so we fetch once
  let minStart = budgetRows[0].period_start;
  let maxEnd = budgetRows[0].period_end;
  for (const b of budgetRows) {
    if (b.period_start < minStart) minStart = b.period_start;
    if (b.period_end > maxEnd) maxEnd = b.period_end;
  }

  const { data: txRows, error: txError } = await supabase
    .from("transactions")
    .select("type, amount, category, date")
    .eq("user_id", user.id)
    .eq("type", "expense")
    .gte("date", minStart)
    .lte("date", maxEnd);

  if (txError) return { error: txError.message };

  const expenses = txRows ?? [];

  const budgets: BudgetWithSpend[] = budgetRows.map((b) => {
    let spent = 0;
    for (const tx of expenses) {
      if (tx.date < b.period_start || tx.date > b.period_end) continue;
      if (b.category !== null && tx.category !== b.category) continue;
      spent += Number(tx.amount);
    }
    const limit = Number(b.limit_amount);
    const percent = limit > 0 ? (spent / limit) * 100 : 0;
    return {
      ...b,
      limit_amount: limit,
      current_spent: spent,
      percent_used: percent,
      is_over: spent > limit,
    };
  });

  return { ok: true, budgets };
}

// Lightweight alerts query for the dashboard home — returns only ACTIVE budgets
// at >= 80% utilization, ordered worst-first. Used to surface warnings without
// fetching the full budget list.
export async function getBudgetAlerts(): Promise<
  { ok: true; alerts: BudgetWithSpend[] } | { error: string }
> {
  const result = await getBudgets();
  if ("error" in result) return { error: result.error };

  const today = new Date().toISOString().split("T")[0]!;
  const active = result.budgets.filter(
    (b) => b.period_start <= today && b.period_end >= today
  );
  const alerts = active
    .filter((b) => b.percent_used >= 80)
    .sort((a, b) => b.percent_used - a.percent_used);

  return { ok: true, alerts };
}

// Historical periods for a given budget category (null = overall).
// Returns each past period with its limit + actual spend, oldest first.
export async function getBudgetHistory(
  category: string | null
): Promise<
  | {
      ok: true;
      history: {
        id: string;
        category: string | null;
        limit_amount: number;
        period_type: BudgetPeriodType;
        period_start: string;
        period_end: string;
        actual_spent: number;
      }[];
    }
  | { error: string }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "You must be signed in to view budget history." };

  let query = supabase
    .from("budgets")
    .select("*")
    .eq("user_id", user.id)
    .order("period_start", { ascending: true });

  if (category === null) {
    query = query.is("category", null);
  } else {
    query = query.eq("category", category);
  }

  const { data: budgetRows, error: budgetError } = await query;
  if (budgetError) return { error: budgetError.message };
  if (!budgetRows || budgetRows.length === 0)
    return { ok: true, history: [] };

  const minStart = budgetRows[0].period_start;
  const maxEnd = budgetRows[budgetRows.length - 1].period_end;

  let txQuery = supabase
    .from("transactions")
    .select("amount, category, date")
    .eq("user_id", user.id)
    .eq("type", "expense")
    .gte("date", minStart)
    .lte("date", maxEnd);

  if (category !== null) {
    txQuery = txQuery.eq("category", category);
  }

  const { data: txRows, error: txError } = await txQuery;
  if (txError) return { error: txError.message };

  const expenses = txRows ?? [];

  const history = budgetRows.map((b) => {
    let spent = 0;
    for (const tx of expenses) {
      if (tx.date < b.period_start || tx.date > b.period_end) continue;
      spent += Number(tx.amount);
    }
    return {
      id: b.id,
      category: b.category,
      limit_amount: Number(b.limit_amount),
      period_type: b.period_type,
      period_start: b.period_start,
      period_end: b.period_end,
      actual_spent: spent,
    };
  });

  return { ok: true, history };
}

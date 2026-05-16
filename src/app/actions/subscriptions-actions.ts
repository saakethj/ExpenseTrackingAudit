"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type SubscriptionBillingCycle = "weekly" | "monthly" | "quarterly" | "yearly";
export type SubscriptionStatus = "active" | "paused" | "cancelled";
export type SubscriptionPaymentMode = "cash" | "card" | "upi" | "bank" | "other";

export type AddSubscriptionInput = {
  name: string;
  amount: number;
  billing_cycle: SubscriptionBillingCycle;
  next_billing_date: string;
  category?: string | null;
  payment_mode: SubscriptionPaymentMode;
  status?: SubscriptionStatus;
  notes?: string | null;
};

export type Subscription = {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  billing_cycle: SubscriptionBillingCycle;
  next_billing_date: string;
  category: string | null;
  payment_mode: SubscriptionPaymentMode;
  status: SubscriptionStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type SubscriptionWithDerived = Subscription & {
  annual_cost: number;
  monthly_cost: number;
  days_until_renewal: number;
};

const VALID_CYCLES = new Set<string>(["weekly", "monthly", "quarterly", "yearly"]);
const VALID_STATUSES = new Set<string>(["active", "paused", "cancelled"]);
const VALID_MODES = new Set<string>(["cash", "card", "upi", "bank", "other"]);

const CYCLE_TO_ANNUAL_MULTIPLIER: Record<SubscriptionBillingCycle, number> = {
  weekly: 52,
  monthly: 12,
  quarterly: 4,
  yearly: 1,
};

function validateInput(input: AddSubscriptionInput): string | null {
  if (!input.name?.trim()) return "Name is required.";
  if (!input.amount || input.amount <= 0) return "Amount must be greater than zero.";
  if (!VALID_CYCLES.has(input.billing_cycle)) return "Invalid billing cycle.";
  if (!input.next_billing_date) return "Next billing date is required.";
  if (!VALID_MODES.has(input.payment_mode)) return "Invalid payment mode.";
  if (input.status && !VALID_STATUSES.has(input.status)) return "Invalid status.";
  return null;
}

function withDerived(row: Subscription): SubscriptionWithDerived {
  const amt = Number(row.amount);
  const multiplier = CYCLE_TO_ANNUAL_MULTIPLIER[row.billing_cycle];
  const annual_cost = amt * multiplier;
  const monthly_cost = annual_cost / 12;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const next = new Date(row.next_billing_date + "T00:00:00");
  const days_until_renewal = Math.round(
    (next.getTime() - today.getTime()) / 86_400_000
  );

  return {
    ...row,
    amount: amt,
    annual_cost,
    monthly_cost,
    days_until_renewal,
  };
}

export async function addSubscription(
  input: AddSubscriptionInput
): Promise<{ ok: true; id: string } | { error: string }> {
  const validationError = validateInput(input);
  if (validationError) return { error: validationError };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "You must be signed in to add a subscription." };

  const { data, error } = await supabase
    .from("subscriptions")
    .insert({
      user_id: user.id,
      name: input.name.trim(),
      amount: input.amount,
      billing_cycle: input.billing_cycle,
      next_billing_date: input.next_billing_date,
      category: input.category?.trim() || null,
      payment_mode: input.payment_mode,
      status: input.status ?? "active",
      notes: input.notes?.trim() || null,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  revalidatePath("/dashboard/subscriptions");
  return { ok: true, id: (data as { id: string }).id };
}

export async function updateSubscription(
  id: string,
  input: AddSubscriptionInput
): Promise<{ ok: true } | { error: string }> {
  if (!id) return { error: "Missing subscription id." };
  const validationError = validateInput(input);
  if (validationError) return { error: validationError };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "You must be signed in to update a subscription." };

  const { error } = await supabase
    .from("subscriptions")
    .update({
      name: input.name.trim(),
      amount: input.amount,
      billing_cycle: input.billing_cycle,
      next_billing_date: input.next_billing_date,
      category: input.category?.trim() || null,
      payment_mode: input.payment_mode,
      status: input.status ?? "active",
      notes: input.notes?.trim() || null,
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/subscriptions");
  return { ok: true };
}

export async function deleteSubscription(
  id: string
): Promise<{ ok: true } | { error: string }> {
  if (!id) return { error: "Missing subscription id." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "You must be signed in to delete a subscription." };

  const { error } = await supabase
    .from("subscriptions")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/subscriptions");
  return { ok: true };
}

export async function getSubscriptions(): Promise<
  { ok: true; subscriptions: SubscriptionWithDerived[] } | { error: string }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "You must be signed in." };

  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .order("next_billing_date", { ascending: true });

  if (error) return { error: error.message };

  const subscriptions = (data ?? []).map((row) =>
    withDerived(row as Subscription)
  );

  return { ok: true, subscriptions };
}

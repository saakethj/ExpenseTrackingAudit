"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type Category = {
  id: string;
  name: string;
  color: string;
  icon: string;
  sort_order: number;
  transaction_type?: "expense" | "income" | "both";
};

export async function createCategoryAction(data: {
  name: string;
  color: string;
  icon: string;
  sort_order: number;
  transaction_type?: "expense" | "income" | "both";
}): Promise<{ id?: string; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) return { error: "Not authenticated." };

  const { data: row, error } = await supabase
    .from("categories")
    .insert({ user_id: user.id, ...data, transaction_type: data.transaction_type || "both" })
    .select("id")
    .single();

  if (error) return { error: error.message };
  revalidatePath("/dashboard/profile");
  return { id: (row as { id: string }).id };
}

export async function updateCategoryAction(
  id: string,
  data: { name: string; color: string; icon: string }
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) return { error: "Not authenticated." };

  const { error } = await supabase
    .from("categories")
    .update(data)
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/profile");
  return {};
}

export async function getUserCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("categories")
    .select("id, name, color, icon, sort_order, transaction_type")
    .eq("user_id", user.id)
    .order("sort_order", { ascending: true });

  if (error) return [];
  return (data ?? []) as Category[];
}

export async function getCategoriesByType(type: "expense" | "income"): Promise<Category[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("categories")
    .select("id, name, color, icon, sort_order, transaction_type")
    .eq("user_id", user.id)
    .or(`transaction_type.eq.${type},transaction_type.eq.both`)
    .order("sort_order", { ascending: true });

  if (error) return [];
  return (data ?? []) as Category[];
}

export async function deleteCategoryAction(id: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) return { error: "Not authenticated." };

  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/profile");
  return {};
}

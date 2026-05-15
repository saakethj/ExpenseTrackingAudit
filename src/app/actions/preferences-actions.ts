"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function savePreferencesAction(data: {
  currency: string;
  numberFormat: string;
  dateFormat: string;
  timezone: string;
  weekStart: string;
  fiscalYearStart: string;
}): Promise<{ error?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: "Not authenticated." };
  }

  const { error } = await supabase.auth.updateUser({
    data: {
      pref_currency: data.currency,
      pref_number_format: data.numberFormat,
      pref_date_format: data.dateFormat,
      pref_timezone: data.timezone,
      pref_week_start: data.weekStart,
      pref_fiscal_year_start: data.fiscalYearStart,
    },
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/profile");
  return {};
}

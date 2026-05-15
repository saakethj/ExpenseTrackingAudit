"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type NotificationPrefs = {
  budgetAlerts: boolean;
  largeTransactions: boolean;
  weeklySummary: boolean;
  monthlyReport: boolean;
  loginActivity: boolean;
  profileChanges: boolean;
  frequency: "realtime" | "daily" | "weekly";
};

export async function saveNotificationsAction(
  data: NotificationPrefs
): Promise<{ error?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) return { error: "Not authenticated." };

  const { error } = await supabase.auth.updateUser({
    data: {
      notif_budget_alerts: data.budgetAlerts,
      notif_large_transactions: data.largeTransactions,
      notif_weekly_summary: data.weeklySummary,
      notif_monthly_report: data.monthlyReport,
      notif_login_activity: data.loginActivity,
      notif_profile_changes: data.profileChanges,
      notif_frequency: data.frequency,
    },
  });

  if (error) return { error: error.message };
  revalidatePath("/dashboard/profile");
  return {};
}

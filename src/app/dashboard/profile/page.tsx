import type { CSSProperties } from "react";
import { redirect } from "next/navigation";
import ProfileCard from "@/components/profile-card";
import { AvatarControls } from "@/components/avatar-controls";
import { AccountSnapshot } from "@/components/account-snapshot";
import { ProfileShell } from "@/components/profile-shell";
import { createClient } from "@/lib/supabase/server";
import { getAvatarSignedUrl } from "@/lib/supabase/avatar-server";
import type { Category } from "@/components/categories-panel";

const DEFAULT_CATEGORIES = [
  { name: "Food & Dining", color: "#f97316", icon: "🍔", sort_order: 0 },
  { name: "Transport",     color: "#3b82f6", icon: "🚗", sort_order: 1 },
  { name: "Housing",       color: "#8b5cf6", icon: "🏠", sort_order: 2 },
  { name: "Utilities",     color: "#eab308", icon: "💡", sort_order: 3 },
  { name: "Shopping",      color: "#ec4899", icon: "🛍️", sort_order: 4 },
  { name: "Entertainment", color: "#06b6d4", icon: "🎬", sort_order: 5 },
  { name: "Health",        color: "#22c55e", icon: "💊", sort_order: 6 },
  { name: "Education",     color: "#f59e0b", icon: "📚", sort_order: 7 },
  { name: "Travel",        color: "#6366f1", icon: "✈️", sort_order: 8 },
  { name: "Income",        color: "#10b981", icon: "💰", sort_order: 9 },
];

const DEFAULT_AVATAR = "/avatar-default.svg";

function handleFromEmail(email: string): string {
  return email.split("@")[0] ?? "user";
}

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    redirect("/login");
  }

  const handle = handleFromEmail(user.email);
  const meta = user.user_metadata ?? {};

  // Resolve first / last name — Google sets full_name; email users may set them separately
  const metaFirst = (meta.first_name as string | undefined) ?? "";
  const metaLast = (meta.last_name as string | undefined) ?? "";
  const metaFull = (meta.full_name as string | undefined) ?? "";

  let firstName = metaFirst;
  let lastName = metaLast;
  if (!firstName && metaFull) {
    const parts = metaFull.trim().split(/\s+/);
    firstName = parts[0] ?? "";
    lastName = parts.slice(1).join(" ");
  }

  const displayName = metaFull || `${firstName} ${lastName}`.trim() || handle;
  const gender = (meta.gender as string | undefined) ?? "";
  const country = (meta.country as string | undefined) ?? "";

  const prefCurrency = (meta.pref_currency as string | undefined) ?? "USD";
  const prefNumberFormat = (meta.pref_number_format as string | undefined) ?? "1,000.00";
  const prefDateFormat = (meta.pref_date_format as string | undefined) ?? "MM/DD/YYYY";
  const prefTimezone =
    (meta.pref_timezone as string | undefined) ??
    Intl.DateTimeFormat().resolvedOptions().timeZone;
  const prefWeekStart = (meta.pref_week_start as string | undefined) ?? "sunday";
  const prefFiscalYearStart =
    (meta.pref_fiscal_year_start as string | undefined) ?? "January";

  const notifBudgetAlerts = (meta.notif_budget_alerts as boolean | undefined) ?? true;
  const notifLargeTransactions = (meta.notif_large_transactions as boolean | undefined) ?? true;
  const notifWeeklySummary = (meta.notif_weekly_summary as boolean | undefined) ?? false;
  const notifMonthlyReport = (meta.notif_monthly_report as boolean | undefined) ?? true;
  const notifLoginActivity = (meta.notif_login_activity as boolean | undefined) ?? true;
  const notifProfileChanges = (meta.notif_profile_changes as boolean | undefined) ?? false;
  const notifFrequency = (meta.notif_frequency as "realtime" | "daily" | "weekly" | undefined) ?? "realtime";

  const provider = (user.app_metadata?.provider as string | undefined) ?? "email";
  const hasPassword = (user.identities ?? []).some((id) => id.provider === "email");

  const twoFactorEnabled = (user.factors ?? []).some((f) => f.status === "verified");
  const emailVerified = user.email_confirmed_at != null;
  const lastSignInAt = user.last_sign_in_at ?? null;

  const signedAvatarUrl = await getAvatarSignedUrl(user.id);
  const avatarUrl = signedAvatarUrl ?? DEFAULT_AVATAR;

  // Fetch categories — seed defaults on first visit
  const { data: existingCats } = await supabase
    .from("categories")
    .select("id, name, color, icon, sort_order")
    .order("sort_order", { ascending: true });

  let categories = (existingCats as Category[] | null) ?? [];

  if (categories.length === 0) {
    const { data: seeded } = await supabase
      .from("categories")
      .insert(DEFAULT_CATEGORIES.map((d) => ({ ...d, user_id: user.id })))
      .select("id, name, color, icon, sort_order");
    categories = (seeded as Category[] | null) ?? [];
  }

  return (
    <div className="flex flex-1 justify-center px-3 py-8 sm:px-6 sm:py-12">
      <div className="grid w-full max-w-7xl grid-cols-1 gap-8 lg:grid-cols-[220px_minmax(0,1fr)_auto]">
        <ProfileShell
          email={user.email}
          provider={provider}
          hasPassword={hasPassword}
          firstName={firstName}
          lastName={lastName}
          gender={gender}
          country={country}
          preferences={{
            currency: prefCurrency,
            numberFormat: prefNumberFormat,
            dateFormat: prefDateFormat,
            timezone: prefTimezone,
            weekStart: prefWeekStart,
            fiscalYearStart: prefFiscalYearStart,
          }}
          categories={categories}
          notifications={{
            budgetAlerts: notifBudgetAlerts,
            largeTransactions: notifLargeTransactions,
            weeklySummary: notifWeeklySummary,
            monthlyReport: notifMonthlyReport,
            loginActivity: notifLoginActivity,
            profileChanges: notifProfileChanges,
            frequency: notifFrequency,
          }}
        />

        {/* Right: profile card + avatar controls */}
        <div className="flex flex-col items-center lg:items-end">
          <div
            className="flex flex-col"
            style={
              {
                width: "calc(60svh * 0.718)",
                maxWidth: "calc(380px * 0.718)",
                "--pc-height": "60svh",
                "--pc-max-height": "380px",
                "--pc-name-size": "1.9em",
                "--pc-title-size": "12px",
                "--pc-title-top": "-4px",
                "--pc-text-top": "1em",
              } as CSSProperties
            }
          >
            <ProfileCard
              className="w-fit"
              name={displayName}
              title="Member"
              handle={handle}
              status="Active"
              contactText="Edit profile"
              avatarUrl={avatarUrl}
              miniAvatarUrl={avatarUrl}
              showUserInfo={false}
              enableTilt
              enableMobileTilt={false}
            />
            <AvatarControls
              userId={user.id}
              hasAvatar={signedAvatarUrl !== null}
            />
            <AccountSnapshot
              provider={provider}
              lastSignInAt={lastSignInAt}
              twoFactorEnabled={twoFactorEnabled}
              emailVerified={emailVerified}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

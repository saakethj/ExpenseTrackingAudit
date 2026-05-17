import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getBudgets } from "@/app/actions/budgets-actions";
import { BudgetsShell } from "@/components/budgets-shell";

export default async function BudgetsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const result = await getBudgets();
  const initialBudgets = "ok" in result ? result.budgets : [];
  const initialError = "error" in result ? result.error : null;

  return (
    <BudgetsShell
      initialBudgets={initialBudgets}
      initialError={initialError}
    />
  );
}

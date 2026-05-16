import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSubscriptions } from "@/app/actions/subscriptions-actions";
import { SubscriptionsShell } from "@/components/subscriptions-shell";

export default async function SubscriptionsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const result = await getSubscriptions();
  const subscriptions = "ok" in result ? result.subscriptions : [];

  return <SubscriptionsShell subscriptions={subscriptions} />;
}

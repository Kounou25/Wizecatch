import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * État de facturation du compte connecté.
 *
 * Client normal, donc RLS : la politique `subscriptions_select_own` garantit
 * qu'on ne lit que son propre abonnement. Rien de sensible ne transite — ni
 * identifiant Dodo, ni montant.
 */
export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const [{ data: profile }, { data: subscription }] = await Promise.all([
    supabase.from("profiles").select("plan, plan_source").eq("id", user.id).maybeSingle(),
    supabase
      .from("subscriptions")
      .select("plan, status, current_period_end, cancel_at_period_end")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  return NextResponse.json({
    plan: profile?.plan ?? "free",
    planSource: profile?.plan_source ?? "system",
    subscription: subscription
      ? {
          plan: subscription.plan,
          status: subscription.status,
          currentPeriodEnd: subscription.current_period_end,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
        }
      : null,
  });
}

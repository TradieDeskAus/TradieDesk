import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function getMonthlyDocCount(userId: string): Promise<number> {
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
  const { count } = await supabase
    .from("usage")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", monthStart);
  return count ?? 0;
}

export async function recordDoc(userId: string, docType: string): Promise<void> {
  await supabase.from("usage").insert({ user_id: userId, doc_type: docType });
}

export async function getUserPlan(userId: string): Promise<string> {
  const { data } = await supabase
    .from("subscriptions")
    .select("plan")
    .eq("user_id", userId)
    .single();
  return data?.plan ?? "starter";
}

export async function upsertSubscription(
  userId: string,
  plan: string,
  stripeCustomerId: string,
  stripeSubscriptionId: string
): Promise<void> {
  await supabase.from("subscriptions").upsert({
    user_id: userId,
    plan,
    stripe_customer_id: stripeCustomerId,
    stripe_subscription_id: stripeSubscriptionId,
    updated_at: new Date().toISOString(),
  });
}

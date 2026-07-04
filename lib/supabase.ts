import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function getMonthlyDocCount(userId: string): Promise<number> {
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
  const { count, error } = await supabase
    .from("usage")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", monthStart);
  if (error) throw new Error("Failed to retrieve usage count.");
  return count ?? 0;
}

export async function recordDoc(userId: string, docType: string): Promise<void> {
  const { error } = await supabase.from("usage").insert({ user_id: userId, doc_type: docType });
  if (error) throw new Error("Failed to record document usage.");
}

export async function getUserPlan(userId: string): Promise<string> {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("plan")
    .eq("user_id", userId)
    .single();
  // PGRST116 = no rows found — user has no subscription, default to starter
  if (error && error.code !== "PGRST116") throw new Error("Failed to retrieve user plan.");
  return data?.plan ?? "starter";
}

export async function upsertSubscription(
  userId: string,
  plan: string,
  stripeCustomerId: string,
  stripeSubscriptionId: string
): Promise<void> {
  const { error } = await supabase.from("subscriptions").upsert({
    user_id: userId,
    plan,
    stripe_customer_id: stripeCustomerId,
    stripe_subscription_id: stripeSubscriptionId,
    updated_at: new Date().toISOString(),
  });
  if (error) throw new Error("Failed to update subscription.");
}

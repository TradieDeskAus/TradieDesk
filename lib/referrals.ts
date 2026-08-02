import crypto from "crypto";
import { clerkClient } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";

export interface Referral {
  userId: string;
  code: string;
  businessName: string | null;
  googleReviewLink: string | null;
}

interface ReferralRow {
  user_id: string;
  code: string;
  business_name: string | null;
  google_review_link: string | null;
}

function toReferral(row: ReferralRow): Referral {
  return {
    userId: row.user_id,
    code: row.code,
    businessName: row.business_name,
    googleReviewLink: row.google_review_link,
  };
}

function generateReferralCode(): string {
  // 6 bytes = 8 URL-safe base64 chars, no padding — safe to drop
  // straight into a URL path segment (/r/k3F9zQwZ).
  return crypto.randomBytes(6).toString("base64url");
}

const REFERRAL_COLUMNS = "user_id, code, business_name, google_review_link";

export async function getOrCreateReferral(userId: string): Promise<Referral> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const { data: existing, error: selectError } = await supabase
      .from("referrals")
      .select(REFERRAL_COLUMNS)
      .eq("user_id", userId)
      .single();

    if (existing) return toReferral(existing);

    if (selectError && selectError.code !== "PGRST116") {
      throw new Error("Failed to retrieve referral code.");
    }

    const { data: inserted, error: insertError } = await supabase
      .from("referrals")
      .insert({ user_id: userId, code: generateReferralCode() })
      .select(REFERRAL_COLUMNS)
      .single();

    if (inserted) return toReferral(inserted);

    // 23505 = unique_violation — either a concurrent request created this
    // user's row first, or (astronomically unlikely) the code collided.
    // Either way, loop back and re-select rather than assuming which.
    if (insertError?.code !== "23505") {
      throw new Error("Failed to create referral code.");
    }
  }

  throw new Error("Failed to create referral code after multiple attempts.");
}

export async function upsertReferralProfile(
  userId: string,
  profile: { businessName?: string; googleReviewLink?: string }
): Promise<void> {
  // Callers must call getOrCreateReferral first to guarantee a row exists.
  // This updates fields on that row rather than performing a blind upsert,
  // since `code` is NOT NULL and system-generated, not user-supplied.
  const { error } = await supabase
    .from("referrals")
    .update({
      business_name: profile.businessName,
      google_review_link: profile.googleReviewLink,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);
  if (error) throw new Error("Failed to update referral profile.");
}

export async function getReferralByCode(code: string): Promise<Referral | null> {
  const { data, error } = await supabase
    .from("referrals")
    .select(REFERRAL_COLUMNS)
    .eq("code", code)
    .single();
  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error("Failed to look up referral code.");
  }
  return toReferral(data);
}

export async function getUserEmail(userId: string): Promise<string | null> {
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  return user.emailAddresses[0]?.emailAddress ?? null;
}

export async function logReviewRequest(
  userId: string,
  clientEmail: string,
  status: "sent" | "failed",
  resendMessageId?: string
): Promise<void> {
  const { error } = await supabase.from("review_requests").insert({
    user_id: userId,
    client_email: clientEmail,
    status,
    resend_message_id: resendMessageId ?? null,
  });
  if (error) throw new Error("Failed to log review request.");
}

export async function getMonthlyReviewRequestCount(userId: string): Promise<number> {
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
  const { count, error } = await supabase
    .from("review_requests")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", monthStart);
  if (error) throw new Error("Failed to retrieve review request count.");
  return count ?? 0;
}

export async function getRecentLeadCount(referralCode: string, sinceMinutesAgo: number): Promise<number> {
  const since = new Date(Date.now() - sinceMinutesAgo * 60_000).toISOString();
  const { count, error } = await supabase
    .from("leads")
    .select("*", { count: "exact", head: true })
    .eq("referral_code", referralCode)
    .gte("created_at", since);
  if (error) throw new Error("Failed to check recent lead volume.");
  return count ?? 0;
}

export async function logLead(
  referralCode: string,
  name: string,
  contact: string,
  message: string
): Promise<void> {
  const { error } = await supabase.from("leads").insert({
    referral_code: referralCode,
    name,
    contact,
    message: message || null,
  });
  if (error) throw new Error("Failed to log lead.");
}

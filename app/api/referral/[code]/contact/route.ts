import { NextRequest, NextResponse } from "next/server";
import { sanitize } from "@/lib/sanitize";
import { resend } from "@/lib/resend";
import { getReferralByCode, getUserEmail, logLead, getRecentLeadCount } from "@/lib/referrals";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_LEADS_PER_HOUR = 20;

// Public endpoint — submitted by a visitor to a tradie's /r/[code] page, no Clerk session.
export async function POST(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;

  const referral = await getReferralByCode(code);
  if (!referral) {
    return NextResponse.json({ error: "This referral link is no longer valid." }, { status: 404 });
  }

  let raw: Record<string, unknown>;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const name = sanitize(raw.name);
  const contact = sanitize(raw.contact);
  const message = sanitize(raw.message);

  if (!name || !contact) {
    return NextResponse.json({ error: "Please enter your name and a way to reach you." }, { status: 400 });
  }

  const recentCount = await getRecentLeadCount(code, 60);
  if (recentCount >= MAX_LEADS_PER_HOUR) {
    return NextResponse.json({ error: "Too many requests right now — please try again shortly." }, { status: 429 });
  }

  // Log first — this is the source of truth. A lead must never be silently lost
  // even if the notification email below fails.
  try {
    await logLead(code, name, contact, message);
  } catch {
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }

  try {
    const tradieEmail = await getUserEmail(referral.userId);
    if (tradieEmail) {
      await resend.emails.send({
        from: "TradieDesk Leads <leads@tradiedeskapp.com.au>",
        to: tradieEmail,
        replyTo: EMAIL_REGEX.test(contact) ? contact : undefined,
        subject: `New lead from your TradieDesk referral link`,
        text: `You've got a new lead via your referral link!\n\nName: ${name}\nContact: ${contact}\n${message ? `Message: ${message}\n` : ""}\nReply to this email to get in touch with them directly.`,
      });
    }
  } catch {
    // Best effort — the lead is already logged above even if this notification fails.
  }

  return NextResponse.json({ success: true });
}

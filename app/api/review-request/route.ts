import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { generateEmail, parseSubjectAndBody } from "@/lib/generators";
import { sanitize } from "@/lib/sanitize";
import { resend } from "@/lib/resend";
import {
  getOrCreateReferral,
  upsertReferralProfile,
  getUserEmail,
  logReviewRequest,
  getMonthlyReviewRequestCount,
} from "@/lib/referrals";
import { MAX_REVIEW_REQUESTS_PER_MONTH, ALLOWED_REVIEW_LINK_HOSTS, REVIEW_REQUEST_FROM_EMAIL } from "@/lib/constants";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isAllowedReviewLink(link: string): boolean {
  try {
    const url = new URL(link);
    if (url.protocol !== "https:") return false;
    return ALLOWED_REVIEW_LINK_HOSTS.some(
      (host) => url.hostname === host || url.hostname.endsWith(`.${host}`)
    );
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  let raw: Record<string, unknown>;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const clientName = sanitize(raw.clientName);
  const clientEmail = sanitize(raw.clientEmail);
  const businessName = sanitize(raw.businessName);
  const jobDescription = sanitize(raw.jobDescription);
  const googleReviewLink = sanitize(raw.googleReviewLink);

  if (!clientEmail || !EMAIL_REGEX.test(clientEmail)) {
    return NextResponse.json({ error: "Enter a valid client email address." }, { status: 400 });
  }
  if (!businessName || !jobDescription) {
    return NextResponse.json({ error: "Business name and job description are required." }, { status: 400 });
  }
  if (googleReviewLink && !isAllowedReviewLink(googleReviewLink)) {
    return NextResponse.json({ error: "Review link must be a Google review link." }, { status: 400 });
  }

  try {
    const used = await getMonthlyReviewRequestCount(userId);
    if (used >= MAX_REVIEW_REQUESTS_PER_MONTH) {
      return NextResponse.json(
        { error: `You've reached your ${MAX_REVIEW_REQUESTS_PER_MONTH} review request limit this month.` },
        { status: 429 }
      );
    }

    const referral = await getOrCreateReferral(userId);
    await upsertReferralProfile(userId, { businessName, googleReviewLink: googleReviewLink || undefined });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://tradiedeskapp.com.au";
    const referralLink = `${appUrl}/r/${referral.code}`;

    const rawEmail = await generateEmail({
      emailType: "review_referral",
      businessName,
      clientName,
      jobDescription,
      extraDetails: "",
      googleReviewLink: googleReviewLink || undefined,
      referralLink,
    });
    const { subject, body } = parseSubjectAndBody(rawEmail);

    const tradieEmail = await getUserEmail(userId);

    const { data, error: sendError } = await resend.emails.send({
      from: `${businessName} (via TradieDesk) <${REVIEW_REQUEST_FROM_EMAIL}>`,
      to: clientEmail,
      replyTo: tradieEmail ?? undefined,
      subject,
      text: body,
    });

    // Log best-effort — a logging failure must not mask a send that already succeeded.
    try {
      await logReviewRequest(userId, clientEmail, sendError ? "failed" : "sent", data?.id);
    } catch {
      // swallow — the email itself is the source of truth for the user
    }

    if (sendError) {
      return NextResponse.json({ error: "Could not send the email. Please try again." }, { status: 502 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}

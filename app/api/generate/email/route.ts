import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { generateEmail, type EmailInput, type EmailType } from "@/lib/anthropic";
import { getMonthlyDocCount, getUserPlan, recordDoc } from "@/lib/supabase";
import { PLANS } from "@/lib/stripe";

const MAX_FIELD_LENGTH = 2000;

const VALID_EMAIL_TYPES: EmailType[] = [
  "follow_up", "job_complete", "variation", "overdue_invoice", "complaint_response", "booking_confirm",
];

function sanitize(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "").slice(0, MAX_FIELD_LENGTH).trim();
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const plan = await getUserPlan(userId);
  const planConfig = PLANS[plan as keyof typeof PLANS] ?? PLANS.starter;

  if (planConfig.docsPerMonth !== Infinity) {
    const used = await getMonthlyDocCount(userId);
    if (used >= planConfig.docsPerMonth) {
      return NextResponse.json(
        { error: `You've reached your ${planConfig.docsPerMonth} document limit this month. Upgrade to generate more.` },
        { status: 429 }
      );
    }
  }

  let raw: Record<string, unknown>;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const emailType = raw.emailType as EmailType;
  if (!VALID_EMAIL_TYPES.includes(emailType)) {
    return NextResponse.json({ error: "Invalid email type." }, { status: 400 });
  }

  const input: EmailInput = {
    emailType,
    businessName: sanitize(raw.businessName),
    clientName: sanitize(raw.clientName),
    jobDescription: sanitize(raw.jobDescription),
    extraDetails: sanitize(raw.extraDetails),
  };

  if (!input.emailType || !input.jobDescription) {
    return NextResponse.json({ error: "Email type and job description are required." }, { status: 400 });
  }

  // Record usage before generating to prevent race-condition abuse
  await recordDoc(userId, "email");

  try {
    const content = await generateEmail(input);
    return NextResponse.json({ content });
  } catch {
    return NextResponse.json({ error: "Generation failed. Please try again." }, { status: 500 });
  }
}

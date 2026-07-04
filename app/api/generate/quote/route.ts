import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { generateQuote, type QuoteInput } from "@/lib/anthropic";
import { getMonthlyDocCount, getUserPlan, recordDoc } from "@/lib/supabase";
import { PLANS } from "@/lib/stripe";

const MAX_FIELD_LENGTH = 2000;

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

  const input: QuoteInput = {
    businessName: sanitize(raw.businessName),
    clientName: sanitize(raw.clientName),
    jobDescription: sanitize(raw.jobDescription),
    tradeType: sanitize(raw.tradeType),
    estimatedHours: sanitize(raw.estimatedHours),
    hourlyRate: sanitize(raw.hourlyRate),
    materials: sanitize(raw.materials),
    gst: raw.gst === true,
  };

  if (!input.jobDescription || !input.tradeType) {
    return NextResponse.json({ error: "Job description and trade type are required." }, { status: 400 });
  }

  const hours = parseFloat(input.estimatedHours);
  const rate = parseFloat(input.hourlyRate);
  if (input.estimatedHours && (isNaN(hours) || hours < 0 || hours > 10000)) {
    return NextResponse.json({ error: "Invalid estimated hours." }, { status: 400 });
  }
  if (input.hourlyRate && (isNaN(rate) || rate < 0 || rate > 100000)) {
    return NextResponse.json({ error: "Invalid hourly rate." }, { status: 400 });
  }

  // Record usage before generating to prevent race-condition abuse
  await recordDoc(userId, "quote");

  try {
    const content = await generateQuote(input);
    return NextResponse.json({ content });
  } catch {
    return NextResponse.json({ error: "Generation failed. Please try again." }, { status: 500 });
  }
}

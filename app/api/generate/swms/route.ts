import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { generateSwms, type SwmsInput } from "@/lib/anthropic";
import { getMonthlyDocCount, getUserPlan, recordDoc } from "@/lib/supabase";
import { PLANS } from "@/lib/stripe";

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

  const input = (await req.json()) as SwmsInput;
  if (!input.jobDescription || !input.tradeType) {
    return NextResponse.json({ error: "Job description and trade type are required." }, { status: 400 });
  }

  const content = await generateSwms(input);
  await recordDoc(userId, "swms");

  return NextResponse.json({ content });
}

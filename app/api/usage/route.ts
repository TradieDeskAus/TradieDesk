import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getMonthlyDocCount, getUserPlan } from "@/lib/supabase";
import { PLANS } from "@/lib/stripe";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const [plan, used] = await Promise.all([getUserPlan(userId), getMonthlyDocCount(userId)]);
  const planConfig = PLANS[plan as keyof typeof PLANS] ?? PLANS.starter;

  return NextResponse.json({
    plan,
    used,
    limit: planConfig.docsPerMonth === Infinity ? null : planConfig.docsPerMonth,
  });
}

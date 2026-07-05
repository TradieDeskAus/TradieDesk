import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getMonthlyDocCount, getUserPlan, recordDoc } from "@/lib/supabase";
import { PLANS } from "@/lib/stripe";
import type { DocType } from "@/lib/constants";

type Handler<T> = (input: T) => Promise<string>;

/**
 * Wraps a document generation handler with auth, plan enforcement,
 * usage recording, and error handling — eliminating boilerplate
 * across all generate routes.
 */
export function withGenerateGuard<T>(
  docType: DocType,
  parseInput: (raw: Record<string, unknown>) => T | null,
  handler: Handler<T>
) {
  return async function POST(req: NextRequest) {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    }

    // Run both DB queries in parallel — they are independent
    let plan: string;
    let used: number;
    try {
      [plan, used] = await Promise.all([
        getUserPlan(userId),
        getMonthlyDocCount(userId),
      ]);
    } catch {
      return NextResponse.json({ error: "Service unavailable." }, { status: 503 });
    }

    const planConfig = PLANS[plan as keyof typeof PLANS] ?? PLANS.starter;

    if (planConfig.docsPerMonth !== Infinity && used >= planConfig.docsPerMonth) {
      return NextResponse.json(
        {
          error: `You've reached your ${planConfig.docsPerMonth} document limit this month. Upgrade to generate more.`,
        },
        { status: 429 }
      );
    }

    let raw: Record<string, unknown>;
    try {
      raw = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    const input = parseInput(raw);
    if (!input) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    // Record before generating — prevents race-condition abuse
    try {
      await recordDoc(userId, docType);
    } catch {
      return NextResponse.json({ error: "Service unavailable." }, { status: 503 });
    }

    try {
      const content = await handler(input);
      return NextResponse.json({ content });
    } catch {
      return NextResponse.json({ error: "Generation failed. Please try again." }, { status: 500 });
    }
  };
}

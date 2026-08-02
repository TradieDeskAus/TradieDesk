import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getOrCreateReferral } from "@/lib/referrals";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  try {
    const referral = await getOrCreateReferral(userId);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://tradiedeskapp.com.au";
    return NextResponse.json({
      code: referral.code,
      link: `${appUrl}/r/${referral.code}`,
      businessName: referral.businessName,
      googleReviewLink: referral.googleReviewLink,
    });
  } catch {
    return NextResponse.json({ error: "Could not load your referral link." }, { status: 503 });
  }
}

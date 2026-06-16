import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { stripe, PLANS, type PlanKey } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const { plan } = (await req.json()) as { plan: PlanKey };
  const planConfig = PLANS[plan];
  if (!planConfig?.priceId) return NextResponse.json({ error: "Invalid plan" }, { status: 400 });

  const user = await currentUser();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    currency: "aud",
    line_items: [{ price: planConfig.priceId, quantity: 1 }],
    customer_email: user?.emailAddresses[0]?.emailAddress,
    metadata: { userId },
    allow_promotion_codes: true,
    success_url: `${appUrl}/dashboard?upgraded=true`,
    cancel_url: `${appUrl}/#pricing`,
  });

  return NextResponse.json({ url: session.url });
}

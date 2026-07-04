import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabase, upsertSubscription } from "@/lib/supabase";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId;
    if (!userId || !session.subscription || !session.customer) return NextResponse.json({ ok: true });

    const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
    const priceId = subscription.items.data[0]?.price.id;
    const plan = priceId === process.env.STRIPE_PRO_PRICE_ID ? "pro"
      : priceId === process.env.STRIPE_BUSINESS_PRICE_ID ? "business"
      : "starter";

    await upsertSubscription(userId, plan, session.customer as string, subscription.id);
  }

  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;
    const { data } = await supabase
      .from("subscriptions")
      .select("user_id")
      .eq("stripe_customer_id", subscription.customer)
      .single();
    if (data?.user_id) {
      await upsertSubscription(data.user_id, "starter", subscription.customer as string, "");
    }
  }

  return NextResponse.json({ ok: true });
}

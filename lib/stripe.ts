import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

export const PLANS = {
  starter: { name: "Starter", priceAUD: 0, docsPerMonth: 5, priceId: null },
  pro:     { name: "Pro",     priceAUD: 19.95, docsPerMonth: 100, priceId: process.env.STRIPE_PRO_PRICE_ID! },
  business:{ name: "Business",priceAUD: 99, docsPerMonth: Infinity, priceId: process.env.STRIPE_BUSINESS_PRICE_ID! },
} as const;

export type PlanKey = keyof typeof PLANS;

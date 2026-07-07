"use client";
import Link from "next/link";
import { useState } from "react";
import { SignUpButton, useUser } from "@clerk/nextjs";

const plans = [
  {
    name: "Starter",
    price: "Free",
    period: "",
    docs: "5 documents/month",
    features: ["SWMS generator", "Quote builder", "Client emails", "Copy & download"],
    cta: "Start free",
    plan: "starter",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$19.95",
    period: "/mo",
    docs: "100 documents/month",
    features: ["Everything in Starter", "100 docs per month", "Priority generation", "Email support"],
    cta: "Get Pro",
    plan: "pro",
    highlighted: true,
  },
  {
    name: "Business",
    price: "$79",
    period: "/mo",
    docs: "Unlimited documents",
    features: ["Everything in Pro", "Unlimited documents", "Multiple staff logins coming soon", "Phone support"],
    cta: "Get Business",
    plan: "business",
    highlighted: false,
  },
];

const PROMO_EXPIRES = new Date("2026-07-14T23:59:59+10:00");

function PricingButton({ plan, cta, highlighted, isSignedIn }: { plan: string; cta: string; highlighted: boolean; isSignedIn: boolean }) {
  const [loading, setLoading] = useState(false);
  const base = highlighted ? "bg-brand-500 text-white hover:bg-brand-600" : "bg-gray-100 text-gray-700 hover:bg-gray-200";

  async function handleUpgrade() {
    setLoading(true);
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    setLoading(false);
  }

  if (!isSignedIn) {
    return (
      <SignUpButton mode="modal">
        <button className={`w-full py-3 rounded-xl font-bold transition ${base}`}>{cta}</button>
      </SignUpButton>
    );
  }
  if (plan === "starter") {
    return (
      <Link href="/dashboard" className={`w-full py-3 rounded-xl font-bold transition text-center block ${base}`}>{cta}</Link>
    );
  }
  return (
    <button onClick={handleUpgrade} disabled={loading} className={`w-full py-3 rounded-xl font-bold transition disabled:opacity-50 ${base}`}>
      {loading ? "Redirecting…" : cta}
    </button>
  );
}

export function PricingCards() {
  const { isSignedIn } = useUser();
  const showPromo = new Date() < PROMO_EXPIRES;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {plans.map((p) => (
        <div key={p.name} className={`rounded-2xl p-8 border-2 flex flex-col ${p.highlighted ? "border-brand-500 shadow-2xl scale-105 bg-orange-50" : "border-gray-200"}`}>
          {p.highlighted && <div className="text-xs font-bold text-brand-600 uppercase tracking-widest mb-3">Most Popular</div>}
          {p.highlighted && showPromo && (
            <div className="text-xs font-bold text-white bg-brand-500 rounded-lg px-3 py-2 mb-3">
              Enter code <span className="bg-white text-brand-600 px-1.5 py-0.5 rounded">TRADIE2026</span> at checkout for 3 months free
            </div>
          )}
          <h3 className="text-xl font-bold text-gray-900 mb-1">{p.name}</h3>
          <div className="flex items-baseline gap-1 mb-1">
            <span className="text-4xl font-extrabold text-gray-900">{p.price}</span>
            <span className="text-gray-500 text-sm">{p.period}</span>
          </div>
          <p className="text-sm text-brand-600 font-semibold mb-6">{p.docs}</p>
          <ul className="space-y-2 mb-8 flex-1">
            {p.features.map((f) => (
              <li key={f} className="text-sm text-gray-600 flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span> {f}
              </li>
            ))}
          </ul>
          <PricingButton plan={p.plan} cta={p.cta} highlighted={p.highlighted} isSignedIn={!!isSignedIn} />
        </div>
      ))}
    </div>
  );
}

"use client";
import Link from "next/link";
import { useState } from "react";
import { SignInButton, SignUpButton, useUser } from "@clerk/nextjs";

const trades = ["Electrician", "Plumber", "Builder", "Roofer", "Landscaper", "Concretor", "Carpenter", "Painter", "HVAC", "Tiler"];

const features = [
  {
    icon: "🦺",
    title: "SWMS Generator",
    desc: "Legally compliant Safe Work Method Statements in 30 seconds. Stop spending 3 hours on paperwork before every job.",
    badge: "Most popular",
  },
  {
    icon: "📋",
    title: "Quote Builder",
    desc: "Professional, itemised quotes with GST, terms & conditions, and a client sign-off section. Win more jobs.",
    badge: null,
  },
  {
    icon: "✉️",
    title: "Client Emails",
    desc: "Follow-ups, variation notices, overdue invoices, job completions — written professionally in seconds.",
    badge: null,
  },
];

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

const faqs = [
  {
    q: "Are the SWMS documents legally compliant?",
    a: "Yes. Every SWMS is generated following Safe Work Australia guidelines and the Work Health and Safety Act 2011. They include risk assessment tables, hierarchy of controls, PPE requirements, and worker sign-off sections — everything required on an Australian worksite.",
  },
  {
    q: "I'm not good with computers. Is this easy to use?",
    a: "Very easy. You fill in a simple form — what trade you do, what the job is, where it is. Click a button. Your document appears. Copy it or print it. That's it.",
  },
  {
    q: "Can I edit the documents after they're generated?",
    a: "Yes. Copy the text and paste it into Word or any text editor. Add your logo, tweak the wording, whatever you need.",
  },
  {
    q: "Do I need a credit card to sign up?",
    a: "No. The free plan gives you 5 documents per month with no card required.",
  },
];

const PROMO_EXPIRES = new Date("2026-07-14T23:59:59+10:00");

export default function Home() {
  const { isSignedIn } = useUser();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const showPromo = new Date() < PROMO_EXPIRES;

  return (
    <main className="min-h-screen">
      {/* Promo banner */}
      {showPromo && (
        <a
          href="#pricing"
          className="fixed top-0 w-full bg-brand-500 text-white text-center py-3 px-4 z-[60] text-sm sm:text-base font-bold shadow-lg animate-pulse flex flex-wrap items-center justify-center gap-2 hover:bg-brand-600 transition"
        >
          <span>
            🎉 LAUNCH OFFER — Use code <span className="bg-white text-brand-600 px-2 py-0.5 rounded-md mx-1 font-extrabold tracking-wide">TRADIE2026</span> for 3 months free on the Pro plan. Only 50 spots, ends 14 July 2026!
          </span>
          <span className="bg-gray-900 text-white px-3 py-1 rounded-full text-xs sm:text-sm font-extrabold underline-offset-2">Claim offer ↓</span>
        </a>
      )}

      {/* Nav */}
      <nav className={`fixed w-full bg-white/95 backdrop-blur border-b border-gray-100 z-50 ${showPromo ? "top-12" : "top-0"}`}>
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔧</span>
            <span className="text-xl font-bold text-gray-900">TradieDesk</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="#features" className="text-sm text-gray-600 hover:text-gray-900 hidden sm:block">Features</a>
            <a href="#pricing" className="text-sm text-gray-600 hover:text-gray-900 hidden sm:block">Pricing</a>
            {isSignedIn ? (
              <Link href="/dashboard" className="bg-brand-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-brand-600 transition">Dashboard</Link>
            ) : (
              <>
                <SignInButton mode="modal"><button className="text-sm text-gray-600 hover:text-gray-900">Sign in</button></SignInButton>
                <SignUpButton mode="modal"><button className="bg-brand-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-brand-600 transition">Try free</button></SignUpButton>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className={`pb-20 px-4 bg-gradient-to-b from-orange-50 to-white ${showPromo ? "pt-40" : "pt-28"}`}>
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-orange-100 text-brand-700 text-sm font-semibold px-4 py-2 rounded-full mb-6">
            🇦🇺 Built for Australian tradies
          </div>
          <h1 className="text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
            Stop wasting hours on<br />
            <span className="text-brand-500">tradie paperwork</span>
          </h1>
          <p className="text-xl text-gray-600 mb-4 max-w-2xl mx-auto">
            Generate compliant SWMS documents, professional quotes, and client emails in 30 seconds. Not 3 hours.
          </p>
          <p className="text-sm text-gray-400 mb-10">Used by electricians, plumbers, builders, roofers, landscapers, concretors, carpenters, painters, HVAC technicians, tilers and more...</p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isSignedIn ? (
              <Link href="/dashboard" className="bg-brand-500 text-white px-8 py-4 rounded-xl text-lg font-bold hover:bg-brand-600 transition shadow-lg">Go to Dashboard →</Link>
            ) : (
              <SignUpButton mode="modal">
                <button className="bg-brand-500 text-white px-8 py-4 rounded-xl text-lg font-bold hover:bg-brand-600 transition shadow-lg">
                  Try free — no card needed
                </button>
              </SignUpButton>
            )}
            <a href="#features" className="border-2 border-gray-200 text-gray-700 px-8 py-4 rounded-xl text-lg font-semibold hover:border-gray-400 transition">
              See how it works ↓
            </a>
          </div>
        </div>
      </section>

      {/* Pain point section */}
      <section className="py-16 px-4 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Sound familiar?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {[
              { icon: "😤", text: "\"I spent Sunday writing a SWMS instead of watching the footy. Took 3 hours and I'm still not sure if it's right.\"" },
              { icon: "💸", text: "\"Lost a job because my quote took a week to get out. By then the client had gone with someone else.\"" },
              { icon: "😬", text: "\"Got a complaint from a client and had no idea how to respond professionally without making it worse.\"" },
            ].map((item, i) => (
              <div key={i} className="bg-gray-800 rounded-2xl p-6">
                <div className="text-3xl mb-3">{item.icon}</div>
                <p className="text-gray-300 text-sm italic">{item.text}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 text-brand-400 font-semibold text-lg">TradieDesk fixes all of this.</p>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">Three tools. All the paperwork sorted.</h2>
          <p className="text-center text-gray-500 mb-12">Fill in a form. Click generate. Done in 30 seconds.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="bg-gray-50 rounded-2xl p-7 relative">
                {f.badge && (
                  <span className="absolute top-4 right-4 bg-brand-500 text-white text-xs font-bold px-2 py-1 rounded-full">{f.badge}</span>
                )}
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 bg-orange-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">How it works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Pick your document", desc: "SWMS, quote, or client email. Then fill in the simple form about your job." },
              { step: "2", title: "Click generate", desc: "Our AI produces a complete, professional document in about 30 seconds." },
              { step: "3", title: "Copy and use it", desc: "Copy the text, paste it into Word, email it to your client, or print it and bring it to site." },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-14 h-14 bg-brand-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">{item.step}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">Simple pricing. No surprises.</h2>
          <p className="text-center text-gray-500 mb-12">All prices in AUD. Cancel anytime.</p>
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
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Common questions</h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full text-left px-6 py-4 font-semibold text-gray-900 flex items-center justify-between"
                >
                  {faq.q}
                  <span className="text-gray-400 ml-4">{openFaq === i ? "−" : "+"}</span>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-4 text-sm text-gray-600 leading-relaxed">{faq.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-brand-500 text-white text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to stop wasting time on paperwork?</h2>
        <p className="text-orange-100 mb-8 text-lg">Free to start. Takes 2 minutes to set up.</p>
        {isSignedIn ? (
          <Link href="/dashboard" className="bg-white text-brand-600 px-10 py-4 rounded-xl text-lg font-bold hover:bg-orange-50 transition shadow-lg inline-block">
            Go to Dashboard →
          </Link>
        ) : (
          <SignUpButton mode="modal">
            <button className="bg-white text-brand-600 px-10 py-4 rounded-xl text-lg font-bold hover:bg-orange-50 transition shadow-lg">
              Start for free →
            </button>
          </SignUpButton>
        )}
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-10 px-4 text-center text-sm">
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="text-xl">🔧</span>
          <span className="text-white font-bold text-lg">TradieDesk</span>
        </div>
        <p>Built for Australian tradies 🇦🇺</p>
        <p className="mt-2">© {new Date().getFullYear()} TradieDesk. All rights reserved.</p>
      </footer>
    </main>
  );
}

function PricingButton({ plan, cta, highlighted, isSignedIn }: { plan: string; cta: string; highlighted: boolean; isSignedIn: boolean }) {
  const [loading, setLoading] = useState(false);
  const base = highlighted
    ? "bg-brand-500 text-white hover:bg-brand-600"
    : "bg-gray-100 text-gray-700 hover:bg-gray-200";

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

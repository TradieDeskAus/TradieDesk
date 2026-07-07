import { NavActions } from "@/app/components/NavActions";
import { HeroCta } from "@/app/components/HeroCta";
import { CtaSignUp } from "@/app/components/CtaSignUp";
import { FaqAccordion } from "@/app/components/FaqAccordion";
import { PricingCards } from "@/app/components/PricingCards";

const PROMO_EXPIRES = new Date("2026-07-14T23:59:59+10:00");

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

export default function Home() {
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
            🎉 LAUNCH OFFER — Use code{" "}
            <span className="bg-white text-brand-600 px-2 py-0.5 rounded-md mx-1 font-extrabold tracking-wide">TRADIE2026</span>
            for 3 months free on the Pro plan. Only 50 spots, ends 14 July 2026!
          </span>
          <span className="bg-gray-900 text-white px-3 py-1 rounded-full text-xs sm:text-sm font-extrabold">Claim offer ↓</span>
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
            <NavActions />
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
          <p className="text-sm text-gray-400 mb-10">
            Used by electricians, plumbers, builders, roofers, landscapers, concretors, carpenters, painters, HVAC technicians, tilers and more...
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <HeroCta />
            <a href="#features" className="border-2 border-gray-200 text-gray-700 px-8 py-4 rounded-xl text-lg font-semibold hover:border-gray-400 transition">
              See how it works ↓
            </a>
          </div>
        </div>
      </section>

      {/* Pain points */}
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
          <PricingCards />
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Common questions</h2>
          <FaqAccordion />
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-brand-500 text-white text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to stop wasting time on paperwork?</h2>
        <p className="text-orange-100 mb-8 text-lg">Free to start. Takes 2 minutes to set up.</p>
        <CtaSignUp />
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

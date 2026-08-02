"use client";
import { useState, useEffect } from "react";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

type Tool = "swms" | "quote" | "email" | "review";
type EmailType = "follow_up" | "job_complete" | "variation" | "overdue_invoice" | "complaint_response" | "booking_confirm";

interface MaterialRow {
  description: string;
  qty: string;
  unitCost: string;
}

const TRADES = ["Electrician", "Plumber", "Builder / Carpenter", "Roofer", "Landscaper / Gardener", "Concretor", "Painter", "HVAC / Air Con", "Tiler", "Plasterer", "Other"];
const EMAIL_TYPES: { value: EmailType; label: string }[] = [
  { value: "follow_up", label: "Follow-up after quote" },
  { value: "job_complete", label: "Job completion notice" },
  { value: "variation", label: "Variation / price change" },
  { value: "overdue_invoice", label: "Overdue invoice reminder" },
  { value: "complaint_response", label: "Response to complaint" },
  { value: "booking_confirm", label: "Booking confirmation" },
];

export default function Dashboard() {
  const [activeTool, setActiveTool] = useState<Tool>("swms");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [usage, setUsage] = useState<{ plan: string; used: number; limit: number | null } | null>(null);
  const [upgraded, setUpgraded] = useState(false);

  // SWMS form
  const [swms, setSwms] = useState({ jobDescription: "", tradeType: "", location: "", numberOfWorkers: "1", equipment: "" });
  // Quote form
  const [quote, setQuote] = useState({ businessName: "", clientName: "", jobDescription: "", tradeType: "", estimatedHours: "", hourlyRate: "", gst: true });
  const [materials, setMaterials] = useState<MaterialRow[]>([{ description: "", qty: "1", unitCost: "" }]);

  function addMaterialRow() {
    setMaterials([...materials, { description: "", qty: "1", unitCost: "" }]);
  }

  function removeMaterialRow(index: number) {
    setMaterials(materials.filter((_, i) => i !== index));
  }

  function updateMaterial(index: number, field: keyof MaterialRow, value: string) {
    const updated = [...materials];
    updated[index] = { ...updated[index], [field]: value };
    setMaterials(updated);
  }

  function materialsTotal() {
    return materials.reduce((sum, m) => {
      const qty = parseFloat(m.qty) || 0;
      const cost = parseFloat(m.unitCost) || 0;
      return sum + qty * cost;
    }, 0);
  }
  // Email form
  const [email, setEmail] = useState({ emailType: "follow_up" as EmailType, businessName: "", clientName: "", jobDescription: "", extraDetails: "" });

  // Review & Referral form
  const [review, setReview] = useState({ clientName: "", clientEmail: "", businessName: "", jobDescription: "", googleReviewLink: "" });
  const [reviewSending, setReviewSending] = useState(false);
  const [reviewMessage, setReviewMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Referral link (shown in sidebar regardless of active tool)
  const [referral, setReferral] = useState<{ code: string; link: string; businessName: string | null; googleReviewLink: string | null } | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);

  useEffect(() => {
    fetch("/api/usage").then((r) => r.json()).then(setUsage);
    if (typeof window !== "undefined" && window.location.search.includes("upgraded=true")) {
      setUpgraded(true);
      setTimeout(() => setUpgraded(false), 5000);
    }
  }, [result]);

  useEffect(() => {
    fetch("/api/referral").then((r) => r.json()).then((data) => {
      if (data.code) setReferral(data);
    });
  }, []);

  useEffect(() => {
    if (!referral) return;
    setReview((r) => ({
      ...r,
      businessName: r.businessName || referral.businessName || "",
      googleReviewLink: r.googleReviewLink || referral.googleReviewLink || "",
    }));
  }, [referral]);

  async function generate() {
    setLoading(true);
    setResult("");
    let endpoint = "";
    let body: Record<string, unknown> = {};

    if (activeTool === "swms") { endpoint = "/api/generate/swms"; body = swms; }
    if (activeTool === "quote") {
      endpoint = "/api/generate/quote";
      const materialsText = materials
        .filter(m => m.description)
        .map(m => `${m.description} (qty: ${m.qty}, unit cost: $${m.unitCost}, total: $${((parseFloat(m.qty)||0)*(parseFloat(m.unitCost)||0)).toFixed(2)})`)
        .join(", ");
      body = { ...quote, materials: materialsText, materialsTotal: materialsTotal().toFixed(2) };
    }
    if (activeTool === "email") { endpoint = "/api/generate/email"; body = email; }

    try {
      const res = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      setResult(data.error ? `Error: ${data.error}` : data.content);
    } catch {
      setResult("Something went wrong. Please try again.");
    }
    setLoading(false);
  }

  async function copy() {
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function sendReviewRequest() {
    setReviewSending(true);
    setReviewMessage(null);
    try {
      const res = await fetch("/api/review-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(review),
      });
      const data = await res.json();
      if (!res.ok) {
        setReviewMessage({ type: "error", text: data.error || "Something went wrong. Please try again." });
      } else {
        setReviewMessage({ type: "success", text: `Sent to ${review.clientEmail}!` });
        setReview((r) => ({ ...r, clientName: "", clientEmail: "", jobDescription: "" }));
      }
    } catch {
      setReviewMessage({ type: "error", text: "Something went wrong. Please try again." });
    }
    setReviewSending(false);
  }

  async function copyLink() {
    if (!referral) return;
    await navigator.clipboard.writeText(referral.link);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  }

  const tools = [
    { id: "swms" as Tool, label: "SWMS", icon: "🦺", desc: "Safe Work Method Statement" },
    { id: "quote" as Tool, label: "Quote", icon: "📋", desc: "Job quote with pricing" },
    { id: "email" as Tool, label: "Email", icon: "✉️", desc: "Client communications" },
    { id: "review" as Tool, label: "Review & Referral", icon: "⭐", desc: "Ask for a review + get leads" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl">🔧</span>
            <span className="text-lg font-bold text-gray-900">TradieDesk</span>
          </Link>
          <div className="flex items-center gap-4">
            {usage && (
              <span className="text-xs text-gray-500 hidden sm:block">
                <span className="capitalize font-medium">{usage.plan}</span> plan
                {usage.limit && ` · ${usage.used}/${usage.limit} docs`}
              </span>
            )}
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>

      {upgraded && (
        <div className="bg-green-50 border-b border-green-200 text-green-800 text-sm text-center py-3 font-medium">
          🎉 You're now on the {usage?.plan} plan! Enjoy your extra documents.
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Sidebar */}
          <aside className="lg:col-span-1 space-y-4">

            {/* Tool selector */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Select tool</h3>
              <div className="space-y-2">
                {tools.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => { setActiveTool(t.id); setResult(""); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition text-left ${activeTool === t.id ? "bg-brand-50 border-2 border-brand-500" : "border-2 border-transparent hover:bg-gray-50"}`}
                  >
                    <span className="text-2xl">{t.icon}</span>
                    <div>
                      <div className={`text-sm font-semibold ${activeTool === t.id ? "text-brand-600" : "text-gray-900"}`}>{t.label}</div>
                      <div className="text-xs text-gray-400">{t.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Usage */}
            {usage && (
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">This month</h3>
                <p className="text-3xl font-bold text-gray-900">{usage.used}</p>
                <p className="text-sm text-gray-400 mb-3">
                  {usage.limit ? `of ${usage.limit} documents` : "unlimited documents"}
                </p>
                {usage.limit && (
                  <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
                    <div
                      className={`h-2 rounded-full transition-all ${(usage.used / usage.limit) > 0.8 ? "bg-red-400" : "bg-brand-500"}`}
                      style={{ width: `${Math.min((usage.used / usage.limit) * 100, 100)}%` }}
                    />
                  </div>
                )}
                {usage.plan !== "business" && (
                  <Link href="/#pricing" className="block text-center bg-brand-500 text-white py-2 rounded-lg text-sm font-semibold hover:bg-brand-600 transition">
                    Upgrade plan
                  </Link>
                )}
              </div>
            )}

            {/* Referral link — always visible, independent of active tool */}
            {referral && (
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Your referral link</h3>
                <p className="text-xs text-gray-500 mb-3">Share this so people who need a tradie can reach you directly.</p>
                <div className="flex items-center gap-2">
                  <input
                    readOnly
                    value={referral.link}
                    className="flex-1 min-w-0 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-600 bg-gray-50 truncate"
                  />
                  <button
                    onClick={copyLink}
                    className="shrink-0 text-xs bg-brand-500 text-white px-3 py-2 rounded-lg hover:bg-brand-600 transition font-semibold"
                  >
                    {linkCopied ? "✓" : "Copy"}
                  </button>
                </div>
              </div>
            )}
          </aside>

          {/* Main */}
          <main className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">

              {/* SWMS Form */}
              {activeTool === "swms" && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 mb-1">SWMS Generator</h2>
                    <p className="text-sm text-gray-500">Fill in the details below. Your SWMS will be ready in about 30 seconds.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Trade type *</label>
                    <select value={swms.tradeType} onChange={(e) => setSwms({ ...swms, tradeType: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
                      <option value="">Select your trade…</option>
                      {TRADES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">What is the job? *</label>
                    <textarea value={swms.jobDescription} onChange={(e) => setSwms({ ...swms, jobDescription: e.target.value })} rows={3} placeholder="e.g. Installing new switchboard in a residential home, including running new cable from meter box to distribution board" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Work location</label>
                      <input type="text" value={swms.location} onChange={(e) => setSwms({ ...swms, location: e.target.value })} placeholder="e.g. 42 Smith St, Sydney NSW" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Number of workers</label>
                      <input type="number" min="1" value={swms.numberOfWorkers} onChange={(e) => setSwms({ ...swms, numberOfWorkers: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Equipment & tools being used</label>
                    <input type="text" value={swms.equipment} onChange={(e) => setSwms({ ...swms, equipment: e.target.value })} placeholder="e.g. Angle grinder, ladder, power drill, multimeter" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
                  </div>
                </div>
              )}

              {/* Quote Form */}
              {activeTool === "quote" && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 mb-1">Quote Builder</h2>
                    <p className="text-sm text-gray-500">Fill in the details and get a professional quote with GST, terms and a sign-off section.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Your business name *</label>
                      <input type="text" value={quote.businessName} onChange={(e) => setQuote({ ...quote, businessName: e.target.value })} placeholder="e.g. Smith Electrical" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Client name *</label>
                      <input type="text" value={quote.clientName} onChange={(e) => setQuote({ ...quote, clientName: e.target.value })} placeholder="e.g. John Brown" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Trade type *</label>
                    <select value={quote.tradeType} onChange={(e) => setQuote({ ...quote, tradeType: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
                      <option value="">Select your trade…</option>
                      {TRADES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Describe the job *</label>
                    <textarea value={quote.jobDescription} onChange={(e) => setQuote({ ...quote, jobDescription: e.target.value })} rows={3} placeholder="e.g. Supply and install new hot water system, remove old unit, connect to existing copper pipes" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Estimated hours</label>
                      <input type="number" value={quote.estimatedHours} onChange={(e) => setQuote({ ...quote, estimatedHours: e.target.value })} placeholder="e.g. 4" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Your hourly rate ($)</label>
                      <input type="number" value={quote.hourlyRate} onChange={(e) => setQuote({ ...quote, hourlyRate: e.target.value })} placeholder="e.g. 120" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Materials / parts</label>
                    <div className="border border-gray-200 rounded-xl overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500">Description</th>
                            <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500 w-16">Qty</th>
                            <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500 w-24">Unit cost $</th>
                            <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500 w-20">Total</th>
                            <th className="w-8"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {materials.map((m, i) => (
                            <tr key={i} className="border-t border-gray-100">
                              <td className="px-2 py-1">
                                <input
                                  type="text"
                                  value={m.description}
                                  onChange={(e) => updateMaterial(i, "description", e.target.value)}
                                  placeholder="e.g. Copper pipe 20mm"
                                  className="w-full text-sm px-2 py-1.5 focus:outline-none"
                                />
                              </td>
                              <td className="px-2 py-1">
                                <input
                                  type="number"
                                  min="0"
                                  value={m.qty}
                                  onChange={(e) => updateMaterial(i, "qty", e.target.value)}
                                  className="w-full text-sm px-2 py-1.5 focus:outline-none"
                                />
                              </td>
                              <td className="px-2 py-1">
                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={m.unitCost}
                                  onChange={(e) => updateMaterial(i, "unitCost", e.target.value)}
                                  placeholder="0.00"
                                  className="w-full text-sm px-2 py-1.5 focus:outline-none"
                                />
                              </td>
                              <td className="px-2 py-1 text-sm text-gray-600 font-medium">
                                ${((parseFloat(m.qty)||0) * (parseFloat(m.unitCost)||0)).toFixed(2)}
                              </td>
                              <td className="px-2 py-1">
                                {materials.length > 1 && (
                                  <button onClick={() => removeMaterialRow(i)} className="text-gray-300 hover:text-red-400 text-lg leading-none">×</button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="border-t-2 border-gray-200 bg-gray-50">
                          <tr>
                            <td colSpan={3} className="px-3 py-2 text-sm font-bold text-gray-700 text-right">Materials total:</td>
                            <td className="px-2 py-2 text-sm font-bold text-gray-900">${materialsTotal().toFixed(2)}</td>
                            <td></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                    <button
                      onClick={addMaterialRow}
                      className="mt-2 text-sm text-brand-500 hover:text-brand-600 font-semibold"
                    >
                      + Add another item
                    </button>
                  </div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={quote.gst} onChange={(e) => setQuote({ ...quote, gst: e.target.checked })} className="w-4 h-4 accent-brand-500" />
                    <span className="text-sm font-semibold text-gray-700">Include GST (10%)</span>
                  </label>
                </div>
              )}

              {/* Email Form */}
              {activeTool === "email" && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 mb-1">Client Email Writer</h2>
                    <p className="text-sm text-gray-500">Pick the type of email and fill in the details. Sounds professional, takes 10 seconds.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">What type of email? *</label>
                    <div className="grid grid-cols-2 gap-2">
                      {EMAIL_TYPES.map((et) => (
                        <button
                          key={et.value}
                          onClick={() => setEmail({ ...email, emailType: et.value })}
                          className={`px-3 py-2 rounded-lg text-xs font-medium text-left transition border-2 ${email.emailType === et.value ? "border-brand-500 bg-brand-50 text-brand-700" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}
                        >
                          {et.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Your business name</label>
                      <input type="text" value={email.businessName} onChange={(e) => setEmail({ ...email, businessName: e.target.value })} placeholder="e.g. Smith Plumbing" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Client name</label>
                      <input type="text" value={email.clientName} onChange={(e) => setEmail({ ...email, clientName: e.target.value })} placeholder="e.g. Sarah Jones" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">What was the job? *</label>
                    <input type="text" value={email.jobDescription} onChange={(e) => setEmail({ ...email, jobDescription: e.target.value })} placeholder="e.g. Replacing bathroom tap fittings at 42 Smith St" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Any extra details?</label>
                    <textarea value={email.extraDetails} onChange={(e) => setEmail({ ...email, extraDetails: e.target.value })} rows={2} placeholder="e.g. Invoice is 2 weeks overdue, amount is $850" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
                  </div>
                </div>
              )}

              {/* Review & Referral Form */}
              {activeTool === "review" && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 mb-1">Review & Referral</h2>
                    <p className="text-sm text-gray-500">Job done? Send the client a quick thank-you that asks for a Google review and lets them pass your details to anyone who needs a tradie.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Your business name *</label>
                      <input type="text" value={review.businessName} onChange={(e) => setReview({ ...review, businessName: e.target.value })} placeholder="e.g. Smith Electrical" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Client name</label>
                      <input type="text" value={review.clientName} onChange={(e) => setReview({ ...review, clientName: e.target.value })} placeholder="e.g. John Brown" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Client email *</label>
                    <input type="email" value={review.clientEmail} onChange={(e) => setReview({ ...review, clientEmail: e.target.value })} placeholder="e.g. john@example.com" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">What was the job? *</label>
                    <input type="text" value={review.jobDescription} onChange={(e) => setReview({ ...review, jobDescription: e.target.value })} placeholder="e.g. Replacing bathroom tap fittings at 42 Smith St" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Your Google review link</label>
                    <input type="url" value={review.googleReviewLink} onChange={(e) => setReview({ ...review, googleReviewLink: e.target.value })} placeholder="Paste your Google Business review link" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
                    <p className="mt-1 text-xs text-gray-400">Find this in Google Business Profile → Get more reviews. Saved for next time.</p>
                  </div>

                  {reviewMessage && (
                    <p className={`text-sm font-medium ${reviewMessage.type === "success" ? "text-green-600" : "text-red-600"}`}>
                      {reviewMessage.text}
                    </p>
                  )}

                  <button
                    onClick={sendReviewRequest}
                    disabled={reviewSending}
                    className="w-full bg-brand-500 text-white py-4 rounded-xl font-bold text-lg hover:bg-brand-600 disabled:opacity-50 transition"
                  >
                    {reviewSending ? "Sending…" : "Send review request →"}
                  </button>
                </div>
              )}

              {activeTool !== "review" && (
              <button
                onClick={generate}
                disabled={loading}
                className="mt-6 w-full bg-brand-500 text-white py-4 rounded-xl font-bold text-lg hover:bg-brand-600 disabled:opacity-50 transition flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Generating your document…
                  </>
                ) : (
                  `Generate ${activeTool === "swms" ? "SWMS" : activeTool === "quote" ? "Quote" : "Email"} →`
                )}
              </button>
              )}
            </div>

            {/* Result */}
            {activeTool !== "review" && result && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900">Your document is ready</h3>
                  <div className="flex gap-2">
                    <button onClick={copy} className="text-xs bg-brand-500 text-white px-4 py-2 rounded-lg hover:bg-brand-600 transition font-semibold">
                      {copied ? "✓ Copied!" : "Copy all"}
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="text-xs bg-gray-100 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-200 transition font-semibold"
                    >
                      Print
                    </button>
                  </div>
                </div>
                <div className="prose-doc max-h-[600px] overflow-y-auto border border-gray-100 rounded-xl p-4 bg-gray-50">
                  <pre className="whitespace-pre-wrap text-sm text-gray-800 font-sans leading-relaxed">{result}</pre>
                </div>
                <p className="mt-3 text-xs text-gray-400">Tip: Click "Copy all" then paste into Microsoft Word to format and add your logo.</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

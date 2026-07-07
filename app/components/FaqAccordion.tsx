"use client";
import { useState } from "react";

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

export function FaqAccordion() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  return (
    <div className="space-y-3">
      {faqs.map((faq, i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <button
            onClick={() => setOpenFaq(openFaq === i ? null : i)}
            className="w-full text-left px-6 py-4 font-semibold text-gray-900 flex items-center justify-between"
            aria-expanded={openFaq === i}
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
  );
}

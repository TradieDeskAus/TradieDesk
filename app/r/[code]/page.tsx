import Link from "next/link";
import { getReferralByCode } from "@/lib/referrals";
import { ReferralContactForm } from "@/app/components/ReferralContactForm";

export default async function ReferralPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const referral = await getReferralByCode(code);

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <span className="text-2xl">🔧</span>
          <span className="text-lg font-bold text-gray-900">TradieDesk</span>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          {referral ? (
            <>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Get in touch with {referral.businessName || "this tradie"}
              </h1>
              <p className="text-sm text-gray-500 mb-6">
                Fill in your details below and they'll be in touch soon.
              </p>
              <ReferralContactForm code={code} />
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">This link isn't valid</h1>
              <p className="text-sm text-gray-500 mb-6">
                It may have expired or been typed incorrectly.
              </p>
              <Link
                href="/"
                className="block text-center bg-brand-500 text-white py-3 rounded-xl font-semibold hover:bg-brand-600 transition"
              >
                Visit TradieDesk
              </Link>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

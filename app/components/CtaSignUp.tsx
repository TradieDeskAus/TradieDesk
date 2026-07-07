"use client";
import Link from "next/link";
import { SignUpButton, useUser } from "@clerk/nextjs";

export function CtaSignUp() {
  const { isSignedIn } = useUser();
  return isSignedIn ? (
    <Link href="/dashboard" className="bg-white text-brand-600 px-10 py-4 rounded-xl text-lg font-bold hover:bg-orange-50 transition shadow-lg inline-block">
      Go to Dashboard →
    </Link>
  ) : (
    <SignUpButton mode="modal">
      <button className="bg-white text-brand-600 px-10 py-4 rounded-xl text-lg font-bold hover:bg-orange-50 transition shadow-lg">
        Start for free →
      </button>
    </SignUpButton>
  );
}

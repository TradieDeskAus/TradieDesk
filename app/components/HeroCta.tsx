"use client";
import Link from "next/link";
import { SignUpButton, useUser } from "@clerk/nextjs";

export function HeroCta() {
  const { isSignedIn } = useUser();
  return isSignedIn ? (
    <Link href="/dashboard" className="bg-brand-500 text-white px-8 py-4 rounded-xl text-lg font-bold hover:bg-brand-600 transition shadow-lg">
      Go to Dashboard →
    </Link>
  ) : (
    <SignUpButton mode="modal">
      <button className="bg-brand-500 text-white px-8 py-4 rounded-xl text-lg font-bold hover:bg-brand-600 transition shadow-lg">
        Try free — no card needed
      </button>
    </SignUpButton>
  );
}

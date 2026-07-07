"use client";
import Link from "next/link";
import { SignInButton, SignUpButton, useUser } from "@clerk/nextjs";

export function NavActions() {
  const { isSignedIn } = useUser();
  return isSignedIn ? (
    <Link href="/dashboard" className="bg-brand-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-brand-600 transition">
      Dashboard
    </Link>
  ) : (
    <>
      <SignInButton mode="modal">
        <button className="text-sm text-gray-600 hover:text-gray-900">Sign in</button>
      </SignInButton>
      <SignUpButton mode="modal">
        <button className="bg-brand-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-brand-600 transition">Try free</button>
      </SignUpButton>
    </>
  );
}

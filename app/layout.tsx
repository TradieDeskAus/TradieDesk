import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TradieDesk — SWMS, Quotes & Emails for Australian Tradies",
  description: "Generate compliant SWMS documents, professional quotes, and client emails in seconds. Built for Australian tradies.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en-AU">
        <body className={inter.className}>{children}</body>
      </html>
    </ClerkProvider>
  );
}

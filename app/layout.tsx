import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TradieDesk — SWMS, Quotes & Emails for Australian Tradies",
  description: "Generate compliant SWMS documents, professional quotes, and client emails in seconds. Built for Australian tradies.",
  metadataBase: new URL("https://tradiedeskapp.com.au"),
  openGraph: {
    title: "TradieDesk — Stop wasting hours on tradie paperwork",
    description: "Generate compliant SWMS, professional quotes, and client emails in 30 seconds. Free to start. Built for Australian tradies.",
    url: "https://tradiedeskapp.com.au",
    siteName: "TradieDesk",
    locale: "en_AU",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TradieDesk — SWMS, Quotes & Emails for Australian Tradies",
    description: "Generate compliant SWMS, professional quotes, and client emails in 30 seconds. Free to start.",
  },
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

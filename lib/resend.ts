import { Resend } from "resend";

// Resend's constructor throws immediately if given an empty/undefined key
// (unlike Stripe's, which only fails on actual use) — this would crash the
// whole Next.js build before RESEND_API_KEY is ever configured. Fall back to
// a placeholder so the module loads; a missing real key still surfaces as a
// clean, handled send error at call time, not a build-time crash.
export const resend = new Resend(process.env.RESEND_API_KEY || "re_not_configured");

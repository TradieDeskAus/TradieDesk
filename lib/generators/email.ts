import { anthropic } from "@/lib/anthropic";
import { sanitize } from "@/lib/sanitize";

export const EMAIL_TYPES = [
  "follow_up",
  "job_complete",
  "variation",
  "overdue_invoice",
  "complaint_response",
  "booking_confirm",
  "review_referral",
] as const;

export type EmailType = (typeof EMAIL_TYPES)[number];

const EMAIL_LABELS: Record<EmailType, string> = {
  follow_up: "Follow-up after quote",
  job_complete: "Job completion notice",
  variation: "Variation / price change notice",
  overdue_invoice: "Overdue invoice reminder",
  complaint_response: "Response to a complaint",
  booking_confirm: "Booking confirmation",
  review_referral: "Review request & referral",
};

export interface EmailInput {
  emailType: EmailType;
  businessName: string;
  clientName: string;
  jobDescription: string;
  extraDetails: string;
  // Only used when emailType === "review_referral" — sent automatically,
  // not shown for copy/paste like the other six types.
  googleReviewLink?: string;
  referralLink?: string;
}

export function parseEmailInput(raw: Record<string, unknown>): EmailInput | null {
  const emailType = raw.emailType as EmailType;
  if (!EMAIL_TYPES.includes(emailType)) return null;

  const input: EmailInput = {
    emailType,
    businessName: sanitize(raw.businessName),
    clientName: sanitize(raw.clientName),
    jobDescription: sanitize(raw.jobDescription),
    extraDetails: sanitize(raw.extraDetails),
  };

  if (!input.jobDescription) return null;
  return input;
}

function buildReviewReferralPrompt(input: EmailInput): string {
  const linkLines = [
    input.googleReviewLink ? `Google review link: ${input.googleReviewLink}` : null,
    input.referralLink ? `Referral link (for the client to pass on to anyone who needs a tradie): ${input.referralLink}` : null,
  ].filter(Boolean).join("\n");

  return `You are writing a short, warm email on behalf of an Australian tradie/trade business to a client whose job has just been completed. This email will be sent automatically — it will NOT be reviewed or edited by a human before sending.

Business: ${input.businessName}
Client: ${input.clientName}
Job just completed: ${input.jobDescription}
${linkLines}

Write an email that:
- Thanks the client warmly for their business, mentioning the job briefly
- ${input.googleReviewLink ? "Asks them to leave a quick Google review using the review link — make it easy and low-pressure" : "Thanks them for their business"}
- ${input.referralLink ? "Mentions that if they know anyone else who needs a tradie, they can pass along the referral link" : ""}
- Sounds like a real Australian tradie, not a corporate robot — warm, brief, genuine
- Uses Australian English and spelling

CRITICAL OUTPUT FORMAT — this will be parsed by code, not read directly by a human:
- The very first line must be exactly: SUBJECT: <the subject line text>
- Then one blank line
- Then the email body only — no other labels, headers, or commentary anywhere in your response`;
}

export async function generateEmail(input: EmailInput): Promise<string> {
  const prompt = input.emailType === "review_referral"
    ? buildReviewReferralPrompt(input)
    : `You are writing a professional email on behalf of an Australian tradie/trade business.

Business: ${input.businessName}
Client: ${input.clientName}
Email Type: ${EMAIL_LABELS[input.emailType]}
Job: ${input.jobDescription}
Additional details: ${input.extraDetails}

Write a professional, friendly email that:
- Sounds like a real Australian trade professional (not a corporate robot)
- Is direct and easy to read
- Gets to the point quickly
- Maintains a professional but approachable tone
- Uses Australian English and spelling

Include:
- Subject line
- Greeting
- Clear main message
- Any relevant next steps or action required
- Professional sign-off with placeholder for name, business name, phone number

Keep it concise — tradies and their clients are busy people.`;

  const message = await anthropic.messages.create({
    model: "claude-opus-4-8",
    max_tokens: 1000,
    messages: [{ role: "user", content: prompt }],
  });

  return message.content
    .filter((b) => b.type === "text")
    .map((b) => (b as { type: "text"; text: string }).text)
    .join("");
}

/** Splits generateEmail's output for emailType "review_referral" into subject/body. */
export function parseSubjectAndBody(raw: string): { subject: string; body: string } {
  const match = raw.match(/^SUBJECT:\s*(.+?)\r?\n\r?\n([\s\S]*)$/);
  if (!match) {
    return { subject: "Thanks for choosing us!", body: raw.trim() };
  }
  return { subject: match[1].trim(), body: match[2].trim() };
}

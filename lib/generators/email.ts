import { anthropic } from "@/lib/anthropic";
import { sanitize } from "@/lib/sanitize";

export const EMAIL_TYPES = [
  "follow_up",
  "job_complete",
  "variation",
  "overdue_invoice",
  "complaint_response",
  "booking_confirm",
] as const;

export type EmailType = (typeof EMAIL_TYPES)[number];

const EMAIL_LABELS: Record<EmailType, string> = {
  follow_up: "Follow-up after quote",
  job_complete: "Job completion notice",
  variation: "Variation / price change notice",
  overdue_invoice: "Overdue invoice reminder",
  complaint_response: "Response to a complaint",
  booking_confirm: "Booking confirmation",
};

export interface EmailInput {
  emailType: EmailType;
  businessName: string;
  clientName: string;
  jobDescription: string;
  extraDetails: string;
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

export async function generateEmail(input: EmailInput): Promise<string> {
  const prompt = `You are writing a professional email on behalf of an Australian tradie/trade business.

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

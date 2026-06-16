import Anthropic from "@anthropic-ai/sdk";

export const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

// ── SWMS ────────────────────────────────────────────────────────────────────

export interface SwmsInput {
  jobDescription: string;
  tradeType: string;
  location: string;
  numberOfWorkers: string;
  equipment: string;
}

export async function generateSwms(input: SwmsInput): Promise<string> {
  const prompt = `You are an expert Australian workplace health and safety consultant. Generate a fully compliant Safe Work Method Statement (SWMS) following Safe Work Australia guidelines and the Work Health and Safety Act 2011.

Job Details:
- Trade: ${input.tradeType}
- Job Description: ${input.jobDescription}
- Work Location: ${input.location}
- Number of Workers: ${input.numberOfWorkers}
- Equipment/Tools: ${input.equipment}

Generate a complete, professional SWMS document with the following sections:

1. DOCUMENT HEADER
   - Company name: [Company Name] (leave as placeholder)
   - Job/Project name
   - Date prepared: ${new Date().toLocaleDateString("en-AU")}
   - Document number: SWMS-001
   - Review date (12 months from today)

2. SCOPE OF WORK
   Detailed description of the work to be carried out.

3. LEGISLATION & STANDARDS
   List the relevant Australian legislation, codes of practice and Australian Standards that apply to this work.

4. PERSONS CONDUCTING THE WORK
   Roles and responsibilities table.

5. PLANT, EQUIPMENT & MATERIALS
   Table listing all equipment, tools and materials with inspection requirements.

6. RISK ASSESSMENT TABLE
   For each work step, provide a table with columns:
   - Work Step (number each step)
   - Hazards Identified
   - Initial Risk Rating (Likelihood x Consequence = Risk: Low/Medium/High/Extreme)
   - Control Measures (using hierarchy of controls: Eliminate, Substitute, Isolate, Engineer, Administrative, PPE)
   - Residual Risk Rating
   - Person Responsible

   Include at least 8-10 specific work steps relevant to this job.

7. PERSONAL PROTECTIVE EQUIPMENT (PPE)
   Table of required PPE with standards (e.g. AS/NZS 1800 for hard hats).

8. EMERGENCY PROCEDURES
   - Emergency contact numbers (000, local hospital)
   - First aid procedures
   - Incident reporting procedure
   - Emergency evacuation procedure

9. CONSULTATION
   Statement that workers have been consulted in the development of this SWMS.

10. SIGN-OFF TABLE
    Table with columns: Name | Role | Signature | Date
    Include 5 blank rows for worker sign-off.

Format the document clearly with proper headings. Use Australian English. Make it look professional and legally sound. This document must be ready to print and use on site.`;

  const message = await anthropic.messages.create({
    model: "claude-opus-4-8",
    max_tokens: 4000,
    thinking: { type: "adaptive" },
    messages: [{ role: "user", content: prompt }],
  });

  return message.content
    .filter((b) => b.type === "text")
    .map((b) => (b as { type: "text"; text: string }).text)
    .join("");
}

// ── QUOTE ───────────────────────────────────────────────────────────────────

export interface QuoteInput {
  businessName: string;
  clientName: string;
  jobDescription: string;
  tradeType: string;
  estimatedHours: string;
  hourlyRate: string;
  materials: string;
  gst: boolean;
}

export async function generateQuote(input: QuoteInput): Promise<string> {
  const prompt = `You are an expert Australian tradesperson. Generate a professional, detailed job quote document.

Business: ${input.businessName}
Client: ${input.clientName}
Trade: ${input.tradeType}
Job Description: ${input.jobDescription}
Estimated Hours: ${input.estimatedHours}
Hourly Rate: $${input.hourlyRate}/hr
Materials/Parts: ${input.materials}
GST Applicable: ${input.gst ? "Yes (10%)" : "No"}
Quote Date: ${new Date().toLocaleDateString("en-AU")}
Quote Valid For: 30 days

Generate a complete professional quote document with:

1. QUOTE HEADER
   - ${input.businessName} letterhead style
   - ABN: [ABN] (placeholder)
   - Quote number: Q-${Date.now().toString().slice(-5)}
   - Date and expiry

2. CLIENT DETAILS
   - Addressed to ${input.clientName}

3. SCOPE OF WORK
   Detailed breakdown of exactly what work will be carried out. Be specific and professional.

4. ITEMISED PRICING TABLE
   Break down into:
   - Labour (hours × rate)
   - Materials (itemised list based on: ${input.materials})
   - Call-out fee if applicable
   - Subtotal
   ${input.gst ? "- GST (10%)\n   - TOTAL (inc. GST)" : "- TOTAL"}

5. TERMS & CONDITIONS
   Include:
   - Payment terms (deposit required, final payment on completion)
   - What is and isn't included
   - Variations policy
   - Warranty on workmanship (standard Australian consumer law)
   - Access requirements

6. ACCEPTANCE SECTION
   Signature line for client to accept the quote.

Use Australian English. Format professionally. Make it look like it came from an established, professional trade business.`;

  const message = await anthropic.messages.create({
    model: "claude-opus-4-8",
    max_tokens: 2500,
    thinking: { type: "adaptive" },
    messages: [{ role: "user", content: prompt }],
  });

  return message.content
    .filter((b) => b.type === "text")
    .map((b) => (b as { type: "text"; text: string }).text)
    .join("");
}

// ── EMAIL ───────────────────────────────────────────────────────────────────

export type EmailType =
  | "follow_up"
  | "job_complete"
  | "variation"
  | "overdue_invoice"
  | "complaint_response"
  | "booking_confirm";

export interface EmailInput {
  emailType: EmailType;
  businessName: string;
  clientName: string;
  jobDescription: string;
  extraDetails: string;
}

const EMAIL_LABELS: Record<EmailType, string> = {
  follow_up: "Follow-up after quote",
  job_complete: "Job completion notice",
  variation: "Variation / price change notice",
  overdue_invoice: "Overdue invoice reminder",
  complaint_response: "Response to a complaint",
  booking_confirm: "Booking confirmation",
};

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

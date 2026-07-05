import { anthropic } from "@/lib/anthropic";
import { sanitize } from "@/lib/sanitize";

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

export function parseQuoteInput(raw: Record<string, unknown>): QuoteInput | null {
  const input: QuoteInput = {
    businessName: sanitize(raw.businessName),
    clientName: sanitize(raw.clientName),
    jobDescription: sanitize(raw.jobDescription),
    tradeType: sanitize(raw.tradeType),
    estimatedHours: sanitize(raw.estimatedHours),
    hourlyRate: sanitize(raw.hourlyRate),
    materials: sanitize(raw.materials),
    gst: raw.gst === true,
  };
  if (!input.jobDescription || !input.tradeType) return null;

  const hours = parseFloat(input.estimatedHours);
  const rate = parseFloat(input.hourlyRate);
  if (input.estimatedHours && (isNaN(hours) || hours < 0 || hours > 10000)) return null;
  if (input.hourlyRate && (isNaN(rate) || rate < 0 || rate > 100000)) return null;

  return input;
}

export async function generateQuote(input: QuoteInput): Promise<string> {
  const today = new Date().toLocaleDateString("en-AU");
  const quoteNum = `Q-${Date.now().toString().slice(-5)}`;
  const prompt = `You are an expert Australian tradesperson. Generate a professional, detailed job quote document.

Business: ${input.businessName}
Client: ${input.clientName}
Trade: ${input.tradeType}
Job Description: ${input.jobDescription}
Estimated Hours: ${input.estimatedHours}
Hourly Rate: $${input.hourlyRate}/hr
Materials/Parts: ${input.materials}
GST Applicable: ${input.gst ? "Yes (10%)" : "No"}
Quote Date: ${today}
Quote Valid For: 30 days

Generate a complete professional quote document with:

1. QUOTE HEADER
   - ${input.businessName} letterhead style
   - ABN: [ABN] (placeholder)
   - Quote number: ${quoteNum}
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
    messages: [{ role: "user", content: prompt }],
  });

  return message.content
    .filter((b) => b.type === "text")
    .map((b) => (b as { type: "text"; text: string }).text)
    .join("");
}

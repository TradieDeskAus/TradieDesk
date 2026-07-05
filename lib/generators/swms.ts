import { anthropic } from "@/lib/anthropic";
import { sanitize } from "@/lib/sanitize";

export interface SwmsInput {
  jobDescription: string;
  tradeType: string;
  location: string;
  numberOfWorkers: string;
  equipment: string;
}

export function parseSwmsInput(raw: Record<string, unknown>): SwmsInput | null {
  const input: SwmsInput = {
    jobDescription: sanitize(raw.jobDescription),
    tradeType: sanitize(raw.tradeType),
    location: sanitize(raw.location),
    numberOfWorkers: sanitize(raw.numberOfWorkers),
    equipment: sanitize(raw.equipment),
  };
  if (!input.jobDescription || !input.tradeType) return null;
  return input;
}

export async function generateSwms(input: SwmsInput): Promise<string> {
  const today = new Date().toLocaleDateString("en-AU");
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
   - Date prepared: ${today}
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
    messages: [{ role: "user", content: prompt }],
  });

  return message.content
    .filter((b) => b.type === "text")
    .map((b) => (b as { type: "text"; text: string }).text)
    .join("");
}

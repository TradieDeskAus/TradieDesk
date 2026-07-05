import { withGenerateGuard } from "@/lib/generate-guard";
import { generateQuote, parseQuoteInput } from "@/lib/generators";

export const POST = withGenerateGuard("quote", parseQuoteInput, generateQuote);

import { withGenerateGuard } from "@/lib/generate-guard";
import { generateEmail, parseEmailInput } from "@/lib/generators";

export const POST = withGenerateGuard("email", parseEmailInput, generateEmail);

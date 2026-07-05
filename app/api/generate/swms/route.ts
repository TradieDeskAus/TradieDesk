import { withGenerateGuard } from "@/lib/generate-guard";
import { generateSwms, parseSwmsInput } from "@/lib/generators";

export const POST = withGenerateGuard("swms", parseSwmsInput, generateSwms);

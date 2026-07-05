import { MAX_FIELD_LENGTH } from "@/lib/constants";

export function sanitize(value: unknown): string {
  if (typeof value !== "string") return "";
  return value
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    .slice(0, MAX_FIELD_LENGTH)
    .trim();
}

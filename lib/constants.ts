export const DOC_TYPES = ["swms", "quote", "email"] as const;
export type DocType = (typeof DOC_TYPES)[number];

export const PLAN_NAMES = ["starter", "pro", "business"] as const;
export type PlanName = (typeof PLAN_NAMES)[number];

export const MAX_FIELD_LENGTH = 2000;

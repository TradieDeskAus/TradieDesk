export const DOC_TYPES = ["swms", "quote", "email"] as const;
export type DocType = (typeof DOC_TYPES)[number];

export const PLAN_NAMES = ["starter", "pro", "business"] as const;
export type PlanName = (typeof PLAN_NAMES)[number];

export const MAX_FIELD_LENGTH = 2000;

// Review request + referral link feature — deliberately NOT part of DOC_TYPES/usage
// quota, so it can't eat into a Starter tradie's small monthly document allowance.
export const MAX_REVIEW_REQUESTS_PER_MONTH = 50;

export const ALLOWED_REVIEW_LINK_HOSTS = [
  "google.com",
  "g.page",
  "goo.gl",
  "maps.app.goo.gl",
];

export const REVIEW_REQUEST_FROM_EMAIL = "reviews@tradiedeskapp.com.au";

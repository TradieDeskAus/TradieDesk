-- Run this in Supabase SQL Editor

create table if not exists subscriptions (
  user_id text primary key,
  plan text not null default 'starter',
  stripe_customer_id text,
  stripe_subscription_id text,
  updated_at timestamptz default now()
);

create table if not exists usage (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  doc_type text not null,
  created_at timestamptz default now()
);

create index if not exists usage_user_month on usage(user_id, created_at);

alter table subscriptions enable row level security;
alter table usage enable row level security;

-- Review request + lead-capture referral link

create table if not exists referrals (
  user_id text primary key,
  code text not null unique,
  business_name text,
  google_review_link text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists review_requests (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  client_email text not null,
  status text not null default 'sent',
  resend_message_id text,
  created_at timestamptz default now()
);

create index if not exists review_requests_user_month on review_requests(user_id, created_at);

create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  referral_code text not null,
  name text not null,
  contact text not null,
  message text,
  created_at timestamptz default now()
);

create index if not exists leads_code_recent on leads(referral_code, created_at);

alter table referrals enable row level security;
alter table review_requests enable row level security;
alter table leads enable row level security;

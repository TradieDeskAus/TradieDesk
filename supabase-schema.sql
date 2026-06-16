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

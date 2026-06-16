# TradieDesk — Setup Guide

## 1. Install Node.js
Download from nodejs.org (LTS). Verify with `node -v` in a new terminal.

## 2. Install dependencies
```
cd "D:\Hunt Central\Hunt Central product data\tradiedesk"
npm install
```

## 3. Set up accounts

### Anthropic — console.anthropic.com
- Create API key

### Clerk — clerk.com
- Create app → copy Publishable Key + Secret Key

### Stripe — stripe.com (set currency to AUD)
- Create product "TradieDesk Pro" → $49 AUD/month → copy Price ID
- Create product "TradieDesk Business" → $99 AUD/month → copy Price ID
- Copy Secret Key + Publishable Key from Developers → API Keys

### Supabase — supabase.com
- Create project → SQL Editor → paste supabase-schema.sql → Run
- Copy Project URL + service_role key from Settings → API

## 4. Configure environment
```
copy .env.local.example .env.local
```
Fill in all values in .env.local

## 5. Run locally
```
npm run dev
```
Open http://localhost:3000

## 6. Deploy to Vercel
1. Push to GitHub
2. Import to vercel.com
3. Add all env vars from .env.local
4. Deploy → get your live URL

## 7. Stripe webhook
Stripe Dashboard → Developers → Webhooks → Add endpoint:
- URL: https://your-app.vercel.app/api/stripe/webhook
- Events: checkout.session.completed, customer.subscription.deleted
- Copy signing secret → add as STRIPE_WEBHOOK_SECRET in Vercel

## Revenue
- Pro: $49 AUD/mo × 100 users = $4,900/mo
- Business: $99 AUD/mo × 50 users = $4,950/mo
- Claude cost per user: ~$0.50-2.00/mo
- Margin: ~97%

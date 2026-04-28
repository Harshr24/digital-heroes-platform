# Digital Heroes Platform

Production-ready full-stack app for subscription golf scores, monthly draws, and charity contributions.

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind CSS + Framer Motion
- Supabase (PostgreSQL, Auth, Storage-ready integration)
- Stripe subscriptions + webhook synchronization
- Vercel deployment configuration

## Phase Coverage

1. Architecture and modular folder structure
2. Supabase SQL schema with RLS (`supabase/schema.sql`)
3. API routes and service layer in `src/lib/services`
4. Auth flows and route protection (`src/proxy.ts`)
5. Stripe checkout + webhook sync
6. Score, draw, charity, and winner verification workflows
7. Admin dashboard and draw controls
8. Mobile-first animated UI
9. Notification service abstraction (`src/lib/notifications.ts`)
10. Validation and server guards
11. Build/lint readiness and edge-safe routes
12. Deployment files (`vercel.json`, `.env.example`)

## Local Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Key Routes

- `/` Marketing landing page
- `/signup` and `/login`
- `/dashboard` User dashboard
- `/admin` Admin control panel
- `/charities` Charity directory
- `/leaderboard` Bonus feature

## Database Setup

1. Open Supabase SQL editor
2. Execute `supabase/schema.sql`
3. Seed `charities` and create one admin row in `users`

## Deployment

- Import repository to Vercel
- Add all environment variables from `.env.example`
- Configure Stripe webhook endpoint:
  - `https://<your-domain>/api/webhooks/stripe`

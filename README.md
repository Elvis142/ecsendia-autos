# Ecsendia Autos — Car Inventory & AI Sourcing Platform

A full-stack car dealership website with public inventory browsing, admin dashboard, and AI-powered Facebook Marketplace sourcing. Currency: Nigerian Naira (₦).

## Tech Stack

- **Framework**: Next.js 14 (App Router, TypeScript)
- **Database**: Prisma 7 + PostgreSQL (Supabase)
- **Auth**: NextAuth.js v4
- **Storage**: Supabase Storage (car photos)
- **Email**: Resend
- **AI Agent**: Playwright (browser automation for FB Marketplace)
- **AI Scoring**: Anthropic Claude (haiku)
- **Scheduling**: node-cron

---

## Quick Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
```bash
cp .env.example .env
```
Fill in all values in `.env` — see `.env.example` for descriptions.

### 3. Supabase Storage Setup
1. Go to Supabase Dashboard → Storage
2. Create a bucket named `car-photos` (set to Public)
3. Add service role policy for writes

### 4. Run Database Migration
```bash
npm run db:push
```

### 5. Seed Initial Data
```bash
npm run db:seed
```
Creates admin user: `admin@ecsendiautos.com` / `admin123`

**Change the password immediately after first login!**

### 6. Start Development
```bash
npm run dev
```
- Public site: http://localhost:3000
- Admin panel: http://localhost:3000/admin

---

## Features

### Public Site
- Home page with featured cars and how-it-works
- Inventory listing with filters (make, price, year, mileage, body type, transmission, fuel, drive, condition, status)
- Car detail pages with photo gallery, full specs, JSON-LD schema
- Inquiry form (tied to specific vehicle, email notification to admin)
- Contact, About, Privacy, Terms pages
- Dynamic sitemap.xml

### Admin Dashboard
- **Dashboard**: Stats overview + recent activity
- **Inventory**: Full CRUD with photo upload (drag-drop, reorder, set main photo)
- **Inquiries**: View all inquiries, update status, export CSV
- **AI Sourcing**: Facebook Marketplace agent with approval queue
- **Settings**: Account management

### AI Sourcing (Facebook Marketplace)
1. Configure search in Admin → AI Sourcing → Settings
2. Paste Facebook session cookies (JSON)
3. Set filters: location, budget ₦, year, mileage, keywords
4. Run manually or schedule daily
5. Review suggestions with Opportunity Scores (0-100)
6. Approve → creates draft listing for editing before publish

---

## Commands
```bash
npm run dev          # Development server
npm run build        # Production build
npm run db:push      # Push schema to database
npm run db:migrate   # Run migrations
npm run db:seed      # Seed sample data + admin user
npm run db:studio    # Open Prisma Studio
npm run db:generate  # Regenerate Prisma client
```

---

## Environment Variables

See `.env.example` for all required variables:
- `DATABASE_URL` — Supabase PostgreSQL connection string
- `DIRECT_URL` — Supabase direct connection (for migrations)
- `NEXTAUTH_SECRET` — Random 32-char secret (`openssl rand -base64 32`)
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role key
- `RESEND_API_KEY` — Resend email API key
- `ADMIN_EMAIL` — Where inquiry notifications go
- `ANTHROPIC_API_KEY` — Claude API key for AI scoring

---

## Deployment (Vercel)
```bash
vercel
```
Add all env vars in Vercel dashboard. Update `NEXTAUTH_URL` and `NEXT_PUBLIC_SITE_URL` to your production domain.

---

**Default Admin**: `admin@ecsendiautos.com` / `admin123` — change immediately!

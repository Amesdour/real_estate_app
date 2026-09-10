# Terraço — Real Estate & Reservation Management (Web)

A Next.js app for browsing property listings and placing a time-limited,
fee-backed reservation hold on one — the core "reserve before someone else
does" flow from the original spec, built and working end to end.

## What this is

- Public property listings (house/apartment/villa/land/commercial) with a
  detail page per listing
- Email/password accounts with roles (`AGENT`, `PROPERTY_OWNER`,
  `BUYER_TENANT`, `SUPER_ADMIN`)
- Agents/owners can submit a listing (goes in as `PENDING_APPROVAL`)
- Buyers can place a **15-minute hold** on an `AVAILABLE` property, which
  blocks other buyers from reserving it until the hold is confirmed,
  cancelled, or it expires and the property reopens automatically
- A demo-mode payment step standing in for the reservation-fee charge (see
  "What's stubbed" below — this is the one piece that is intentionally not a
  real integration)

## Stack

Next.js 14 (App Router, Server Components + Route Handlers) · TypeScript ·
Tailwind CSS · Prisma ORM · PostgreSQL · JWT-in-httpOnly-cookie auth with
bcrypt password hashing.

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```
   This also runs `prisma generate` automatically via Prisma's postinstall
   hook. If it doesn't for any reason, run it yourself: `npx prisma generate`.

2. **Start a database.** Either:
   - Local, via the included `docker-compose.yml`:
     ```bash
     docker compose up -d
     ```
     This matches the `DATABASE_URL` already in `.env.example` — no changes
     needed.
   - Or a hosted free-tier Postgres (Neon, Supabase, or Railway all work) —
     paste their connection string into `DATABASE_URL` instead.

3. **Copy the environment file and fill it in**
   ```bash
   cp .env.example .env
   ```
   - `DATABASE_URL` — see step 2
   - `JWT_SECRET` — generate one: `openssl rand -base64 32`
   - `STRIPE_SECRET_KEY` — optional, leave as the placeholder to stay in
     demo mode (see below)

4. **Run migrations and seed demo data**
   ```bash
   npx prisma migrate dev --name init
   npm run seed
   ```
   Seeds two accounts (password `password123` for both):
   - `agent@example.com` (role `AGENT`, can list properties)
   - `buyer@example.com` (role `BUYER_TENANT`, can place holds)

   ...and three sample listings.

## Running locally

```bash
npm run dev
```
Open http://localhost:3000.

## What's stubbed vs. production-ready

Said plainly, so "looks done" doesn't get mistaken for "is done":

- **Payments are demo-mode by default.** With no `STRIPE_SECRET_KEY` set,
  confirming a reservation just flips its status — no card is charged, and
  the UI says so explicitly. Setting a real Stripe **test** secret key makes
  `lib/payments.ts` create a real PaymentIntent, but the client-side
  Stripe.js/Elements confirmation UI and a webhook handler that verifies the
  charge before trusting a "confirmed" reservation are **not** built here —
  a real payment integration should never let the client alone decide a
  reservation is paid.
- **Hold expiry** is enforced two ways: lazily (checked whenever a reservation
  or property is read) and via `npm run expire-holds`, a standalone script
  meant to run on a schedule (cron, or your host's scheduled-jobs feature)
  every minute or so. Nothing currently runs that on a timer for you.
- **No PostGIS / geospatial search.** Latitude/longitude are stored as plain
  floats with a basic index; there's no radius or "properties near me" query.
  Adding the `postgis` extension and a `geography` column is the natural next
  step if that's needed.
- **No file uploads.** Listing images are pasted URLs, not an S3/R2 upload
  pipeline. `PropertyImage`/`PropertyDocument` models exist and are ready for
  one.
- **No admin approval UI.** New listings go in as `PENDING_APPROVAL` per the
  schema, but there's no screen to review and publish them — that's a
  straightforward CRUD page against the existing `Property` model, just not
  built yet. In the meantime you can flip a listing to `AVAILABLE` directly
  in `npx prisma studio`.
- **No email verification or password reset.** `isVerified` exists on `User`
  but nothing sets it.
- **Mobile app and GraphQL/NestJS layer are out of scope for this build.**
  The original spec called for a React Native app and a separate GraphQL API
  in front of the same data. This build is the web app only, on Next.js
  Server Actions/Route Handlers rather than a standalone GraphQL service —
  building a real Expo app and a NestJS GraphQL layer as *working* code is a
  substantially separate project, and faking either would be worse than not
  including them. The Prisma schema underneath is shared-data-model-ready if
  you want to add either later.

## Deployment

Vercel is the path of least resistance for Next.js specifically. Push this
to a git repo, import it in Vercel, and set the same environment variables
(`DATABASE_URL`, `JWT_SECRET`, `STRIPE_SECRET_KEY`) in the project settings
rather than committing them. Use a hosted Postgres (Neon/Supabase/Railway)
for the deployed `DATABASE_URL` — the docker-compose database is for local
dev only.

## Security checklist run before calling this done

- [x] No secrets hardcoded — only in `.env`, which is gitignored
- [x] Passwords hashed with bcrypt (cost factor 12), never stored plaintext
- [x] Session token in an `httpOnly`, `sameSite=lax` cookie, `secure` in
      production
- [x] Every mutating API route validates input server-side with Zod — the
      frontend forms are a UX convenience, not the security boundary
- [x] Role checks happen server-side (`requireRole`) on every route that
      needs them, not just hidden in the UI
- [ ] Rate limiting — not included; add it (e.g. at the edge/proxy level) 
      before exposing login/register publicly
- [ ] CORS — not relevant as shipped (same-origin Next.js app), but if the
      API is ever called from a separate frontend, restrict allowed origins
      explicitly rather than `*`

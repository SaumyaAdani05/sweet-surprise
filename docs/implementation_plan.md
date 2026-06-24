# Implementation Plan — Sweet Surprise (Supabase + Next.js, Production-Ready)

This supersedes the original FastAPI-based plan. The new stack removes the
custom Python backend and Razorpay entirely.

## What changed from the original plan
- **No custom backend server.** Supabase replaces FastAPI: managed Postgres
  database, built-in authentication, file storage, and Edge Functions for
  background jobs like sending emails.
- **No payment gateway.** Payment happens outside the app (cash on delivery
  or UPI transfer), confirmed manually by the owner over call/WhatsApp after
  the order is placed.
- **Final stack:** Next.js 15 (App Router) on Vercel · Supabase (Database +
  Auth + Storage) · Resend (transactional email) · GitHub (version control,
  auto-deploys to Vercel on push).

## Guiding principle
Every phase below ends with a **Security checkpoint**. Security retrofitted
after a feature ships is how vulnerabilities get into production — each
checkpoint must pass before moving to the next phase, not "later."

---

## Phase 1 — Project & Account Setup

1.1 Create a private GitHub repository for the project.

1.2 Scaffold the app: `npx create-next-app@latest` — choose TypeScript,
    Tailwind CSS, App Router, and a `src/` directory.

1.3 Commit and push the initial scaffold to GitHub.

1.4 Create a Vercel account, import the GitHub repo, and confirm it
    auto-deploys on every push to `main`.

1.5 Create a Supabase project. Choose a region close to your users (e.g.
    Mumbai / ap-south-1) for lower latency.

1.6 Create a Resend account and verify a sending domain (Resend's shared
    test domain works fine while developing).

1.7 Install the Supabase client libraries:
    `npm install @supabase/supabase-js @supabase/ssr`

1.8 Create `.env.local` with three variables: `NEXT_PUBLIC_SUPABASE_URL`,
    `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`. The
    service role key bypasses all database security rules and must only
    ever be used in server-side code, never sent to the browser.

**Security checkpoint:** Confirm `.env.local` is listed in `.gitignore`
*before* your first commit. Search your codebase for the service role key —
it should appear in exactly one file (see file_structure.md,
`lib/supabase/server.ts`). Add all three env vars to Vercel's project
settings (Production and Preview environments), since `.env.local` never
gets deployed.

---

## Phase 2 — Database Schema & Row Level Security

2.1 In the Supabase SQL editor, create the tables from backend_schema.md:
    `profiles` (extends Supabase's built-in `auth.users` with name, phone,
    address, `is_admin`), `categories`, `products`, `orders`, `order_items`,
    `notifications`.

2.2 Enable Row Level Security (RLS) on **every** table immediately after
    creating it. An unprotected Supabase table is publicly readable and
    writable by anyone who has your project's public URL — this is the
    single most common way Supabase projects get breached.

2.3 Write RLS policies:
    - `categories`, `products`: public `SELECT` for everyone; `INSERT` /
      `UPDATE` / `DELETE` only where the requesting user's
      `profiles.is_admin = true`.
    - `orders`, `order_items`: a customer can `SELECT` / `INSERT` only rows
      where `user_id = auth.uid()`; admins can `SELECT` / `UPDATE` all rows.
    - `notifications`: readable and writable only by admins.
    - `profiles`: a user can `SELECT` / `UPDATE` only their own row; admins
      can `SELECT` all rows.

2.4 Create a Postgres trigger that recalculates `orders.total_price`
    server-side from `order_items` and the current `products.price_base`,
    rather than trusting whatever total the client submits. **This is the
    single most important anti-tampering measure** — without it, a modified
    frontend request could submit a ₹2,000 cake at a ₹20 price and the
    database would accept it.

2.5 Add indexes on `products.category_id`, `orders.user_id`, and
    `notifications.read` as listed in backend_schema.md.

**Security checkpoint:** Run Supabase's "RLS disabled" advisor — every
table must show RLS enabled with policies attached. Using only the public
anon key (no logged-in session), try to insert a product or read another
user's order; both must be rejected.

---

## Phase 3 — Authentication

3.1 Implement Supabase Auth email/password signup and login using
    `@supabase/ssr`, so sessions work correctly in both Server and Client
    Components.

3.2 On signup, insert a matching `profiles` row (name, phone, address) via
    a Postgres trigger on `auth.users` insert — not a separate client-side
    call. This keeps account creation atomic and server-controlled.

3.3 Set `is_admin = true` for Rinku's account manually inside the Supabase
    dashboard. Never build a client-facing way to self-promote to admin.

3.4 Build `middleware.ts` to refresh the session on every request and
    redirect unauthenticated users away from `/admin` and `/checkout`.

3.5 Build an auth context/hook exposing the current session and `is_admin`
    flag to the rest of the app.

**Security checkpoint:** Visiting `/admin` while logged out must redirect
immediately with no flash of admin content. Check this happens both in
middleware (before the page renders) and again inside the page component
itself — never rely on a single client-side check alone.

---

## Phase 4 — Public Catalog (Menu & Product Pages)

4.1 Build the tabbed category menu, fetching active products from Supabase.

4.2 Build the product detail page with the weight/price calculator (base
    price × weight multiplier).

4.3 Validate the custom-weight input with a Zod schema — numeric, within a
    sane range (e.g. 100g–10kg) — so a user can't submit a negative or
    absurd value that breaks downstream price math.

**Security checkpoint:** Confirm the displayed price is always recomputed
from the selected weight, never read from a hidden field or URL parameter.

---

## Phase 5 — Cart

5.1 Implement cart state in React Context, persisted to `localStorage` for
    guest convenience. Store cart contents only — never auth tokens or
    personal data in `localStorage`.

5.2 Quantity/weight adjustments update the subtotal live in the UI; this is
    a convenience display only — Phase 6 always re-verifies the real total
    server-side.

---

## Phase 6 — Checkout & Order Placement

6.1 Auth guard: clicking "Checkout" while logged out redirects to
    login/signup, then returns the user to their cart after success.

6.2 Delivery form (name, phone, address) validated with Zod — phone format,
    required fields, sensible length limits.

6.3 On submit, insert into `orders` and `order_items` using the
    authenticated Supabase client. Let RLS set `user_id = auth.uid()`
    automatically — never pass `user_id` from client-submitted data.

6.4 Display the *database-confirmed* total (from the Phase 2.4 trigger)
    back to the user, not the client-side calculated one.

**Security checkpoint:** Open browser dev tools, intercept the order
request, and try to lower the price before it's sent. Confirm the stored
total in the database is unaffected by the tampering.

---

## Phase 7 — Notifications & Email

7.1 Create a Postgres trigger on `orders` insert that writes a row into
    `notifications`.

7.2 Create a Supabase Edge Function (`send-order-email`) triggered by a
    database webhook on `orders` insert, calling the Resend API to email
    Rinku with the order details.

7.3 Store the Resend API key as a Supabase Edge Function secret — never in
    frontend code or committed to the repo.

7.4 Send a separate confirmation email to the customer, using the address
    on their `profiles` row.

**Security checkpoint:** Search the built frontend output
(`.next/static`) for the Resend API key — it must not appear anywhere in
shipped JavaScript.

---

## Phase 8 — Admin Dashboard

8.1 Overview tab: aggregate queries for total sales, order counts, pending
    orders, active customer count (admin-only via RLS).

8.2 Orders tab: list, filter, and update order status
    (`pending` → `completed` / `cancelled`). Consider adding a separate
    `payment_confirmed` boolean, since "delivered" and "paid" are different
    concerns now that payment happens outside the app.

8.3 Catalog tab: CRUD forms for categories/products, including image
    upload to Supabase Storage with validation — reject anything that
    isn't `image/jpeg` / `image/png` / `image/webp`, and cap file size
    around 2MB.

8.4 Notifications tab: mark-as-read and clear-all, scoped to admins via
    RLS.

**Security checkpoint:** Log in as a regular (non-admin) customer account
and attempt every admin action directly through the Supabase client (not
just via the hidden UI). Every call must be rejected by RLS — the UI being
hidden is not security, the database rule is.

---

## Phase 9 — Production Hardening Pass

9.1 Run `npm audit` and update any dependencies flagged with known
    vulnerabilities.

9.2 Add security headers in `next.config.ts`: `Content-Security-Policy`,
    `X-Frame-Options`, `Referrer-Policy`.

9.3 Enable Supabase's built-in rate limiting on auth endpoints
    (signup/login) to slow brute-force attempts.

9.4 Confirm every form rejects empty or malformed input server-side — an
    HTML5 `required` attribute alone is not validation, since it's trivial
    to bypass.

9.5 Confirm Vercel's automatic HTTPS is active and there are no
    mixed-content warnings in the browser console.

9.6 Review Supabase's logs from your own testing for any anonymous write
    attempts — they should all show "denied by RLS."

---

## Phase 10 — Launch

10.1 Point a custom domain at Vercel. Configure Cloudflare DNS at this
     point if you're using a custom domain — not needed before this.

10.2 Smoke-test the complete flow in production: signup, browse menu, add
     to cart, checkout, admin order management, both emails arriving.

10.3 Set Rinku's admin password directly in Supabase, and confirm she can
     log in and manage orders comfortably from her phone.

---

## Verification checklist (re-run before every deploy)

- [ ] RLS enabled and tested on every table
- [ ] No secret keys present in any client-side JavaScript bundle
- [ ] `.env.local` never committed to GitHub
- [ ] Order totals always recalculated server-side, never trusted from the client
- [ ] Admin routes blocked in both middleware and the page component
- [ ] Image uploads validated for file type and size
- [ ] `npm audit` shows no unresolved critical/high vulnerabilities

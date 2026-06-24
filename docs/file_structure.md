# File Structure — Sweet Surprise

This maps the Next.js project once the implementation plan is complete, and
explains what every file and folder does. Files marked 🔒 are
security-sensitive — read their notes before touching them.

```
sweet-surprise/
├── .env.local                       🔒 Local secrets, never committed
├── .gitignore
├── middleware.ts                    🔒 Refreshes auth session; blocks
│                                        /admin and /checkout when logged out
├── next.config.ts                   Security headers, image domains, build config
├── package.json
├── tailwind.config.ts
├── tsconfig.json
│
├── src/
│   ├── app/                         Next.js App Router — one folder per route
│   │   ├── layout.tsx                Root layout: header, footer, fonts, providers
│   │   ├── page.tsx                  Landing page (hero, FAQs, contact form)
│   │   ├── globals.css
│   │   │
│   │   ├── menu/
│   │   │   └── page.tsx              Tabbed category menu, fetches products
│   │   │
│   │   ├── product/
│   │   │   └── [id]/page.tsx         Product detail, weight/price calculator
│   │   │
│   │   ├── cart/
│   │   │   └── page.tsx              Cart review, quantity edits
│   │   │
│   │   ├── checkout/
│   │   │   └── page.tsx              Auth-guarded delivery form, places order
│   │   │
│   │   ├── login/
│   │   │   └── page.tsx              Login / signup tabs (Supabase Auth)
│   │   │
│   │   ├── order-confirmed/
│   │   │   └── page.tsx              Post-order success screen
│   │   │
│   │   ├── admin/
│   │   │   ├── page.tsx              🔒 Dashboard shell, re-checks is_admin
│   │   │   ├── orders/page.tsx       🔒 Order list + status updates
│   │   │   ├── catalog/page.tsx      🔒 Category/product CRUD
│   │   │   └── notifications/page.tsx 🔒 Activity log
│   │   │
│   │   └── api/
│   │       └── contact/route.ts      Contact form handler, server-validated
│   │
│   ├── components/
│   │   ├── ui/                       Shadcn primitives (button, input, accordion...)
│   │   ├── Header.tsx                Logo, nav links, cart icon
│   │   ├── Footer.tsx                FAQ / contact / social links
│   │   ├── ProductCard.tsx           Card with hover animation, links to product
│   │   ├── CategorySection.tsx       Groups product cards by category
│   │   ├── PriceCalculator.tsx       Weight selector + live price display
│   │   └── AdminGuard.tsx            🔒 Client-side redirect helper — backs up
│   │                                    middleware, does not replace it
│   │
│   ├── context/
│   │   ├── CartContext.tsx           Client-only cart state, persisted to localStorage
│   │   └── AuthContext.tsx           Wraps Supabase session, exposes user + is_admin
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts             Browser Supabase client (anon key only)
│   │   │   └── server.ts             🔒 Server Supabase client — the ONLY file
│   │   │                                allowed to use the service role key
│   │   ├── validations/
│   │   │   ├── checkout.ts           Zod schema: name, phone, address
│   │   │   ├── product.ts            Zod schema: admin product form
│   │   │   └── auth.ts               Zod schema: login/signup
│   │   └── utils.ts                  Formatting helpers (currency, weight display)
│   │
│   └── types/
│       └── database.ts               Generated Supabase TypeScript types
│
├── supabase/
│   ├── migrations/                   SQL files: table creation, RLS policies, triggers
│   └── functions/
│       └── send-order-email/         🔒 Edge Function calling Resend; holds the
│                                         Resend API key as a secret, not in the repo
│
└── public/
    ├── logo.png
    └── images/                       Static fallback images (product photos live
                                          mainly in Supabase Storage)
```

## Why the 🔒 files need extra care

**`.env.local` and the Supabase service role key** — if either leaks into
the GitHub repo or the browser bundle, anyone who finds it has full
read/write access to your entire database, bypassing every RLS rule you
wrote. Treat this key like a master password.

**`middleware.ts` and `app/admin/page.tsx`** — route protection is checked
in two places on purpose (defense in depth). Middleware blocks the request
before anything renders; the page itself re-checks `is_admin` in case
middleware is ever misconfigured or skipped. Neither check alone is
sufficient on its own.

**`supabase/functions/send-order-email/`** — the only place the Resend API
key should ever live. It runs entirely on Supabase's servers and never
reaches the browser, so it can't be extracted from your shipped JavaScript.

**`lib/supabase/server.ts`** — the only file in the entire codebase
permitted to import the service role key. Every other file — every page,
every component — uses the public anon key, which Row Level Security
policies constrain to exactly what that user is allowed to see or change.

## Never commit these

Add to `.gitignore` if not already present: `.env.local`, `.env*.local`,
`node_modules/`, `.next/`, `supabase/.temp/`.

## How this maps to the original docs

This structure implements the same data model as `backend_schema.md` and
the same user flows as `app_flow.md` — the only thing that changed is
*where* the logic lives: Supabase's database and Edge Functions now do the
job originally assigned to the FastAPI backend in the old plan, and there's
no payment-gateway integration since checkout no longer includes an online
payment step.

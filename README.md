# Sweet Surprise

Sweet Surprise is a responsive bakery storefront for browsing cakes, chocolates, cookies, customized gifts, and trousseau packing. Customers can explore the catalog, view product options, manage a cart, sign in, and place orders, while the owner can manage products, categories, orders, payments, and notifications from an admin dashboard.

![Sweet Surprise logo](public/images/logo.png)

## Features

- Product catalog organized by category
- Product detail pages with weight and price options
- Persistent shopping cart and checkout flow
- Customer login and registration
- Contact form with authenticated customer details
- Order confirmation and manual payment workflow
- Admin dashboard for catalog, order, payment, and notification management
- Supabase schema with authentication, row-level security, triggers, and storage policies
- Optional order email notifications through a Supabase Edge Function and Resend
- Responsive UI with light and dark theme support

## Tech stack

- Next.js 15 with the App Router
- React 18 and TypeScript
- Tailwind CSS and Radix UI components
- Supabase Auth, Postgres, Storage, and Edge Functions
- Genkit with Google AI
- Zod and React Hook Form
- Firebase App Hosting configuration

## Getting started

### Prerequisites

- Node.js 20 or newer
- npm
- A Supabase project for persistent authentication and data features

### Installation

```bash
git clone <repository-url>
cd "Sweet Surprise"
npm install
```

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Only required when using Genkit/Google AI features
GOOGLE_GENAI_API_KEY=your-google-ai-key
```

Never commit `.env.local` or expose the service-role key in client-side code.

Start the development server:

```bash
npm run dev
```

Open http://localhost:3000.

The app includes placeholder Supabase values so the interface can be previewed without a configured project, but persistent authentication, database, storage, and production order features require valid credentials.

## Supabase setup

1. Create a Supabase project.
2. Open the SQL editor and run `supabase/migrations/20260620_schema.sql`.
3. Add the Supabase URL and keys to `.env.local`.
4. In Supabase Auth, add `http://localhost:3000/auth/callback` as an allowed redirect URL.
5. To grant admin access, set `is_admin` to `true` on the appropriate row in the `profiles` table.

For order emails, deploy `supabase/functions/send-order-email` and configure these Edge Function secrets:

```env
RESEND_API_KEY=your-resend-key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Then connect the function to an order-insert database webhook in Supabase.

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start Next.js locally on port 3000 |
| `npm run build` | Create a production build |
| `npm run start` | Run the production build |
| `npm run typecheck` | Check TypeScript without emitting files |
| `npm run lint` | Run the configured Next.js lint command |
| `npm run genkit:dev` | Start the Genkit developer UI |
| `npm run genkit:watch` | Start Genkit in watch mode |

## Application routes

| Route | Purpose |
| --- | --- |
| `/` | Home, specialties, business information, and contact form |
| `/menu` | Filterable product catalog |
| `/products/[id]` | Product details and purchase options |
| `/cart` | Shopping cart |
| `/checkout` | Delivery details and order placement |
| `/order-confirmed` | Order confirmation |
| `/login` | Customer authentication |
| `/admin` | Owner dashboard |
| `/privacy` | Privacy policy |
| `/terms` | Terms and conditions |

## Project structure

```text
src/
|-- app/                 # Pages, layouts, API routes, and auth callback
|-- components/          # Storefront, layout, and reusable UI components
|-- context/             # Shared authentication, cart, catalog, and order state
|-- hooks/               # Reusable React hooks
|-- lib/                 # Product data, validation, utilities, and Supabase clients
|-- ai/                  # Genkit configuration
`-- types/               # Shared TypeScript types
public/images/           # Brand and product images
supabase/
|-- migrations/          # Database schema, triggers, and RLS policies
`-- functions/           # Order email Edge Function
docs/                    # Product, technical, flow, and implementation documents
```

## Deployment

Build locally before deployment:

```bash
npm run typecheck
npm run build
```

The repository includes `apphosting.yaml` for Firebase App Hosting. Add required environment variables and secrets in the hosting provider rather than committing them to the repository.

## Documentation

Detailed planning material is available in the `docs` directory, including the product requirements, technical requirements, application flow, database schema, implementation plan, and file structure.

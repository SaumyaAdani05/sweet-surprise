# Product Design Document (PD) - Sweet Surprise

## 1. Product Overview & Goal
**Sweet Surprise** (managed by Owner Rinku Adani) is a premium, boutique bakery and gifting studio specializing in artisan cakes, handmade chocolates, gourmet cookies, and custom gifting solutions (such as wedding Trousseau packing and chocolate/rose bouquets).

The goal of the Sweet Surprise web application is to provide an engaging, responsive, and secure platform for customers to browse the menu, calculate custom pricing based on weight, place orders, and contact the studio. It also provides an Admin Dashboard for Rinku Adani to manage orders, catalog listings, and view store statistics.

> **Payment model**: orders are placed and confirmed through the app, but
> payment itself happens outside it — cash on delivery or a direct UPI
> transfer, confirmed by Rinku over a call or WhatsApp once she's notified
> of the new order. There is no online payment gateway in this version.

---

## 2. Target Audience & Personas
- **The Event Host**: Looking for custom cakes (cardamom, saffron, paan fusion flavors) and bespoke gifting trays for weddings, birthdays, or festivals.
- **The Sweet Enthusiast**: Ordering freshly-baked artisan treats (cakes, cookies, chocolates) for regular indulgence or small gatherings.
- **The Owner (Rinku Adani)**: Needs an intuitive interface to manage incoming order requests, modify catalog offerings, create new sections, and track sales without technical complexity.

---

## 3. Core Features & Scope

### 3.1. Customer-Facing Flow
1. **Homepage / Landing Page**:
   - Hero banner with brand messaging.
   - Grid displaying key specialties.
   - Practical information (hours, location, WhatsApp direct contact, Instagram link).
   - Dynamic FAQs using a smooth Accordion.
   - Contact form with inputs for name, email, subject, and message.
2. **Interactive Menu**:
   - Tabbed view for different categories (Cakes, Chocolates, Cookies, Packing & Bouquets).
   - Rich product cards with animations and clear visual hierarchy.
3. **Dynamic Product Detail Page**:
   - Large product image, description, ingredients list, and allergen warnings.
   - **Weight/Portion Selector**: Automatically calculates price adjustments (base price is for 500g for cakes, 250g for chocolates).
   - **Custom Weight Input**: Allows entering custom weight (e.g., 1.2kg) and updates calculations in real time, validated against a sane min/max range.
   - Quantity selector and toast-notified "Add to Cart" action.
   - Related products recommendation slider/grid.
4. **Shopping Cart & Checkout**:
   - Sidebar/page reviewing items, selected weights, individual sub-prices, and quantity adjustments.
   - Contact and delivery address inputs.
   - **Auth Guard**: Forces customers to log in/register before finalized checkout.
   - On placing the order, the customer sees a database-confirmed total and order ID — no payment form, since payment is settled directly with Rinku afterward.
5. **Secure Authentication & Account Creation**:
   - Customer login/register handled entirely by **Supabase Auth** (managed email/password authentication — the app never stores or sees raw or hashed passwords itself).
   - Contact form requires a logged-in session to prevent anonymous spam.

### 3.2. Owner / Admin Dashboard
1. **Overview Dashboard**:
   - Key performance indicators (Total Sales, Total Orders, Pending Orders, Active Customers count).
   - Quick forms to add products or create menu categories.
2. **Order Management**:
   - View complete lists of incoming orders.
   - Customer details (name, phone, delivery address) and detailed items tables.
   - Update order status (Mark Completed, Cancel Order). Since payment is
     confirmed manually, the admin can optionally track a separate
     "payment confirmed" flag alongside delivery status.
3. **Catalog Manager**:
   - CRUD operations on Category Sections.
   - CRUD operations on Product Listings (edit names, descriptions, prices, categories, images).
4. **System Notifications Log**:
   - Logs for user sign-ups, customer log-ins, and purchase events, written automatically by database triggers.
   - Read/Unread tracking and bulk log clearing.

---

## 4. Current Gaps vs. Production-Ready Criteria

| Feature / Aspect | Prototype Implementation (Original) | Production-Ready Implementation (Current Plan) |
| :--- | :--- | :--- |
| **Data Persistence** | LocalStorage in React Context. Refreshing or switching browsers wipes all edits, orders, and catalogs. | Managed Postgres database via **Supabase**, accessed through `supabase-js`, with data persisted centrally for every user. |
| **Security & Auth** | Hashed credentials check in frontend code. Hardcoded admin credentials (`admin2602` / `Sweet@admin1983`) visible in JS files. | **Supabase Auth** handles signup/login/session management internally; the app never touches raw passwords. Authorization is enforced at the database layer via **Row Level Security (RLS)** policies, not custom backend code — so even a frontend bug can't expose unauthorized data. |
| **Catalog Updates** | Modifications to categories or products only save locally to that specific browser session. | Catalog changes write to Supabase and are visible to every user immediately, gated by admin-only RLS policies. |
| **Order Processing** | Orders are locally pushed to a state log. Owner dashboard cannot receive order notifications from other users. | Orders are saved to Supabase; a Postgres trigger logs a notification and fires a webhook to a **Supabase Edge Function**, which emails Rinku via **Resend**. Payment itself is confirmed manually (call/WhatsApp) since there's no payment gateway. |
| **Order Total Integrity** | Cart total calculated and trusted entirely in the browser. | Order total is recalculated server-side by a Postgres trigger from the authoritative product prices — a tampered client request cannot change what's actually charged. |
| **Form Validation** | Simple frontend state checks. | Zod schema validation on the frontend, plus Postgres column constraints and RLS as a second enforcement layer. |

---

## 5. User Experience (UX) Design Principles
- **Vibrant & Sweet Aesthetics**: Tailored color palette matching project rules (harmonious pink primary accent, clean light mode, responsive cards).
- **Responsive Layout**: Seamless transition from desktop viewport grids to stacked vertical lists on mobile devices.
- **Dynamic Feedback**: Hover animations, scale changes on cards, and toast alerts for critical user actions (adding items, placing orders, wrong passwords).
- **Accessibility (a11y)**: Semantic HTML tags (`<header>`, `<main>`, `<footer>`), descriptive labels, and keyboard-friendly Radix controls.

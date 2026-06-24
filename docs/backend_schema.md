# Database Schema Document - Sweet Surprise

This document details the database schema for Sweet Surprise, implemented
as a managed Postgres database on **Supabase**, with authorization enforced
by **Row Level Security (RLS)** rather than custom backend code. There is
no separate ORM layer to maintain — `supabase-js` talks to Postgres
directly, and RLS policies are the actual security boundary.

## 1. Entity Relationship (ER) Diagram

```mermaid
erDiagram
    PROFILE ||--o{ ORDER : places
    CATEGORY ||--o{ PRODUCT : contains
    ORDER ||--|{ ORDER_ITEM : includes
    PRODUCT ||--o{ ORDER_ITEM : ordered_in

    PROFILE {
        uuid id PK "references auth.users.id"
        string name
        string phone
        string address
        boolean is_admin
        datetime created_at
    }

    CATEGORY {
        string id PK
        string name
        string slug UNIQUE
    }

    PRODUCT {
        string id PK
        string name
        string description
        integer price_base
        string category_id FK
        string image_url
        string image_hint
        boolean is_active
        datetime created_at
    }

    ORDER {
        string id PK
        uuid user_id FK
        string customer_name
        string customer_phone
        string customer_address
        integer total_price
        string status
        boolean payment_confirmed
        datetime created_at
    }

    ORDER_ITEM {
        integer id PK
        string order_id FK
        string product_id FK
        integer quantity
        string weight
        integer price_at_purchase
    }

    NOTIFICATION {
        string id PK
        string type
        string message
        string details
        boolean read
        datetime created_at
    }
```

> **Note**: email and password are never stored in our own tables. Supabase
> manages a separate, internal `auth.users` table (with proper password
> hashing, email verification, and session handling) that we never query or
> modify directly. `profiles.id` is a foreign key to `auth.users.id`, created
> automatically by a trigger when someone signs up.

---

## 2. Table Specifications

### 2.1. Table: `profiles`
Extends Supabase's built-in `auth.users` with the app-specific fields we
need. One row per user, customer or admin (Rinku).

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY, FOREIGN KEY -> `auth.users.id` | Same ID Supabase Auth assigned at signup |
| `name` | VARCHAR(100) | NOT NULL | Customer's full name |
| `phone` | VARCHAR(20) | NOT NULL | 10-digit phone number |
| `address` | TEXT | NULL | Default/shipping address |
| `is_admin` | BOOLEAN | DEFAULT FALSE | Owner flag — set manually in the Supabase dashboard, never from the client |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Date of registration |

### 2.2. Table: `categories`
Stores the tab categories displayed in the menu.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | VARCHAR(50) | PRIMARY KEY | Section ID (e.g. `cakes`, `cookies`) |
| `name` | VARCHAR(100) | NOT NULL | Printable name (e.g. `Artisan Cakes`) |
| `slug` | VARCHAR(100) | UNIQUE, NOT NULL | Slug link |

### 2.3. Table: `products`
Stores dessert listings.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | VARCHAR(50) | PRIMARY KEY | Product ID (e.g. `cake-vanilla`) |
| `name` | VARCHAR(100) | NOT NULL | Display name |
| `description` | TEXT | NOT NULL | Ingredients & flavor description |
| `price_base` | INTEGER | NOT NULL | Numeric base price in Rupees |
| `category_id` | VARCHAR(50) | FOREIGN KEY -> `categories.id` | Associated category |
| `image_url` | VARCHAR(255) | NOT NULL | Supabase Storage public URL |
| `image_hint` | VARCHAR(255) | NULL | AI generation hints |
| `is_active` | BOOLEAN | DEFAULT TRUE | Catalog display flag |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Date added |

### 2.4. Table: `orders`
Stores customer orders.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | VARCHAR(20) | PRIMARY KEY | Unique generated order code (e.g. `ORD-871625`) |
| `user_id` | UUID | FOREIGN KEY -> `profiles.id` | Placed by user; always set to `auth.uid()` via RLS, never client-supplied |
| `customer_name` | VARCHAR(100) | NOT NULL | Name typed in checkout form |
| `customer_phone` | VARCHAR(20) | NOT NULL | Contact phone for delivery |
| `customer_address` | TEXT | NOT NULL | Delivery address |
| `total_price` | INTEGER | NOT NULL | **Server-calculated** — see trigger in section 4 |
| `status` | VARCHAR(20) | DEFAULT 'pending' | Status: `pending`, `completed`, `cancelled` |
| `payment_confirmed` | BOOLEAN | DEFAULT FALSE | Set by admin after confirming cash/UPI payment manually |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Timestamp |

### 2.5. Table: `order_items`
Sub-item weights and quantity breakdowns.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | SERIAL | PRIMARY KEY | Serial index |
| `order_id` | VARCHAR(20) | FOREIGN KEY -> `orders.id`, ON DELETE CASCADE | Associated parent order |
| `product_id` | VARCHAR(50) | FOREIGN KEY -> `products.id` | Associated catalog item |
| `quantity` | INTEGER | NOT NULL, CHECK > 0 | Selected quantity |
| `weight` | VARCHAR(20) | NULL | Portion (e.g. `500g`, `1kg`, `custom_300g`) |
| `price_at_purchase` | INTEGER | NOT NULL | Calculated unit price, set by the trigger — never trusted from the client |

### 2.6. Table: `notifications`
System logs visible in the Admin Panel.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | VARCHAR(50) | PRIMARY KEY | Unique log key |
| `type` | VARCHAR(20) | NOT NULL | Type: `purchase`, `login`, `contact` |
| `message` | VARCHAR(255) | NOT NULL | Header message |
| `details` | TEXT | NOT NULL | Body info |
| `read` | BOOLEAN | DEFAULT FALSE | View status |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Log date |

---

## 3. Row Level Security Policies

Every table below has RLS **enabled**. A table with RLS enabled and no
policies denies all access by default — policies are what grant access
back, scoped as narrowly as possible.

| Table | SELECT | INSERT | UPDATE | DELETE |
| :--- | :--- | :--- | :--- | :--- |
| `profiles` | Own row only, or any row if `is_admin` | — (created by trigger only) | Own row only | — |
| `categories` | Public (anyone) | Admin only | Admin only | Admin only |
| `products` | Public (anyone) | Admin only | Admin only | Admin only |
| `orders` | Own rows, or all rows if `is_admin` | Own rows only (`user_id = auth.uid()`) | Admin only | — |
| `order_items` | Via parent order ownership, or all if `is_admin` | Own order only | Admin only | — |
| `notifications` | Admin only | System (trigger) only | Admin only | Admin only |

---

## 4. Triggers (server-side logic that replaces custom backend code)

- **`set_order_total`** — `BEFORE INSERT` on `orders`: recalculates
  `total_price` from `order_items` joined against the current
  `products.price_base`, ignoring any total submitted by the client. This
  is what prevents price tampering.
- **`log_new_order`** — `AFTER INSERT` on `orders`: inserts a row into
  `notifications` (`type = 'purchase'`), which in turn triggers the
  `send-order-email` Edge Function via a database webhook.
- **`create_profile_on_signup`** — `AFTER INSERT` on `auth.users`: creates
  the matching `profiles` row automatically, keeping account creation
  atomic.

---

## 5. Index Recommendations
- **Index on `products.category_id`**: speeds up category tab loading.
- **Index on `orders.user_id`**: speeds up retrieving order histories for logged-in accounts.
- **Index on `notifications.read`**: speeds up admin counting queries for unread alerts.

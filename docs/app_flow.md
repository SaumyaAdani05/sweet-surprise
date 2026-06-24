# Application User Flow Document - Sweet Surprise

This document details the screen navigations, role boundaries, and data
interaction sequences for customers and the admin owner (Rinku Adani),
built on Next.js + Supabase (no custom backend server, no payment gateway).

## 1. Customer User Flow

The customer flow covers landing page browsing, dynamic product actions, cart additions, authentication guards, and order placement.

```mermaid
graph TD
    Start([User Opens App]) --> Landing[Landing Page]

    %% Navigation
    Landing -->|Click Menu| Menu[Menu Page]
    Landing -->|Click Call / WA| Phone([WhatsApp / Phone Call])
    Landing -->|Scroll / Click Contact| ContactCheck{Is User Logged In?}

    %% Contact Flow
    ContactCheck -->|No| LoginPrompt[Show Login Prompt]
    LoginPrompt -->|Click Login| LoginPage[Login / Register Page - Supabase Auth]
    ContactCheck -->|Yes| PreFilledForm[Pre-filled Contact Form]
    PreFilledForm -->|Submit Form| ContactSuccess[Insert Notification Row / Show Success Toast]

    %% Browsing & Cart Flow
    Menu -->|Select Tab| CategoryTabs{Cakes, Chocolates, Cookies, Bouquets}
    CategoryTabs -->|Cakes / Chocolates / Cookies| ProdDetails[Product Details Page]
    CategoryTabs -->|Bouquets / Custom| ContactRedirect[Redirect to Contact/WhatsApp]

    ProdDetails -->|Select Weight / Custom Weight| PriceCalc[Update Dynamic Price Box]
    PriceCalc -->|Click Add to Cart| CartStorage[Add to Cart & Show Toast]

    CartStorage -->|Open Cart| CartPage[Cart Page]
    CartPage -->|Adjust Quantity / Delete| CartPage
    CartPage -->|Click Checkout| CheckoutGuard{Is User Logged In?}

    CheckoutGuard -->|No| LoginRedirect[Redirect to Login Page]
    LoginRedirect -->|Successful Login| CartPage
    CheckoutGuard -->|Yes| DeliveryForm[Fill Name, Phone, Address]
    DeliveryForm -->|Click Place Order| SaveOrder[Insert Order into Supabase]
    SaveOrder -->|Success| SuccessScreen[Order Confirmed Page - Total Recalculated by DB Trigger, Admin Notified]
    SuccessScreen --> PaymentNote([Payment confirmed manually: cash on delivery or UPI, via call/WhatsApp])
```

---

## 2. Owner / Admin Dashboard Workflow

Access to the Admin Panel is gated by Supabase Auth plus an `is_admin` flag
on the user's `profiles` row, enforced both in middleware and by Row Level
Security at the database. Once unlocked, Rinku Adani accesses a dashboard
featuring multi-tab control panels.

```mermaid
graph TD
    AdminStart([Navigate to /admin]) --> AdminGuard{Is Logged In & is_admin?}

    AdminGuard -->|No| LoginGate[Login Page]
    LoginGate -->|Submit credentials| AuthAPI[Supabase Auth Verify]
    AuthAPI -->|Invalid| LoginGate
    AuthAPI -->|Valid, not admin| AccessDenied[Access Denied - Redirect Home]
    AuthAPI -->|Valid, is_admin=true| AdminDashboard[Unlock Dashboard]

    AdminGuard -->|Yes| AdminDashboard

    AdminDashboard --> Tabs[Tab Selector]

    %% Tab 1
    Tabs -->|Overview| Stats[Read Sales, Orders, Pending, User counts]
    Stats --> AddProduct[Quick Product Add Form]
    Stats --> AddCategory[Quick Category Create Form]

    %% Tab 2
    Tabs -->|Orders| OrderList[List Customer Orders - RLS: admin-only]
    OrderList -->|Mark Completed| OrderComplete[Transition Order to Completed]
    OrderList -->|Cancel Order| OrderCancel[Transition Order to Cancelled]
    OrderList -->|Confirm Payment| PaymentConfirmed[Mark Payment Confirmed - via call/WhatsApp]

    %% Tab 3
    Tabs -->|Catalog| CatalogManager[Catalog Listing Grid]
    CatalogManager -->|Edit Button| EditForm[Inline Product Details Editor]
    EditForm -->|Save| SaveAPI[Update Product in Supabase - RLS: admin-only]
    CatalogManager -->|Delete Button| DeleteAPI[Delete Product in Supabase - RLS: admin-only]

    %% Tab 4
    Tabs -->|Notifications| NotificationLog[Read Activity Alerts Log]
    NotificationLog -->|Click Read| MarkRead[Mark notification as Read]
    NotificationLog -->|Click Clear All| ClearLogs[Clear Alert Logs]

    AdminDashboard -->|Exit| Logout[supabase.auth.signOut - Clear Session]
```

---

## 3. Detailed Sequence Diagrams

### 3.1. Checkout Order Placement (Supabase-driven, no payment gateway)

```mermaid
sequenceDiagram
    autonumber
    actor Customer
    participant FE as Next.js Client
    participant SB as Supabase (Postgres + RLS)
    participant EF as Edge Function (send-order-email)
    participant RS as Resend

    Customer->>FE: Click "Place Order" (Cart)
    FE->>SB: INSERT order + order_items (authenticated client)
    Note over SB: RLS policy sets user_id = auth.uid() automatically
    SB->>SB: Trigger recalculates total_price from current product prices
    SB->>SB: Trigger inserts a row into notifications
    SB-->>FE: Return confirmed order (id, server-calculated total)
    FE-->>Customer: Show Order Confirmed Page

    SB->>EF: Database webhook fires on orders insert
    EF->>RS: Call Resend API (order confirmation + owner alert)
    RS-->>Customer: Order confirmation email delivered
    RS-->>EF: Owner notification email delivered
    Note over Customer,RS: Payment is settled separately - Rinku calls<br/>or messages the customer to confirm<br/>cash-on-delivery or UPI payment
```

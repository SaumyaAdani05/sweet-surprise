-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- =========================================================================
-- 1. TABLES DEFINITION
-- =========================================================================

-- Profiles table (extends auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name varchar(100) not null,
  phone varchar(20) not null,
  address text,
  is_admin boolean default false,
  created_at timestamptz default now()
);

-- Categories table
create table public.categories (
  id varchar(50) primary key,
  name varchar(100) not null,
  slug varchar(100) unique not null
);

-- Products table
create table public.products (
  id varchar(50) primary key,
  name varchar(100) not null,
  description text not null,
  price_base integer not null,
  category_id varchar(50) references public.categories(id) on delete set null,
  image_url varchar(255) not null,
  image_hint varchar(255),
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Orders table
create table public.orders (
  id varchar(20) primary key,
  user_id uuid references public.profiles(id) on delete set null,
  customer_name varchar(100) not null,
  customer_phone varchar(20) not null,
  customer_address text not null,
  total_price integer default 0 not null,
  status varchar(20) default 'pending' not null,
  payment_confirmed boolean default false not null,
  created_at timestamptz default now()
);

-- Order Items table
create table public.order_items (
  id serial primary key,
  order_id varchar(20) references public.orders(id) on delete cascade,
  product_id varchar(50) references public.products(id) on delete set null,
  quantity integer not null check (quantity > 0),
  weight varchar(20),
  price_at_purchase integer not null
);

-- Notifications table
create table public.notifications (
  id varchar(50) primary key,
  type varchar(20) not null, -- 'purchase', 'login', 'contact'
  message varchar(255) not null,
  details text not null,
  read boolean default false not null,
  created_at timestamptz default now()
);

-- =========================================================================
-- 2. INDEX RECOMMENDATIONS
-- =========================================================================
create index idx_products_category_id on public.products(category_id);
create index idx_orders_user_id on public.orders(user_id);
create index idx_notifications_read on public.notifications(read);

-- =========================================================================
-- 3. HELPER FUNCTIONS & TRIGGERS
-- =========================================================================

-- Helper function to check if a user is an admin without infinite recursion
create or replace function public.is_admin(user_id uuid)
returns boolean as $$
begin
  return exists (
    select 1 from public.profiles
    where id = user_id and is_admin = true
  );
end;
$$ language plpgsql security definer;

-- Trigger: Automatically create a profiles row on auth.users signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, phone, address, is_admin)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', ''),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    coalesce(new.raw_user_meta_data->>'address', ''),
    coalesce((new.raw_user_meta_data->>'is_admin')::boolean, false)
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Helper function: Calculate weight price multiplier server-side
create or replace function public.calculate_weight_multiplier(category_id varchar, weight varchar)
returns numeric as $$
declare
  numeric_val numeric;
  clean_weight varchar;
begin
  if weight is null or weight = '' then
    return 1.0;
  end if;

  clean_weight := lower(trim(weight));

  if category_id = 'cakes' then
    if clean_weight = '500g' then return 1.0;
    elsif clean_weight = '1kg' then return 2.0;
    elsif clean_weight = '1.5kg' then return 3.0;
    elsif clean_weight = '2kg' then return 4.0;
    elsif clean_weight = '3kg' then return 6.0;
    elsif clean_weight = '5kg' then return 10.0;
    else
      -- custom parsing (e.g. "1.2kg" or "600g")
      numeric_val := substring(clean_weight from '^[0-9]+(\.[0-9]+)?')::numeric;
      if numeric_val is null then
        return 1.0;
      end if;
      if clean_weight like '%kg' then
        return (numeric_val * 1000.0) / 500.0;
      else
        return numeric_val / 500.0;
      end if;
    end if;
  elsif category_id = 'chocolates' then
    if clean_weight = '100g' then return 0.4;
    elsif clean_weight = '250g' then return 1.0;
    elsif clean_weight = '500g' then return 2.0;
    elsif clean_weight = '1kg' then return 4.0;
    else
      numeric_val := substring(clean_weight from '^[0-9]+(\.[0-9]+)?')::numeric;
      if numeric_val is null then
        return 1.0;
      end if;
      if clean_weight like '%kg' then
        return (numeric_val * 1000.0) / 250.0;
      else
        return numeric_val / 250.0;
      end if;
    end if;
  end if;

  return 1.0;
exception
  when others then
    return 1.0;
end;
$$ language plpgsql immutable;

-- Trigger: Automatically set order item purchase price server-side to prevent tampering
create or replace function public.set_order_item_price()
returns trigger as $$
declare
  v_price_base integer;
  v_category_id varchar;
  v_multiplier numeric;
begin
  select price_base, category_id
  into v_price_base, v_category_id
  from public.products
  where id = new.product_id;

  v_multiplier := public.calculate_weight_multiplier(v_category_id, new.weight);
  new.price_at_purchase := round(v_price_base * v_multiplier);

  return new;
end;
$$ language plpgsql;

create trigger set_order_item_price_trigger
  before insert on public.order_items
  for each row execute procedure public.set_order_item_price();

-- Trigger: Recalculate order total from order_items
create or replace function public.recalculate_order_total()
returns trigger as $$
declare
  v_order_id varchar(20);
  v_total integer;
begin
  if TG_OP = 'DELETE' then
    v_order_id := old.order_id;
  else
    v_order_id := new.order_id;
  end if;

  select coalesce(sum(price_at_purchase * quantity), 0)
  into v_total
  from public.order_items
  where order_id = v_order_id;

  update public.orders
  set total_price = v_total
  where id = v_order_id;

  return null;
end;
$$ language plpgsql security definer;

create trigger update_order_total
  after insert or update or delete on public.order_items
  for each row execute procedure public.recalculate_order_total();

-- Trigger: Log order creation to notifications when order total updates to positive value
create or replace function public.on_order_total_updated_log()
returns trigger as $$
begin
  if (old.total_price = 0 or old.total_price is null) and new.total_price > 0 then
    if not exists (
      select 1 from public.notifications 
      where details like '%' || new.id || '%' and type = 'purchase'
    ) then
      insert into public.notifications (id, type, message, details, read, created_at)
      values (
        'purchase_' || new.id,
        'purchase',
        'New Order Placed: ' || new.id,
        new.customer_name || ' placed an order for RS ' || new.total_price || '.',
        false,
        now()
      );
    end if;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger log_order_total_update
  after update of total_price on public.orders
  for each row execute procedure public.on_order_total_updated_log();

-- =========================================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.notifications enable row level security;

-- Profiles Policies
create policy "Allow users to read their own profile, and admins to read all"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin(auth.uid()));

create policy "Allow users to update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Categories Policies
create policy "Allow anyone to read categories"
  on public.categories for select
  using (true);

create policy "Allow admins to modify categories"
  on public.categories for all
  using (public.is_admin(auth.uid()));

-- Products Policies
create policy "Allow anyone to read products"
  on public.products for select
  using (true);

create policy "Allow admins to modify products"
  on public.products for all
  using (public.is_admin(auth.uid()));

-- Orders Policies
create policy "Allow users to read their own orders, and admins to read all"
  on public.orders for select
  using (auth.uid() = user_id or public.is_admin(auth.uid()));

create policy "Allow users to insert their own orders"
  on public.orders for insert
  with check (auth.uid() = user_id);

create policy "Allow admins to update orders"
  on public.orders for update
  using (public.is_admin(auth.uid()));

-- Order Items Policies
create policy "Allow users to read their own order items, and admins to read all"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders
      where id = order_items.order_id
        and (user_id = auth.uid() or public.is_admin(auth.uid()))
    )
  );

create policy "Allow users to insert their own order items"
  on public.order_items for insert
  with check (
    exists (
      select 1 from public.orders
      where id = order_items.order_id
        and user_id = auth.uid()
    )
  );

create policy "Allow admins to modify order items"
  on public.order_items for all
  using (public.is_admin(auth.uid()));

-- Notifications Policies (Admin only)
create policy "Allow admins to manage notifications"
  on public.notifications for all
  using (public.is_admin(auth.uid()));

-- =========================================================================
-- 5. INITIAL DATA SEEDING
-- =========================================================================

insert into public.categories (id, name, slug) values
  ('cakes', 'Artisan Cakes', 'cakes'),
  ('chocolates', 'Artisan Chocolates', 'chocolates'),
  ('cookies', 'Gourmet Cookies', 'cookies'),
  ('packing_bouquets', 'Trouser Packing & Bouquets', 'packing-bouquets'),
  ('customization', 'Custom Orders', 'custom-orders')
on conflict (id) do nothing;

insert into public.products (id, name, description, price_base, category_id, image_url, is_active) values
  ('cake-vanilla', 'Classic Vanilla Cake', 'Moist vanilla sponge layered with rich vanilla buttercream.', 500, 'cakes', '/images/products/cake_chocolate.jpg', true),
  ('cake-chocolate', 'Fudge Chocolate Cake', 'Decadent chocolate sponge with smooth fudge frosting.', 600, 'cakes', '/images/products/cake_chocolate.jpg', true),
  ('choco-belgian', 'Belgian Chocolate Box', 'Assorted dark and milk Belgian chocolate truffles.', 300, 'chocolates', '/images/products/choco_chocolate.jpg', true),
  ('cookie-choco-chip', 'Classic Choco Chip Cookies', 'Freshly baked buttery cookies loaded with premium chocolate chips.', 150, 'cookies', '/images/products/classic_choco.png', true),
  ('packing-trousseau-premium', 'Premium Wedding Trousseau Tray', 'Elegant handmade packing tray decorated with artificial flowers and ribbons.', 1500, 'packing_bouquets', '/images/products/trousseau_packing1.png', true)
on conflict (id) do nothing;

-- =========================================================================
-- 6. ADMIN USER SEEDING
-- =========================================================================

-- Enable pgcrypto extension if not enabled
create extension if not exists pgcrypto;

-- Create admin user in auth.users if not exists
insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
)
values (
  '00000000-0000-0000-0000-000000000000',
  'a0000000-0000-0000-0000-000000000000', -- fixed uuid for admin
  'authenticated',
  'authenticated',
  'admin2602@sweetsurprise.com',
  crypt('Sweet@admin1983', gen_salt('bf')), -- bcrypt hashed password
  now(),
  null,
  null,
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Rinku Adani", "phone": "9825084514", "address": "Sweet Surprise, Mumbai", "is_admin": true}',
  now(),
  now(),
  '',
  '',
  '',
  ''
) on conflict (id) do nothing;

-- Ensure public.profiles contains the admin record with is_admin = true
insert into public.profiles (id, name, phone, address, is_admin)
values (
  'a0000000-0000-0000-0000-000000000000',
  'Rinku Adani',
  '9825084514',
  'Sweet Surprise, Mumbai',
  true
) on conflict (id) do update set is_admin = true;


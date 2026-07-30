-- Apply this baseline in a new Supabase project, then run files in supabase/migrations.
create table if not exists public.profiles(id uuid primary key references auth.users on delete cascade,display_name text check(char_length(display_name)<=80),first_name text,last_name text,avatar_url text,phone text,preferred_language text default 'en',preferred_size text,preferred_colors text[] default '{}',preferred_categories text[] default '{}',marketing_consent boolean default false,created_at timestamptz default now(),updated_at timestamptz default now());
create table if not exists public.user_state(user_id uuid primary key references auth.users on delete cascade,cart jsonb not null default '[]',wishlist jsonb not null default '[]',compare jsonb not null default '[]',recently_viewed jsonb not null default '[]',preferences jsonb not null default '{}',version bigint not null default 1,updated_at timestamptz default now());
alter table public.profiles enable row level security;alter table public.user_state enable row level security;drop policy if exists "profile owner" on public.profiles;drop policy if exists "state owner" on public.user_state;create policy "profile owner" on public.profiles for all using(auth.uid()=id) with check(auth.uid()=id);create policy "state owner" on public.user_state for all using(auth.uid()=user_id) with check(auth.uid()=user_id);

alter table public.profiles
  add column if not exists preferred_currency text default 'USD'
    check (preferred_currency in ('USD','LYD')),
  add column if not exists preferred_country text
    check (preferred_country is null or char_length(preferred_country) = 2);

-- Authenticated order history (additive and RLS-protected)
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  user_id uuid references auth.users(id) on delete set null,
  customer_email text not null,
  currency text not null default 'USD',
  total numeric(12,2) not null check (total >= 0),
  payment_method text not null,
  payment_status text not null default 'pending' check (payment_status in ('pending','paid','failed','refunded','cancelled')),
  order_status text not null default 'received' check (order_status in ('received','confirmed','processing','completed','cancelled')),
  fulfillment_status text not null default 'unfulfilled' check (fulfillment_status in ('unfulfilled','processing','fulfilled','cancelled')),
  shipping_summary jsonb,
  items_snapshot jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.orders enable row level security;
drop policy if exists "Users can read own orders" on public.orders;
create policy "Users can read own orders" on public.orders for select using (auth.uid() = user_id);
drop policy if exists "Users can insert own pending orders" on public.orders;
create policy "Users can insert own pending orders" on public.orders for insert with check (auth.uid() = user_id and payment_status = 'pending');

create table public.book_orders (
  id uuid primary key default gen_random_uuid(),
  order_no bigint generated always as identity (start with 1001),
  status text not null default 'pending'
    check (status in ('pending','paid','shipped','delivered','cancelled')),
  customer_name text not null,
  email text not null,
  phone text not null,
  child_class smallint not null check (child_class between 4 and 9),
  pincode text not null,
  city text not null,
  state text not null,
  address_line1 text not null,
  address_line2 text,
  landmark text,
  quantity int not null default 1,
  amount_inr integer not null,
  currency text not null default 'INR',
  razorpay_order_id text unique,
  razorpay_payment_id text,
  paid_at timestamptz,
  tracking_id text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  created_at timestamptz not null default now()
);

create index book_orders_status_idx on public.book_orders (status, created_at desc);

-- No policies on purpose: only your server (service-role key) can read or write.
alter table public.book_orders enable row level security;
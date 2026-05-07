-- supabase/migrations/011_asaas_payments.sql

-- ── Bookings: ASAAS payment columns ─────────────────────────────────────────
alter table bookings
  add column if not exists customer_name      text,
  add column if not exists customer_email     text,
  add column if not exists customer_phone     text,
  add column if not exists cpf_hash           text,
  add column if not exists asaas_payment_id   text,
  add column if not exists asaas_customer_id  text,
  add column if not exists payment_method     text,
  add column if not exists payment_status     text not null default 'pending',
  add column if not exists payment_url        text,
  add column if not exists pix_qr_code        text,
  add column if not exists pix_copy_paste     text,
  add column if not exists paid_at            timestamptz;

-- ── Partners: ASAAS subconta wallet ─────────────────────────────────────────
alter table partners
  add column if not exists asaas_wallet_id    text,
  add column if not exists commission_pct     integer not null default 90;

-- ── Roadmap tasks (replaces hardcoded array) ─────────────────────────────────
create table if not exists roadmap_tasks (
  id          uuid primary key default gen_random_uuid(),
  area        text not null,
  title       text not null,
  description text,
  status      text not null default 'pending',
  priority    text not null default 'média',
  eta         text,
  notes       text,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table roadmap_tasks enable row level security;

create policy "admin full access roadmap_tasks"
  on roadmap_tasks for all
  using (is_admin())
  with check (is_admin());

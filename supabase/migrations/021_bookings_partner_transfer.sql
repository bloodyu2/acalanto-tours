-- supabase/migrations/021_bookings_partner_transfer.sql
alter table public.bookings
  add column if not exists partner_transfer_id text,
  add column if not exists partner_transferred_at timestamptz;

create index if not exists bookings_partner_transfer_id_idx on public.bookings(partner_transfer_id);

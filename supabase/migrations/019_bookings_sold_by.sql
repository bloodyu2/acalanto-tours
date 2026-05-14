-- supabase/migrations/019_bookings_sold_by.sql
alter table public.bookings
  add column if not exists sold_by_user_id uuid references auth.users(id) on delete set null,
  add column if not exists sold_by_role text check (sold_by_role in ('super_admin','pdv','tripulacao','fotografo'));

create index if not exists bookings_sold_by_user_id_idx on public.bookings(sold_by_user_id);

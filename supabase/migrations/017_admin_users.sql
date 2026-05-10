-- supabase/migrations/017_admin_users.sql
-- RBAC for admin panel: maps auth.users -> non-super_admin roles.
-- super_admin is derived from SUPER_ADMIN_EMAILS env var (no row required).

create table if not exists public.admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('super_admin','pdv','tripulacao','fotografo')),
  display_name text,
  created_at timestamptz default now()
);

alter table public.admin_users enable row level security;

-- service_role bypasses RLS automatically. This permissive policy lets a
-- logged-in admin user read their own row from a Server Component using the
-- session client (createClient + auth.getUser). Insertion still requires the
-- service role.
drop policy if exists "admin_users_self_read" on public.admin_users;
create policy "admin_users_self_read" on public.admin_users
  for select
  using (id = auth.uid());

create index if not exists admin_users_role_idx on public.admin_users(role);

-- supabase/migrations/018_admin_role_permissions.sql
create table if not exists public.admin_role_permissions (
  role text not null check (role in ('super_admin','pdv','tripulacao','fotografo')),
  vertical text not null check (vertical in ('passeio','fotografia','servico','hospedagem')),
  enabled boolean not null default false,
  priority integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (role, vertical)
);

alter table public.admin_role_permissions enable row level security;

drop policy if exists "admin_role_perms_read_authenticated" on public.admin_role_permissions;
create policy "admin_role_perms_read_authenticated" on public.admin_role_permissions
  for select using (auth.role() = 'authenticated');

-- Seed: defaults sensatos
insert into public.admin_role_permissions (role, vertical, enabled, priority) values
  ('super_admin', 'passeio',     true, 100),
  ('super_admin', 'fotografia',  true, 100),
  ('super_admin', 'servico',     true, 100),
  ('super_admin', 'hospedagem',  true, 100),
  ('pdv',         'passeio',     true, 100),
  ('pdv',         'fotografia',  true,  90),
  ('pdv',         'servico',     true,  80),
  ('pdv',         'hospedagem',  true,  70),
  ('tripulacao',  'passeio',     true, 100),
  ('tripulacao',  'fotografia',  true,  80),
  ('tripulacao',  'servico',    false,   0),
  ('tripulacao',  'hospedagem', false,   0),
  ('fotografo',   'fotografia',  true, 100),
  ('fotografo',   'passeio',     true,  70),
  ('fotografo',   'servico',    false,   0),
  ('fotografo',   'hospedagem', false,   0)
on conflict (role, vertical) do nothing;

create table if not exists service_providers (
  id          uuid primary key default gen_random_uuid(),
  service_id  uuid not null references services(id) on delete cascade,
  partner_id  uuid not null references partners(id) on delete cascade,
  notes       text,
  display_order int not null default 0,
  created_at  timestamptz not null default now(),
  unique (service_id, partner_id)
);

alter table service_providers enable row level security;

create policy "public read service_providers"
  on service_providers for select
  using (true);

create policy "admin full access service_providers"
  on service_providers for all
  using (is_admin())
  with check (is_admin());

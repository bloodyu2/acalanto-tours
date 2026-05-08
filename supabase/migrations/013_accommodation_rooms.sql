-- 1. Tabela de tipos de quarto
create table if not exists accommodation_rooms (
  id                       uuid primary key default gen_random_uuid(),
  listing_id               uuid not null references partner_listings(id) on delete cascade,
  name                     text not null,
  description              text,
  price_per_night_cents    integer not null,
  price_extra_guest_cents  integer not null default 0,
  max_guests               integer not null default 2,
  min_nights               integer not null default 1,
  amenities                text[] not null default '{}',
  cover_image              text,
  display_order            integer not null default 0,
  active                   boolean not null default true,
  created_at               timestamptz not null default now()
);

alter table accommodation_rooms enable row level security;

create policy "public read active rooms"
  on accommodation_rooms for select
  using (active = true);

-- 2. accommodation_availability: adicionar room_id
alter table accommodation_availability
  add column if not exists room_id uuid references accommodation_rooms(id) on delete cascade;

-- Índices únicos parciais para upsert correto
create unique index if not exists availability_listing_date_no_room_idx
  on accommodation_availability (listing_id, date) where room_id is null;

create unique index if not exists availability_room_date_idx
  on accommodation_availability (room_id, date) where room_id is not null;

-- 3. gallery: suporte a todos os produtos
alter table gallery
  add column if not exists listing_id              uuid references partner_listings(id) on delete cascade,
  add column if not exists room_id                 uuid references accommodation_rooms(id) on delete cascade,
  add column if not exists photographer_package_id uuid references photographer_packages(id) on delete cascade;

-- 4. bookings: campos de hospedagem
alter table bookings
  add column if not exists accommodation_room_id uuid references accommodation_rooms(id),
  add column if not exists check_out             text;

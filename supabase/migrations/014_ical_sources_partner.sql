-- 1. Add missing columns
alter table ical_sources
  add column if not exists label  text not null default 'Calendário externo',
  add column if not exists active boolean not null default true;

-- 2. Partner RLS: partners can read/write sources for their own listings
create policy "Partners manage own ical_sources"
  on ical_sources for all
  using (
    exists (
      select 1
      from partner_listings pl
      join partners p on p.id = pl.partner_id
      where pl.id = ical_sources.listing_id
        and p.auth_user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from partner_listings pl
      join partners p on p.id = pl.partner_id
      where pl.id = ical_sources.listing_id
        and p.auth_user_id = auth.uid()
    )
  );

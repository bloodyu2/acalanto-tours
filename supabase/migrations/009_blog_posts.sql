create table if not exists blog_posts (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  title       text not null,
  summary     text,
  content     text not null default '',
  cover_url   text,
  published   boolean not null default false,
  published_at timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger blog_posts_updated_at
before update on blog_posts
for each row execute function set_updated_at();

alter table blog_posts enable row level security;

create policy "public read published blog posts"
  on blog_posts for select
  using (published = true);

create policy "admin full access blog posts"
  on blog_posts for all
  using (is_admin())
  with check (is_admin());

-- CashClimb newsletter lead capture
-- Run after the existing CashClimb migrations.

create table if not exists newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text,
  source text not null default 'site',
  page_path text,
  status text not null default 'active' check (status in ('active', 'unsubscribed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists newsletter_subscribers_updated_at on newsletter_subscribers;
create trigger newsletter_subscribers_updated_at
before update on newsletter_subscribers
for each row execute procedure update_updated_at();

create index if not exists newsletter_subscribers_status_idx on newsletter_subscribers(status, created_at desc);
create index if not exists newsletter_subscribers_source_idx on newsletter_subscribers(source);

alter table newsletter_subscribers enable row level security;

-- Inserts are handled through the server API with the Supabase service role.
-- Keep direct public access closed.

-- BuildProof schema for Supabase.
--
-- Run this once in the Supabase SQL editor (Dashboard -> SQL Editor -> New query).
--
-- Design note: no file bytes are stored here. Media lives on Shelby; a row keeps
-- only the Shelby explorer link (the durable on-chain reference) plus the RPC
-- read URL used to render it. Deleting a row never destroys the stored blob.
--
-- Every wallet address is stored in its normalized long form (0x + 64 hex chars),
-- which is what `normalizeAddress()` in src/lib/auth.ts produces. Comparisons
-- elsewhere assume that, so never insert a short-form address by hand.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------- users

create table if not exists public.users (
  wallet      text primary key,
  name        text not null default '',
  bio         text not null default '',
  location    text,
  website     text,
  github      text,
  twitter     text,
  linkedin    text,
  avatar_url  text,   -- Shelby RPC read URL for the avatar image
  resume_url  text,   -- Shelby RPC read URL for the resume PDF
  resume_name text,   -- original filename, for display
  role        text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------- posts

create table if not exists public.posts (
  id           uuid primary key default gen_random_uuid(),
  author       text not null,
  content      text not null default '',
  -- Shelby references. `explorer_url` is the canonical pointer to the stored
  -- blob; `media_url` is the RPC URL the UI renders from.
  media_url    text,
  explorer_url text,
  media_type   text check (media_type in ('image', 'pdf')),
  media_name   text,
  created_at   timestamptz not null default now()
);

create index if not exists posts_created_at_idx on public.posts (created_at desc);
create index if not exists posts_author_idx on public.posts (author);

-- ---------------------------------------------------------------- messages

create table if not exists public.messages (
  id         uuid primary key default gen_random_uuid(),
  sender     text not null,
  receiver   text not null,
  body       text not null,
  media_url  text,
  created_at timestamptz not null default now()
);

-- Conversations are fetched by unordered wallet pair, so index both directions.
create index if not exists messages_pair_idx on public.messages (sender, receiver, created_at);
create index if not exists messages_pair_rev_idx on public.messages (receiver, sender, created_at);

-- ---------------------------------------------------------------- jobs

create table if not exists public.jobs (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  company     text not null,
  description text not null,
  location    text not null,
  type        text not null default 'Full-time',
  salary      text not null default 'Competitive',
  logo        text not null default '',
  posted_by   text,
  created_at  timestamptz not null default now()
);

create index if not exists jobs_created_at_idx on public.jobs (created_at desc);

-- ---------------------------------------------------------------- access

-- RLS is enabled with NO policies, so anonymous and authenticated clients can
-- read nothing. The app reaches these tables only from server-side API routes
-- using the service role key, which bypasses RLS — and those routes already
-- verify a wallet signature before writing.
--
-- This matters: the service role key must never be exposed to the browser. It is
-- read from SUPABASE_SERVICE_ROLE_KEY (no NEXT_PUBLIC_ prefix) for that reason.
--
-- If you later want the browser to query Supabase directly with the anon key,
-- add explicit policies here first — without them, such queries return nothing.

alter table public.users    enable row level security;
alter table public.posts    enable row level security;
alter table public.messages enable row level security;
alter table public.jobs     enable row level security;

-- Keep users.updated_at honest.
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists users_touch_updated_at on public.users;
create trigger users_touch_updated_at
  before update on public.users
  for each row execute function public.touch_updated_at();

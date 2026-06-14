-- PicksRecord schema. Safe to run repeatedly.

create table if not exists users (
  id                    uuid primary key default gen_random_uuid(),
  name                  text not null,
  email                 text not null unique,
  password_hash         text not null,
  preferred_odds_format text not null default 'american' check (preferred_odds_format in ('american','decimal')),
  currency              text not null default 'USD',
  favorite_sports       text[] not null default '{}',
  onboarded             boolean not null default false,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create table if not exists events (
  id          uuid primary key default gen_random_uuid(),
  created_by  uuid not null references users(id) on delete cascade,
  name        text not null,
  sport       text not null,
  description text,
  color       text not null default '#46E6A4',
  event_date  date,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists event_members (
  id         uuid primary key default gen_random_uuid(),
  event_id   uuid not null references events(id) on delete cascade,
  user_id    uuid not null references users(id) on delete cascade,
  role       text not null default 'member' check (role in ('owner','member')),
  created_at timestamptz not null default now(),
  unique (event_id, user_id)
);

create table if not exists picks (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references users(id) on delete cascade,
  event_id         uuid not null references events(id) on delete cascade,
  match_name       text not null,
  selection        text not null,
  pick_type        text not null default 'moneyline' check (pick_type in ('moneyline','spread','over_under','prop','parlay','future','other')),
  stake            numeric(12,2) not null,
  odds             numeric(10,2) not null,
  odds_format      text not null check (odds_format in ('american','decimal')),
  status           text not null default 'pending' check (status in ('pending','won','lost','push')),
  notes            text,
  profit           numeric(12,2) not null default 0,
  potential_return numeric(12,2) not null default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  settled_at       timestamptz
);

-- Parlay legs: for pick_type = 'parlay', the individual selections and their odds.
-- null for single picks. Each element: { "selection": text, "odds": number }.
alter table picks add column if not exists legs jsonb;

create index if not exists idx_picks_user    on picks(user_id);
create index if not exists idx_picks_event   on picks(event_id);
create index if not exists idx_events_owner   on events(created_by);
create index if not exists idx_members_user  on event_members(user_id);

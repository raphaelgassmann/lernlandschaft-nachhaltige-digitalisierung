-- Supabase Setup: Schema + Seed-Daten
-- Dieses Script einmalig im Supabase SQL Editor ausführen.
-- Erstellt alle benötigten Tabellen, RLS-Policies und Seed-Daten.

-- ========================================
-- 1. HIGHSCORES – Bestenliste (1 Zeile pro Spieler)
-- ========================================

create table if not exists highscores (
  name text primary key,
  xp integer not null default 0,
  avatar text not null default 'explorer',
  stations integer not null default 0,
  updated_at date default current_date
);

alter table highscores enable row level security;
create policy "Anyone can read highscores" on highscores for select using (true);
create policy "Anyone can insert highscores" on highscores for insert with check (true);
create policy "Anyone can update highscores" on highscores for update using (true);

-- ========================================
-- 2. PLAYERS – Spieler-Info (Browser, OS, etc.)
-- ========================================

create table if not exists players (
  name text primary key,
  avatar text not null default 'explorer',
  browser text,
  os text,
  screen_width integer,
  screen_height integer,
  language text,
  created_at timestamptz default now(),
  last_seen_at timestamptz default now()
);

alter table players enable row level security;
create policy "Anyone can read players" on players for select using (true);
create policy "Anyone can insert players" on players for insert with check (true);
create policy "Anyone can update players" on players for update using (true);

-- ========================================
-- 3. STATION_TIMES – Verweilzeit pro Station
-- ========================================

create table if not exists station_times (
  id bigint generated always as identity primary key,
  player_name text not null,
  station_id text not null,
  duration_seconds integer not null default 0,
  completed boolean not null default false,
  challenge_done boolean not null default false,
  quiz_passed boolean not null default false,
  visited_at timestamptz default now(),
  unique (player_name, station_id)
);

alter table station_times enable row level security;
create policy "Anyone can read station_times" on station_times for select using (true);
create policy "Anyone can insert station_times" on station_times for insert with check (true);
create policy "Anyone can update station_times" on station_times for update using (true);

-- ========================================
-- 4. SEED: Fiktive Bestenlisten-Einträge
-- ========================================

insert into highscores (name, xp, avatar, stations, updated_at) values
  ('Luca',     172, 'explorer',  12, '2026-03-18'),
  ('Noemi',    158, 'scientist', 11, '2026-03-17'),
  ('Levin',    145, 'hacker',    10, '2026-03-19'),
  ('Mila',     163, 'explorer',  11, '2026-03-16'),
  ('Yanick',   131, 'hacker',     9, '2026-03-18'),
  ('Seraina',  120, 'scientist',  8, '2026-03-15'),
  ('Flurin',   149, 'explorer',  10, '2026-03-20'),
  ('Alina',    175, 'scientist', 12, '2026-03-19'),
  ('Nico',     138, 'hacker',     9, '2026-03-17'),
  ('Ladina',   155, 'explorer',  11, '2026-03-16'),
  ('Matteo',   127, 'scientist',  8, '2026-03-20')
on conflict (name) do update set
  xp = excluded.xp,
  avatar = excluded.avatar,
  stations = excluded.stations,
  updated_at = excluded.updated_at;

-- Supabase Setup: Schema + Seed-Daten
-- Dieses Script einmalig im Supabase SQL Editor ausführen.
-- Erstellt alle benötigten Tabellen, RLS-Policies und Seed-Daten.

-- ========================================
-- 1. HIGHSCORES – Bestenliste (1 Zeile pro Spieler)
-- ========================================

create table if not exists highscores (
  player_id uuid primary key default gen_random_uuid(),
  name text not null,
  xp integer not null default 0,
  avatar text not null default 'explorer',
  stations integer not null default 0,
  group_name text not null default '',
  cert_uuid uuid default gen_random_uuid(),
  updated_at date default current_date
);

alter table highscores enable row level security;
create policy "Anyone can read highscores" on highscores for select using (true);
create policy "Anyone can insert highscores" on highscores for insert with check (true);
create policy "Anyone can update highscores" on highscores for update using (true);
create policy "Anyone can delete highscores" on highscores for delete using (true);

-- ========================================
-- 2. PLAYERS – Spieler-Info (Browser, OS, etc.)
-- ========================================

create table if not exists players (
  player_id uuid primary key default gen_random_uuid(),
  name text not null,
  avatar text not null default 'explorer',
  group_name text not null default '',
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
create policy "Anyone can delete players" on players for delete using (true);

-- ========================================
-- 3. STATION_TIMES – Verweilzeit pro Station
-- ========================================

create table if not exists station_times (
  id bigint generated always as identity primary key,
  player_id uuid not null,
  station_id text not null,
  duration_seconds integer not null default 0,
  completed boolean not null default false,
  challenge_done boolean not null default false,
  quiz_passed boolean not null default false,
  visited_at timestamptz default now(),
  unique (player_id, station_id)
);

alter table station_times enable row level security;
create policy "Anyone can read station_times" on station_times for select using (true);
create policy "Anyone can insert station_times" on station_times for insert with check (true);
create policy "Anyone can update station_times" on station_times for update using (true);

-- ========================================
-- 4. GROUP_SETTINGS – Einstellungen pro Gruppe
-- ========================================

create table if not exists group_settings (
  group_name text primary key,
  minigames_enabled boolean not null default true
);

alter table group_settings enable row level security;
create policy "Anyone can read group_settings" on group_settings for select using (true);
create policy "Anyone can insert group_settings" on group_settings for insert with check (true);
create policy "Anyone can update group_settings" on group_settings for update using (true);
create policy "Anyone can delete group_settings" on group_settings for delete using (true);

-- ========================================
-- 5. MIGRATION: name → player_id (UUID)
-- ========================================

-- Für bestehende Installationen mit name als PK:
--
-- ALTER TABLE highscores DROP CONSTRAINT highscores_pkey;
-- ALTER TABLE highscores ADD COLUMN player_id uuid DEFAULT gen_random_uuid();
-- UPDATE highscores SET player_id = gen_random_uuid() WHERE player_id IS NULL;
-- ALTER TABLE highscores ALTER COLUMN player_id SET NOT NULL;
-- ALTER TABLE highscores ADD PRIMARY KEY (player_id);
--
-- ALTER TABLE players DROP CONSTRAINT players_pkey;
-- ALTER TABLE players ADD COLUMN player_id uuid DEFAULT gen_random_uuid();
-- UPDATE players SET player_id = gen_random_uuid() WHERE player_id IS NULL;
-- ALTER TABLE players ALTER COLUMN player_id SET NOT NULL;
-- ALTER TABLE players ADD PRIMARY KEY (player_id);
--
-- ALTER TABLE station_times DROP CONSTRAINT station_times_player_name_station_id_key;
-- ALTER TABLE station_times RENAME COLUMN player_name TO player_id;
-- ALTER TABLE station_times ALTER COLUMN player_id TYPE uuid USING gen_random_uuid();
-- ALTER TABLE station_times ADD UNIQUE (player_id, station_id);

-- ========================================
-- 5. SEED: Fiktive Bestenlisten-Einträge
-- ========================================

insert into highscores (player_id, name, xp, avatar, stations, updated_at) values
  (gen_random_uuid(), 'Luca',     172, 'explorer',  12, '2026-03-18'),
  (gen_random_uuid(), 'Noemi',    158, 'scientist', 11, '2026-03-17'),
  (gen_random_uuid(), 'Levin',    145, 'hacker',    10, '2026-03-19'),
  (gen_random_uuid(), 'Mila',     163, 'explorer',  11, '2026-03-16'),
  (gen_random_uuid(), 'Yanick',   131, 'hacker',     9, '2026-03-18'),
  (gen_random_uuid(), 'Seraina',  120, 'scientist',  8, '2026-03-15'),
  (gen_random_uuid(), 'Flurin',   149, 'explorer',  10, '2026-03-20'),
  (gen_random_uuid(), 'Alina',    175, 'scientist', 12, '2026-03-19'),
  (gen_random_uuid(), 'Nico',     138, 'hacker',     9, '2026-03-17'),
  (gen_random_uuid(), 'Ladina',   155, 'explorer',  11, '2026-03-16'),
  (gen_random_uuid(), 'Matteo',   127, 'scientist',  8, '2026-03-20');

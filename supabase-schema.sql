-- Planning Poker - Supabase Schema
-- Supabase dashboard > SQL Editor'de çalıştır

create table if not exists rooms (
  id text primary key,
  name text not null,
  revealed boolean not null default false,
  created_at timestamptz default now()
);

create table if not exists players (
  id text primary key,
  room_id text not null references rooms(id) on delete cascade,
  name text not null,
  has_voted boolean not null default false
);

create table if not exists votes (
  player_id text primary key references players(id) on delete cascade,
  room_id text not null references rooms(id) on delete cascade,
  value text not null
);

-- DELETE eventlerinde filtre çalışsın diye replica identity full
alter table players replica identity full;
alter table votes replica identity full;

-- RLS etkinleştir ama anon key ile her şeye izin ver
alter table rooms enable row level security;
alter table players enable row level security;
alter table votes enable row level security;

create policy "anon all" on rooms for all to anon using (true) with check (true);
create policy "anon all" on players for all to anon using (true) with check (true);
create policy "anon all" on votes for all to anon using (true) with check (true);

-- Realtime etkinleştir
alter publication supabase_realtime add table rooms;
alter publication supabase_realtime add table players;
alter publication supabase_realtime add table votes;

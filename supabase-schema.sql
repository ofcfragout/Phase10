-- Phase 10 Game Database Schema for Supabase

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Games table
create table games (
  id uuid primary key default uuid_generate_v4(),
  share_code text unique not null,
  status text not null check (status in ('waiting', 'active', 'completed')),
  current_player_index integer not null default 0,
  phase integer not null default 1,
  deck jsonb not null,
  discard_pile jsonb not null,
  winner_id uuid,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Players table
create table players (
  id uuid primary key default uuid_generate_v4(),
  game_id uuid references games(id) on delete cascade,
  name text not null,
  hand jsonb not null,
  current_phase integer not null default 1,
  score integer not null default 0,
  has_completed_phase boolean not null default false,
  has_laid_down boolean not null default false,
  player_order integer not null,
  created_at timestamp with time zone default now()
);

-- Game moves table (for tracking all moves)
create table game_moves (
  id uuid primary key default uuid_generate_v4(),
  game_id uuid references games(id) on delete cascade,
  player_id uuid references players(id) on delete cascade,
  move_type text not null,
  move_data jsonb,
  created_at timestamp with time zone default now()
);

-- Laid down cards table (for phase completions)
create table laid_down_cards (
  id uuid primary key default uuid_generate_v4(),
  game_id uuid references games(id) on delete cascade,
  player_id uuid references players(id) on delete cascade,
  groups jsonb not null,
  created_at timestamp with time zone default now()
);

-- Indexes
create index games_share_code_idx on games(share_code);
create index players_game_id_idx on players(game_id);
create index game_moves_game_id_idx on game_moves(game_id);
create index laid_down_cards_game_id_idx on laid_down_cards(game_id);

-- Enable Row Level Security
alter table games enable row level security;
alter table players enable row level security;
alter table game_moves enable row level security;
alter table laid_down_cards enable row level security;

-- RLS Policies (Allow all for now - can be restricted based on authentication)
create policy "Allow all on games" on games for all using (true);
create policy "Allow all on players" on players for all using (true);
create policy "Allow all on game_moves" on game_moves for all using (true);
create policy "Allow all on laid_down_cards" on laid_down_cards for all using (true);

-- Function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger to auto-update updated_at
create trigger update_games_updated_at
  before update on games
  for each row
  execute function update_updated_at_column();

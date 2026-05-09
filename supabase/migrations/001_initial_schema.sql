-- ─── Extensions ──────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─── Profiles ────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id             uuid primary key references auth.users(id) on delete cascade,
  email          text not null,
  name           text not null default '',
  plan           text not null default 'operator' check (plan in ('operator','strategist','institution')),
  trial_ends_at  timestamptz,
  ens_name       text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
alter table public.profiles enable row level security;
drop policy if exists "Users can view their own profile"   on public.profiles;
drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can view their own profile"   on public.profiles for select using (auth.uid() = id);
create policy "Users can update their own profile" on public.profiles for update using (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── Mandates ────────────────────────────────────────────────────────────────
create table if not exists public.mandates (
  id             uuid primary key default uuid_generate_v4(),
  user_id        uuid not null references public.profiles(id) on delete cascade,
  name           text not null,
  mandate_text   text not null default '',
  parsed_policy  jsonb,
  policy_hash    text,
  base_currency  text not null default 'USDC',
  strategy_type  text,
  risk_params    jsonb not null default '{"maxDrawdown":15,"maxPosition":20,"stopLoss":5,"maxPositions":5,"cooldownHours":1}'::jsonb,
  capital_cap    numeric,
  status         text not null default 'draft' check (status in ('draft','active','paused','archived')),
  on_chain_tx    text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
alter table public.mandates enable row level security;
drop policy if exists "Users manage their own mandates" on public.mandates;
create policy "Users manage their own mandates" on public.mandates for all using (auth.uid() = user_id);
create index if not exists mandates_user_status_idx on public.mandates (user_id, status);

-- ─── Agents ──────────────────────────────────────────────────────────────────
create table if not exists public.agents (
  id                uuid primary key default uuid_generate_v4(),
  user_id           uuid not null references public.profiles(id) on delete cascade,
  mandate_id        uuid not null references public.mandates(id) on delete cascade,
  name              text not null,
  status            text not null default 'inactive' check (status in ('active','paused','failed','stopped','inactive')),
  capital_cap       numeric not null default 0,
  total_pnl         numeric not null default 0,
  total_roi         numeric not null default 0,
  total_volume      numeric not null default 0,
  drawdown_current  numeric not null default 0,
  deployed_at       timestamptz,
  last_trade_at     timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
alter table public.agents enable row level security;
drop policy if exists "Users manage their own agents" on public.agents;
create policy "Users manage their own agents" on public.agents for all using (auth.uid() = user_id);
create index if not exists agents_user_status_idx on public.agents (user_id, status);

-- ─── Wallets ─────────────────────────────────────────────────────────────────
create table if not exists public.wallets (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  address      text not null,
  chain_id     integer not null default 5000,
  label        text,
  balance_usd  numeric not null default 0,
  is_primary   boolean not null default false,
  created_at   timestamptz not null default now(),
  unique (user_id, address)
);
alter table public.wallets enable row level security;
drop policy if exists "Users manage their own wallets" on public.wallets;
create policy "Users manage their own wallets" on public.wallets for all using (auth.uid() = user_id);

-- ─── Trades ──────────────────────────────────────────────────────────────────
create table if not exists public.trades (
  id                    uuid primary key default uuid_generate_v4(),
  user_id               uuid not null references public.profiles(id) on delete cascade,
  agent_id              uuid not null references public.agents(id) on delete cascade,
  mandate_id            uuid not null references public.mandates(id) on delete cascade,
  asset_pair            text not null,
  direction             text not null check (direction in ('buy','sell')),
  amount_usd            numeric not null,
  price                 numeric not null,
  pnl                   numeric,
  protocol              text not null default 'merchant_moe',
  tx_hash               text,
  block_number          bigint,
  status                text not null default 'pending' check (status in ('pending','success','failed')),
  mandate_rule_applied  text,
  created_at            timestamptz not null default now()
);
alter table public.trades enable row level security;
drop policy if exists "Users view their own trades" on public.trades;
create policy "Users view their own trades" on public.trades for all using (auth.uid() = user_id);
create index if not exists trades_user_created_idx on public.trades (user_id, created_at desc);
create index if not exists trades_agent_created_idx on public.trades (agent_id, created_at desc);

-- ─── Portfolio History ────────────────────────────────────────────────────────
create table if not exists public.portfolio_history (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  date       date not null,
  value      numeric not null default 0,
  pnl        numeric not null default 0,
  created_at timestamptz not null default now(),
  unique (user_id, date)
);
alter table public.portfolio_history enable row level security;
drop policy if exists "Users view their own portfolio history" on public.portfolio_history;
create policy "Users view their own portfolio history" on public.portfolio_history for all using (auth.uid() = user_id);

-- ─── Alerts ──────────────────────────────────────────────────────────────────
create table if not exists public.alerts (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  type       text not null,
  severity   text not null default 'info' check (severity in ('info','warning','critical')),
  title      text not null,
  message    text not null,
  is_read    boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.alerts enable row level security;
drop policy if exists "Users manage their own alerts" on public.alerts;
create policy "Users manage their own alerts" on public.alerts for all using (auth.uid() = user_id);
create index if not exists alerts_user_read_idx on public.alerts (user_id, is_read, created_at desc);

-- ─── Audit Logs ──────────────────────────────────────────────────────────────
create table if not exists public.audit_logs (
  id             uuid primary key default uuid_generate_v4(),
  user_id        uuid not null references public.profiles(id) on delete cascade,
  agent_id       uuid references public.agents(id) on delete set null,
  trade_id       uuid references public.trades(id) on delete set null,
  event_type     text not null,
  decision_hash  text,
  tx_hash        text,
  block_number   bigint,
  details        jsonb not null default '{}'::jsonb,
  created_at     timestamptz not null default now()
);
alter table public.audit_logs enable row level security;
drop policy if exists "Users view their own audit logs"  on public.audit_logs;
drop policy if exists "System can insert audit logs"     on public.audit_logs;
create policy "Users view their own audit logs" on public.audit_logs for select using (auth.uid() = user_id);
create policy "System can insert audit logs"    on public.audit_logs for insert with check (auth.uid() = user_id);
create index if not exists audit_logs_user_created_idx on public.audit_logs (user_id, created_at desc);

-- ─── updated_at trigger ──────────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
drop trigger if exists set_updated_at on public.profiles;
drop trigger if exists set_updated_at on public.mandates;
drop trigger if exists set_updated_at on public.agents;
create trigger set_updated_at before update on public.profiles for each row execute procedure public.set_updated_at();
create trigger set_updated_at before update on public.mandates for each row execute procedure public.set_updated_at();
create trigger set_updated_at before update on public.agents   for each row execute procedure public.set_updated_at();

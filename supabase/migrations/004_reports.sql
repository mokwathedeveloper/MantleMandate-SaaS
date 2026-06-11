-- ─── Reports ─────────────────────────────────────────────────────────────────
-- Per-user generated performance/risk/agent/portfolio reports surfaced on
-- /dashboard/reports. Mirrors the column mapping expected by
-- frontend/app/api/reports/route.ts.
create table if not exists public.reports (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  name          text not null,
  type          text not null check (type in ('PERFORMANCE','RISK','AGENT','PORTFOLIO')),
  date_from     date not null,
  date_to       date not null,
  total_pnl     numeric not null default 0,
  roi           numeric not null default 0,
  drawdown      numeric,
  sharpe_ratio  numeric,
  created_at    timestamptz not null default now()
);

alter table public.reports enable row level security;
drop policy if exists "Users manage their own reports" on public.reports;
create policy "Users manage their own reports" on public.reports for all using (auth.uid() = user_id);
create index if not exists reports_user_created_idx on public.reports (user_id, created_at desc);

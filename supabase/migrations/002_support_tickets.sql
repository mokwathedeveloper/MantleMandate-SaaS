-- ─── Support Tickets ─────────────────────────────────────────────────────────
create table if not exists public.support_tickets (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references auth.users(id) on delete set null,
  from_email  text not null,
  from_name   text not null default '',
  subject     text not null,
  category    text not null default 'General Question',
  priority    text not null default 'Medium' check (priority in ('Low','Medium','High')),
  message     text not null,
  ticket_ref  text not null,
  status      text not null default 'open' check (status in ('open','in_progress','resolved','closed')),
  created_at  timestamptz not null default now()
);
alter table public.support_tickets enable row level security;
drop policy if exists "Users can view their own tickets"   on public.support_tickets;
drop policy if exists "Anyone can submit a support ticket" on public.support_tickets;
create policy "Users can view their own tickets"   on public.support_tickets for select using (auth.uid() = user_id);
create policy "Anyone can submit a support ticket" on public.support_tickets for insert with check (true);
create index if not exists support_tickets_user_idx    on public.support_tickets (user_id, created_at desc);
create index if not exists support_tickets_status_idx  on public.support_tickets (status, created_at desc);

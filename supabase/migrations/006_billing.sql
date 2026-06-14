-- ─── Billing / Invoices ──────────────────────────────────────────────────────
-- Per-user payment records, surfaced on /dashboard/billing. Crypto invoices
-- are created by frontend/app/api/billing/verify-crypto/route.ts after a
-- real on-chain transfer to NEXT_PUBLIC_TREASURY_ADDRESS on Mantle Sepolia
-- is verified. Card/bank payment_method values are reserved for when a
-- payment provider (e.g. Stripe) is connected.
create table if not exists public.invoices (
  id             uuid primary key default uuid_generate_v4(),
  user_id        uuid not null references public.profiles(id) on delete cascade,
  plan           text not null,
  amount         numeric not null,
  currency       text not null default 'MNT',
  payment_method text not null check (payment_method in ('crypto', 'card', 'bank')),
  status         text not null default 'pending' check (status in ('pending', 'paid', 'failed')),
  tx_hash        text,
  created_at     timestamptz not null default now()
);

alter table public.invoices enable row level security;
drop policy if exists "Users manage their own invoices" on public.invoices;
create policy "Users manage their own invoices" on public.invoices for all using (auth.uid() = user_id);

create index if not exists invoices_user_created_idx on public.invoices (user_id, created_at desc);
create unique index if not exists invoices_tx_hash_unique on public.invoices (tx_hash) where tx_hash is not null;

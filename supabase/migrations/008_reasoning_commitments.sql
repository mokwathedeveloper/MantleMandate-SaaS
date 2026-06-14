-- ─── Reasoning trail + on-chain commitment linkage ─────────────────────────
-- Records the content-addressed (IPFS CIDv1) reasoning trail for a trade and
-- the on-chain AgentReputationRegistry commitment that anchors it before
-- execution. All columns are nullable: ticks behave exactly as before when
-- AgentReputationRegistry is not yet deployed/configured.
alter table public.trades
  add column if not exists reasoning_cid        text,
  add column if not exists reasoning_pinned     boolean not null default false,
  add column if not exists commitment_tx_hash   text,
  add column if not exists commitment_index     bigint,
  add column if not exists resolution_tx_hash   text;

create index if not exists trades_reasoning_cid_idx
  on public.trades (reasoning_cid) where reasoning_cid is not null;

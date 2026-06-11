-- ─── On-chain shadow agent linkage ──────────────────────────────────────────
-- Links a platform `agents` row to the on-chain AgentExecutor agent that the
-- service wallet registers and executes orders against on its behalf.
alter table public.agents
  add column if not exists onchain_agent_id    bigint,
  add column if not exists onchain_policy_hash text,
  add column if not exists onchain_owner       text;

create index if not exists agents_onchain_agent_id_idx
  on public.agents (onchain_agent_id) where onchain_agent_id is not null;

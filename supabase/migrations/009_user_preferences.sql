-- ─── User display/notification preferences ────────────────────────────────
-- Settings page (Display, Language, Notifications tabs) previously held
-- these as local-only React state — reloading the page reset everything to
-- hardcoded defaults. Persist them as a single jsonb blob on the user's own
-- profile row; RLS policies from 001_initial_schema.sql already restrict
-- reads/writes to `auth.uid() = id`, and 007_protect_profile_fields.sql only
-- guards `role`/`plan`, so this column is freely updatable by the owner.
alter table public.profiles
  add column if not exists preferences jsonb not null default '{}'::jsonb;

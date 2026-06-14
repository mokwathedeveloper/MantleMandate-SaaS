-- ─── Protect privileged profile fields ──────────────────────────────────────
-- "Users can update their own profile" (001_initial_schema.sql) is
-- `for update using (auth.uid() = id)` with no column restriction and no
-- `with check`, so RLS lets a user update ANY column on their own row —
-- including `role` (005_user_roles.sql) and `plan`. Without this trigger,
-- a signed-in user could run, from the browser console:
--   supabase.from('profiles').update({ role: 'admin' }).eq('id', user.id)
-- to gain access to /dashboard/users (admin panel), or:
--   supabase.from('profiles').update({ plan: 'institution' }).eq('id', user.id)
-- to upgrade their plan for free, bypassing /api/billing/verify-crypto.
--
-- Only connections authenticated with the service-role key (auth.role() =
-- 'service_role') may change `role` or `plan`. Routes that need to change
-- these — /api/billing/verify-crypto (plan) and any future admin-role-grant
-- tooling (role) — must use the service-role Supabase client.
create or replace function public.guard_profile_privileged_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (new.role is distinct from old.role or new.plan is distinct from old.plan)
     and auth.role() <> 'service_role' then
    raise exception 'Only the system can change role or plan';
  end if;
  return new;
end;
$$;

drop trigger if exists guard_profile_privileged_fields on public.profiles;
create trigger guard_profile_privileged_fields
  before update on public.profiles
  for each row execute function public.guard_profile_privileged_fields();

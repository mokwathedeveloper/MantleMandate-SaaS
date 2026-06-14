-- ─── User Roles ──────────────────────────────────────────────────────────────
-- Adds an admin/user role to profiles, used to gate the real admin user panel
-- at /dashboard/users (frontend/app/api/admin/users/route.ts).
alter table public.profiles
  add column if not exists role text not null default 'user' check (role in ('user', 'admin'));

-- ─── One-time manual step ───────────────────────────────────────────────────
-- After applying this migration, bootstrap the first admin account by running
-- the following in the Supabase SQL editor (replace the email if needed):
--
--   update public.profiles set role = 'admin' where email = 'mokwaohuru@gmail.com';

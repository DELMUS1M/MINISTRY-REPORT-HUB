-- ============================================================================
-- Ministry Report Hub — initial schema
-- Run via `supabase db push`, or paste into the Supabase SQL editor.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. profiles — one row per auth.users, holds the app-level identity
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  username text not null unique,
  role text not null default 'publisher' check (role in ('publisher', 'secretary')),
  category text check (category in ('publisher', 'regular_pioneer', 'auxiliary_pioneer', 'special_pioneer')),
  avatar_url text,
  created_at timestamptz not null default now()
);

comment on table public.profiles is 'App-level identity for every account: name, username, role, category, avatar.';

-- ---------------------------------------------------------------------------
-- 2. reports — one row per publisher per month
-- ---------------------------------------------------------------------------
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  month_key text not null check (month_key ~ '^\d{4}-\d{2}$'),
  category text not null check (category in ('publisher', 'regular_pioneer', 'auxiliary_pioneer', 'special_pioneer')),
  participated boolean,
  hours numeric(6, 2),
  studies integer,
  comment text,
  submitted_at timestamptz not null default now(),
  edited_by_secretary text,
  edited_at timestamptz,
  unique (user_id, month_key)
);

comment on table public.reports is 'One locked report per publisher per month. Only the secretary may update after submission.';

create index if not exists reports_month_key_idx on public.reports (month_key);
create index if not exists reports_user_id_idx on public.reports (user_id);

-- ---------------------------------------------------------------------------
-- 3. New-user trigger — creates the profile row from signUp() metadata
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, username, role, category)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1)),
    'publisher',
    coalesce(new.raw_user_meta_data ->> 'category', 'publisher')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------------------------
-- 4. Helper — is the current JWT a secretary?
-- ---------------------------------------------------------------------------
create or replace function public.is_secretary()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'secretary'
  );
$$;

-- ---------------------------------------------------------------------------
-- 5. Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.reports enable row level security;

-- profiles: any signed-in member can see the congregation directory
-- (needed so the secretary's table and the "hasn't reported" list can show
-- names); only the owner can create/update their own row.
drop policy if exists profiles_select_authenticated on public.profiles;
create policy profiles_select_authenticated
  on public.profiles for select
  to authenticated
  using (true);

drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- reports: publishers see + create their own; the secretary sees everyone's.
-- Reports are locked after insert — only the secretary can update or delete.
drop policy if exists reports_select_own_or_secretary on public.reports;
create policy reports_select_own_or_secretary
  on public.reports for select
  to authenticated
  using (auth.uid() = user_id or public.is_secretary());

drop policy if exists reports_insert_own on public.reports;
create policy reports_insert_own
  on public.reports for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists reports_update_secretary_only on public.reports;
create policy reports_update_secretary_only
  on public.reports for update
  to authenticated
  using (public.is_secretary())
  with check (public.is_secretary());

drop policy if exists reports_delete_secretary_only on public.reports;
create policy reports_delete_secretary_only
  on public.reports for delete
  to authenticated
  using (public.is_secretary());

-- ---------------------------------------------------------------------------
-- 6. Storage — avatars bucket (public read, owner-only write)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

drop policy if exists avatars_public_read on storage.objects;
create policy avatars_public_read
  on storage.objects for select
  to public
  using (bucket_id = 'avatars');

drop policy if exists avatars_owner_write on storage.objects;
create policy avatars_owner_write
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists avatars_owner_update on storage.objects;
create policy avatars_owner_update
  on storage.objects for update
  to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists avatars_owner_delete on storage.objects;
create policy avatars_owner_delete
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

-- ---------------------------------------------------------------------------
-- 7. Realtime — publish reports table changes to subscribed clients
-- ---------------------------------------------------------------------------
alter publication supabase_realtime add table public.reports;

-- ============================================================================
-- Wizecatch — Étape 1 : profils utilisateurs
--
-- À exécuter dans Supabase → SQL Editor → New query → Run.
-- Les tables sites / reviews / sessions viendront dans la migration suivante.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Table profiles : prolonge auth.users avec nos données applicatives.
-- On ne touche jamais à auth.users directement (table gérée par Supabase).
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text not null,
  full_name   text,
  avatar_url  text,
  locale      text not null default 'en' check (locale in ('en', 'fr')),
  plan        text not null default 'free' check (plan in ('free', 'pro')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.profiles is
  'Données applicatives de l''utilisateur. 1 ligne par compte auth.users.';

-- ----------------------------------------------------------------------------
-- RLS : chacun ne voit et ne modifie que sa propre ligne.
-- ----------------------------------------------------------------------------
alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  using ((select auth.uid()) = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Pas de policy INSERT : la création passe uniquement par le trigger ci-dessous,
-- qui s'exécute en security definer. Un utilisateur ne peut pas se fabriquer
-- un profil arbitraire.

-- ----------------------------------------------------------------------------
-- Trigger : créer le profil automatiquement à l'inscription.
--
-- Google renvoie le nom et l'avatar dans raw_user_meta_data. Les clés diffèrent
-- selon le provider, d'où les coalesce : Google utilise full_name / name et
-- avatar_url / picture. Une inscription par email n'aura ni l'un ni l'autre.
-- ----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name'
    ),
    coalesce(
      new.raw_user_meta_data ->> 'avatar_url',
      new.raw_user_meta_data ->> 'picture'
    )
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- Tenir updated_at à jour automatiquement.
-- ----------------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row
  execute function public.touch_updated_at();

-- ----------------------------------------------------------------------------
-- Rattraper les comptes déjà créés avant l'installation du trigger
-- (utile si vous aviez testé une connexion avant d'exécuter ce script).
-- ----------------------------------------------------------------------------
insert into public.profiles (id, email, full_name, avatar_url)
select
  u.id,
  u.email,
  coalesce(u.raw_user_meta_data ->> 'full_name', u.raw_user_meta_data ->> 'name'),
  coalesce(u.raw_user_meta_data ->> 'avatar_url', u.raw_user_meta_data ->> 'picture')
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null;

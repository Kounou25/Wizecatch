-- ============================================================================
-- Wizecatch — Étape 6 : sécurisation des plans et socle d'administration
--
-- Ce que cette migration corrige et apporte :
--   1. FAILLE — un utilisateur pouvait s'attribuer un plan payant lui-même
--   2. Les plans autorisés en base ne correspondaient pas à ceux vendus
--   3. Le drapeau administrateur
--   4. Le journal d'audit des actions d'administration
--
-- Supabase → SQL Editor → New query → coller → Run.
-- ============================================================================


-- ----------------------------------------------------------------------------
-- 1. Élévation de privilège : un compte pouvait se vendre un abonnement
--
-- `profiles_update_own` autorise la mise à jour de sa propre ligne. Mais RLS ne
-- filtre que les LIGNES, jamais les colonnes : la politique laissait donc
-- passer `update profiles set plan = 'pro'`. Comme SITE_LIMITS lit ce champ
-- pour appliquer les quotas, n'importe qui pouvait débloquer les limites
-- payantes depuis la console de son navigateur.
--
-- Le correctif se fait au niveau des privilèges Postgres, seul endroit où l'on
-- peut restreindre des colonnes. La politique RLS reste inchangée.
-- ----------------------------------------------------------------------------
revoke update on public.profiles from authenticated, anon;

-- Seuls les champs que l'utilisateur a le droit de modifier lui-même.
-- `plan` et `is_admin` en sont volontairement absents.
grant update (full_name, avatar_url, locale) on public.profiles to authenticated;


-- ----------------------------------------------------------------------------
-- 2. Aligner les plans sur la grille tarifaire
--
-- La contrainte n'acceptait que 'free' et 'pro' alors que la plateforme vend
-- free / starter / scale / lifetime. Passer un client en « Starter » aurait été
-- rejeté par la base.
--
-- 'pro' est conservé : d'anciennes lignes le portent peut-être déjà.
-- ----------------------------------------------------------------------------
alter table public.profiles drop constraint if exists profiles_plan_check;

alter table public.profiles add constraint profiles_plan_check
  check (plan in ('free', 'starter', 'scale', 'lifetime', 'pro'));


-- ----------------------------------------------------------------------------
-- 3. Drapeau administrateur
--
-- Non modifiable par l'utilisateur : la restriction de colonnes ci-dessus
-- l'exclut des champs accordés. Sans elle, ajouter ce drapeau aurait permis à
-- n'importe qui de se déclarer administrateur.
--
-- L'attribution se fait à la main, en SQL — voir la fin de ce fichier.
-- ----------------------------------------------------------------------------
alter table public.profiles
  add column if not exists is_admin boolean not null default false;

comment on column public.profiles.is_admin is
  'Accès au back-office. Modifiable uniquement en SQL ou via le service role.';


-- ----------------------------------------------------------------------------
-- 4. Journal d'audit
--
-- Le back-office contourne RLS pour lire les données de tous les comptes. À
-- partir de là, il faut pouvoir dire qui a consulté ou modifié quoi, et quand.
-- Sans ce journal, un accès administrateur est indistinguable d'une fuite.
-- ----------------------------------------------------------------------------
create table if not exists public.audit_log (
  id          bigserial primary key,
  actor_id    uuid references public.profiles (id) on delete set null,
  actor_email text,
  action      text not null,
  target_type text,
  target_id   text,
  details     jsonb,
  created_at  timestamptz not null default now()
);

comment on table public.audit_log is
  'Actions d''administration. Écriture et lecture réservées au service role.';

create index if not exists audit_log_created_idx
  on public.audit_log (created_at desc);

alter table public.audit_log enable row level security;

-- Aucune politique : RLS active sans policy = tout est refusé aux clients
-- normaux. Seul le service role, qui contourne RLS, peut lire et écrire.


-- ----------------------------------------------------------------------------
-- 5. Se déclarer administrateur
--
-- Remplacez l'adresse par la vôtre, puis exécutez cette ligne.
-- C'est volontairement manuel : aucune interface ne doit pouvoir créer un
-- administrateur.
-- ----------------------------------------------------------------------------
-- update public.profiles set is_admin = true where email = 'vous@exemple.com';


-- ----------------------------------------------------------------------------
-- Vérification
-- ----------------------------------------------------------------------------
select
  (select count(*) from information_schema.column_privileges
     where table_name = 'profiles' and grantee = 'authenticated'
       and privilege_type = 'UPDATE')                        as colonnes_modifiables,
  (select count(*) from public.profiles where is_admin)      as administrateurs;



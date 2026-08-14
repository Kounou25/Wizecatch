-- ============================================================================
-- Wizecatch — Étape 7 : facturation (Dodo Payments)
--
-- Trois objets :
--   1. `subscriptions`  — l'état brut venu du fournisseur
--   2. `payment_events` — le journal des webhooks, qui garantit l'idempotence
--   3. `profiles.plan_source` — distingue un plan payé d'un plan posé à la main
--
-- PRINCIPE : `profiles.plan` reste le DROIT D'ACCÈS (lu par SITE_LIMITS,
-- EXPORT_PLANS, le quota d'avis). `subscriptions` est l'ÉTAT BRUT du
-- fournisseur. Les deux sont séparés parce que le plan est une valeur dérivée :
-- sans l'état brut, on ne peut ni rejouer un événement manqué, ni expliquer
-- pourquoi un compte est dans tel plan.
--
-- Supabase → SQL Editor → New query → coller → Run.
-- ============================================================================


-- ----------------------------------------------------------------------------
-- 1. Journal des webhooks — la pièce qui rend le traitement idempotent
--
-- Dodo réessaie jusqu'à 8 fois (immédiatement, 5 s, 5 min, 30 min, 2 h, 5 h,
-- 10 h, 10 h) et coupe la connexion au bout de 15 secondes. Un traitement
-- lent produit donc des livraisons multiples du MÊME événement.
--
-- `event_id` porte l'en-tête `webhook-id` : la charge utile de Dodo ne contient
-- aucun identifiant d'événement, c'est donc le seul repère stable. La contrainte
-- UNIQUE est ce qui empêche de compter deux fois un renouvellement — sans elle,
-- une latence passagère se traduit par huit activations.
-- ----------------------------------------------------------------------------
create table if not exists public.payment_events (
  id           bigserial primary key,
  event_id     text not null unique,
  event_type   text not null,
  payload      jsonb not null,
  -- Renseigné une fois l'effet appliqué. Un événement reçu mais non traité
  -- reste visible ici : c'est ce qui permet de diagnostiquer après coup.
  processed_at timestamptz,
  error        text,
  created_at   timestamptz not null default now()
);

comment on table public.payment_events is
  'Webhooks Dodo reçus. Écriture et lecture réservées au service role.';

create index if not exists payment_events_created_idx
  on public.payment_events (created_at desc);

alter table public.payment_events enable row level security;
-- Aucune politique : RLS active sans policy refuse tout aux clients normaux.
-- Seul le service role, qui contourne RLS, écrit et lit ici.


-- ----------------------------------------------------------------------------
-- 2. Abonnements
--
-- Une ligne par abonnement Dodo. `provider_subscription_id` est unique : un
-- webhook rejoué met à jour la ligne existante au lieu d'en créer une seconde.
-- ----------------------------------------------------------------------------
create table if not exists public.subscriptions (
  id                       uuid primary key default gen_random_uuid(),
  user_id                  uuid not null references public.profiles (id) on delete cascade,

  provider_subscription_id text not null unique,
  provider_customer_id     text,
  provider_product_id      text,

  -- Le plan Wizecatch correspondant au produit acheté.
  plan                     text not null,

  -- Statuts Dodo : pending, active, on_hold, paused, cancelled, failed, expired.
  -- Non contraint volontairement : un statut ajouté par le fournisseur ne doit
  -- pas faire échouer l'enregistrement du webhook.
  status                   text not null,

  -- Fin de la période payée. L'accès court jusque-là, même après annulation.
  current_period_end       timestamptz,
  cancel_at_period_end     boolean not null default false,

  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

comment on table public.subscriptions is
  'État brut des abonnements Dodo. Écriture réservée au service role.';

create index if not exists subscriptions_user_idx
  on public.subscriptions (user_id, created_at desc);

alter table public.subscriptions enable row level security;

-- Lecture seule, et uniquement sa propre ligne : le client doit pouvoir voir
-- son abonnement dans son espace. Aucune politique d'écriture — seul le
-- webhook, en service role, modifie cette table.
drop policy if exists "subscriptions_select_own" on public.subscriptions;
create policy "subscriptions_select_own"
  on public.subscriptions for select
  using ((select auth.uid()) = user_id);

drop trigger if exists subscriptions_touch_updated_at on public.subscriptions;
create trigger subscriptions_touch_updated_at
  before update on public.subscriptions
  for each row
  execute function public.touch_updated_at();


-- ----------------------------------------------------------------------------
-- 3. Origine du plan
--
-- Sans cette colonne, un plan accordé à la main depuis le back-office serait
-- écrasé au premier webhook — et un client à qui vous avez offert trois mois
-- se retrouverait rétrogradé sans que personne comprenne pourquoi.
--
--   'system' — valeur par défaut, plan gratuit
--   'dodo'   — piloté par la facturation
--   'manual' — posé par un administrateur, les webhooks n'y touchent pas
-- ----------------------------------------------------------------------------
alter table public.profiles
  add column if not exists plan_source text not null default 'system'
  check (plan_source in ('system', 'dodo', 'manual'));

comment on column public.profiles.plan_source is
  'Qui décide du plan. « manual » protège le plan des webhooks de facturation.';

-- Le client ne doit pas pouvoir modifier l'origine de son plan : la colonne
-- est exclue des privilèges accordés en 0005, on le confirme ici.
revoke update on public.profiles from authenticated, anon;
grant update (full_name, avatar_url, locale) on public.profiles to authenticated;


-- ----------------------------------------------------------------------------
-- Vérification
-- ----------------------------------------------------------------------------
select
  (select count(*) from public.subscriptions)   as abonnements,
  (select count(*) from public.payment_events)  as evenements,
  (select count(*) from information_schema.columns
     where table_name = 'profiles' and column_name = 'plan_source') as colonne_plan_source;

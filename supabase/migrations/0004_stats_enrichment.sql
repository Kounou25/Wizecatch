-- ============================================================================
-- Wizecatch — Étape 5 : enrichissement des statistiques
--
-- Ce que cette migration apporte :
--   1. UTM et langue sur les visites (le référent seul ne dit rien d'une campagne)
--   2. Appareil / OS / navigateur sur les avis, pour croiser satisfaction et trafic
--   3. Une table `pageviews` — jusqu'ici seule la page d'ENTRÉE était connue
--   4. Les fonctions d'agrégation correspondantes
--
-- SÉCURITÉ : mêmes principes qu'en 0003. Fonctions en SECURITY INVOKER, RLS
-- appliqué sur les tables sous-jacentes. La nouvelle table `pageviews` suit la
-- règle des `sessions` : lecture réservée au propriétaire du site, écriture
-- réservée au service role.
--
-- Supabase → SQL Editor → New query → coller → Run.
-- ============================================================================


-- ----------------------------------------------------------------------------
-- 1. Provenance détaillée des visites
--
-- `source` ne retient que le domaine référent : impossible d'y distinguer deux
-- campagnes venues du même réseau. Les UTM comblent ce trou.
-- ----------------------------------------------------------------------------
alter table public.sessions add column if not exists utm_source   text;
alter table public.sessions add column if not exists utm_medium   text;
alter table public.sessions add column if not exists utm_campaign text;
alter table public.sessions add column if not exists language     text;


-- ----------------------------------------------------------------------------
-- 2. Contexte technique des avis
--
-- Les avis portaient déjà le pays. Sans l'appareil, impossible de répondre à
-- « mes visiteurs mobiles sont-ils moins satisfaits ? » — précisément ce qu'un
-- outil d'analytics seul ne peut pas dire.
-- ----------------------------------------------------------------------------
alter table public.reviews add column if not exists device  text;
alter table public.reviews add column if not exists os      text;
alter table public.reviews add column if not exists browser text;


-- ----------------------------------------------------------------------------
-- 3. Pages réellement vues
--
-- `sessions.entry_path` ne contient que la page d'arrivée : un visiteur entré
-- sur « / » puis passé par « /pricing » ne comptait que pour « / ». La carte
-- « pages les plus vues » était donc fausse par construction.
-- ----------------------------------------------------------------------------
create table if not exists public.pageviews (
  id         bigserial primary key,
  site_id    uuid not null references public.sites (id) on delete cascade,
  session_id uuid not null,
  path       text not null,
  viewed_at  timestamptz not null default now()
);

comment on table public.pageviews is
  'Une page vue. Insertion uniquement via /api/collect (service role).';

create index if not exists pageviews_site_viewed_idx
  on public.pageviews (site_id, viewed_at desc);

alter table public.pageviews enable row level security;

-- Lecture : uniquement les pages des sites que l'on possède.
drop policy if exists "pageviews_select_own_sites" on public.pageviews;
create policy "pageviews_select_own_sites"
  on public.pageviews for select
  using (exists (
    select 1 from public.sites s
    where s.id = pageviews.site_id
      and s.user_id = (select auth.uid())
  ));

-- Aucune politique d'INSERT : seul le service role écrit, comme pour sessions.


-- ============================================================================
-- 4. Fonctions d'agrégation
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Chiffres clés — visiteurs uniques et pages vues en plus.
--
-- `p_offset` décale la fenêtre vers le passé : avec p_offset = p_days on
-- obtient la période précédente, et donc la comparaison, sans dupliquer la
-- logique de calcul.
--
-- La signature change : il faut supprimer l'ancienne version d'abord.
-- ----------------------------------------------------------------------------
drop function if exists public.stats_summary(uuid[], integer);

create or replace function public.stats_summary(
  p_site_ids uuid[],
  p_days     integer default 30,
  p_offset   integer default 0
)
returns table (
  total_visits      bigint,
  unique_visitors   bigint,
  total_pageviews   bigint,
  avg_duration      integer,
  bounce_rate       integer,
  countries_reached bigint,
  new_visitors      bigint
)
language sql
stable
as $$
  select
    count(*)                                                   as total_visits,
    count(distinct visitor_hash)                               as unique_visitors,
    coalesce(sum(pageview_count), 0)                           as total_pageviews,
    coalesce(round(avg(duration_seconds))::integer, 0)         as avg_duration,
    coalesce(
      round(
        100.0 * count(*) filter (
          where pageview_count <= 1 or duration_seconds < 15
        ) / nullif(count(*), 0)
      )::integer,
      0
    )                                                          as bounce_rate,
    count(distinct country) filter (where country is not null) as countries_reached,
    count(*) filter (where is_new)                             as new_visitors
  from public.sessions
  where site_id = any(p_site_ids)
    and started_at >= current_date - (p_days - 1) - p_offset
    and started_at <  current_date + 1 - p_offset;
$$;


-- ----------------------------------------------------------------------------
-- Répartition — dimensions UTM et langue ajoutées.
-- ----------------------------------------------------------------------------
create or replace function public.stats_breakdown(
  p_site_ids uuid[],
  p_dimension text,
  p_days integer default 30
)
returns table (label text, count bigint)
language sql
stable
as $$
  select
    coalesce(
      case p_dimension
        when 'country'      then s.country
        when 'city'         then s.city
        when 'device'       then s.device
        when 'os'           then s.os
        when 'browser'      then s.browser
        when 'source'       then s.source
        when 'path'         then s.entry_path
        when 'utm_source'   then s.utm_source
        when 'utm_medium'   then s.utm_medium
        when 'utm_campaign' then s.utm_campaign
        when 'language'     then s.language
        when 'visitor_type' then case when s.is_new then 'New' else 'Returning' end
      end,
      'Unknown'
    ) as label,
    count(*) as count
  from public.sessions s
  where s.site_id = any(p_site_ids)
    and s.started_at >= current_date - (p_days - 1)
  group by 1
  order by 2 desc;
$$;


-- ----------------------------------------------------------------------------
-- Pages les plus vues — sur la table `pageviews`, cette fois.
-- ----------------------------------------------------------------------------
create or replace function public.stats_pages(
  p_site_ids uuid[],
  p_days integer default 30,
  p_limit integer default 12
)
returns table (label text, count bigint)
language sql
stable
as $$
  select
    p.path as label,
    count(*) as count
  from public.pageviews p
  where p.site_id = any(p_site_ids)
    and p.viewed_at >= current_date - (p_days - 1)
  group by p.path
  order by count(*) desc
  limit p_limit;
$$;


-- ----------------------------------------------------------------------------
-- Répartition réelle des notes.
--
-- Le tableau de bord affichait jusqu'ici des notes fictives issues des données
-- de démonstration : plausibles, donc indétectables à l'œil.
-- ----------------------------------------------------------------------------
create or replace function public.stats_review_ratings(
  p_site_ids uuid[],
  p_days integer default 30
)
returns table (rating integer, count bigint)
language sql
stable
as $$
  with scale as (select generate_series(1, 5) as rating)
  select
    scale.rating,
    count(r.id) as count
  from scale
  left join public.reviews r
    on r.rating = scale.rating
   and r.site_id = any(p_site_ids)
   and r.created_at >= current_date - (p_days - 1)
  group by scale.rating
  order by scale.rating;
$$;


-- ----------------------------------------------------------------------------
-- NPS — promoteurs (9-10) moins détracteurs (0-6), en pourcentage.
--
-- Le score était collecté depuis le début sans jamais être calculé.
-- ----------------------------------------------------------------------------
create or replace function public.stats_nps(
  p_site_ids uuid[],
  p_days integer default 30
)
returns table (
  promoters  bigint,
  passives   bigint,
  detractors bigint,
  responses  bigint,
  score      integer
)
language sql
stable
as $$
  with answers as (
    select nps_score
    from public.reviews
    where site_id = any(p_site_ids)
      and nps_score is not null
      and created_at >= current_date - (p_days - 1)
  )
  select
    count(*) filter (where nps_score >= 9)                as promoters,
    count(*) filter (where nps_score between 7 and 8)     as passives,
    count(*) filter (where nps_score <= 6)                as detractors,
    count(*)                                              as responses,
    coalesce(
      round(
        100.0 * (count(*) filter (where nps_score >= 9)
               - count(*) filter (where nps_score <= 6))
        / nullif(count(*), 0)
      )::integer,
      0
    )                                                     as score
  from answers;
$$;


-- ----------------------------------------------------------------------------
-- Note moyenne croisée avec une dimension de trafic.
--
-- C'est ce qu'aucun outil d'analytics ne peut produire : la satisfaction par
-- pays, par appareil ou par navigateur.
--
-- Les dimensions techniques n'existent que sur les avis récents — les avis
-- antérieurs à cette migration renvoient « Unknown », ce qui est exact.
-- ----------------------------------------------------------------------------
create or replace function public.stats_rating_by(
  p_site_ids uuid[],
  p_dimension text,
  p_days integer default 30,
  p_min_reviews integer default 1
)
returns table (label text, avg_rating numeric, count bigint)
language sql
stable
as $$
  select
    coalesce(
      case p_dimension
        when 'country' then r.country
        when 'device'  then r.device
        when 'os'      then r.os
        when 'browser' then r.browser
      end,
      'Unknown'
    ) as label,
    round(avg(r.rating)::numeric, 1) as avg_rating,
    count(*) as count
  from public.reviews r
  where r.site_id = any(p_site_ids)
    and r.rating is not null
    and r.created_at >= current_date - (p_days - 1)
  group by 1
  having count(*) >= p_min_reviews
  order by avg(r.rating) desc;
$$;


-- ----------------------------------------------------------------------------
-- Note moyenne jour par jour, jours sans avis compris (valeur nulle).
--
-- On ne comble pas à zéro comme pour les visites : une journée sans avis n'a
-- pas une note de 0, elle n'a pas de note. Le graphique doit interrompre la
-- courbe, pas la faire plonger.
-- ----------------------------------------------------------------------------
create or replace function public.stats_daily_rating(
  p_site_ids uuid[],
  p_days integer default 30
)
returns table (day date, avg_rating numeric, count bigint)
language sql
stable
as $$
  with calendar as (
    select generate_series(
      (current_date - (p_days - 1))::date,
      current_date,
      interval '1 day'
    )::date as day
  )
  select
    calendar.day,
    round(avg(r.rating)::numeric, 2) as avg_rating,
    count(r.id) as count
  from calendar
  left join public.reviews r
    on r.created_at::date = calendar.day
   and r.site_id = any(p_site_ids)
   and r.rating is not null
  group by calendar.day
  order by calendar.day;
$$;


-- ----------------------------------------------------------------------------
-- Avis collectés sur la période — sert au taux de collecte (avis / visiteurs).
-- ----------------------------------------------------------------------------
create or replace function public.stats_review_total(
  p_site_ids uuid[],
  p_days integer default 30,
  p_offset integer default 0
)
returns table (total bigint)
language sql
stable
as $$
  select count(*) as total
  from public.reviews
  where site_id = any(p_site_ids)
    and created_at >= current_date - (p_days - 1) - p_offset
    and created_at <  current_date + 1 - p_offset;
$$;


-- ----------------------------------------------------------------------------
-- Droits d'exécution (RLS continue de filtrer les lignes).
-- ----------------------------------------------------------------------------
grant execute on function public.stats_summary(uuid[], integer, integer)          to authenticated;
grant execute on function public.stats_pages(uuid[], integer, integer)            to authenticated;
grant execute on function public.stats_review_ratings(uuid[], integer)            to authenticated;
grant execute on function public.stats_nps(uuid[], integer)                       to authenticated;
grant execute on function public.stats_rating_by(uuid[], text, integer, integer)  to authenticated;
grant execute on function public.stats_daily_rating(uuid[], integer)              to authenticated;
grant execute on function public.stats_review_total(uuid[], integer, integer)     to authenticated;


-- ----------------------------------------------------------------------------
-- Vérification : doit lister les 12 fonctions stats_*.
-- ----------------------------------------------------------------------------
select routine_name
from information_schema.routines
where routine_schema = 'public'
  and routine_name like 'stats_%'
order by routine_name;

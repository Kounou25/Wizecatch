-- ============================================================================
-- Wizecatch — Étape 4 : fonctions d'agrégation des statistiques
--
-- Pourquoi des fonctions SQL plutôt qu'un calcul en JavaScript :
-- le client Supabase ne sait pas faire de GROUP BY. L'alternative serait de
-- rapatrier toutes les sessions du mois pour les agréger côté serveur Node —
-- soit des mégaoctets transférés à chaque chargement de page. Ici Postgres
-- renvoie quelques dizaines de lignes déjà agrégées.
--
-- SÉCURITÉ : ces fonctions sont en SECURITY INVOKER (comportement par défaut).
-- Elles s'exécutent donc avec les droits de l'appelant, et RLS s'applique
-- normalement sur `sessions`. Passer l'identifiant du site d'un autre
-- utilisateur ne renvoie rien — la protection reste dans la base.
--
-- Supabase → SQL Editor → New query → coller → Run.
-- ============================================================================


-- ----------------------------------------------------------------------------
-- Visites par jour, avec les jours vides comblés à zéro.
--
-- Sans le generate_series, un jour sans visite serait absent de la série et la
-- courbe relierait deux points distants, ce qui donnerait une lecture fausse.
-- ----------------------------------------------------------------------------
create or replace function public.stats_daily_visits(
  p_site_ids uuid[],
  p_days integer default 30
)
returns table (day date, visits bigint)
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
    count(s.id) as visits
  from calendar
  left join public.sessions s
    on s.started_at::date = calendar.day
   and s.site_id = any(p_site_ids)
  group by calendar.day
  order by calendar.day;
$$;


-- ----------------------------------------------------------------------------
-- Répartition selon une dimension : pays, ville, appareil, OS, navigateur,
-- source, page d'entrée, ou type de visiteur.
--
-- Une seule fonction paramétrée plutôt qu'une par dimension : ajouter une
-- dimension plus tard ne demandera pas de nouvelle migration.
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
-- Activité par heure de la journée, 0 à 23, heures creuses incluses.
-- ----------------------------------------------------------------------------
create or replace function public.stats_hourly(
  p_site_ids uuid[],
  p_days integer default 30
)
returns table (hour integer, visits bigint)
language sql
stable
as $$
  with hours as (
    select generate_series(0, 23) as hour
  )
  select
    hours.hour,
    count(s.id) as visits
  from hours
  left join public.sessions s
    on extract(hour from s.started_at)::integer = hours.hour
   and s.site_id = any(p_site_ids)
   and s.started_at >= current_date - (p_days - 1)
  group by hours.hour
  order by hours.hour;
$$;


-- ----------------------------------------------------------------------------
-- Chiffres clés en une seule requête, pour éviter quatre allers-retours.
--
-- Rebond : une visite d'une seule page OU de moins de 15 secondes.
-- ----------------------------------------------------------------------------
create or replace function public.stats_summary(
  p_site_ids uuid[],
  p_days integer default 30
)
returns table (
  total_visits      bigint,
  avg_duration      integer,
  bounce_rate       integer,
  countries_reached bigint,
  new_visitors      bigint
)
language sql
stable
as $$
  select
    count(*)                                             as total_visits,
    coalesce(round(avg(duration_seconds))::integer, 0)   as avg_duration,
    coalesce(
      round(
        100.0 * count(*) filter (
          where pageview_count <= 1 or duration_seconds < 15
        ) / nullif(count(*), 0)
      )::integer,
      0
    )                                                    as bounce_rate,
    count(distinct country) filter (where country is not null) as countries_reached,
    count(*) filter (where is_new)                       as new_visitors
  from public.sessions
  where site_id = any(p_site_ids)
    and started_at >= current_date - (p_days - 1);
$$;


-- ----------------------------------------------------------------------------
-- Avis collectés par jour — alimente la courbe du dashboard.
-- ----------------------------------------------------------------------------
create or replace function public.stats_daily_reviews(
  p_site_ids uuid[],
  p_days integer default 30
)
returns table (day date, reviews bigint)
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
    count(r.id) as reviews
  from calendar
  left join public.reviews r
    on r.created_at::date = calendar.day
   and r.site_id = any(p_site_ids)
  group by calendar.day
  order by calendar.day;
$$;


-- ----------------------------------------------------------------------------
-- Autoriser l'appel depuis l'application (RLS continue de filtrer les lignes).
-- ----------------------------------------------------------------------------
grant execute on function public.stats_daily_visits(uuid[], integer)  to authenticated;
grant execute on function public.stats_breakdown(uuid[], text, integer) to authenticated;
grant execute on function public.stats_hourly(uuid[], integer)        to authenticated;
grant execute on function public.stats_summary(uuid[], integer)       to authenticated;
grant execute on function public.stats_daily_reviews(uuid[], integer) to authenticated;


-- ----------------------------------------------------------------------------
-- Vérification : doit lister les 5 fonctions.
-- ----------------------------------------------------------------------------
select routine_name
from information_schema.routines
where routine_schema = 'public'
  and routine_name like 'stats_%'
order by routine_name;

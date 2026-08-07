-- ============================================================================
-- Wizecatch — Étape 2 : tables métier (sites, reviews, sessions)
--
-- ⚠️ Exécuter 0001_profiles.sql AVANT ce script : sites référence profiles.
-- Script idempotent : le relancer ne casse rien.
--
-- Supabase → SQL Editor → New query → coller → Run.
-- ============================================================================


-- ============================================================================
-- 1. SITES
-- ============================================================================

-- Génère la clé publique visible dans le snippet (<script data-site="...">).
-- Elle n'est pas secrète — elle apparaît dans le HTML du client — mais elle
-- doit être imprévisible et sans collision. gen_random_uuid() est natif PG13+.
create or replace function public.generate_public_key()
returns text
language sql
volatile
as $$
  select 'wz_' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 12);
$$;

create table if not exists public.sites (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles (id) on delete cascade,

  public_key  text not null unique default public.generate_public_key(),
  name        text not null,
  domain      text not null,

  mode        text not null default 'reviews'
              check (mode in ('reviews', 'analytics_only')),

  template_id text
              check (template_id in
                ('star_rating', 'star_comment', 'thumbs', 'nps', 'testimonial')),

  -- Configs en jsonb : ces options bougeront souvent, et on ne fera jamais
  -- de requête analytique dessus. Évite une migration par idée produit.
  template_config jsonb not null default
    '{"title": null, "buttonLabel": null, "requireComment": false, "showLocation": true}'::jsonb,

  widget_config jsonb not null default
    '{"position": "bottom-right", "trigger": "load", "format": "carousel"}'::jsonb,

  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  archived_at timestamptz,

  -- Un site en mode "reviews" doit avoir un template ; en analytics_only, non.
  constraint sites_template_matches_mode check (
    (mode = 'reviews' and template_id is not null)
    or (mode = 'analytics_only' and template_id is null)
  )
);

comment on table public.sites is
  'Un site surveillé. public_key est la valeur du data-site dans le snippet.';

create index if not exists sites_user_id_idx
  on public.sites (user_id)
  where archived_at is null;

drop trigger if exists sites_touch_updated_at on public.sites;
create trigger sites_touch_updated_at
  before update on public.sites
  for each row
  execute function public.touch_updated_at();


-- ============================================================================
-- 2. REVIEWS
-- ============================================================================

create table if not exists public.reviews (
  id           uuid primary key default gen_random_uuid(),
  site_id      uuid not null references public.sites (id) on delete cascade,

  -- Figé à la soumission : si le client change de template plus tard,
  -- les anciens avis conservent leur forme d'origine.
  template_id  text not null
               check (template_id in
                 ('star_rating', 'star_comment', 'thumbs', 'nps', 'testimonial')),

  status       text not null default 'pending'
               check (status in ('pending', 'published', 'hidden')),

  author_name  text,
  author_email text,
  comment      text,

  -- Un seul de ces champs est rempli, selon le template.
  rating       smallint check (rating between 1 and 5),
  thumbs_up    boolean,
  nps_score    smallint check (nps_score between 0 and 10),

  country      text,
  city         text,
  source_url   text,

  created_at   timestamptz not null default now(),
  published_at timestamptz,

  -- Garantit qu'un avis porte bien la donnée attendue par son template.
  constraint reviews_payload_matches_template check (
    case template_id
      when 'star_rating'  then rating    is not null
      when 'star_comment' then rating    is not null
      when 'thumbs'       then thumbs_up is not null
      when 'nps'          then nps_score is not null
      when 'testimonial'  then comment   is not null
      else false
    end
  )
);

comment on table public.reviews is
  'Avis collectés. Insertion uniquement via la route publique (service role).';

-- Liste d'avis d'un site, du plus récent au plus ancien.
create index if not exists reviews_site_created_idx
  on public.reviews (site_id, created_at desc);

-- Le widget ne lit que les avis publiés d'un site.
create index if not exists reviews_site_published_idx
  on public.reviews (site_id, published_at desc)
  where status = 'published';


-- ============================================================================
-- 3. SESSIONS
--
-- Une ligne par visite, pas par page vue. Suffit à calculer toutes les
-- métriques du dashboard sauf "pages les plus vues" — d'où entry_path, qui
-- donne les pages d'entrée. Une table pageviews pourra être ajoutée plus tard
-- si le besoin d'analytics par page se confirme.
-- ============================================================================

create table if not exists public.sessions (
  -- Généré par le widget, ce qui permet un upsert : le premier beacon crée la
  -- ligne, celui de fin de visite met à jour durée et nombre de pages.
  id               uuid primary key,
  site_id          uuid not null references public.sites (id) on delete cascade,

  -- hash(sel_du_jour + ip + user-agent + site). L'IP n'est jamais stockée.
  visitor_hash     text,

  started_at       timestamptz not null default now(),
  last_seen_at     timestamptz not null default now(),
  duration_seconds integer not null default 0 check (duration_seconds >= 0),
  pageview_count   integer not null default 1 check (pageview_count >= 1),

  entry_path       text,
  country          text,
  city             text,
  device           text,
  os               text,
  browser          text,
  source           text,
  is_new           boolean not null default true
);

comment on table public.sessions is
  'Une visite. Insertion uniquement via /api/collect (service role).';

-- L'index qui porte la quasi-totalité des requêtes du dashboard.
create index if not exists sessions_site_started_idx
  on public.sessions (site_id, started_at desc);

-- Sert à déterminer si un visiteur est déjà venu aujourd'hui.
create index if not exists sessions_visitor_day_idx
  on public.sessions (site_id, visitor_hash, started_at desc);


-- ============================================================================
-- 4. RLS — chacun ne voit que ses propres données
--
-- Principe : c'est Postgres qui filtre, pas le code applicatif. Une requête
-- qui oublierait un WHERE ne renverra jamais les données d'un autre compte.
--
-- (select auth.uid()) plutôt que auth.uid() : l'expression est évaluée une
-- seule fois au lieu d'une fois par ligne — recommandation Supabase.
-- ============================================================================

alter table public.sites    enable row level security;
alter table public.reviews  enable row level security;
alter table public.sessions enable row level security;

-- ---- sites : contrôle total sur les siens -----------------------------------
drop policy if exists "sites_select_own" on public.sites;
create policy "sites_select_own"
  on public.sites for select
  using ((select auth.uid()) = user_id);

drop policy if exists "sites_insert_own" on public.sites;
create policy "sites_insert_own"
  on public.sites for insert
  with check ((select auth.uid()) = user_id);

drop policy if exists "sites_update_own" on public.sites;
create policy "sites_update_own"
  on public.sites for update
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "sites_delete_own" on public.sites;
create policy "sites_delete_own"
  on public.sites for delete
  using ((select auth.uid()) = user_id);

-- ---- reviews : lecture et modération sur ses propres sites -------------------
-- Pas de policy INSERT : les avis n'entrent que par la route publique, qui
-- utilise la clé service_role et contourne RLS.
drop policy if exists "reviews_select_own_sites" on public.reviews;
create policy "reviews_select_own_sites"
  on public.reviews for select
  using (exists (
    select 1 from public.sites s
    where s.id = reviews.site_id
      and s.user_id = (select auth.uid())
  ));

drop policy if exists "reviews_update_own_sites" on public.reviews;
create policy "reviews_update_own_sites"
  on public.reviews for update
  using (exists (
    select 1 from public.sites s
    where s.id = reviews.site_id
      and s.user_id = (select auth.uid())
  ));

drop policy if exists "reviews_delete_own_sites" on public.reviews;
create policy "reviews_delete_own_sites"
  on public.reviews for delete
  using (exists (
    select 1 from public.sites s
    where s.id = reviews.site_id
      and s.user_id = (select auth.uid())
  ));

-- ---- sessions : lecture seule ------------------------------------------------
-- Aucune policy d'écriture : personne ne doit pouvoir fabriquer ou modifier
-- des statistiques. Seule /api/collect écrit, en service role.
drop policy if exists "sessions_select_own_sites" on public.sessions;
create policy "sessions_select_own_sites"
  on public.sessions for select
  using (exists (
    select 1 from public.sites s
    where s.id = sessions.site_id
      and s.user_id = (select auth.uid())
  ));


-- ============================================================================
-- 5. Vérification — doit renvoyer 4 tables avec rowsecurity = true
-- ============================================================================
select
  c.relname                                   as table_name,
  c.relrowsecurity                            as rls_active,
  (select count(*) from pg_policies p
    where p.schemaname = 'public'
      and p.tablename = c.relname)            as nb_policies
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in ('profiles', 'sites', 'reviews', 'sessions')
  and c.relkind = 'r'
order by c.relname;

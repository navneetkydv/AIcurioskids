create table public.visitor_sessions (
  id uuid primary key,
  visitor_id uuid not null,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  landing_path text,
  is_returning boolean not null default false,
  referrer_host text,
  referrer_url text,
  source text not null default 'direct',
  medium text not null default 'none',
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  click_id_type text,
  device text,
  browser text,
  os text,
  country text,
  region text,
  pageviews int not null default 1
);

create table public.page_views (
  id bigint generated always as identity primary key,
  session_id uuid not null references public.visitor_sessions(id) on delete cascade,
  path text not null,
  created_at timestamptz not null default now()
);

create index visitor_sessions_first_seen_idx on public.visitor_sessions (first_seen_at desc);
create index visitor_sessions_visitor_idx on public.visitor_sessions (visitor_id);
create index page_views_created_idx on public.page_views (created_at desc);
create index page_views_path_idx on public.page_views (path);

-- No policies: only the server (service-role key) can touch these tables.
alter table public.visitor_sessions enable row level security;
alter table public.page_views enable row level security;

-- Records one page view; creates the session on its first hit (first-touch attribution).
create or replace function public.track_visit(
  p_session_id uuid,
  p_visitor_id uuid,
  p_path text,
  p_ctx jsonb
) returns void
language plpgsql
as $$
declare
  v_rows integer;
begin
  insert into public.visitor_sessions as s (
    id, visitor_id, landing_path, is_returning,
    referrer_host, referrer_url, source, medium,
    utm_source, utm_medium, utm_campaign, utm_content, utm_term, click_id_type,
    device, browser, os, country, region
  ) values (
    p_session_id, p_visitor_id,
    coalesce(p_ctx->>'landing_path', p_path),
    coalesce((p_ctx->>'is_returning')::boolean, false),
    p_ctx->>'referrer_host', p_ctx->>'referrer_url',
    coalesce(p_ctx->>'source', 'direct'), coalesce(p_ctx->>'medium', 'none'),
    p_ctx->>'utm_source', p_ctx->>'utm_medium', p_ctx->>'utm_campaign',
    p_ctx->>'utm_content', p_ctx->>'utm_term', p_ctx->>'click_id_type',
    p_ctx->>'device', p_ctx->>'browser', p_ctx->>'os',
    p_ctx->>'country', p_ctx->>'region'
  )
  on conflict (id) do update
    set last_seen_at = now(),
        pageviews = s.pageviews + 1
    where s.visitor_id = excluded.visitor_id
      and s.pageviews < 200;          -- abuse guard

  get diagnostics v_rows = row_count;

  if v_rows > 0 then
    insert into public.page_views (session_id, path) values (p_session_id, p_path);
  end if;
end;
$$;

-- All the numbers for the admin dashboard, in one call.
create or replace function public.traffic_summary(
  p_from timestamptz,
  p_to timestamptz default now()
) returns jsonb
language sql
stable
as $$
with s as (
  select * from public.visitor_sessions
  where first_seen_at >= p_from and first_seen_at < p_to
)
select jsonb_build_object(
  'totals', (
    select jsonb_build_object(
      'sessions', count(*),
      'visitors', count(distinct visitor_id),
      'pageviews', coalesce(sum(pageviews), 0),
      'returning_sessions', count(*) filter (where is_returning)
    ) from s
  ),
  'daily', coalesce((
    select jsonb_agg(t order by t.day) from (
      select d::date as day,
             coalesce(x.sessions, 0) as sessions,
             coalesce(x.visitors, 0) as visitors
      from generate_series(
             ((p_from at time zone 'Asia/Kolkata')::date)::timestamp,
             ((p_to at time zone 'Asia/Kolkata')::date)::timestamp,
             interval '1 day') d
      left join (
        select (first_seen_at at time zone 'Asia/Kolkata')::date as day,
               count(*) as sessions, count(distinct visitor_id) as visitors
        from s group by 1
      ) x on x.day = d::date
    ) t
  ), '[]'::jsonb),
  'by_source', coalesce((
    select jsonb_agg(t) from (
      select source, medium, count(*) as sessions, count(distinct visitor_id) as visitors
      from s group by source, medium order by sessions desc limit 20
    ) t
  ), '[]'::jsonb),
  'by_campaign', coalesce((
    select jsonb_agg(t) from (
      select utm_campaign as campaign, utm_source, utm_medium, count(*) as sessions
      from s where utm_campaign is not null
      group by utm_campaign, utm_source, utm_medium order by sessions desc limit 20
    ) t
  ), '[]'::jsonb),
  'referrers', coalesce((
    select jsonb_agg(t) from (
      select referrer_host as host, count(*) as sessions
      from s where referrer_host is not null
      group by referrer_host order by sessions desc limit 15
    ) t
  ), '[]'::jsonb),
  'landing_pages', coalesce((
    select jsonb_agg(t) from (
      select coalesce(landing_path, '/') as path, count(*) as sessions
      from s group by 1 order by sessions desc limit 10
    ) t
  ), '[]'::jsonb),
  'top_pages', coalesce((
    select jsonb_agg(t) from (
      select path, count(*) as views
      from public.page_views
      where created_at >= p_from and created_at < p_to
      group by path order by views desc limit 10
    ) t
  ), '[]'::jsonb),
  'devices', coalesce((
    select jsonb_agg(t) from (
      select coalesce(device, 'unknown') as device, count(*) as sessions
      from s group by 1 order by sessions desc
    ) t
  ), '[]'::jsonb),
  'browsers', coalesce((
    select jsonb_agg(t) from (
      select coalesce(browser, 'unknown') as browser, count(*) as sessions
      from s group by 1 order by sessions desc limit 8
    ) t
  ), '[]'::jsonb),
  'locations', coalesce((
    select jsonb_agg(t) from (
      select coalesce(country, 'unknown') as country, coalesce(region, '') as region,
             count(*) as sessions
      from s group by 1, 2 order by sessions desc limit 15
    ) t
  ), '[]'::jsonb),
  'orders_by_utm_source', coalesce((
    select jsonb_agg(t) from (
      select coalesce(nullif(lower(utm_source), ''), '(no utm)') as source,
             count(*) as orders, sum(amount_inr) as revenue
      from public.book_orders
      where status in ('paid', 'shipped', 'delivered')
        and paid_at >= p_from and paid_at < p_to
      group by 1 order by orders desc limit 20
    ) t
  ), '[]'::jsonb)
);
$$;

-- Supabase exposes functions through its public API by default.
-- Lock these two so only your server (service role) can call them.
revoke all on function public.track_visit(uuid, uuid, text, jsonb) from public, anon, authenticated;
grant execute on function public.track_visit(uuid, uuid, text, jsonb) to service_role;

revoke all on function public.traffic_summary(timestamptz, timestamptz) from public, anon, authenticated;
grant execute on function public.traffic_summary(timestamptz, timestamptz) to service_role;
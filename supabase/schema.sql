-- ═══════════════════════════════════════════════════════════════
--  UBEE · Modern Hair Studio — base de datos (Supabase / Postgres)
--  Ejecutar UNA vez en Supabase → SQL Editor → New query → Run.
--  Después ejecutar supabase/seed.sql para cargar el contenido inicial.
-- ═══════════════════════════════════════════════════════════════

create extension if not exists btree_gist;

-- ── Contenido que el salón edita desde el panel ───────────────

create table if not exists public.services (
  id          text primary key,
  category    text not null check (category in ('color','corte','peinado','tratamiento')),
  name        text not null,
  description text not null default '',
  duration    int  not null check (duration between 15 and 600),   -- minutos
  price       int  not null check (price >= 0),                     -- pesos, valor "desde"
  signature   boolean not null default false,
  active      boolean not null default true,
  sort        int not null default 0,
  updated_at  timestamptz not null default now()
);

create table if not exists public.products (
  id         text primary key,
  name       text not null,
  line       text not null default '',
  category   text not null default '',
  size       text not null default '',
  price      int  not null check (price >= 0),
  image      text not null default '',
  note       text not null default '',
  active     boolean not null default true,
  sort       int not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.news (
  id         text primary key default gen_random_uuid()::text,
  type       text not null check (type in ('novedad','beneficio','oportunidad','workshop')),
  title      text not null,
  text       text not null default '',
  date       date not null default current_date,
  image      text not null default '',
  cta_label  text not null default 'Ver más',
  cta_href   text not null default '/',
  members    boolean not null default false,   -- exclusivo Club
  published  boolean not null default true,
  updated_at timestamptz not null default now()
);

-- ── Turnos ────────────────────────────────────────────────────

create table if not exists public.bookings (
  id           uuid primary key default gen_random_uuid(),
  code         text not null unique,
  branch_id    text not null check (branch_id in ('cordoba','carlos-paz')),
  service_ids  text[] not null,
  staff_id     text not null,
  date         date not null,
  time         time not null,
  duration     int  not null check (duration between 15 and 600),
  total        int  not null default 0,
  client_name  text not null check (char_length(client_name) between 3 and 80),
  client_phone text not null check (client_phone ~ '^[0-9]{10,15}$'),
  client_email text,
  notes        text check (char_length(notes) <= 500),
  club         boolean not null default false,
  status       text not null default 'confirmado'
               check (status in ('confirmado','en-salon','completado','cancelado')),
  source       text not null default 'web' check (source in ('web','salon')),
  created_at   timestamptz not null default now(),
  starts_at    timestamp generated always as (date + time) stored,
  ends_at      timestamp generated always as (date + time + make_interval(mins => duration)) stored,

  -- La misma profesional nunca puede tener dos turnos que se superpongan.
  -- Si dos personas reservan el mismo horario al mismo tiempo, la segunda
  -- recibe un error (23P01) y la web le pide elegir otro horario.
  constraint no_overlap exclude using gist (
    staff_id with =,
    tsrange(starts_at, ends_at) with &&
  ) where (status <> 'cancelado')
);

create index if not exists bookings_branch_date on public.bookings (branch_id, date);

-- ── Horarios ocupados, sin datos personales ───────────────────
-- La web pública la usa para calcular disponibilidad. Devuelve solo
-- profesional + horario + duración: nunca nombres ni teléfonos.

create or replace function public.busy_slots(p_branch text, p_from date, p_to date)
returns table (staff_id text, date date, "time" time, duration int)
language sql
security definer
set search_path = public
stable
as $$
  select b.staff_id, b.date, b.time, b.duration
  from public.bookings b
  where b.branch_id = p_branch
    and b.date between p_from and least(p_to, p_from + 31)
    and b.status <> 'cancelado';
$$;

revoke all on function public.busy_slots(text, date, date) from public;
grant execute on function public.busy_slots(text, date, date) to anon, authenticated;

-- ── Seguridad por filas (RLS) ─────────────────────────────────
-- anon          = cualquier visitante de la web
-- authenticated = el equipo del salón, con usuario creado en Supabase Auth

alter table public.services enable row level security;
alter table public.products enable row level security;
alter table public.news     enable row level security;
alter table public.bookings enable row level security;

-- Lectura pública del contenido visible
drop policy if exists "public read services" on public.services;
create policy "public read services" on public.services for select to anon using (active);
drop policy if exists "public read products" on public.products;
create policy "public read products" on public.products for select to anon using (active);
drop policy if exists "public read news" on public.news;
create policy "public read news" on public.news for select to anon using (published);

-- El equipo puede todo sobre el contenido
drop policy if exists "staff manage services" on public.services;
create policy "staff manage services" on public.services for all to authenticated using (true) with check (true);
drop policy if exists "staff manage products" on public.products;
create policy "staff manage products" on public.products for all to authenticated using (true) with check (true);
drop policy if exists "staff manage news" on public.news;
create policy "staff manage news" on public.news for all to authenticated using (true) with check (true);

-- Turnos: la web solo puede CREAR turnos nuevos y confirmados, en fecha futura
drop policy if exists "public create booking" on public.bookings;
create policy "public create booking" on public.bookings for insert to anon
  with check (status = 'confirmado' and source = 'web' and date >= current_date and date <= current_date + 60);

-- El equipo ve y gestiona todos los turnos
drop policy if exists "staff manage bookings" on public.bookings;
create policy "staff manage bookings" on public.bookings for all to authenticated using (true) with check (true);

-- ── Tiempo real: el panel se actualiza solo cuando entra un turno ──
do $$ begin
  alter publication supabase_realtime add table public.bookings;
exception when duplicate_object then null; end $$;

-- ── Imágenes (novedades y productos) ──────────────────────────
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

drop policy if exists "public read media" on storage.objects;
create policy "public read media" on storage.objects for select to anon using (bucket_id = 'media');
drop policy if exists "staff upload media" on storage.objects;
create policy "staff upload media" on storage.objects for insert to authenticated with check (bucket_id = 'media');
drop policy if exists "staff update media" on storage.objects;
create policy "staff update media" on storage.objects for update to authenticated using (bucket_id = 'media');
drop policy if exists "staff delete media" on storage.objects;
create policy "staff delete media" on storage.objects for delete to authenticated using (bucket_id = 'media');

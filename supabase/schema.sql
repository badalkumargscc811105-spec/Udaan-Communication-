-- UDAAN Communication production data model
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  user_id text unique,
  full_name text,
  mobile text,
  address text,
  role text not null default 'cyber_cafe' check (role in ('admin','school_admin','franchise','cyber_cafe','teacher','driver','accountant','student_parent','manager','staff')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  category text,
  price numeric(12,2) not null default 0,
  is_free boolean not null default false,
  active boolean not null default true,
  public_access boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.franchises (
  id uuid primary key default gen_random_uuid(),
  franchise_id text unique not null,
  shop_name text not null,
  owner_name text not null,
  mobile text,
  address text,
  username text unique,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  franchise_id uuid references public.franchises(id) on delete set null,
  service_id uuid references public.services(id) on delete set null,
  customer_name text,
  customer_mobile text,
  status text not null default 'pending',
  amount numeric(12,2) not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete cascade,
  application_id uuid references public.applications(id) on delete cascade,
  storage_path text not null,
  original_name text not null,
  mime_type text,
  size_bytes bigint,
  created_at timestamptz not null default now()
);

create table if not exists public.notices (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  notice_type text not null default 'general',
  start_at timestamptz,
  end_at timestamptz,
  active boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.festivals (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  festival_date date not null,
  design_url text,
  active boolean not null default true
);

alter table public.profiles enable row level security;
alter table public.services enable row level security;
alter table public.franchises enable row level security;
alter table public.applications enable row level security;
alter table public.documents enable row level security;
alter table public.notices enable row level security;
alter table public.festivals enable row level security;

create or replace function public.current_role()
returns text language sql stable security definer set search_path=public
as $$ select role from public.profiles where id=auth.uid() $$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path=public
as $$ select coalesce(public.current_role()='admin',false) $$;

drop policy if exists profiles_self on public.profiles;
create policy profiles_self on public.profiles for select using (id=auth.uid() or public.is_admin());
drop policy if exists profiles_admin on public.profiles;
create policy profiles_admin on public.profiles for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists services_read on public.services;
create policy services_read on public.services for select using (active=true or public.is_admin());
drop policy if exists services_admin on public.services;
create policy services_admin on public.services for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists notices_read on public.notices;
create policy notices_read on public.notices for select using (active=true);
drop policy if exists notices_admin on public.notices;
create policy notices_admin on public.notices for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists festivals_read on public.festivals;
create policy festivals_read on public.festivals for select using (active=true);
drop policy if exists festivals_admin on public.festivals;
create policy festivals_admin on public.festivals for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists applications_owner on public.applications;
create policy applications_owner on public.applications for select using (user_id=auth.uid() or public.is_admin());
drop policy if exists applications_insert on public.applications;
create policy applications_insert on public.applications for insert with check (user_id=auth.uid() or public.is_admin());

drop policy if exists documents_owner on public.documents;
create policy documents_owner on public.documents for select using (owner_id=auth.uid() or public.is_admin());
drop policy if exists documents_insert on public.documents;
create policy documents_insert on public.documents for insert with check (owner_id=auth.uid() or public.is_admin());
drop policy if exists documents_delete on public.documents;
create policy documents_delete on public.documents for delete using (owner_id=auth.uid() or public.is_admin());

-- Storage bucket is created separately because storage schema ownership is managed by Supabase.
-- Recommended bucket: udaan-documents (private). Apply storage policies to owner_id/path when deploying.

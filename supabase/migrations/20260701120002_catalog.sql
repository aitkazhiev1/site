-- Storefront catalog: barbers, services, and the many-to-many between them.
create table public.barbers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  bio text,
  avatar_url text,
  specialties text[] not null default '{}',
  active boolean not null default true
);

create table public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  duration_min integer not null check (duration_min > 0),
  price numeric(10, 2) not null check (price >= 0),
  active boolean not null default true
);

create table public.barber_services (
  barber_id uuid not null references public.barbers (id) on delete cascade,
  service_id uuid not null references public.services (id) on delete cascade,
  primary key (barber_id, service_id)
);

alter table public.barbers enable row level security;
alter table public.services enable row level security;
alter table public.barber_services enable row level security;

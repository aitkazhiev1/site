-- Recurring weekly availability and one-off blocks (vacation, sick days) per barber.
create table public.working_hours (
  id uuid primary key default gen_random_uuid(),
  barber_id uuid not null references public.barbers (id) on delete cascade,
  -- 0 = Sunday .. 6 = Saturday, matching Postgres extract(dow from date).
  weekday smallint not null check (weekday between 0 and 6),
  start_time time not null,
  end_time time not null,
  constraint working_hours_valid_range check (start_time < end_time)
);

create unique index working_hours_barber_weekday_start_idx
  on public.working_hours (barber_id, weekday, start_time);

create table public.time_off (
  id uuid primary key default gen_random_uuid(),
  barber_id uuid not null references public.barbers (id) on delete cascade,
  start_at timestamptz not null,
  end_at timestamptz not null,
  reason text,
  constraint time_off_valid_range check (start_at < end_at)
);

create index time_off_barber_range_idx on public.time_off (barber_id, start_at, end_at);

alter table public.working_hours enable row level security;
alter table public.time_off enable row level security;

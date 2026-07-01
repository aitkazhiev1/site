create type public.appointment_status as enum ('pending', 'confirmed', 'cancelled', 'completed');

create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  barber_id uuid not null references public.barbers (id) on delete restrict,
  service_id uuid not null references public.services (id) on delete restrict,
  customer_id uuid not null references public.profiles (id) on delete cascade,
  start_at timestamptz not null,
  end_at timestamptz not null,
  status public.appointment_status not null default 'pending',
  notes text,
  created_at timestamptz not null default now(),
  constraint appointments_valid_range check (start_at < end_at)
);

create index appointments_barber_start_idx on public.appointments (barber_id, start_at);
create index appointments_customer_idx on public.appointments (customer_id);

-- Double-booking protection at the DB level (not just the frontend):
-- no two non-cancelled appointments for the same barber may have
-- overlapping [start_at, end_at) ranges. Requires btree_gist for the
-- equality operator class on uuid inside a GiST index.
alter table public.appointments
  add constraint appointments_no_overlap
  exclude using gist (
    barber_id with =,
    tstzrange(start_at, end_at) with &&
  )
  where (status <> 'cancelled');

alter table public.appointments enable row level security;

-- Defense in depth beyond RLS row-visibility: a non-admin caller who owns
-- the row may only flip status to 'cancelled', may not touch any other
-- column, and may not cancel an appointment that has already started.
create function public.enforce_appointment_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_admin() then
    return new;
  end if;

  if old.customer_id is distinct from auth.uid() then
    raise exception 'not allowed';
  end if;

  if new.customer_id is distinct from old.customer_id
    or new.barber_id is distinct from old.barber_id
    or new.service_id is distinct from old.service_id
    or new.start_at is distinct from old.start_at
    or new.end_at is distinct from old.end_at
  then
    raise exception 'customers may only cancel an appointment, not modify it';
  end if;

  if new.status is distinct from 'cancelled' then
    raise exception 'customers may only change status to cancelled';
  end if;

  if old.start_at <= now() then
    raise exception 'cannot cancel a past or in-progress appointment';
  end if;

  return new;
end;
$$;

create trigger appointments_update_guard
  before update on public.appointments
  for each row execute procedure public.enforce_appointment_update();

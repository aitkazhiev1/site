-- profiles: one row per auth user, extends auth.users with app-level fields.
create type public.user_role as enum ('customer', 'admin');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  phone text,
  role public.user_role not null default 'customer'
);

alter table public.profiles enable row level security;

-- SECURITY DEFINER so RLS policies can check "is this caller an admin?"
-- without recursively re-evaluating profiles' own RLS policies.
create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Every new auth user gets a profiles row automatically. Runs as the
-- function owner (bypassing RLS), since new users can't yet satisfy an
-- "own row" insert policy at the moment their row is created.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

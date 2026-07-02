-- Recent Supabase versions no longer auto-grant table privileges to the
-- anon/authenticated Data API roles for newly created tables — RLS policies
-- restrict which *rows* a role can see, but Postgres still requires an
-- explicit GRANT before a role may touch a table at all. Without these,
-- every query fails with 42501 "permission denied for table ...",
-- regardless of how the RLS policies are written.
grant usage on schema public to anon, authenticated;

-- Public storefront: barbers, services, and the link table between them.
grant select on public.barbers, public.services, public.barber_services to anon;

grant select, insert, update, delete
  on public.barbers, public.services, public.barber_services, public.working_hours, public.time_off
  to authenticated;

-- profiles: no insert grant — rows are created only by the SECURITY DEFINER
-- handle_new_user trigger, which runs as the function owner and bypasses
-- grants entirely.
grant select, update on public.profiles to authenticated;

grant select, insert, update, delete on public.appointments to authenticated;

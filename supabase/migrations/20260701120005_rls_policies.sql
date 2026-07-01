-- profiles: a user sees/edits their own row; admins see/edit everything.
-- Insertion happens only via the handle_new_user trigger (SECURITY DEFINER),
-- so there is no client-facing insert policy.
create policy "profiles_select_own_or_admin" on public.profiles
  for select
  using (id = auth.uid() or public.is_admin());

create policy "profiles_update_own" on public.profiles
  for update
  using (id = auth.uid())
  with check (id = auth.uid() and role = 'customer');

create policy "profiles_admin_all" on public.profiles
  for all
  using (public.is_admin())
  with check (public.is_admin());

-- barbers / services: publicly readable when active (storefront), admins
-- manage everything including inactive rows.
create policy "barbers_public_select" on public.barbers
  for select
  using (active = true);

create policy "barbers_admin_all" on public.barbers
  for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "services_public_select" on public.services
  for select
  using (active = true);

create policy "services_admin_all" on public.services
  for all
  using (public.is_admin())
  with check (public.is_admin());

-- barber_services: non-sensitive linking data required to render the public
-- storefront ("barber card with their services"), so it is publicly
-- readable like barbers/services. Only admins manage the links.
create policy "barber_services_public_select" on public.barber_services
  for select
  using (true);

create policy "barber_services_admin_all" on public.barber_services
  for all
  using (public.is_admin())
  with check (public.is_admin());

-- working_hours / time_off are NOT publicly readable (schedules and time-off
-- reasons are internal). Availability for booking is exposed only through
-- the get_available_slots() function (SECURITY DEFINER, see
-- 20260701120006_slot_availability.sql), never via raw table access.
create policy "working_hours_admin_all" on public.working_hours
  for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "time_off_admin_all" on public.time_off
  for all
  using (public.is_admin())
  with check (public.is_admin());

-- appointments: customers see/manage only their own; admins see/manage all.
create policy "appointments_select_own_or_admin" on public.appointments
  for select
  using (customer_id = auth.uid() or public.is_admin());

create policy "appointments_customer_insert" on public.appointments
  for insert
  with check (
    customer_id = auth.uid()
    and status = 'pending'
    and start_at > now()
  );

create policy "appointments_update_own_or_admin" on public.appointments
  for update
  using (customer_id = auth.uid() or public.is_admin())
  with check (customer_id = auth.uid() or public.is_admin());

create policy "appointments_admin_delete" on public.appointments
  for delete
  using (public.is_admin());

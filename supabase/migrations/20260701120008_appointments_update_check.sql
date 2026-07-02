-- Defense in depth for appointment updates.
--
-- The enforce_appointment_update() trigger (see 20260701120004_appointments.sql)
-- is the primary guard that a non-admin customer may only flip status to
-- 'cancelled'. Previously the RLS UPDATE policy checked ownership only, leaving
-- the trigger as the sole enforcer of the status rule. This adds a redundant
-- WITH CHECK so that even if that trigger were ever dropped or disabled, RLS
-- alone still forbids a customer from updating their appointment into any state
-- other than 'cancelled'. Admins remain unrestricted.

drop policy "appointments_update_own_or_admin" on public.appointments;

create policy "appointments_update_own_or_admin" on public.appointments
  for update
  using (customer_id = auth.uid() or public.is_admin())
  with check (
    public.is_admin()
    or (customer_id = auth.uid() and status = 'cancelled')
  );

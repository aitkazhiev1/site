-- Public read model for booking: returns free slots for a barber/service/day
-- without exposing the underlying working_hours/time_off/appointments rows.
-- A slot is free iff it fits inside working_hours, does not overlap
-- time_off, does not overlap an existing non-cancelled appointment, and
-- does not start in the past.
create function public.get_available_slots(
  p_barber_id uuid,
  p_service_id uuid,
  p_date date
)
returns table (slot_start timestamptz, slot_end timestamptz)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_duration interval;
  v_weekday smallint;
begin
  select make_interval(mins => duration_min) into v_duration
  from public.services
  where id = p_service_id and active = true;

  if v_duration is null then
    return;
  end if;

  v_weekday := extract(dow from p_date);

  return query
  with hours as (
    select
      (p_date + wh.start_time)::timestamptz as window_start,
      (p_date + wh.end_time)::timestamptz as window_end
    from public.working_hours wh
    where wh.barber_id = p_barber_id
      and wh.weekday = v_weekday
  ),
  candidates as (
    select
      gs as candidate_start,
      gs + v_duration as candidate_end
    from hours,
      lateral generate_series(hours.window_start, hours.window_end - v_duration, v_duration) as gs
  )
  select c.candidate_start, c.candidate_end
  from candidates c
  where c.candidate_start > now()
    and not exists (
      select 1 from public.time_off t
      where t.barber_id = p_barber_id
        and tstzrange(t.start_at, t.end_at) && tstzrange(c.candidate_start, c.candidate_end)
    )
    and not exists (
      select 1 from public.appointments a
      where a.barber_id = p_barber_id
        and a.status <> 'cancelled'
        and tstzrange(a.start_at, a.end_at) && tstzrange(c.candidate_start, c.candidate_end)
    )
  order by c.candidate_start;
end;
$$;

grant execute on function public.get_available_slots(uuid, uuid, date) to anon, authenticated;

-- Extensions used across the schema.
-- btree_gist is required for the EXCLUDE constraint that prevents
-- double-booking on public.appointments (see 20260701120004_appointments.sql).
create extension if not exists pgcrypto with schema extensions;
create extension if not exists btree_gist with schema extensions;

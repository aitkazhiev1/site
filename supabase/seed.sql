-- Local/dev seed data only. Never run against a production project:
-- it inserts rows directly into auth.users, bypassing normal signup.
-- Applied automatically by `supabase db reset`.

-- Test accounts (password for both customers: "password123").
-- Inserting into auth.users fires the on_auth_user_created trigger, which
-- creates the matching public.profiles row automatically.
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data
) values
  ('00000000-0000-0000-0000-000000000000', '10000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated',
   'admin@barbershop.test', extensions.crypt('password123', extensions.gen_salt('bf')), now(), now(), now(),
   '{"provider":"email","providers":["email"]}', '{"full_name":"Admin Admin"}'),
  ('00000000-0000-0000-0000-000000000000', '10000000-0000-0000-0000-000000000002', 'authenticated', 'authenticated',
   'ivan@barbershop.test', extensions.crypt('password123', extensions.gen_salt('bf')), now(), now(), now(),
   '{"provider":"email","providers":["email"]}', '{"full_name":"Иван Тестов"}'),
  ('00000000-0000-0000-0000-000000000000', '10000000-0000-0000-0000-000000000003', 'authenticated', 'authenticated',
   'olga@barbershop.test', extensions.crypt('password123', extensions.gen_salt('bf')), now(), now(), now(),
   '{"provider":"email","providers":["email"]}', '{"full_name":"Ольга Тестова"}')
on conflict (id) do nothing;

update public.profiles set role = 'admin', phone = '+1 555 0100'
where id = '10000000-0000-0000-0000-000000000001';

update public.profiles set phone = '+1 555 0101'
where id = '10000000-0000-0000-0000-000000000002';

update public.profiles set phone = '+1 555 0102'
where id = '10000000-0000-0000-0000-000000000003';

-- Barbers
insert into public.barbers (id, name, bio, avatar_url, specialties, active) values
  ('20000000-0000-0000-0000-000000000001', 'Marcus Reed', 'Классические стрижки и уходовое бритьё, 12 лет за креслом.', null, array['classic cuts', 'straight razor shave'], true),
  ('20000000-0000-0000-0000-000000000002', 'Dante Kovacs', 'Фейд, дизайн бороды, современные текстуры.', null, array['fades', 'beard design'], true),
  ('20000000-0000-0000-0000-000000000003', 'Leo Santos', 'Барбер широкого профиля, специализация — детские стрижки.', null, array['kids cuts', 'classic cuts'], true),
  ('20000000-0000-0000-0000-000000000004', 'Sam Okafor', 'Экспериментальные стрижки и укладка.', null, array['fades', 'styling'], false);

-- Services
insert into public.services (id, name, description, duration_min, price, active) values
  ('30000000-0000-0000-0000-000000000001', 'Классическая стрижка', 'Стрижка машинкой и ножницами, укладка.', 45, 35.00, true),
  ('30000000-0000-0000-0000-000000000002', 'Стрижка + борода', 'Стрижка и оформление бороды.', 60, 50.00, true),
  ('30000000-0000-0000-0000-000000000003', 'Оформление бороды', 'Стрижка, контур, горячее полотенце.', 30, 25.00, true),
  ('30000000-0000-0000-0000-000000000004', 'Королевское бритьё', 'Бритьё опасной бритвой с горячим полотенцем.', 40, 40.00, true),
  ('30000000-0000-0000-0000-000000000005', 'Фейд', 'Плавный переход, чёткие линии.', 45, 40.00, true),
  ('30000000-0000-0000-0000-000000000006', 'Детская стрижка', 'Стрижка для детей до 12 лет.', 30, 25.00, true),
  ('30000000-0000-0000-0000-000000000007', 'Камуфляж седины', 'Тонирование седины, натуральный результат.', 30, 30.00, true);

-- Barber <-> service links
insert into public.barber_services (barber_id, service_id) values
  ('20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001'),
  ('20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000003'),
  ('20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000004'),
  ('20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000007'),
  ('20000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000001'),
  ('20000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002'),
  ('20000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000005'),
  ('20000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000001'),
  ('20000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000006'),
  ('20000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000002');

-- Working hours: Tue-Sat 9:00-18:00 for the three active barbers.
insert into public.working_hours (barber_id, weekday, start_time, end_time)
select b.id, wd, time '09:00', time '18:00'
from public.barbers b
cross join generate_series(2, 6) as wd
where b.id in (
  '20000000-0000-0000-0000-000000000001',
  '20000000-0000-0000-0000-000000000002',
  '20000000-0000-0000-0000-000000000003'
);

-- One time-off block: Marcus is out next week.
insert into public.time_off (barber_id, start_at, end_at, reason) values
  ('20000000-0000-0000-0000-000000000001', now() + interval '7 days', now() + interval '9 days', 'Отпуск');

-- Sample appointments across statuses.
insert into public.appointments (barber_id, service_id, customer_id, start_at, end_at, status, notes) values
  ('20000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000001',
   '10000000-0000-0000-0000-000000000002', now() + interval '2 days' + interval '10 hours', now() + interval '2 days' + interval '10 hours 45 minutes',
   'confirmed', null),
  ('20000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000002',
   '10000000-0000-0000-0000-000000000003', now() + interval '3 days' + interval '14 hours', now() + interval '3 days' + interval '15 hours',
   'pending', 'Впервые, просьба не спешить'),
  ('20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000004',
   '10000000-0000-0000-0000-000000000002', now() - interval '5 days' + interval '11 hours', now() - interval '5 days' + interval '11 hours 40 minutes',
   'completed', null),
  ('20000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000005',
   '10000000-0000-0000-0000-000000000003', now() - interval '2 days' + interval '9 hours', now() - interval '2 days' + interval '9 hours 45 minutes',
   'cancelled', 'Клиент отменил');

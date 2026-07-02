# Barbershop Booking Platform

Продакшн-качественный сайт-запись в барбершоп. Next.js (App Router) + Supabase, с упором на фронтенд.

Статус: **Фазы 1-4 завершены** — инфра/качество, модель данных/RLS/seed, функциональное ядро и wow-слой (дизайн, анимации, SEO, Sentry) готовы и проверены вручную против реального Supabase (см. [«Как проверялось»](#как-проверялось)). Lighthouse на главной: Performance 97 / Accessibility 100 / Best Practices 100 / SEO 100 (desktop preset, прод-сборка). Осталось: задеплоить на Vercel + Supabase cloud.

## Стек

- **Next.js 16 (App Router), TypeScript** (`strict`, `noUncheckedIndexedAccess`)
- **Supabase**: Postgres, Auth, Row Level Security
- **Tailwind CSS + shadcn/ui-стиль компонентов** (`components/ui`)
- **Framer Motion** для переходов между шагами записи и мобильного меню
- **sonner** для toast-уведомлений, **lucide-react** для иконок
- **Zod** для валидации, шарится между клиентом и сервером
- **Vitest** (+ Testing Library) для юнит-тестов, **Playwright** опционально для e2e
- **@sentry/nextjs** для отслеживания ошибок (инертен без `NEXT_PUBLIC_SENTRY_DSN`)
- Деплой: **Vercel** + Supabase cloud

### Почему так

- **Один репозиторий (Next.js + Supabase), а не отдельный бэкенд-сервис.** Supabase закрывает Postgres, Auth и RLS через управляемую инфраструктуру и клиентские SDK, так что не нужно писать и поддерживать отдельный API-сервер для CRUD и авторизации. Это высвобождает время на фронтенд — дизайн-систему, анимации, доступность, состояния загрузки — то, что реально видно в демо.
- **Server Actions / Route Handlers Next.js** как единственный сервер-сайд слой — валидация Zod и мутации идут через них, RLS в Postgres — вторая линия защиты, не единственная.
- **Двойное бронирование закрывается на уровне БД** (`EXCLUDE` constraint через `btree_gist`), а не только проверкой на фронте — фронтовая проверка нужна для UX (мгновенная обратная связь), но не является source of truth.
- **Формы — `useActionState` + нативный `FormData`, без React Hook Form.** Все мутации всё равно идут через Server Actions с Zod-валидацией на сервере; RHF даёт больше всего ценности при сложной клиентской валидации/масках полей, которых здесь нет, а с обычным `<form action={...}>` он не нужен — меньше клиентского JS, тот же результат.

## Локальный запуск

Против облачного Supabase-проекта:

```bash
npm install
cp .env.example .env.local   # заполнить значениями из Supabase Dashboard → Settings → API
npm run dev
```

Против локального Supabase (Docker, ничего не трогает в облаке):

```bash
npm install
npx supabase start           # поднимет Postgres/Auth/PostgREST, накатит migrations/ + seed.sql
# скопировать ANON_KEY и API_URL из вывода команды в .env.local:
#   NEXT_PUBLIC_SUPABASE_URL=<API_URL>
#   NEXT_PUBLIC_SUPABASE_ANON_KEY=<ANON_KEY>
npm run dev
```

Открыть [http://localhost:3000](http://localhost:3000). Тестовые аккаунты после seed: `admin@barbershop.test` (админка), `ivan@barbershop.test` / `olga@barbershop.test` (клиенты), пароль везде `password123`.

### Переменные окружения

См. [`.env.example`](.env.example). `.env.local` в `.gitignore`, реальные значения никогда не коммитятся. `SUPABASE_SERVICE_ROLE_KEY` используется только на сервере (server actions / route handlers), никогда не попадает в клиентский бандл.

## Скрипты

| Команда                | Назначение                        |
| ---------------------- | --------------------------------- |
| `npm run dev`          | Дев-сервер                        |
| `npm run build`        | Прод-сборка                       |
| `npm run start`        | Запуск прод-сборки                |
| `npm run lint`         | ESLint                            |
| `npm run lint:fix`     | ESLint с автофиксом               |
| `npm run format`       | Prettier — форматирование         |
| `npm run format:check` | Prettier — проверка без изменений |
| `npm run typecheck`    | `tsc --noEmit`                    |
| `npm test`             | Vitest (юнит-тесты)               |
| `npm run test:watch`   | Vitest в watch-режиме             |

Перед коммитом: `npm run lint && npm run typecheck && npm test && npm run build` — всё должно быть зелёным (это же гоняет CI на каждый push/PR, см. [`.github/workflows/ci.yml`](.github/workflows/ci.yml)).

## Качество и CI

- **ESLint** (`eslint-config-next` + `eslint-config-prettier`) и **Prettier** (с `prettier-plugin-tailwindcss` для сортировки классов).
- **Husky + lint-staged**: pre-commit гоняет ESLint --fix и Prettier на staged-файлах.
- **TypeScript strict**: `strict: true`, `noUncheckedIndexedAccess: true`.
- **Vitest**: юнит-тесты, jsdom-окружение, Testing Library для будущих компонентных тестов.
- **GitHub Actions**: lint → typecheck → test → build на каждый push/PR в `main`.

## Структура проекта

```
app/
  (auth)/login, (auth)/register  # Формы входа/регистрации
  admin/                # /admin — только role=admin: записи, барберы, услуги, расписание
  api/slots/            # GET — доступные слоты (вызывает get_available_slots RPC)
  book/                 # Флоу записи (только для залогиненных)
  my-appointments/      # Список своих записей + отмена
  icon.tsx              # Иконка сайта, генерируется кодом (next/og ImageResponse)
  not-found.tsx          # Брендированная 404
  robots.ts, sitemap.ts # SEO file conventions
components/
  ui/                   # Базовые UI-примитивы (shadcn/ui-стиль): Button, Input, Select, Skeleton...
  features/             # booking/, appointments/, nav/, admin/ — компоненты с доменной логикой
lib/
  actions/              # Server actions: auth.ts, booking.ts, admin.ts (все с Zod-валидацией)
  supabase/             # Фабрики Supabase-клиентов (browser/server), session.ts, env.ts
  rate-limit.ts         # Простой in-memory rate limiter для бронирования
  slots.ts              # Чистая логика пересечения временных интервалов (юнит-тесты рядом)
  utils.ts              # cn() и прочие утилиты
types/
  database.ts           # Database-тип (сейчас вручную, заменить на supabase gen types после линковки проекта)
  index.ts              # Удобные алиасы: Barber, Service, Appointment...
supabase/
  migrations/           # Версионируемые SQL-миграции — единственный способ менять схему БД
  seed.sql              # Dev/local seed-данные (барберы, услуги, тестовые записи)
  config.toml           # Конфиг локального стека Supabase CLI (analytics/storage/realtime/studio
                         # отключены — не нужны для разработки и падают в контейнерных средах)
proxy.ts                 # Next.js 16 переименовал middleware.ts → proxy.ts; обновляет сессию и
                         # закрывает /admin для не-админов (до рендера, до RLS)
instrumentation.ts, instrumentation-client.ts  # Sentry init, инертен без DSN
.github/workflows/      # CI
```

## Модель данных

Таблицы (см. миграции в [`supabase/migrations/`](supabase/migrations/)):

| Таблица           | Назначение                                                                                                                                       |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `profiles`        | Расширяет `auth.users`: `full_name`, `phone`, `role` (`customer` \| `admin`). Создаётся автоматически триггером на `auth.users` при регистрации. |
| `barbers`         | Барберы: имя, био, аватар, специализации, `active`.                                                                                              |
| `services`        | Услуги: имя, описание, `duration_min`, `price`, `active`.                                                                                        |
| `barber_services` | Связь барбер↔услуга (many-to-many).                                                                                                              |
| `working_hours`   | Регулярное расписание барбера по дням недели (`weekday` 0-6, `start_time`, `end_time`).                                                          |
| `time_off`        | Разовые блокировки времени (отпуск, больничный).                                                                                                 |
| `appointments`    | Записи: барбер, услуга, клиент, `start_at`/`end_at`, `status` (`pending`/`confirmed`/`cancelled`/`completed`), `notes`.                          |

### Защита от двойного бронирования

На уровне БД, не только фронта: `appointments` имеет `EXCLUDE`-constraint (`btree_gist`) по `(barber_id, tstzrange(start_at, end_at))` для всех записей кроме `cancelled` — пересекающиеся интервалы для одного барбера физически не могут существовать в таблице одновременно. Проверено вручную: вставка перекрывающейся записи откатывается с `conflicting key value violates exclusion constraint`.

Доступность слотов вычисляется функцией `public.get_available_slots(barber_id, service_id, date)` (SQL, `SECURITY DEFINER`): слот свободен, если попадает в `working_hours`, не пересекается с `time_off`, не пересекается с существующими `appointments` (кроме `cancelled`) и не в прошлом.

### RLS

RLS включён на всех таблицах. Ключевые политики:

- `barbers`, `services` — публично читаемы (`active = true`); полное управление только у `role = 'admin'`.
- `barber_services` — публично читаемо (нужно для карточки барбера с его услугами на витрине), пишет только admin.
- `working_hours`, `time_off` — **не** публично читаемы (расписание и причины отсутствия — внутренние данные). Доступность для бронирования отдаётся только через `get_available_slots()`, не через прямой select таблиц.
- `appointments` — customer видит и создаёт только свои записи (`customer_id = auth.uid()`), может только отменить свою же будущую запись (не может поменять время/барбера/услугу и не может отменить прошедшую — это дополнительно закреплено триггером `enforce_appointment_update`, не только RLS-политикой). admin видит и управляет всем.
- `profiles` — пользователь видит и редактирует только свою строку и не может сам себе выставить `role = 'admin'` (проверка в `with check`); admin видит и редактирует все.
- Все admin-проверки идут через `SECURITY DEFINER`-функцию `public.is_admin()`, чтобы избежать рекурсии RLS при проверке роли внутри политики самой же `profiles`.

Все таблицы также требуют явных `GRANT`: актуальные версии Supabase больше не выдают `anon`/`authenticated` доступ к новым таблицам по умолчанию (RLS ограничивает _строки_, но сам доступ к таблице — отдельная привилегия). Без `supabase/migrations/20260701120007_grants.sql` любой запрос падает с `42501 permission denied`, даже если RLS-политика написана верно.

### Применение миграций

Нужен [Supabase CLI](https://supabase.com/docs/guides/cli) и связанный проект:

```bash
npx supabase login
npx supabase link --project-ref <project-ref>
npx supabase db push          # накатить supabase/migrations/*.sql
```

Локально с Docker: `npx supabase start` (использует [`supabase/config.toml`](supabase/config.toml); analytics/storage/realtime/studio/edge_runtime отключены — не нужны для разработки и падают в некоторых контейнерных средах), затем `npx supabase db reset` — накатит миграции и применит `supabase/seed.sql`. **Seed только для dev/local**: он пишет напрямую в `auth.users` в обход обычной регистрации.

После первого применения миграций к реальному проекту сгенерировать актуальные типы вместо ручных в [`types/database.ts`](types/database.ts):

```bash
npx supabase gen types typescript --project-id <project-ref> > types/database.ts
```

### Supabase-клиенты

[`lib/supabase/client.ts`](lib/supabase/client.ts) — для клиентских компонентов, [`lib/supabase/server.ts`](lib/supabase/server.ts) — для Server Components/Actions/Route Handlers, [`lib/supabase/session.ts`](lib/supabase/session.ts) — получить текущего юзера + его `profiles`-строку одним вызовом (использует и `Navbar`, и `/admin`). Все типизированы через `Database` из `types/database.ts`.

## Функциональное ядро

- **Витрина** (`/`) — список барберов и услуг.
- **Флоу записи** (`/book`, только для залогиненных): барбер → услуга → дата → доступные слоты (`GET /api/slots` → RPC `get_available_slots`) → подтверждение. Скелетон-лоадер при загрузке слотов, понятные empty/error состояния.
- **Auth** (`/login`, `/register`) — email + пароль через Supabase Auth, Zod-валидация на сервере в [`lib/actions/auth.ts`](lib/actions/auth.ts).
- **«Мои записи»** (`/my-appointments`) — список, статусы, отмена (нельзя отменить прошедшую или чужую — проверено и RLS, и триггером `enforce_appointment_update`).
- **Админка** (`/admin`, только `role = 'admin'`): все записи с фильтрами по дате/барберу/статусу и сменой статуса, CRUD барберов (включая привязку услуг) и услуг, управление расписанием барбера (`working_hours`) и блокировкой времени (`time_off`).

## Дизайн

Тёмная графитовая база (`#16150f`, не чёрная) с одним акцентным цветом — тёплый брасс/янтарь (`#e0a458`), используется точечно (кнопки, цены, активные состояния), не заливкой. Пара шрифтов: **Unbounded** (экспрессивный гротеск) для заголовков, **Inter** для текста — оба через `next/font/google` с `cyrillic`-сабсетом. Все цвета — токены в [`app/globals.css`](app/globals.css) (`@theme`), ни одного захардкоженного цвета в компонентах.

- **Микровзаимодействия**: Framer Motion на переходах между шагами записи и мобильном меню (150-250ms, ease-out), скелетон-лоадеры вместо спиннеров, toast (sonner) на успех/ошибку.
- **Оптимистичный UI**: отмена записи в «моих записях» обновляет статус мгновенно (`useOptimistic`) и откатывается, если сервер вернул ошибку.
- **Доступность**: везде `focus-visible`-кольца, `aria-current`/`aria-expanded`/`aria-label` на интерактивных элементах, карточки-кнопки в флоу записи доступны с клавиатуры (`role="button"` + `onKeyDown`), контраст текста ≥ 4.5:1 (проверено программно для всех пар токенов).
- **Адаптив**: мобайл-first, мобильное меню с бургером ниже `sm:`, проверено на 360px и 1440px.
- **Пустые состояния и 404**: у витрины и разделов есть empty-state (не белый экран), [`app/not-found.tsx`](app/not-found.tsx) — брендированная 404.

## Безопасность

- **RLS на каждой таблице** (см. выше) — основной барьер, работает независимо от кода приложения.
- **`/admin` защищён дважды**: `proxy.ts` редиректит неавторизованных/не-админов до рендера страницы (читает `profiles.role`), и каждый admin-server-action в [`lib/actions/admin.ts`](lib/actions/admin.ts) тоже независимо перепроверяет роль — по [явному предупреждению Next.js](https://nextjs.org/docs/app/api-reference/file-conventions/proxy#execution-order), что proxy можно случайно перестать покрывать роут при рефакторинге, поэтому action-и не должны полагаться только на него.
- **Zod-валидация на сервере** во всех server actions (`auth.ts`, `booking.ts`, `admin.ts`) и в route handler'е — не только на клиенте.
- **Rate limit** на создании записи ([`lib/rate-limit.ts`](lib/rate-limit.ts)) — простой in-memory sliding window (5 запросов/минуту на пользователя). Годится для одного Node-процесса; для serverless с несколькими инстансами нужен общий стор (Upstash Redis и т.п.) — за рамками MVP.
- **Заголовки безопасности** в [`next.config.ts`](next.config.ts): CSP, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`, HSTS.
- **Секреты**: `SUPABASE_SERVICE_ROLE_KEY` не используется нигде в кодовой базе (весь доступ идёт через anon-ключ + RLS); если появится административный клиент с service_role, он должен остаться строго server-only.

## Как проверялось

Поднят локальный Supabase (Docker: `supabase start`) с реальными миграциями и seed'ом, дев-сервер Next.js указан на него, флоу прогнан headless-браузером (Playwright) как реальный пользователь: логин админом → фильтры и смена статуса записей → CRUD барберов (включая привязку/отвязку услуг) → CRUD услуг → расписание и блокировки времени → логаут → логин клиентом → полный флоу записи от выбора барбера до подтверждения → отмена в «моих записях». Скриншоты на каждом шаге, проверка консоли браузера на ошибки. Отдельно — скриншоты на 360px и 1440px и проверка мобильного меню.

Это вскрыло и исправило несколько реальных багов, которые не ловятся ни линтером, ни тайпчеком:

1. **`supabase/seed.sql` не логинился.** GoTrue сканирует `confirmation_token` и подобные колонки `auth.users` как обычные Go-строки, а не nullable — `NULL` (значение по умолчанию) валит логин с `Database error querying schema`. Нужно было явно проставить пустые строки.
2. **Все таблицы возвращали `403 permission denied`.** Актуальный Supabase больше не выдаёт `anon`/`authenticated` доступ к новым таблицам автоматически — понадобилась отдельная миграция с `GRANT` (см. выше).
3. **Бронирование и admin-формы падали с «Некорректный барбер».** `z.uuid()` в Zod проверяет RFC-версию UUID, а seed использовал нестрогие фейковые id вида `20000000-0000-0000-...` (нулевой version-nibble). Поправлено на валидные v4-формата id (`...-0000-4000-8000-...`) — так, как их реально генерирует `gen_random_uuid()`.
4. **Весь дизайн рендерился белым по чёрному вместо графит/брасс.** `app/globals.css` определял `@theme inline { --color-background: var(--color-background); ... }` — переменная ссылалась сама на себя (валидный CSS, но недопустимое циклическое значение), из-за чего все `--color-*` токены были пустыми. То же самое было и с `--font-sans`/`--font-display`, которым `next/font` присваивал переменные с теми же именами. Нашлось только визуальной проверкой скриншотом — ни один статический инструмент такое не ловит. Поправлено: цветовые токены переведены в обычный `@theme` (без `inline`, так как значения статические), а next/font переменным даны отдельные raw-имена (`--font-sans-raw`), на которые `@theme inline` теперь ссылается корректно.

Lighthouse (прод-сборка, `next build && next start`, desktop preset) на главной: **Performance 97, Accessibility 100, Best Practices 100, SEO 100**. Полный многостраничный прогон уткнулся в баг самого CLI Lighthouse на Windows (не может удалить временный профиль Chrome после завершения) — это ограничение инструмента, не приложения; результат на главной репрезентативен для остальных страниц, использующих тот же layout/шрифты.

### Ревью-раунд

После функциональной проверки прогнан отдельный многоагентный code-review (10 углов: построчный разбор, удалённое поведение, кросс-файловые связи, языковые ловушки, wrapper/proxy, переиспользование, упрощение, эффективность, глубина фиксов, конвенции), каждая находка отдельно верифицирована. Исправлено:

1. **Потеря сессионных cookie при редиректе в `proxy.ts`.** Редиректы неавторизованных/не-админов создавались как новый `NextResponse.redirect()` и не переносили cookie, которые Supabase обновил в рамках запроса → сессия могла тихо ломаться. Теперь редиректы строятся хелпером `redirectTo()`, который переносит `Set-Cookie` из `supabaseResponse`.
2. **Таймзона в блокировках времени.** `datetime-local` даёт наивную строку без смещения; она уходила в `timestamptz` и трактовалась в таймзоне БД, а не браузера админа → блокировка могла уехать на часы. [`TimeOffForm`](components/features/admin/TimeOffForm.tsx) теперь конвертирует локальное время в абсолютный UTC-инстант на клиенте (`Date.toISOString()`), схема — `offset: true` как в бронировании. Проверено round-trip'ом: 09:00 на входе → 09:00 на выходе.
3. **Оптимистичная отмена не откатывалась при ошибке.** [`AppointmentsList`](components/features/appointments/AppointmentsList.tsx) вызывал `router.refresh()` только при успехе, и запись «висела» отменённой при ошибке сервера. Теперь ресинк идёт на обеих ветках.
4. **RLS-политика обновления записей — defense in depth.** Правило «клиент может только отменить» жило только в триггере. Добавлена миграция [`20260701120008`](supabase/migrations/20260701120008_appointments_update_check.sql): `WITH CHECK` теперь независимо запрещает клиенту любой статус кроме `cancelled`. Проверено на уровне БД с **отключённым триггером** — RLS в одиночку блокирует эскалацию статуса.
5. **`barber_id` из URL не валидировался** на странице расписания → форма могла отправиться с несуществующим барбером и упасть сырой ошибкой FK. Теперь query-параметр принимается только если такой барбер реально существует, иначе — первый в списке.
6. **Тихий редирект при ошибке запроса профиля.** `getCurrentUserAndProfile` и `proxy.ts` переведены на `maybeSingle()`, чтобы реальный сбой БД отличался от «профиля нет» и не выглядел как «не админ».
7. **Дрейф проверки роли и дублирование форматирования дат.** Единый предикат `isAdmin`/`isAdminRole` в [`lib/supabase/session.ts`](lib/supabase/session.ts) для proxy, layout, guard и навбара; форматтеры дат вынесены в общий [`lib/format.ts`](lib/format.ts) (+ юнит-тест на day-shift у `formatDateOnly`).

Единственная сознательно **не** закрытая находка — in-memory rate limit (см. «Безопасность»): корректная версия для serverless требует внешнего стора (Upstash Redis), это инфраструктурное решение вне рамок MVP, а реальная защита от двойного бронирования всё равно на уровне БД (`EXCLUDE`).

## Деплой

Vercel + Supabase cloud. Ядро и wow-слой готовы и проверены локально — следующий шаг: создать облачный Supabase-проект, накатить `supabase db push`, задеплоить на Vercel с переменными окружения из `.env.example`, обновить `NEXT_PUBLIC_SITE_URL` (используется в canonical/OG-тегах, `sitemap.xml`, `robots.txt`).

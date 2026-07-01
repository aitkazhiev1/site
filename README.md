# Barbershop Booking Platform

Продакшн-качественный сайт-запись в барбершоп. Next.js (App Router) + Supabase, с упором на фронтенд.

Статус: **Фаза 1 (инфра и качество)** и **Фаза 2 (модель данных, RLS, seed)** завершены. Флоу записи и админка — в следующих фазах.

## Стек

- **Next.js 16 (App Router), TypeScript** (`strict`, `noUncheckedIndexedAccess`)
- **Supabase**: Postgres, Auth, Row Level Security
- **Tailwind CSS + shadcn/ui-стиль компонентов** (`components/ui`)
- **Framer Motion** для микроанимаций
- **Zod** для валидации, шарится между клиентом и сервером
- **React Hook Form** для форм
- **Vitest** (+ Testing Library) для юнит-тестов, **Playwright** опционально для e2e
- Деплой: **Vercel** + Supabase cloud

### Почему так

- **Один репозиторий (Next.js + Supabase), а не отдельный бэкенд-сервис.** Supabase закрывает Postgres, Auth и RLS через управляемую инфраструктуру и клиентские SDK, так что не нужно писать и поддерживать отдельный API-сервер для CRUD и авторизации. Это высвобождает время на фронтенд — дизайн-систему, анимации, доступность, состояния загрузки — то, что реально видно в демо.
- **Server Actions / Route Handlers Next.js** как единственный сервер-сайд слой — валидация Zod и мутации идут через них, RLS в Postgres — вторая линия защиты, не единственная.
- **Двойное бронирование закрывается на уровне БД** (`EXCLUDE` constraint через `btree_gist`), а не только проверкой на фронте — фронтовая проверка нужна для UX (мгновенная обратная связь), но не является source of truth.

## Локальный запуск

```bash
npm install
cp .env.example .env.local   # заполнить значениями из Supabase Dashboard → Settings → API
npm run dev
```

Открыть [http://localhost:3000](http://localhost:3000).

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
app/                    # Next.js App Router: страницы, layouts, route handlers, server actions
components/
  ui/                   # Базовые UI-примитивы (shadcn/ui-стиль): Button, Input, Dialog...
  features/             # Композитные компоненты, привязанные к доменной логике (booking, admin...)
lib/
  supabase/             # Фабрики Supabase-клиентов (browser/server) + чтение env
  utils.ts              # cn() и прочие утилиты
types/
  database.ts           # Database-тип (сейчас вручную, заменить на supabase gen types после линковки проекта)
  index.ts               # Удобные алиасы: Barber, Service, Appointment...
supabase/
  migrations/           # Версионируемые SQL-миграции — единственный способ менять схему БД
  seed.sql              # Dev/local seed-данные (барберы, услуги, тестовые записи)
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

**Как проверялось:** миграции и seed прогнаны на чистом Postgres 16 в Docker (с застабленной `auth`-схемой) — накатывается без ошибок; вручную проверено, что anon видит только активных барберов и не видит `working_hours`/`appointments`, что customer видит только свои записи и не может ни прочитать, ни отменить чужую, что попытка отменить уже прошедшую запись падает с ошибкой, а admin видит всё.

### Применение миграций

Нужен [Supabase CLI](https://supabase.com/docs/guides/cli) и связанный проект:

```bash
npx supabase login
npx supabase link --project-ref <project-ref>
npx supabase db push          # накатить supabase/migrations/*.sql
```

Локально с Docker: `npx supabase start`, затем `npx supabase db reset` — накатит миграции и применит `supabase/seed.sql` (тестовые аккаунты `admin@barbershop.test`, `ivan@barbershop.test`, `olga@barbershop.test`, пароль `password123`; **seed только для dev/local**, он пишет напрямую в `auth.users` в обход обычной регистрации).

После первого применения миграций к реальному проекту сгенерировать актуальные типы вместо ручных в [`types/database.ts`](types/database.ts):

```bash
npx supabase gen types typescript --project-id <project-ref> > types/database.ts
```

### Supabase-клиенты

[`lib/supabase/client.ts`](lib/supabase/client.ts) — для клиентских компонентов, [`lib/supabase/server.ts`](lib/supabase/server.ts) — для Server Components/Actions/Route Handlers (`@supabase/ssr`, cookie-based сессии). Оба типизированы через `Database` из `types/database.ts`. Client для `middleware.ts` (обновление сессии, защита `/admin`) добавится в Фазе 3 вместе с auth-флоу.

## Деплой

Vercel + Supabase cloud. Ссылка появится после Фазы 3 (рабочее функциональное ядро).

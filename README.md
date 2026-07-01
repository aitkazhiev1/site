# Barbershop Booking Platform

Продакшн-качественный сайт-запись в барбершоп. Next.js (App Router) + Supabase, с упором на фронтенд.

Статус: **Фаза 1 — инфра и качество** завершена. Функциональность (модель данных, флоу записи, админка) появится в следующих фазах.

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
lib/                    # Утилиты, Supabase-клиенты, доменная логика (слоты, пересечения времени)
types/                  # Общие TypeScript-типы, включая сгенерированные Supabase-типы (Фаза 2)
supabase/
  migrations/           # Версионируемые SQL-миграции — единственный способ менять схему БД
.github/workflows/      # CI
```

## Модель данных и безопасность

Появятся в Фазе 2: SQL-миграции с RLS-политиками на каждую таблицу, seed-скрипт, защита от двойного бронирования на уровне БД. Подробности будут описаны здесь после реализации.

## Деплой

Vercel + Supabase cloud. Ссылка появится после Фазы 3 (рабочее функциональное ядро).

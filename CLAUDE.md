# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

PicksRecord is a **private** sports-picks tracker (between friends) — not a sportsbook, no real money, no predictions. It records picks (won / lost / pending / push) and reports performance like an investment portfolio: P&L, ROI, win rate, current streak, and an animated equity curve. UI aesthetic is sports-analytics + fintech: dark mode, tabular-mono numbers, EN/ES bilingual (default ES).

## Commands

```bash
npm run dev       # next dev — http://localhost:3000
npm run build     # production build
npm run start     # serve the production build
npm run lint      # next lint
npm run migrate   # apply src/lib/schema.sql to DATABASE_URL (idempotent)
```

`.env.local` must contain `DATABASE_URL` (Neon Postgres connection string) and `AUTH_SECRET` (long random string; `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`). There is no test runner — `scripts/smoke.mjs` and `scripts/authtest.mjs` are ad-hoc manual scripts.

Requires a Node server runtime (Server Actions, middleware, Neon, session cookies) — **static export / GitHub Pages will not work**. Deploy to Vercel or any Node host.

## Architecture

Next.js 15 App Router + React 19 + TypeScript + Tailwind v4 + Framer Motion, on **Neon serverless Postgres**. Auth is hand-rolled (no Supabase Auth) because the app talks directly to Neon.

### Two database clients — pick the right one
- **`src/lib/db.ts`** exports `sql`, the Neon **HTTP tagged-template** client (`await sql\`select ... ${id}\``). Used everywhere in app code. It has **no `.query()` method**.
- **`scripts/migrate.mjs`** uses Neon's **`Pool`** (it needs `.query()`); the HTTP client can't run the multi-statement schema.

### Auth & sessions (the edge/node split matters)
- `src/lib/session.ts` is the **edge-safe half**: `jose` HS256 JWT only, no bcrypt, no DB. `signSession` / `verifySession`, cookie name `pr_session`, 30-day expiry. `src/middleware.ts` imports only this to guard routes at the edge.
- `src/lib/auth.ts` is the **Node half**: `bcryptjs` hashing (12 rounds), cookie set/clear, `getCurrentUser()`, and `requireUser()` (redirects to `/login`). **Never put bcrypt or DB calls into `session.ts`/middleware** — it runs on the edge runtime.
- `getCurrentUser()` selects an explicit public-safe column list; **never `select password_hash`** into anything reachable by the client.
- `middleware.ts` protects `/dashboard`, `/events`, `/picks`, `/profile`, `/onboarding`, and bounces logged-in users away from `/login`,`/register`. Keep the `PROTECTED`/`AUTH_ROUTES` arrays and the `config.matcher` in sync.

### Data flow
Mutations are **Server Actions** in `src/app/actions/{auth,events,picks,profile}.ts`. Every action: `requireUser()` → Zod-validate the `FormData` (`src/lib/validation.ts`, returns `fieldErrors`) → **verify ownership** (`where ... created_by/user_id = ${user.id}`) → write → `revalidatePath()` the affected pages → `redirect()`. All reads live in `src/lib/queries.ts` (marked `server-only`).

**Ownership scoping:** the MVP scopes everything to the owner via `created_by` (events) / `user_id` (picks). `event_members` exists in the schema for future sharing but is unused — don't build features assuming it's wired up.

### Money / odds math
All P&L logic is centralized; don't reinvent it inline:
- `src/lib/odds.ts` — `profitOnWin`, `settledProfit` (won → +profit, lost → −stake, push/pending → 0), `potentialReturn`, `convertOdds`, `impliedProbability`. American `+150 → stake·odds/100`, `−120 → stake·100/|odds|`; decimal `2.50 → stake·(odds−1)`.
- `src/lib/stats.ts` — `computeStats` (totals/ROI/winRate; **pending never counts** toward P&L or win rate; winRate denominator is won+lost only), `currentStreak`, `buildEquityCurve`.
- Picks store **denormalized `profit` and `potential_return`** computed at write time in the action. When status or stake/odds change, recompute via `settledProfit`/`potentialReturn` — never trust a stale stored value. `settlePickAction` accepts an optional `profitOverride` for custom payouts (partial cashouts).

**Neon gotcha:** `numeric` columns come back as **strings**. `mapPick()` in `queries.ts` coerces them; route raw pick rows through it rather than using them directly.

### Server/client boundary
Don't pass a function (e.g. a `format` callback) from a server component into a client component. Use the components that format internally — `AnimatedMoney`, `CountUp`, `StatCard`.

### i18n
Bilingual EN/ES via cookie `pr_lang` (default `es`). Dictionary in `src/lib/i18n.ts`: **`en` is the source-of-truth type, `es` must structurally match it** — when adding a UI string, add the key to **both**. Server reads via `getT()`/`getLocale()` (`src/lib/i18n-server.ts`); client via `useT()` from `@/components/i18n/I18nProvider`. `LanguageToggle` sets the cookie and `router.refresh()`.

### Animations
Follow the Emil design philosophy already in use: custom easings in `src/app/globals.css`, animate `scale(0.95)` not `0`, durations <300ms, distinct won/lost/push reactions. Motion primitives live in `src/components/motion/`.

## Route groups
- `src/app/(auth)/` — login, register (no sidebar)
- `src/app/(app)/` — dashboard, events, picks, profile (protected, with `SideNav`)
- `src/app/onboarding/` — first-run wizard (sets `onboarded`)
- `src/app/page.tsx` — public landing

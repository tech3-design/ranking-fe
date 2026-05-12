# Signalor — Frontend (`ranking-fe`)

Next.js 16 (App Router) + React 19 + Tailwind 4 + shadcn/ui app for signalor.ai.

## Quick start
```bash
pnpm install
pnpm env:local           # copy env/local.env -> .env.local
pnpm dev                 # http://localhost:3000
```

Backend (`ranking-be`) must be running on `http://localhost:8000` for any
authenticated/analyzer feature to work.

## Stack
- **Framework**: Next.js 16 (App Router, Turbopack)
- **Auth**: better-auth (OTP + Google OAuth) → cookie session
- **State**: Zustand stores in `src/lib/stores/`
- **HTTP**: axios via `src/lib/api/client.ts` (10s timeout) and `apiClientLong` (longer for analyzer)
- **UI**: Tailwind 4 + shadcn/ui primitives + custom icon set (`src/components/icons/`)
- **CMS**: Sanity v5 (blog only) under `/studio`, ssr-disabled
- **Charts**: recharts
- **Payments**: Dodo Payments (Shopify Billing API for the Shopify app)

## Layout
```
src/
  app/                      # App Router routes
    (auth)/                 # /sign-in, /sign-up
    dashboard/[slug]/       # Per-organization workspace
      _components/          # Shared dashboard chrome (sidebar, run-context)
    analyzer/[runId]/       # Run-level pages (history, integrations, report)
    studio/[[...tool]]/     # Sanity Studio (ssr: false)
    api/                    # Route handlers (auth callback, tools, etc.)
  components/
    analyzer/               # Cards specific to /analyzer
    dashboard/              # Cards on /dashboard/[slug]
    landing/                # /, /pricing, marketing
    icons/                  # Custom icon set (lucide-shaped, no lucide-react runtime)
    ui/                     # shadcn primitives
  lib/
    api/                    # Axios wrappers per Django app
    stores/                 # Zustand stores
    config.ts               # Routes + feature flags
    auth-client.ts          # better-auth client
```

## Conventions
- **Package manager**: `pnpm` — not npm.
- **Icons**: import from `@/components/icons`, NOT `lucide-react` (lucide-react is still in deps but should not be reached for new code).
- **API client**: every backend call goes through `apiClient` or `apiClientLong` so 401s and base URLs are centrally handled.
- **Cookies / auth**: protected routes are enforced in `src/middleware.ts` (cookie check).
- **Dark mode**: globally enabled (`<html className="dark">` in root layout).
- **Env vars**: client-side env vars MUST be prefixed `NEXT_PUBLIC_`. Source of truth is `env/{local,staging,production}.env`; copy with `pnpm env:<target>`.
- **Site URL**: `NEXT_PUBLIC_SITE_URL` is the public origin for share links — set per environment (`http://localhost:3000`, `https://staging.signalor.ai`, `https://signalor.ai`).

## Tooling
- **Lint**: `pnpm lint` (eslint, Next.js defaults). `pnpm lint:fix` to auto-fix.
- **Format**: `pnpm format` (prettier, see `.prettierrc.json`). `pnpm format:check` for CI.
- **Typecheck**: `pnpm typecheck` (`tsc --noEmit`).
- **Build**: `pnpm build` — **always run this locally before pushing**; we don't rely on Vercel to surface build errors.
- **Pre-commit**: husky + lint-staged run `eslint --fix` and `prettier --write` on staged JS/TS files. Installed via `pnpm install` (the `prepare` script).

## Branching
- `main` → Vercel production (signalor.ai)
- `staging` → Vercel staging (staging.signalor.ai)
- `blog` → blog/Sanity work flows through here before main
- `arkit-01`, `tushar-05` → personal/feature branches

Typical flow: feature on `arkit-01` → `staging` → `blog` (if relevant) → `main`.

## Common pitfalls
- **Sanity Studio** must use `next/dynamic({ ssr: false })` — `window` is referenced at import.
- **`Date.toLocaleString()`** without a fixed locale will hydrate-mismatch SSR vs client. Use `en-US` + UTC.
- **Vercel "Sensitive" env vars** are NOT inlined into `NEXT_PUBLIC_*` builds — uncheck Sensitive for those keys.
- **Author fields on blog posts** are intentionally removed from the Sanity schema; don't re-add `post.author` references in pages or feeds.

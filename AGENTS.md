# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Repository status
- Current state: the repository is currently a specification-only workspace with no committed frontend app code.
- Source of truth for implementation requirements: `frontend-speck.md`.
- No `README.md`, `WARP.md`, `CLAUDE.md`, Cursor rules, or Copilot instructions were found at this time.

## Development commands
Because the app has not been scaffolded yet, there are no runnable project scripts in the current commit.

Once the frontend is scaffolded per `frontend-speck.md` (React 18 + TypeScript + Vite), standard commands should be exposed and used:
- Install deps: `npm install`
- Run dev server: `npm run dev`
- Production build: `npm run build`
- Preview production build: `npm run preview`
- Lint: `npm run lint`
- Unit/component tests (Vitest): `npm run test`
- Single test file (Vitest): `npx vitest run path/to/test-file.test.ts`
- E2E tests (Playwright, once added): `npm run test:e2e`
- Single E2E spec (Playwright): `npx playwright test path/to/spec-file.spec.ts`

If script names differ from the above, prefer `package.json` scripts as the canonical command entrypoints.

## Architecture big picture (from `frontend-speck.md`)
The intended architecture is a feature-first React SPA with shared platform layers:
- `src/app`: app composition (router, providers, TanStack Query client).
- `src/lib`: shared technical foundations:
  - API client/interceptors and endpoint wrappers
  - auth/session token utilities
  - validators (Zod schemas), domain/api types, reusable utilities
- `src/features`: domain modules (`auth`, `products`, `sales`, `reports`, `users`, `shifts`) each containing API hooks and feature components.
- `src/components`: cross-feature UI shell/guards and shared shadcn primitives.
- `src/pages`: route-level page composition.

Key flow expectations:
- API base contract targets `/api/v1/*` with success/error envelope handling.
- Session flow uses bearer token auth, refresh-on-401 once, then forced logout on refresh failure.
- Client routing is role-aware (OWNER / ADMIN / CASHIER) with guarded access and role-based redirect after login.
- Data synchronization is managed through TanStack Query keys and invalidation rules, especially around product, sales, and reports mutations.

## API and environment constraints to preserve
- Dev backend base URL: `http://localhost:3001`.
- Business routes use `/api/v1`; health check uses `/api/health`.
- Required env vars expected by spec:
  - `VITE_API_URL=http://localhost:3001`
  - `VITE_APP_NAME=My Store POS`

## Implementation sequencing (high-level)
When bootstrapping from the current state, follow this order:
1. Foundation: Vite + TS app shell, Tailwind/shadcn setup, router/providers, API/auth infrastructure.
2. Core operations: categories/products/inventory and POS checkout flow.
3. Management modules: reports, users, shifts.
4. Production polish: responsiveness, accessibility, error/loading-state completeness, and test expansion.

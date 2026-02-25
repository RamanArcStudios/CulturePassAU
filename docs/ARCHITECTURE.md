# CulturePass Architecture (Production-Ready Baseline)

## 1) Runtime Targets
CulturePass runs from a single Expo + React Native codebase:

- iOS (App Store build via EAS)
- Android (Play Store build via EAS)
- Web (Expo web export + static hosting)

## 2) Application Layers

- **UI Layer**: `app/` routes + reusable `components/`
- **State Layer**:
  - Server state: TanStack Query (`lib/query-client.ts`)
  - Client/session state: context providers in `contexts/` and `lib/auth.tsx`
- **Data Layer**:
  - API calls through `expo/fetch`
  - Shared type contracts in `shared/schema.ts`

## 3) Key Refactors Added

### Unified design system
Design tokens are organized into focused modules:
- `constants/colors.ts` — light/dark themes, glassmorphism presets, gradient tuples
- `constants/typography.ts` — Poppins font family with iOS-style type scale
- `constants/spacing.ts` — 4-point spacing grid, border radii, layout constants
- `constants/animations.ts` — duration tokens, spring configs, reduced-motion flag

### Typed shared contract
A new `shared/schema.ts` centralizes core app domain interfaces (`User`, `Profile`, `Ticket`, etc.) so route screens use one source of truth for data models.

### Cross-platform auth persistence
`lib/auth.tsx` now uses:
- `expo-secure-store` for native secure storage (iOS/Android)
- AsyncStorage fallback on web for browser compatibility

This removes platform fragility and keeps login/session behavior consistent.

### Safer API URL resolution
`lib/query-client.ts` now resolves API base URLs in priority order:
1. `EXPO_PUBLIC_API_URL`
2. `EXPO_PUBLIC_DOMAIN`
3. web origin (browser)
4. `http://localhost:5000/` fallback

This supports local development, Replit-like domains, and cloud hosting setups.

### React Query tuning for scalability
Default query behavior was updated to production-friendly caching:
- `staleTime: 60s`
- `gcTime: 5m`
- Smart retry: skips retry for 4xx client errors, retries up to twice for server/network errors

This reduces over-fetching and improves perceived performance without stale data persisting forever.

### Config-driven rollout + feature flags
- Backend rollout configuration lives in `server/services/rollout.ts`.
- Runtime phase is controlled by `ROLLOUT_PHASE` (`internal`, `pilot`, `half`, `full`).
- API exposure endpoint: `GET /api/rollout/config?userId=<id>`.
- Client helper: `lib/feature-flags.ts` (`fetchFeatureFlags`).

### QA automation baseline
- Unit checks: `scripts/tests/unit-services-middleware.ts`.
- Integration checks: `scripts/tests/integration-api-routes.ts`.
- E2E smoke: `scripts/tests/e2e-critical-smoke.ts`.
- Aggregated command: `npm run qa:all`.

## 4) Recommended Next Steps (Roadmap)

1. Add server/API folder back into repository or isolate API as a dedicated service.
2. Introduce feature folders for large screens to reduce route file size and improve testability.
3. Add E2E coverage (Detox for native + Playwright for web).
4. Replace ad-hoc `any` in route files with strict shared models and DTO validators (zod).
5. Add CI pipelines for lint, typecheck, and preview builds.

## 5) Firebase Studio Fit
Firebase Studio works well as a backend + hosting option:
- Firebase Hosting for web build (`dist`)
- Cloud Functions / Cloud Run for APIs
- Firestore or Postgres (via Cloud SQL) for data
- Auth, Analytics, Crashlytics for production operations

See `docs/DEPLOYMENT.md` for migration guidance.

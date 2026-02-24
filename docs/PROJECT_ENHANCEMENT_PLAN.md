# CulturePass Project Enhancement Plan

## Objective
This plan converts the requested improvements into an implementation roadmap with delivery phases, ownership focus, QA gates, and publishing readiness criteria.

## Phase 1 — Interconnectivity, Navigation, and Governance (Immediate)

### 1.1 Overall functionality and interconnectivity
- Build a route health gate in CI using:
  - `npm run typecheck`
  - `npm run lint`
  - `npx expo export --platform web`
- Add cross-feature smoke tests for:
  - Onboarding → Home/Tabs
  - Search → Detail pages
  - Save/Join actions reflected in Profile and Saved pages
  - Ticket/perk visibility from profile and dedicated tabs
- Add a route ownership matrix in docs for all critical paths.

### 1.2 Responsive and dynamic navigation
- Consolidate deep-link mapping rules (`+native-intent`) and add tests for legacy route redirections.
- Add explicit fallback routes and not-found handling standards.
- Ensure every settings/help/legal destination is internally reachable from app navigation.

### 1.3 Rules and governance
- Maintain an in-app Community Guidelines page (`/legal/guidelines`) for accessibility.
- Add reporting/abuse entry points in key screens (profile, community, content detail).
- Define moderation automation backlog:
  - profanity filtering
  - spam/rate-limit checks
  - suspicious link validation

## Phase 2 — Search Optimisation and Discovery

### 2.1 Search relevance and performance
- Introduce weighted ranking features:
  - title exact match boost
  - local/city match boost
  - recency and popularity signal weights
- Move heavy filtering/ranking to backend endpoint where possible.

### 2.2 Predictive search and filtering
- Add query suggestions from recent searches + popular entities.
- Introduce multi-select filter chips (type, city, date range, category).
- Persist last-used filters per user locally for fast resume.

### 2.3 Indexing and caching
- Cache search responses by query + filters with stale-while-revalidate strategy.
- Add DB indexes for primary search fields (title, category, city, tags) in backend schema phase.

## Phase 3 — Content Delivery and Performance

### 3.1 Content delivery
- Add CDN-backed image delivery strategy (responsive variants + cache headers).
- Add prefetching for likely-next screens (detail pages from list taps).

### 3.2 App performance
- Track Core Web Vitals for web and startup/render times for mobile.
- Add compression and format optimisation for media uploads (WebP/AVIF where supported).

### 3.3 Monitoring
- Add error/performance telemetry dashboard and weekly regression review.

## Phase 4 — Feature Upgrades

### 4.1 Photo upload and editing
- Introduce upload flow with:
  - drag-and-drop on web
  - camera/gallery on native
- Add client-side tools:
  - crop
  - rotate
  - resize
- Enforce upload constraints (size, dimensions, MIME type) and compression pipeline.

### 4.2 Profile tab and profile page improvements
- Reorganize profile sections into:
  - account
  - activity
  - preferences
  - support
- Add customisable profile fields and visibility controls.
- Add quick actions for tickets, saved content, contacts, and membership status.

### 4.3 Ticketing system enhancements
- Standardise ticket lifecycle states: `open`, `in_progress`, `resolved`, `closed`.
- Add status and priority badges in list/detail views.
- Add event history log and user-facing notifications for state changes.

## Phase 5 — Implementation, Rollout, and Validation

### 5.1 Staged rollout
- Stage A: Internal QA and dogfooding
- Stage B: 10% pilot cohort
- Stage C: 50% progressive rollout
- Stage D: 100% release

### 5.2 QA matrix
- Functional: route navigation, feature interop, save/join/profile consistency
- Reliability: offline/error handling, retry behaviour
- Security: auth/session integrity, private route controls
- Performance: search latency, page transition time, image load time

### 5.3 Success metrics
- Search response time (p95)
- Navigation success rate
- Crash-free sessions
- Ticket resolution time
- User satisfaction/NPS trends

## Publishing Readiness Alignment
This plan should be executed alongside `docs/PUBLISHING_READINESS.md` so each release enforces consistent quality gates before app store/web publishing.

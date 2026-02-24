# CulturePass Release Notes

## 2026-02-24 — Production-ready cross-platform enhancements

### Added
- Design system constants:
  - `constants/spacing.ts` — 4-point spacing grid, border radii, layout tokens
  - `constants/animations.ts` — Duration, spring config, and reduced-motion utilities
- Futuristic UI tokens in `constants/colors.ts`:
  - Glassmorphism presets (`glass.light`, `glass.dark`, `glass.overlay`)
  - Gradient tuples (`gradients.primary`, `gradients.accent`, `gradients.gold`, etc.)
- Enhanced CI/CD pipeline (`.github/workflows/quality-gate.yml`):
  - Added unit test and package validation steps
  - Added web export build verification job
  - Upgraded Node.js to v22
- Firebase Hosting security headers and cache controls (`firebase.json`)
- Android submit configuration in `eas.json` (service account key + track)
- Smart retry logic in query client (skips retry on 4xx client errors)

### Updated
- `app.json`: Added iOS `usesNonExemptEncryption: false`, Android permissions, web `bundler: metro`
- `eas.json`: Added environment variables per build profile, Android submit config
- `README.md`: Comprehensive production-ready documentation with architecture diagram, feature list, design system table, CI/CD section, and full documentation index
- `docs/DEPLOYMENT.md`: Complete cross-platform deployment guide with prerequisites table, detailed checklists for iOS/Android/Web, CI/CD pipeline docs, and staged rollout reference
- `docs/ARCHITECTURE.md`: Added unified design system section

## 2026-02-24 — Phase 7 QA/Rollout hardening

### Added
- Automated QA scripts:
  - `npm run test:unit` (services + middleware checks)
  - `npm run test:integration` (API route integration smoke)
  - `npm run test:e2e:smoke` (critical end-to-end backend flow smoke)
  - `npm run qa:all` (runs all above)
- Rollout configuration service:
  - `server/services/rollout.ts`
  - `GET /api/rollout/config?userId=<id>`
- Config-driven feature flags for staged release phases:
  - `internal` (10%)
  - `pilot` (25%)
  - `half` (50%)
  - `full` (100%)

### Updated
- Ticketing lifecycle and scan robustness from Phase 6 are now covered by integration/e2e smoke tests.
- Architecture, publishing readiness, deployment, and API docs updated with rollout + QA expectations.

### Environment variables
- `ROLLOUT_PHASE=internal|pilot|half|full` (default: `internal`)

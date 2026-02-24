# CulturePass Release Notes

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

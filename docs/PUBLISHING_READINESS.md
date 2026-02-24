# CulturePass Publishing Readiness Guide

## Goal

This document is the release gate for publishing CulturePass to iOS, Android, and Web. It defines what must pass before release and how to verify all app pages are healthy.

## 1) Page Health Verification (All Routes)

CulturePass route files live under `app/` and are registered by Expo Router.

### Required checks

1. **Static route compile check**
   - Run: `npx expo export --platform web`
   - Why: forces bundling of the router tree and catches screen-level import/runtime compile errors.

2. **Code health checks**
   - Run: `npm run lint`
   - Run: `npm run typecheck`
   - Run: `npm run qa:all`

3. **Route file sanity check**
   - Confirm all route files in `app/` are valid and resolvable by Expo Router conventions.
   - Note: `app/+native-intent.tsx` intentionally exports `redirectSystemPath` and does not use a default component export.

## 2) Release Gate (Must-Pass)

Before publishing, ensure:

- [ ] `npm run typecheck` passes
- [ ] `npm run qa:all` passes
- [ ] `npx expo export --platform web` succeeds
- [ ] Lint has no new warnings/errors introduced by release changes
- [ ] App versioning updated in `app.json` (`expo.version`, `ios.buildNumber`, `android.versionCode`)
- [ ] App metadata and store content reviewed (name, description, icons, splash)
- [ ] API environment variables are set for target environment (`EXPO_PUBLIC_API_URL` preferred)
- [ ] robots/sitemap endpoints are correct for production domain

## 3) iOS Publish Checklist

1. Set iOS metadata in `app.json`:
   - `ios.bundleIdentifier`
   - `ios.buildNumber`
2. Fill submit fields in `eas.json`:
   - `appleId`, `ascAppId`, `appleTeamId`
3. Build and submit:
   - `eas build --profile production --platform ios`
   - `eas submit --profile production --platform ios`

## 4) Android Publish Checklist

1. Confirm Android metadata in `app.json`:
   - `android.package`
   - `android.versionCode`
2. Build and submit:
   - `eas build --profile production --platform android`
   - `eas submit --platform android`

## 5) Web Publish Checklist

1. Build web output:
   - `npm run expo:static:build` (or `npx expo export --platform web`)
2. Deploy hosting:
   - `firebase deploy --only hosting`
3. Validate:
   - SPA route rewrites active
   - `robots.txt` reachable at `/robots.txt`
   - `sitemap.xml` reachable at `/sitemap.xml`

## 6) Immediate Improvements Before Public Release

- Reduce existing lint warnings to improve maintainability and catch regressions earlier.
- Add CI pipeline gates for lint + typecheck + web export on every PR.
- Add smoke-test script for key user journeys (onboarding, browse, event detail, saved flow, profile).

## 7) Release sign-off gates (staged rollout)

- [ ] **Internal (10%)**: `ROLLOUT_PHASE=internal` validated by QA/dev team.
- [ ] **Pilot (25%)**: `ROLLOUT_PHASE=pilot` validated by pilot group and telemetry reviewed.
- [ ] **Half (50%)**: `ROLLOUT_PHASE=half` validated for 24h with no P1 incidents.
- [ ] **Full (100%)**: `ROLLOUT_PHASE=full` after sign-off from product + engineering.

Rollout config endpoint for verification:
- `GET /api/rollout/config?userId=<id>`

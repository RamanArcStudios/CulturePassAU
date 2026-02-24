# Build, Test, and Deployment Guide

## Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | 22+ | Runtime |
| npm | 10+ | Package manager |
| EAS CLI | 16+ | Native builds (`npm install -g eas-cli`) |
| Firebase CLI | latest | Web hosting (`npm install -g firebase-tools`) |

---

## Local Development

```bash
# Install dependencies
npm install

# Run quality checks
npm run lint
npm run typecheck
npm run qa:all

# Start the Expo dev server (frontend)
npm run start

# Start the Express API server (backend)
npm run server:dev
```

### Environment variables

```bash
# Point the frontend at your local API
export EXPO_PUBLIC_API_URL=http://localhost:5000

# Control which features are available
export ROLLOUT_PHASE=internal  # internal | pilot | half | full
```

---

## iOS Deployment (App Store)

### 1. Configure metadata

In `app.json` set:
- `expo.version` (semantic version, e.g. `1.0.0`)
- `ios.bundleIdentifier` (e.g. `com.culturepass`)
- `ios.buildNumber` (increment each submission)

In `eas.json` → `submit.production.ios` fill:
- `appleId` — your Apple ID email
- `ascAppId` — App Store Connect app ID (numeric)
- `appleTeamId` — Apple Developer Team ID

### 2. Build

```bash
# Production build for App Store
eas build --profile production --platform ios
```

### 3. Submit

```bash
eas submit --profile production --platform ios
```

### 4. Review checklist
- [ ] App icons (1024×1024) and splash screen configured
- [ ] Privacy policy URL set in App Store Connect
- [ ] `NSLocationWhenInUseUsageDescription` and other Info.plist entries match app behaviour
- [ ] `usesNonExemptEncryption: false` set (no custom crypto)
- [ ] Screenshots for all required device sizes uploaded

---

## Android Deployment (Google Play)

### 1. Configure metadata

In `app.json` set:
- `android.package` (e.g. `com.culturepass`)
- `android.versionCode` (increment each release)

In `eas.json` → `submit.production.android` set:
- `serviceAccountKeyPath` — path to Google Play service account JSON key (gitignored; do not commit this file)
- `track` — release track (`internal`, `alpha`, `beta`, or `production`)

### 2. Build

```bash
# Production build for Play Store
eas build --profile production --platform android
```

### 3. Submit

```bash
eas submit --platform android
```

### 4. Review checklist
- [ ] Adaptive icon (foreground, background, monochrome) configured
- [ ] Privacy policy URL set in Play Console
- [ ] Content rating questionnaire completed
- [ ] Target API level meets current Play Store requirements

---

## Web Deployment (Firebase Hosting)

### 1. Build the static web bundle

```bash
npm run expo:static:build
# or directly:
npx expo export --platform web
```

### 2. Deploy to Firebase Hosting

```bash
firebase deploy --only hosting
```

### 3. Verify

- [ ] SPA route rewrites work (deep links resolve to `index.html`)
- [ ] `robots.txt` reachable at `/robots.txt`
- [ ] Static assets served with cache headers (configured in `firebase.json`)
- [ ] Security headers present (`X-Content-Type-Options`, `X-Frame-Options`)

---

## Firebase Studio Migration Strategy

### Recommended target architecture
- **Frontend**: Expo / React Native (unchanged)
- **Web Hosting**: Firebase Hosting
- **API**: Cloud Run (Express server) or Cloud Functions (smaller endpoints)
- **Data**: Cloud SQL (PostgreSQL) + Drizzle ORM for relational features
- **Auth**: Firebase Auth (custom token bridge if migrating existing sessions)
- **Observability**: Crashlytics + Analytics + Performance Monitoring

### Migration phases

1. **Phase 1 — Hosting + environment**
   - Deploy web bundle to Firebase Hosting
   - Inject `EXPO_PUBLIC_API_URL` from Firebase environment config

2. **Phase 2 — Auth**
   - Add Firebase Auth and map user IDs to the existing profile schema

3. **Phase 3 — Data APIs**
   - Move API endpoints to Cloud Functions / Cloud Run incrementally

4. **Phase 4 — Production hardening**
   - Add monitoring alerts, CI/CD, staged releases, rollback plan

---

## CI/CD Pipeline

The repository includes a GitHub Actions workflow (`.github/workflows/quality-gate.yml`) that runs automatically on every push and pull request:

| Job | What it checks |
|-----|---------------|
| `quality-gate` | TypeScript type check, ESLint, unit tests, package validation |
| `web-build` | Exports the web bundle to verify it compiles cleanly |

### Adding EAS builds to CI (optional)

```yaml
# Add to quality-gate.yml for automated native builds:
eas-build:
  name: EAS Preview Build
  runs-on: ubuntu-latest
  needs: quality-gate
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with: { node-version: '22', cache: 'npm' }
    - run: npm ci --legacy-peer-deps
    - uses: expo/expo-github-action@v8
      with: { eas-version: latest, token: ${{ secrets.EXPO_TOKEN }} }
    - run: eas build --profile preview --platform all --non-interactive
```

---

## Staged Rollout Control

Use the `ROLLOUT_PHASE` environment variable in each deployment environment:

| Phase | Audience | Variable |
|-------|----------|----------|
| Internal | ~10% — QA/dev team | `ROLLOUT_PHASE=internal` |
| Pilot | ~25% — pilot group | `ROLLOUT_PHASE=pilot` |
| Half | ~50% — broader audience | `ROLLOUT_PHASE=half` |
| Full | 100% — general availability | `ROLLOUT_PHASE=full` |

Validate phase + user flag resolution:
```bash
curl "http://localhost:5000/api/rollout/config?userId=u1"
```

# Build, Test, and Deployment Guide

## Local development

```bash
npm install
npm run lint
npm run typecheck
npm run expo:dev
```

If you run a backend locally, set:

```bash
export EXPO_PUBLIC_API_URL=http://localhost:5000
```

---

## iOS deployment (App Store)

1. Configure app metadata in `app.json` (bundle ID, version/build number).
2. Configure EAS and Apple credentials.
3. Build and submit:

```bash
eas build --profile production --platform ios
eas submit --profile production --platform ios
```

### Required `eas.json` submit fields
Populate before submission:
- `appleId`
- `ascAppId`
- `appleTeamId`

---

## Android deployment (Google Play)

1. Ensure `android.package` and `versionCode` are set in `app.json`.
2. Build Android artifact:

```bash
eas build --profile production --platform android
```

3. Submit to Play Console:

```bash
eas submit --platform android
```

---

## Web deployment

Build export and deploy to static host:

```bash
npm run expo:static:build
firebase deploy --only hosting
```

`firebase.json` is already configured to serve `dist/` with SPA rewrites.

---

## Firebase Studio migration strategy

### Recommended target architecture
- **Frontend**: keep Expo/React Native codebase
- **Web Hosting**: Firebase Hosting
- **API**:
  - Option A: Cloud Functions (smaller APIs)
  - Option B: Cloud Run (Express service)
- **Data**:
  - Firestore for document-driven features
  - Cloud SQL + Drizzle for relational features
- **Auth**: Firebase Auth (custom token bridge if needed)
- **Observability**: Crashlytics + Analytics + Performance Monitoring

### Migration phases
1. **Phase 1: Hosting + envs**
   - Deploy web bundle to Firebase Hosting
   - Inject `EXPO_PUBLIC_API_URL` from Firebase env config
2. **Phase 2: Auth**
   - Add Firebase Auth and map user IDs to existing profile schema
3. **Phase 3: Data APIs**
   - Move API endpoints to Cloud Functions/Run incrementally
4. **Phase 4: Production hardening**
   - Add monitoring alerts, CI/CD, staged releases, rollback plan

### CI/CD suggestion
Use GitHub Actions to run lint/typecheck/build on every PR, then auto-deploy preview channels for web.

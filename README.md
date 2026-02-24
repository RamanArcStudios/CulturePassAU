# CulturePass

A cross-platform Expo + React Native app connecting cultural diaspora communities across Australia, New Zealand, UAE, UK, and Canada.

## Platform coverage

- iOS (EAS build + App Store)
- Android (EAS build + Google Play)
- Web (Expo static build + Firebase Hosting)

## Current architecture

- `app/`: Expo Router screens
- `components/`: reusable UI primitives/cards
- `contexts/`: client state providers
- `lib/auth.tsx`: auth/session persistence (secure native + web fallback)
- `lib/query-client.ts`: API and TanStack Query configuration
- `shared/schema.ts`: shared app domain types
- `functions/src/`: backend cloud function handlers

Detailed architecture notes: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)

Full product documentation: [`docs/APP_DOCUMENTATION.md`](docs/APP_DOCUMENTATION.md)

## Quick start

```bash
npm install
npm run lint
npm run typecheck
npm run expo:dev
```

Optional API override:

```bash
export EXPO_PUBLIC_API_URL=http://localhost:5000
```

## Build and deploy

See [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) for:

- iOS App Store build + submission
- Google Play build + submission
- Web deployment (Firebase Hosting)
- Firebase Studio migration plan

## Design direction

The app is set up for a modern “futuristic” direction via:

- unified color tokens in `constants/colors.ts`
- cross-platform routing and UI foundations in Expo Router
- query caching and reduced over-fetching through TanStack Query defaults

## Notes for Replit → production migration

Set environment variables in your deployment platform:

- `EXPO_PUBLIC_API_URL` (recommended)
- `EXPO_PUBLIC_DOMAIN` (legacy fallback)

This lets the same codebase run cleanly across local dev, Replit, Firebase, and production infra.

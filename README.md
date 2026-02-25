# CulturePass

A cross-platform Expo + React Native lifestyle app connecting cultural diaspora communities across Australia, New Zealand, UAE, UK, and Canada. Discover events, join communities, find local businesses, and celebrate diversity.

## Platform Coverage

| Platform | Technology | Distribution |
|----------|-----------|-------------|
| iOS | React Native (Expo) | App Store via EAS Build |
| Android | React Native (Expo) | Google Play via EAS Build |
| Web | Expo Web (Metro) | Firebase Hosting |

## Architecture

```
Frontend (Expo + React Native)
├── app/              # File-based routing (Expo Router)
├── components/       # Reusable UI components
├── constants/        # Design tokens (colors, typography, spacing, animations)
├── contexts/         # Client state (auth, onboarding, saved, contacts)
├── hooks/            # Custom React hooks
├── lib/              # Auth, API client, feature flags, utilities
└── shared/           # Shared TypeScript types (Drizzle schema)

Backend (Express + Node.js)
├── server/           # REST API with Express 5
├── server/services/  # Search, caching, rollout configuration
└── server/middleware/ # Content moderation, validation

Cloud (Firebase)
├── functions/        # Cloud Functions (events, payments, tickets, webhooks)
└── firebase.json     # Hosting + security headers
```

For a full architecture breakdown see [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Quality checks
npm run lint          # ESLint
npm run typecheck     # TypeScript
npm run qa:all        # Unit + integration + E2E smoke tests

# 3. Start development
npm run start         # Expo dev server (iOS / Android / Web)
npm run server:dev    # Express API server
```

### Environment Variables

```bash
# Point frontend at your API (recommended)
export EXPO_PUBLIC_API_URL=http://localhost:5000

# Control feature rollout phase
export ROLLOUT_PHASE=internal   # internal | pilot | half | full

# Database (backend only)
export DATABASE_URL=postgresql://...
```

## Build and deploy

See [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) for full deployment instructions.

Publishing readiness checklist: [`docs/PUBLISHING_READINESS.md`](docs/PUBLISHING_READINESS.md).

### iOS App Store
```bash
eas build --profile production --platform ios
eas submit --profile production --platform ios
```

### Google Play Store
```bash
eas build --profile production --platform android
eas submit --platform android
```

### Web (Firebase Hosting)
```bash
npm run expo:static:build
firebase deploy --only hosting
```

## Key Features

- **Event Discovery** — Browse, search, and filter cultural events by city, category, and date
- **Community Hub** — Join and manage diaspora communities
- **Ticketing** — Purchase tickets, QR code scanning, Apple/Google Wallet integration
- **Business Directory** — Find cultural restaurants, venues, and local businesses
- **Membership Tiers** — Free, Plus, Elite, Pro, Premium, VIP with cashback perks
- **Loyalty Perks** — Earn and redeem rewards across the platform
- **First Nations Spotlight** — Celebrating Indigenous Australian culture
- **Multi-Region** — Australia, New Zealand, UAE, UK, and Canada

## Design System

The app uses a unified design token system for a consistent, futuristic look and feel:

| Module | File | Purpose |
|--------|------|---------|
| Colors | `constants/colors.ts` | Light/dark themes, glassmorphism, gradient presets |
| Typography | `constants/typography.ts` | Poppins font family, iOS-style type scale |
| Spacing | `constants/spacing.ts` | 4-point grid, border radii, layout constants |
| Animations | `constants/animations.ts` | Duration, spring configs, motion preferences |

## CI/CD

GitHub Actions runs on every push and PR:
- **TypeScript type check** — catches type errors
- **ESLint** — enforces code style
- **Unit tests** — validates services and middleware
- **Web export** — verifies the web bundle compiles

See `.github/workflows/quality-gate.yml` for the full pipeline.

## Documentation

| Document | Description |
|----------|-------------|
| [`ARCHITECTURE.md`](docs/ARCHITECTURE.md) | System design and layer overview |
| [`APP_DOCUMENTATION.md`](docs/APP_DOCUMENTATION.md) | Full feature guide |
| [`DEPLOYMENT.md`](docs/DEPLOYMENT.md) | Build, test, and deploy instructions |
| [`PUBLISHING_READINESS.md`](docs/PUBLISHING_READINESS.md) | App Store / Play Store checklist |
| [`API_ENDPOINTS.md`](docs/API_ENDPOINTS.md) | REST API reference |
| [`ROUTE_API_MATRIX.md`](docs/ROUTE_API_MATRIX.md) | Route to API mapping |
| [`PROJECT_ENHANCEMENT_PLAN.md`](docs/PROJECT_ENHANCEMENT_PLAN.md) | Roadmap |
| [`RELEASE_NOTES.md`](docs/RELEASE_NOTES.md) | Version history |

## Tech Stack

- **Frontend**: React 19, React Native 0.81, Expo 54, Expo Router 6
- **State**: TanStack Query 5, React Context
- **UI**: Reanimated 4, Expo Linear Gradient, Expo Blur / Glass Effect
- **Backend**: Express 5, Node.js 22, TypeScript 5.9
- **Database**: PostgreSQL 16, Drizzle ORM
- **Payments**: Stripe
- **Hosting**: Firebase Hosting (web), Cloud Run (API), EAS (native builds)

## Notes for Replit to production migration

Set environment variables in your deployment platform:

- `EXPO_PUBLIC_API_URL` (recommended)
- `EXPO_PUBLIC_DOMAIN` (legacy fallback)

This lets the same codebase run cleanly across local dev, Replit, Firebase, and production infra.

## License

Private — all rights reserved.

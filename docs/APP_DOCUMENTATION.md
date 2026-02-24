# CulturePass — Full Application Documentation

## 1. Product Overview

CulturePass is a cross-platform Expo + React Native application focused on cultural diaspora communities. The app is designed to help users discover events, find local businesses and venues, save experiences, manage tickets/perks, and build community connections across regions including Australia, New Zealand, UAE, UK, and Canada.

## 2. Platform Targets

The app is maintained as a single codebase and currently targets:

- iOS (EAS build + App Store workflow)
- Android (EAS build + Google Play workflow)
- Web (Expo static export + Firebase Hosting)

## 3. Core Tech Stack

### Frontend
- Expo SDK 54 + React Native 0.81 + React 19
- Expo Router for route-based navigation
- TanStack Query for server-state caching and networking
- AsyncStorage + SecureStore for persistence

### Build/Tooling
- TypeScript
- ESLint (Expo config)
- EAS build/submit configuration
- Drizzle kit configuration for PostgreSQL migrations

## 4. Repository Structure (High-Level)

- `app/` — route screens (onboarding, tabs, detail pages, utility pages)
- `components/` — reusable UI pieces and boundaries
- `contexts/` — persisted client-side state (onboarding, saved items, contacts)
- `lib/` — shared runtime utilities (auth, API/query setup)
- `shared/` — shared domain interfaces used across the app
- `docs/` — architecture and deployment docs
- `functions/` — placeholder files for serverless handlers

## 5. Navigation & Screen Surface

The root layout registers onboarding, tab navigation, and many feature/detail screens through Expo Router stack configuration. Key areas include:

- Onboarding/auth (`(onboarding)/*`)
- Main tabs (`(tabs)/*`) for feed, explore, communities, calendar, directory, perks, profile
- Event/community/business/artist/venue/user detail routes
- Tickets, payments, contacts, scanner, search, map, settings, legal pages

## 6. Application Runtime Architecture

CulturePass uses a layered setup:

1. **UI layer** via Expo Router routes and reusable components.
2. **State layer** with TanStack Query for network state and React Context for local persisted state.
3. **Data contracts** via shared interfaces in `shared/schema.ts`.

## 7. Auth & Session Handling

`lib/auth.tsx` provides session context with:

- In-memory auth state for runtime
- Native secure persistence using `expo-secure-store`
- Web-safe fallback persistence via AsyncStorage
- Session restoration on app launch
- `login` and `logout` helpers with storage synchronization

## 8. API Access & Query Behavior

`lib/query-client.ts` centralizes API URL resolution and request behavior:

- URL priority: `EXPO_PUBLIC_API_URL` → `EXPO_PUBLIC_DOMAIN` → web origin → localhost fallback
- Shared `apiRequest` helper with JSON body support and error normalization
- React Query defaults tuned for practical caching (`staleTime`, `gcTime`, retry)

## 9. Persisted Client Contexts

### Onboarding context
Stores onboarding completion, location, communities, and interests in AsyncStorage.

### Saved context
Stores saved event IDs and joined community IDs in AsyncStorage.

### Contacts context
Stores and manages saved contact entries (CulturePass IDs and metadata) in AsyncStorage.

## 10. Domain Models

`shared/schema.ts` currently defines app-level interfaces such as:

- `User`
- `Profile` / `Community`
- `Membership` / `Wallet`
- `Review`
- `Ticket`

These are TypeScript interface contracts (not SQL schema definitions) and function as shared typing primitives across screens and data calls.

## 11. Styling & Visual System

The app defines a consistent theme system in `constants/colors.ts` with:

- Light and dark color palettes
- Shared semantic tokens (primary, text, surface, status colors, etc.)
- Centralized elevation/shadow presets

## 12. Build, Scripts, and Operational Commands

Primary commands:

- `npm run expo:dev` for local development
- `npm run lint` and `npm run typecheck` for quality checks
- `npm run expo:static:build` for web export flow
- `npm run server:dev` / `server:build` / `server:prod` scripts are present in package metadata

## 13. Deployment & Distribution

### Mobile
- EAS build profiles for `development`, `preview`, and `production`
- iOS submit placeholders (`appleId`, `ascAppId`, `appleTeamId`) to complete before release

### Web
- Firebase Hosting serves `dist/` and rewrites all routes to `index.html` for SPA-style routing

## 14. SEO & Crawler Configuration

A root `robots.txt` file is included to:

- Allow public indexing
- Disallow known sensitive/private routes
- Explicitly allow major search and AI crawlers
- Declare sitemap location

## 15. Data & Backend Status (Current State)

- Drizzle config is present and expects `DATABASE_URL`, with migrations output to `./migrations` and schema pointer `./shared/schema.ts`.
- Cloud function source files exist as placeholders and are currently empty.

This indicates frontend and platform foundations are in place while backend implementation remains incomplete in this repository snapshot.

## 16. Recommended Next Documentation/Engineering Steps

1. Add endpoint-level API documentation once backend handlers are implemented.
2. Split domain types (`shared/schema.ts`) into feature-specific modules as the model grows.
3. Add architecture diagrams (navigation map + data flow + deployment topology).
4. Add release checklist templates (versioning, store metadata, smoke tests).
5. Add CI workflows for lint/typecheck/static web export on PRs.

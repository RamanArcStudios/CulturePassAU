# CulturePass - replit.md

## Overview

CulturePass is a cross-platform cultural community and events platform built with Expo (React Native) for the frontend and Express.js for the backend. It connects users with cultural communities, events, and local businesses across multiple countries (Australia, New Zealand, UAE, UK, Canada). The app features an onboarding flow, event discovery, community engagement, business directory, user profiles, perks & benefits system, sponsorship engine, notifications, and payment/wallet integration.

The backend uses PostgreSQL via Drizzle ORM with a comprehensive schema covering users, profiles (9 entity types), follows, likes, reviews, payments, sponsors, perks, memberships, and notifications. Frontend uses mock data for events/movies/restaurants/activities/shopping, while profiles, sponsors, perks, payments, and notifications are backed by the database.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

- **Feb 2026**: Added sponsors, perks, memberships, notifications tables and full CRUD APIs (30+ endpoints)
- **Feb 2026**: Quick Access section on home redesigned from 3-column grid to horizontal scrollable pills with smaller icons (34px)
- **Feb 2026**: Built Perks & Benefits page (`app/perks/index.tsx`) with category filtering and redeem functionality
- **Feb 2026**: Built Notifications page (`app/notifications/index.tsx`) with read/unread state and delete
- **Feb 2026**: Added 3 artist profiles, 4 sponsors, 7 perks, sample notifications as seed data
- **Feb 2026**: Home screen notification bell now links to `/notifications`, perks banner links to `/perks`
- **Feb 2026**: Profile tab now has Perks & Notifications links in Payment & Billing section
- **Feb 2026**: Added tickets table and full CRUD API (5 endpoints) with auto-generated ticket codes
- **Feb 2026**: Built Edit Profile screen (`app/profile/edit.tsx`) with personal info, location, social links editing
- **Feb 2026**: Built My Tickets screen (`app/tickets/index.tsx`) with upcoming/past tickets, ticket codes, cancel functionality
- **Feb 2026**: Built Help & Support screen (`app/help/index.tsx`) with FAQ accordion, contact options, legal links
- **Feb 2026**: Redesigned Profile tab with membership tier badge, ticket count, wallet balance, notifications badge, organized sections (Tickets & Wallet, Payment & Billing, Notifications, Help & Support)
- **Feb 2026**: Added tickets section to Wallet page showing active tickets
- **Feb 2026**: Seeded 4 sample tickets, Plus membership, and wallet balance for demo user

## System Architecture

### Frontend (Expo / React Native)

- **Framework**: Expo SDK 54 with React Native 0.81, targeting iOS, Android, and Web
- **Routing**: expo-router v6 with file-based routing and typed routes enabled
- **Navigation Structure**:
  - `(onboarding)/` - 4-step onboarding flow (welcome → location → communities → interests)
  - `(tabs)/` - Main tab navigation with 5 tabs: Home, Explore, Communities, Directory, Profile
  - Detail screens: `event/[id]`, `community/[id]`, `business/[id]`, `profile/[id]` as stack screens
  - Super-app modules: `movies/`, `restaurants/`, `activities/`, `shopping/`
  - Payment screens: `payment/methods`, `payment/transactions`, `payment/wallet`
  - New screens: `perks/index`, `notifications/index`, `profile/edit`, `tickets/index`, `help/index`
- **State Management**:
  - React Context for app state (`OnboardingContext`, `SavedContext`)
  - AsyncStorage for local persistence of onboarding state, saved events, and joined communities
  - TanStack React Query for server state (profiles, sponsors, perks, payments, notifications)
- **UI/Styling**: React Native StyleSheet (no UI library), custom color system in `constants/colors.ts`, Poppins font family via `@expo-google-fonts/poppins`
- **Animations**: react-native-reanimated for entry animations (FadeInDown, FadeInUp)
- **Haptics**: expo-haptics for tactile feedback on interactions
- **Platform Handling**: Platform-specific safe area insets and web fallbacks (67px top/34px bottom on web)

### Backend (Express.js)

- **Runtime**: Node.js with Express v5, TypeScript via tsx (dev) and esbuild (prod build)
- **Server Location**: `server/` directory with `index.ts` (entry), `routes.ts` (API route registration), `storage.ts` (data access layer), `db.ts` (database connection)
- **CORS**: Dynamic CORS based on Replit environment variables, plus localhost support for Expo web dev
- **API**: 30+ RESTful endpoints covering users, profiles, follows, likes, reviews, payment methods, transactions, wallet, sponsors, event-sponsors, sponsor-placements, perks, perk-redemptions, memberships, notifications, and seed data
- **Static Serving**: In production, serves a pre-built Expo web bundle from `dist/` directory; in dev, proxies to Metro bundler

### Data Layer

- **Schema**: Drizzle ORM with PostgreSQL dialect, defined in `shared/schema.ts`
- **Tables**: users, profiles, follows, likes, reviews, payment_methods, transactions, wallets, sponsors, event_sponsors, sponsor_placements, perks, perk_redemptions, memberships, notifications, tickets
- **Entity Types**: user, community, organisation, venue, business, council, government, artist, sponsor
- **Storage**: `DatabaseStorage` class in `server/storage.ts` with Drizzle-based CRUD operations
- **Mock Data**: Events, movies, restaurants, activities, shopping come from `data/mockData.ts`
- **DB Data**: Profiles, sponsors, perks, payments, notifications are in PostgreSQL
- **Drizzle Config**: Points to `DATABASE_URL` env var, uses `npm run db:push` to sync schema

### Build & Deployment

- **Dev Mode**: Two parallel processes - `expo:dev` (Metro bundler on port 8081) and `server:dev` (Express API server on port 5000)
- **Production Build**: `expo:static:build` creates a static web bundle, `server:build` bundles server with esbuild, `server:prod` serves everything
- **Replit Integration**: Uses `REPLIT_DEV_DOMAIN`, `REPLIT_DOMAINS`, and proxy URL environment variables

### Key Design Patterns

- **Shared Types**: `shared/schema.ts` is shared between frontend and backend for type consistency
- **Path Aliases**: `@/*` maps to project root, `@shared/*` maps to `shared/` directory
- **Error Handling**: Custom `ErrorBoundary` component wraps the entire app with a fallback UI
- **Onboarding Gate**: The onboarding layout redirects to tabs if onboarding is complete
- **Demo User**: `useDemoUserId()` hook fetches first user from `/api/users` for payment/perk/notification screens
- **Entity Type Styling**: Each type has unique color/icon (community=coral/people, organisation=teal/business, venue=purple/location, business=golden/storefront, council=blue/shield, government=navy/flag, artist=pink/musical-notes, sponsor=green/ribbon)

## External Dependencies

### Required Services
- **PostgreSQL Database**: Required by Drizzle ORM config (`DATABASE_URL` env var). Actively used for profiles, sponsors, perks, payments, notifications.

### Key npm Packages
- **expo** (~54.0.27) - Core framework
- **expo-router** (~6.0.17) - File-based routing
- **drizzle-orm** (^0.39.3) + **drizzle-kit** - Database ORM and migration tooling
- **@tanstack/react-query** (^5.83.0) - Server state management
- **express** (^5.0.1) - Backend HTTP server
- **pg** (^8.16.3) - PostgreSQL client
- **zod** + **drizzle-zod** - Schema validation

### Environment Variables
- `DATABASE_URL` - PostgreSQL connection string
- `REPLIT_DEV_DOMAIN` - Replit development domain (used for CORS and Expo proxy)
- `REPLIT_DOMAINS` - Comma-separated list of Replit domains for CORS
- `EXPO_PUBLIC_DOMAIN` - Public domain for API calls from the Expo app

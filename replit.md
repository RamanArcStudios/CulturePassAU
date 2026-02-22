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
- **Feb 2026**: Comprehensive UI/UX redesign across all screens:
  - Enhanced color system with shadow utilities (small/medium/large), primaryGlow, cardShadow
  - Tab bar: Active state pill indicators, refined icons (compass for Explore, grid for Directory), better typography
  - Home: Shadow-depth cards, decorative section dots, tactile location button, greet card treatment, improved featured event overlays
  - Communities: Refined filter pills (borderRadius 24), shadow-depth cards, separator dots in stats, improved join button
  - Explore: Compact category chips with glow on active, shadow event cards, wider image area (100px), styled action buttons
  - Directory: Shadow-depth listing cards, refined category chips, prominent View Details button with background
  - Profile: Decorative avatar glow, accent lines on section titles, shadow stat cards, glass-like tier badge, refined menu items
- **Feb 2026**: Comprehensive app-wide improvements:
  - Fixed backend schema (restored 10 missing table definitions: profiles, likes, paymentMethods, sponsors, eventSponsors, sponsorPlacements, perks, perkRedemptions, notifications, tickets)
  - Fixed wallet balance type handling (numeric/string consistency)
  - Home: Time-based greeting ("Good morning/afternoon/evening, {name}"), "Happening This Week" events section, Explore CTA banner
  - Explore: Event count badges on category chips, Relevance/Date sort toggle, enhanced empty state with quick-search pills, category-aware results summary
  - Event Detail: Live countdown timer (days/hrs/mins), "Who's Going" avatar preview, "You Might Also Like" related events, visual section dividers
  - Communities: Member avatar preview circles on cards, share button, count badges on filter pills
  - Directory: Quick contact action buttons, count badges on filter chips
  - Profile: Profile completeness indicator with progress bar, quick action chips (Share/View Public/Scan QR), upgrade membership CTA, recent activity summary card
  - Onboarding Welcome: Feature highlights (Discover Events, Join Communities, Exclusive Perks), trust indicators bar
  - Login: Simplified title, Remember me toggle
  - Signup: Password strength indicator (Weak/Medium/Strong), benefits text row
  - All 5 main tabs: Pull-to-refresh with RefreshControl
- **Feb 2026**: Profile & Database improvements:
  - Refined color scheme: warmer primary (#D4552A), deeper secondary (#1B7F6F), better shadows with brown-tinted shadow colors, added primarySoft color
  - Redesigned Profile tab: hero card with accent strip, CPID/location chips, colored completeness bar with percentage, full-width Edit Profile button, card-based quick actions with icons
  - Built View Public Profile screen (`app/profile/public.tsx`): shows user's own profile as others see it, with hero header, stats, bio, social links, CulturePass ID card, member since date
  - Built Digital ID / QR screen (`app/profile/qr.tsx`): CulturePass Digital ID card with fingerprint icon, unique visual pattern grid, CPID display, share and copy functionality
  - Profile quick actions: View Public → /profile/public, My QR ID → /profile/qr, Share (native share)
- **Feb 2026**: Navigation & Creation improvements:
  - Added Perks tab to bottom navigation (5 tabs: Discover, Calendar, Community, Perks, Profile) with gift icon
  - Perks tab screen (`app/(tabs)/perks.tsx`) with hero banner, category filters, perk cards, redeem functionality
  - Expanded Submit/Create page to support 5 entity types: Event, Organisation, Business, Artist, Perk
  - Event creation form: title, description, date, time, venue, address, price, capacity, city, country, category
  - Perk creation form: title, description, perk type selector, discount value, provider name, perk category
  - Fixed artist detail page (`app/artist/[id].tsx`) and venue detail page (`app/venue/[id].tsx`) to use API data
  - Fixed All Events page (`app/allevents.tsx`) to use mock data correctly
  - Enriched demo user data: followers (156), following (89), likes (342), phone, website, extended bio
  - Fixed user ordering: getAllUsers now orders by createdAt ASC so demo user appears first

## System Architecture

### Frontend (Expo / React Native)

- **Framework**: Expo SDK 54 with React Native 0.81, targeting iOS, Android, and Web
- **Routing**: expo-router v6 with file-based routing and typed routes enabled
- **Navigation Structure**:
  - `(onboarding)/` - 4-step onboarding flow (welcome → location → communities → interests)
  - `(tabs)/` - Main tab navigation with 5 tabs: Discover, Calendar, Community, Perks, Profile (Explore/Directory hidden)
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

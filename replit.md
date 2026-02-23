# CulturePass - replit.md

## Overview

CulturePass is a cross-platform cultural community and events platform that connects users with cultural communities, events, and local businesses. It is designed to operate across multiple countries, including Australia, New Zealand, UAE, UK, and Canada. The platform features user onboarding, event discovery, community engagement, a business directory, user profiles, a perks and benefits system, sponsorship tools, notifications, and payment/wallet integration. The project aims to become a central hub for cultural interaction and commerce.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend (Expo / React Native)

The frontend is built with Expo SDK 54 and React Native 0.81, targeting iOS, Android, and Web. It uses `expo-router` for file-based routing and features a structured navigation system including an onboarding flow, main tab navigation (Discover, Calendar, Community, Perks, Profile), and dedicated detail screens. State management is handled with React Context for app-wide state and AsyncStorage for local persistence. Server state is managed via TanStack React Query. UI and styling rely on React Native StyleSheet with a custom color system and Poppins font. Animations are implemented with `react-native-reanimated`, and `expo-haptics` provides tactile feedback.

### Backend (Express.js)

The backend is an Express.js application running on Node.js, developed with TypeScript. It provides over 30 RESTful API endpoints for managing users, profiles, interactions (follows, likes, reviews), payments, sponsorships, perks, memberships, notifications, and tickets. CORS is dynamically configured for Replit environments and local development. In production, the backend also serves the static Expo web bundle.

### Data Layer

The application uses PostgreSQL as its database, managed via Drizzle ORM. The schema, defined in `shared/schema.ts`, includes tables for users, profiles (supporting 9 entity types like community, organisation, artist), follows, likes, reviews, payment methods, transactions, wallets, sponsors, perks, memberships, notifications, and tickets. Frontend data for events, movies, restaurants, activities, and shopping is currently sourced from mock data, while profiles, sponsors, perks, payments, and notifications are backed by the PostgreSQL database.

### Build & Deployment

Development uses parallel processes for the Expo Metro bundler and the Express API server. Production involves building a static web bundle for Expo and bundling the server with esbuild. Replit-specific environment variables are utilized for integration.

### Key Design Patterns

Shared types between frontend and backend ensure type consistency. Path aliases simplify imports. The application includes a global `ErrorBoundary` for graceful error handling. An onboarding gate manages access to the main application. A `useDemoUserId()` hook facilitates testing with a sample user. Entity types are differentiated with unique colors and icons.

## Recent Changes (Feb 2026)

### Location Filtering & UI Improvements (Feb 23, 2026)
- Added country/city fields to all mock data interfaces (EventData, CommunityData, BusinessData, MovieData, RestaurantData, ActivityData, ShoppingData)
- Expanded mock data to 100+ items across 11 cities in 5 countries (AU, NZ, UAE, UK, CA)
- Created `hooks/useLocationFilter.ts` hook that reads user's selected country/city from OnboardingContext and filters data
- Applied location filtering to all screens: Home, Explore, Calendar, Movies, Restaurants, Activities, Shopping, All Events
- LocationPicker shortens long country names in trigger display (UAE, UK, NZ)
- Redesigned all filter/category buttons app-wide to pill-shaped capsules (borderRadius: 50) with inline icons, no icon wrapper boxes
- Consistent filter button styling: active = filled accent color, inactive = white surface with thin border

### Production Hardening (Feb 23, 2026)
- Standardized error handling: `server/errors.ts` with AppError class, 29 error codes, wrapHandler middleware, in-memory rate limiter
- Frontend error mapping: `lib/errors.ts` with user-friendly message mapping, extractApiError, showErrorAlert helpers
- Security: Rate limiting on purchase (5/min) and subscription (3/2min) endpoints, duplicate purchase prevention, QR scan fraud prevention
- Ticket validation: Checks for already-scanned, cancelled, expired, and unpaid tickets with specific error codes
- API response format: `{ success: true, data: ... }` or `{ success: false, error: { code, message } }`
- Database indexes: Added on tickets (userId, eventId, status) and notifications (userId) tables
- Platform-aware UI: Web layout with maxWidth: 900 centering, cursor: pointer on interactive elements, proper web insets

### Ticket Purchase Flow
- Full ticket purchase modal on event detail screen (`app/event/[id].tsx`) with Single/Family/Group buying modes
- Family Pack: 4 tickets with 10% discount, Group: 10% at 5+, 15% at 10+
- Price summary section with line items, discount breakdown, and total
- Ticket detail screen (`app/tickets/[id].tsx`) with QR code visualization, event info, share and wallet save options
- Enhanced tickets list screen (`app/tickets/index.tsx`) with tappable cards, share buttons, and "Add to Wallet" functionality
- Server-side Apple Wallet (.pkpass) and Google Wallet pass generation endpoints at `/api/tickets/:id/wallet/apple` and `/api/tickets/:id/wallet/google`

### Share Functionality
- Fixed Share buttons across 14 screens using React Native `Share.share()` API with proper error handling, haptic feedback, and cross-platform `title` + `message` params

### Web Dashboard
- Admin dashboard at `/dashboard` route (served from `server/templates/dashboard.html`)
- Login with username "admin" and password from `ADMIN_USER_PASSWORD` env secret (fallback: "admin123")
- Dashboard sections: Overview (stats, charts), Tickets management, Events, Users, Perks, Analytics
- Login endpoint: `POST /api/dashboard/login`

### Stripe Payment Integration (Feb 2026)
- Replaced wallet-based payment with Stripe Checkout for ticket purchases
- Server creates Stripe Checkout Session, frontend opens it via `expo-web-browser`
- On payment success, ticket status updated to confirmed via redirect callback
- Stripe refund support for ticket cancellations via `/api/stripe/refund`
- Stripe initialization on server startup with `stripe-replit-sync` for schema and webhook management
- `server/stripeClient.ts` handles Stripe credential fetching from Replit connectors API
- `server/webhookHandlers.ts` processes Stripe webhooks for data sync
- Tickets table extended with `stripePaymentIntentId`, `stripeRefundId`, `paymentStatus` columns
- Free tickets bypass Stripe and are created directly via `/api/tickets`

### API Endpoints Added
- `POST /api/dashboard/login` - Dashboard admin authentication
- `GET /api/tickets/:id/wallet/apple` - Apple Wallet pass data
- `GET /api/tickets/:id/wallet/google` - Google Wallet pass data
- `GET /api/stripe/publishable-key` - Get Stripe publishable key
- `POST /api/stripe/create-payment-intent` - Create Stripe Payment Intent
- `POST /api/stripe/create-checkout-session` - Create Stripe Checkout Session (used by frontend)
- `POST /api/stripe/confirm-payment` - Confirm payment status
- `POST /api/stripe/refund` - Refund and cancel ticket
- `GET /api/stripe/checkout-success` - Checkout success redirect handler
- `GET /api/stripe/checkout-cancel` - Checkout cancel redirect handler
- `POST /api/tickets/:id/scan` - QR code scan validation with fraud prevention

## External Dependencies

-   **PostgreSQL Database**: Primary database, configured via `DATABASE_URL`.
-   **Expo**: Core framework for cross-platform development.
-   **expo-router**: For declarative, file-based routing in Expo applications.
-   **drizzle-orm** and **drizzle-kit**: ORM for PostgreSQL and schema migration tools.
-   **@tanstack/react-query**: For efficient server state management.
-   **express**: Node.js web application framework for the backend API.
-   **pg**: PostgreSQL client for Node.js.
-   **zod** and **drizzle-zod**: Used for schema validation and type inference.
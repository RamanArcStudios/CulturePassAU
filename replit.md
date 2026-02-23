# CulturePass

## Overview
CulturePass is a cross-platform cultural community and events platform designed to connect users with cultural communities, events, and local businesses across Australia, New Zealand, UAE, UK, and Canada. Its main purpose is to serve as a central hub for cultural interaction and commerce, offering features like event discovery, community engagement, a business directory, user profiles, perks and benefits, sponsorship tools, notifications, and payment integration. The project aims to foster cultural understanding and provide a marketplace for cultural experiences.

## Recent Changes
- **Feb 2026**: Unified dark theme (background #0A0A0F, surface #1A1A22) across all screens by updating Colors constants to use dark as default. All screens now automatically use the dark palette.
- **Feb 2026**: Implemented functional authentication - POST /api/auth/login and POST /api/auth/register endpoints. Auth state persisted in AsyncStorage via AuthProvider. Demo user: username=demo, password=demo123.
- **Feb 2026**: Fixed hardcoded light-theme background colors in event, business, and profile detail screens for dark theme consistency.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
The frontend is built with Expo SDK 54 and React Native 0.81, supporting iOS, Android, and Web platforms. It utilizes `expo-router` for file-based navigation, including an onboarding flow, main tab navigation (Discover, Calendar, Community, Perks, Profile), and detailed screens. State management uses React Context for global state and AsyncStorage for local persistence, while TanStack React Query handles server state. UI styling leverages React Native StyleSheet with a custom color system and Poppins font. Animations are implemented with `react-native-reanimated`, and `expo-haptics` provides tactile feedback. A global `ErrorBoundary` ensures graceful error handling.

### Backend
The backend is an Express.js application developed with TypeScript on Node.js. It features a modular design with 22 domain modules (e.g., users, events, communities, wallet) organized under `server/modules/`, each containing dedicated service and routing files. These modules are centrally registered in `server/routes.ts`. The backend integrates PostGIS 3.5.3 for geospatial queries and dynamically configures CORS. In production, it also serves the static Expo web bundle. Standardized error handling includes an `AppError` class, error codes, and rate limiting.

### Data Layer
PostgreSQL, with PostGIS extension, serves as the primary database, managed by Drizzle ORM. The `shared/schema.ts` defines tables for users, profiles (supporting 9 entity types), follows, likes, reviews, payments, wallets, sponsors, perks, memberships, notifications, tickets, and location-specific data. Key seeded data includes 27 cities across 5 countries, 45 communities (diaspora, indigenous, language, religion), 36 events, and various businesses and cultural content. The schema includes fields for user origin, radius, indigenous visibility, and language preferences.

### Discover Engine
The CultureOS Adaptive Cultural Ranking Engine (v2) powers a personalized `GET /api/discover/:userId` endpoint. This engine generates up to 9 personalized sections (e.g., Near You, Your Communities, First Nations Spotlight, From Your Homeland, In Your Language, Recommended For You) with normalized 0-1 scoring based on factors like location, community memberships, language, indigenous relevance, and user origin. A composite weighted score is used for recommendations.

### Key Features
-   **Indigenous Visibility Framework:** Integrates indigenous-focused data, content, and acknowledgements across the platform, including specific tags, owned business indicators, and Traditional Custodian land mapping.
-   **Ticket Purchase Flow:** Features a comprehensive ticket purchase modal with various buying modes (Single/Family/Group), discounts, and price summaries. Supports QR code visualization, sharing, and "Add to Wallet" functionality with server-side Apple/Google Wallet pass generation.
-   **Stripe Payment Integration:** Replaced wallet-based payments with Stripe Checkout for ticket purchases, including support for refunds and webhook-based data synchronization. Free tickets bypass Stripe.
-   **Location Filtering:** Implemented a `useLocationFilter` hook that applies user-selected country/city preferences to filter data across all content screens.
-   **Web Dashboard:** An administrative dashboard at `/dashboard` provides tools for managing tickets, events, users, perks, indigenous visibility, and viewing analytics.

## External Dependencies

-   **PostgreSQL Database:** Primary data store, utilizing `DATABASE_URL` for configuration.
-   **Expo:** Core framework for cross-platform application development.
-   **expo-router:** File-based routing for Expo applications.
-   **drizzle-orm** and **drizzle-kit:** ORM and schema migration tools for PostgreSQL.
-   **@tanstack/react-query:** For managing server state and data fetching.
-   **express:** Node.js framework for building the backend API.
-   **pg:** PostgreSQL client for Node.js.
-   **zod** and **drizzle-zod:** For schema validation and type inference.
-   **Stripe:** Payment gateway for processing transactions.
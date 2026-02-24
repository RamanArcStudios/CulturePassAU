# CulturePass

## Overview
CulturePass is a cross-platform cultural community and events platform designed to connect users with cultural communities, events, and local businesses across Australia, New Zealand, UAE, UK, and Canada. It aims to be a central hub for cultural interaction and commerce, facilitating event discovery, community engagement, a comprehensive business directory, user profiles, exclusive perks and benefits, sponsorship tools, notifications, and integrated payment solutions.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: Expo SDK 54, React Native 0.81, utilizing `expo-router` v6 for file-based routing.
- **Platforms**: Supports iOS, Android, and Web.
- **State Management**: React Context for local state (authentication, saved items, contacts, onboarding) with `AsyncStorage` for persistence. Server state managed with TanStack React Query v5.
- **Styling**: Uses React Native StyleSheet, a custom color theme system, and Poppins font family.
- **Animations**: Implements `react-native-reanimated`, with platform-specific checks to manage web compatibility.
- **UI/UX**: Features a modern, card-based UI, horizontal featured sections, gradient backgrounds, and search/filter chips. Web layouts are responsive, constraining the app to a 480px max-width centered container on desktop.
- **Key Components**: A reusable `BrowsePage` component for various content types, `ErrorBoundary` for fault tolerance, and a platform-split map component (`NativeMapView.native.tsx` for native, `.web.tsx` for web).

### Backend
- **Runtime**: Node.js with Express.js v5, written in TypeScript.
- **Architecture**: Organized into 22 domain-driven modules (e.g., `activities`, `businesses`, `events`), each containing routes and services.
- **Database**: PostgreSQL with PostGIS 3.5.3, managed by Drizzle ORM.
- **Schema**: Defined centrally in `shared/schema.ts`, shared between frontend type imports and backend queries.
- **Authentication**: Password-based login/registration with session management.
- **Error Handling**: Custom `AppError` class with standardized error codes, `wrapHandler` utility, and rate limiting.

### Data Layer
- **ORM**: Drizzle ORM for database interaction and schema synchronization.
- **Seed Data**: Initial data provided via `data/mockData.ts` and managed by `server/seed-data.ts`.
- **Entities**: Comprehensive entity model including users, diverse profile types (community, organization, venue, artist, business), events, tickets, movies, restaurants, activities, shopping, perks, sponsors, memberships, notifications, and more.

### Key Features
- **Discovery Engine**: Personalized content discovery based on location, community, language, and indigenous relevance.
- **Indigenous Visibility Framework**: Supports tagging, business indicators, and Traditional Custodian land mapping.
- **Ticketing System**: Includes ticket purchase modals, QR code generation, scanning functionalities, and Apple/Google Wallet pass integration.
- **Admin Dashboard**: A web-based dashboard for content, ticket, and promotion management.
- **CulturePass Card**: A QR-based networking card enabling contact scanning and storage.

## External Dependencies
- **PostgreSQL** with PostGIS: The primary relational database.
- **Stripe**: For secure payment processing, including checkout sessions, refunds, and webhook synchronization.
- **Expo**: The foundational framework for cross-platform application development.
- **Drizzle ORM**: Used for database schema definition, migrations, and object-relational mapping.
- **TanStack React Query**: Manages server-side data fetching, caching, and synchronization.
- **react-native-reanimated**: Provides powerful animation capabilities for fluid UI.
- **react-native-maps**: Integrates native map functionalities.
- **expo-camera**: Enables QR code scanning within the application.
- **expo-linear-gradient**: Facilitates the use of gradient backgrounds in the UI.
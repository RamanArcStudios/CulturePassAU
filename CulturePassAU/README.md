# CulturePass

A cross-platform mobile super-app connecting cultural diaspora communities across Australia, New Zealand, UAE, UK, and Canada.

## What is CulturePass?

CulturePass brings together cultural events, community networking, business directories, and exclusive perks into one vibrant platform. Whether you're discovering local cultural events, joining community groups, finding authentic restaurants, or unlocking member-only deals — CulturePass is your passport to culture.

## Features

### Discover & Explore
- **Cultural Events** — Browse and book tickets to cultural festivals, concerts, exhibitions, and community gatherings
- **Movie Booking** — Find and book cultural and international movies showing near you
- **Restaurant Discovery** — Explore authentic restaurants and eateries curated by the community
- **Activities** — Discover cultural activities, workshops, and experiences
- **Shopping Deals** — Access exclusive deals from culturally-relevant businesses

### Community
- **Community Groups** — Join and engage with cultural communities, organisations, venues, councils, artists, and businesses
- **Social System** — Follow, like, and interact with profiles across the platform
- **Content Sharing** — Share events, communities, and profiles with friends and family

### Identity & Membership
- **CulturePass ID (CPID)** — Your unique digital cultural identity with a scannable QR code
- **Membership Tiers** — Standard, Plus, Pro, Premium, and VIP tiers with escalating benefits
- **Digital ID Card** — A shareable digital identity card with verification status

### Perks & Benefits
- **Exclusive Perks** — Discounts, early access, and special offers from partner businesses
- **Sponsor Partnerships** — Curated sponsorships connecting brands with cultural communities
- **Rewards System** — Earn and redeem perks based on your membership tier

### Payments & Wallet
- **Ticket Wallet** — Store and manage all your event tickets in one place
- **Payment Methods** — Securely manage payment options
- **Transaction History** — Track all your payments and purchases

### Notifications
- **Real-time Updates** — Stay informed about events, community activity, and perk availability
- **Read/Unread Management** — Organised notification feed with easy management

## Tech Stack

### Frontend
- **Expo SDK 54** with React Native 0.81 (iOS, Android, Web)
- **Expo Router v6** — File-based routing
- **React Native Reanimated** — Smooth animations
- **TanStack React Query** — Server state management
- **AsyncStorage** — Local persistence

### Backend
- **Express.js v5** with TypeScript
- **PostgreSQL** — Primary database
- **Drizzle ORM** — Type-safe database operations
- **RESTful API** — 30+ endpoints

### Design System
- **Electric Teal** (`#00D4AA`) — Primary brand colour
- **Cosmic Purple** (`#7C3AED`) — Secondary / premium highlights
- **Ember Orange** (`#FF6B35`) — Attention-grabbing accents
- **Coral Gold** (`#FFB347`) — Rewards and warmth
- Light and dark mode support with carefully crafted neutral palettes

## Supported Countries

- Australia
- New Zealand
- United Arab Emirates
- United Kingdom
- Canada

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up the database:
   ```bash
   npm run db:push
   ```

3. Seed sample data (optional):
   ```bash
   curl -X POST http://localhost:5000/api/seed
   ```

4. Start the development servers:
   ```bash
   npm run server:dev   # Backend on port 5000
   npm run expo:dev     # Frontend on port 8081
   ```

5. Open the app:
   - **Web**: Visit `http://localhost:8081`
   - **Mobile**: Scan the QR code with Expo Go

## Project Structure

```
app/                    # Expo Router screens
  (onboarding)/         # Welcome, login, signup, location, interests
  (tabs)/               # Main tab screens (Discover, Calendar, Community, Perks, Profile)
  event/                # Event detail screens
  community/            # Community detail screens
  profile/              # Profile, public profile, QR code, edit
  movies/               # Movie browsing and details
  restaurants/          # Restaurant discovery
  activities/           # Activities and workshops
  shopping/             # Shopping deals
  payment/              # Wallet, methods, transactions
  perks/                # Perks and benefits
  notifications/        # Notification feed
  tickets/              # Ticket management
  help/                 # Help and support

server/                 # Express.js backend
  index.ts              # Server entry point
  routes.ts             # API route registration
  storage.ts            # Database access layer
  db.ts                 # Database connection

shared/                 # Shared between frontend and backend
  schema.ts             # Drizzle ORM schema and types

components/             # Reusable UI components
constants/              # Colours, typography
contexts/               # React context providers
data/                   # Mock data for events, movies, etc.
```

## API Overview

The backend provides RESTful endpoints for:

- **Users** — Registration, profiles, authentication
- **Profiles** — Community/organisation/venue/artist profiles
- **Social** — Follows, likes, reviews
- **Events** — Event discovery and management
- **Payments** — Methods, transactions, wallet
- **Sponsors** — Sponsor partnerships and placements
- **Perks** — Benefits, redemptions
- **Memberships** — Tier management
- **Notifications** — Real-time notification feed
- **Tickets** — Event ticket management

## License

All rights reserved.
# AppCulturePassau

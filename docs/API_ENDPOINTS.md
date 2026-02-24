# CulturePass API Endpoints (Phase 0/1)

This document describes the initial productionization backend scaffold added for CulturePass.

## Base URL
- Local: `http://localhost:5000`

## Health
- `GET /health`

## Users
- `GET /api/users`
- `GET /api/users/:id`
- `PUT /api/users/:id` (moderation checks applied)

## Discovery Content
- `GET /api/events`
- `GET /api/events/:id`
- `GET /api/communities`
- `GET /api/communities/:id`
- `GET /api/profiles`
- `GET /api/profiles/:id`
- `POST /api/profiles`
- `GET /api/businesses/:id`

## Entertainment & Browse Collections
- `GET /api/movies`
- `GET /api/movies/:id`
- `GET /api/restaurants`
- `GET /api/restaurants/:id`
- `GET /api/activities`
- `GET /api/activities/:id`
- `GET /api/shopping`
- `GET /api/shopping/:id`

## Wallet, Membership, and Payments
- `GET /api/wallet/:userId`
- `GET /api/transactions/:userId`
- `GET /api/payment-methods/:userId`
- `POST /api/payment-methods`
- `GET /api/membership/:userId`
- `GET /api/membership/member-count`
- `POST /api/membership/subscribe`
- `POST /api/membership/cancel-subscription`

## Tickets
- `GET /api/tickets/:userId`
- `GET /api/tickets/:userId/count`
- `GET /api/ticket/:id`
- `POST /api/tickets`
- `PUT /api/tickets/:id/cancel`
- `POST /api/tickets/scan`

## Perks and Reviews
- `GET /api/perks`
- `GET /api/perks/:id`
- `POST /api/perks`
- `GET /api/redemptions`
- `GET /api/reviews/:profileId`

## Notifications and Privacy
- `GET /api/notifications/:userId`
- `GET /api/notifications/:userId/unread-count`
- `POST /api/notifications/:userId/:id/read`
- `GET /api/privacy/settings/:userId`
- `PUT /api/privacy/settings/:userId`

## CPID and Discover
- `GET /api/cpid/lookup/:cpid`
- `GET /api/indigenous/traditional-lands`
- `GET /api/indigenous/spotlights`
- `GET /api/discover/:userId`

## Search
- `GET /api/search`
- `GET /api/search/suggest`

## Stripe placeholders
- `POST /api/stripe/create-checkout-session`
- `POST /api/stripe/refund`

## Moderation and governance baseline
- IP-based rate limiting middleware on API requests.
- Basic profanity moderation on write-heavy endpoints.

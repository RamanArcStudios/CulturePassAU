# CulturePass API Endpoints (Phase 2/3 Increment)

This document describes the current backend scaffold powering Phase 2 Search and Phase 3 Governance work.

## Base URL
- Local: `http://localhost:5000`

## Health
- `GET /health`
- `GET /api/rollout/config?userId=<id>`

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
- `POST /api/wallet/:userId/topup`
- `GET /api/transactions/:userId`
- `GET /api/payment-methods/:userId`
- `POST /api/payment-methods`
- `DELETE /api/payment-methods/:id`
- `PUT /api/payment-methods/:userId/default/:methodId`
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
- `GET /api/tickets/:id/history`
- `GET /api/tickets/admin/scan-events`
- `GET /api/tickets/:id/wallet/apple`
- `GET /api/tickets/:id/wallet/google`

## Perks and Reviews
- `GET /api/perks`
- `GET /api/perks/:id`
- `POST /api/perks`
- `POST /api/perks/:id/redeem`
- `GET /api/redemptions`
- `GET /api/reviews/:profileId`

## Notifications and Privacy
- `GET /api/notifications/:userId`
- `GET /api/notifications/:userId/unread-count`
- `PUT /api/notifications/:id/read`
- `PUT /api/notifications/:userId/read-all`
- `DELETE /api/notifications/:id`
- `GET /api/privacy/settings/:userId`
- `PUT /api/privacy/settings/:userId`

## Governance and moderation reporting
- `POST /api/reports`
- `GET /api/admin/reports`
- `PUT /api/admin/reports/:id/review`

## CPID and Discover
- `GET /api/cpid/lookup/:cpid`
- `GET /api/indigenous/traditional-lands`
- `GET /api/indigenous/spotlights`
- `GET /api/discover/:userId`

## Search
- `GET /api/search?q=...&type=all|event|community|business|profile&city=...&country=...&tags=a,b&startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&page=1&pageSize=20`
- `GET /api/search/suggest?q=...`

### Search implementation notes
- Weighted ranking in service layer (`title > subtitle > description`).
- Trigram-style fuzzy matching approximation for typo tolerance.
- Location relevance boost by city/country match.
- In-memory TTL cache abstraction with Redis-compatible API surface.


## Media upload and image pipeline
- `POST /api/uploads/image` (multipart field: `image`)
- `POST /api/media/attach`
- `GET /api/media/:targetType/:targetId`

## Stripe placeholders
- `POST /api/stripe/create-checkout-session`
- `POST /api/stripe/refund`
- `POST /api/stripe/webhook`

## Moderation and governance baseline
- IP-based rate limiting middleware on API requests.
- Profanity moderation on write-heavy endpoints.
- Suspicious-link heuristic moderation for user-submitted content.

# Route ↔ API Contract Matrix (Phase 1)

This matrix maps key app routes to the API endpoints they consume so dead links and missing handlers are easier to catch during QA.

| Route | Endpoint(s) |
|---|---|
| `/(tabs)/index`, `/allevents`, `/map`, `/search` | `GET /api/events`, `GET /api/communities`, `GET /api/discover/:userId`, `GET /api/indigenous/traditional-lands`, `GET /api/indigenous/spotlights`, `GET /api/search`, `GET /api/search/suggest` |
| `/event/[id]` | `GET /api/events/:id`, `POST /api/tickets`, `POST /api/stripe/create-checkout-session`, `GET /api/ticket/:id` |
| `/saved` | `GET /api/events`, `GET /api/communities` |
| `/tickets`, `/tickets/[id]` | `GET /api/tickets/:userId`, `GET /api/tickets/:userId/count`, `GET /api/ticket/:id`, `GET /api/tickets/:id/history`, `PUT /api/tickets/:id/cancel`, `GET /api/tickets/:id/wallet/apple`, `GET /api/tickets/:id/wallet/google`, `POST /api/stripe/refund` |
| `/(tabs)/index`, `/allevents`, `/map`, `/search` | `GET /api/events`, `GET /api/communities`, `GET /api/discover/:userId`, `GET /api/indigenous/traditional-lands`, `GET /api/indigenous/spotlights` |
| `/event/[id]` | `GET /api/events/:id`, `POST /api/tickets`, `POST /api/stripe/create-checkout-session`, `GET /api/ticket/:id` |
| `/saved` | `GET /api/events`, `GET /api/communities` |
| `/tickets`, `/tickets/[id]` | `GET /api/tickets/:userId`, `GET /api/tickets/:userId/count`, `GET /api/ticket/:id`, `PUT /api/tickets/:id/cancel`, `POST /api/stripe/refund` |
| `/scanner` | `POST /api/tickets/scan`, `GET /api/cpid/lookup/:cpid`, `GET /api/users/:id` |
| `/contacts/[cpid]`, `/user/[id]` | `GET /api/users/:id`, `GET /api/users` |
| `/(tabs)/profile`, `/profile/edit` | `GET /api/users`, `GET /api/users/:id`, `PUT /api/users/:id`, `GET /api/wallet/:userId`, `POST /api/uploads/image`, `POST /api/media/attach`, `GET /api/media/:targetType/:targetId` |
| `/profile/[id]`, `/community/[id]`, `/business/[id]`, `/artist/[id]`, `/venue/[id]` | `GET /api/profiles/:id`, `GET /api/communities/:id`, `GET /api/businesses/:id`, `GET /api/reviews/:profileId`, `GET /api/events`, `POST /api/reports` |
| `/(tabs)/profile`, `/profile/edit` | `GET /api/users`, `GET /api/users/:id`, `PUT /api/users/:id`, `GET /api/wallet/:userId` |
| `/profile/[id]`, `/community/[id]`, `/business/[id]`, `/artist/[id]`, `/venue/[id]` | `GET /api/profiles/:id`, `GET /api/communities/:id`, `GET /api/businesses/:id`, `GET /api/reviews/:profileId`, `GET /api/events`, `POST /api/reports` |
| `/profile/[id]`, `/community/[id]`, `/business/[id]`, `/artist/[id]`, `/venue/[id]` | `GET /api/profiles/:id`, `GET /api/communities/:id`, `GET /api/businesses/:id`, `GET /api/reviews/:profileId`, `GET /api/events` |
| `/perks`, `/perks/[id]`, `/(tabs)/perks` | `GET /api/perks`, `GET /api/perks/:id`, `POST /api/perks/:id/redeem`, `GET /api/membership/:userId`, `GET /api/redemptions` |
| `/notifications` | `GET /api/notifications/:userId`, `PUT /api/notifications/:id/read`, `PUT /api/notifications/:userId/read-all`, `DELETE /api/notifications/:id` |
| `/payment/wallet`, `/payment/methods`, `/payment/transactions` | `GET /api/wallet/:userId`, `POST /api/wallet/:userId/topup`, `GET /api/payment-methods/:userId`, `POST /api/payment-methods`, `DELETE /api/payment-methods/:id`, `PUT /api/payment-methods/:userId/default/:methodId`, `GET /api/transactions/:userId` |
| `/membership/upgrade` | `GET /api/membership/member-count`, `POST /api/membership/subscribe`, `POST /api/membership/cancel-subscription` |
| `/submit` | `POST /api/profiles`, `POST /api/perks`, `POST /api/uploads/image`, `POST /api/media/attach` |
| `/submit` | `POST /api/profiles`, `POST /api/perks` |

## Notes
- Every endpoint in this table now has an implemented Express handler in `server/index.ts`.
- Use this file as the checklist during flow QA: saved → event → tickets → profile → community, and scanner → contacts/profile.

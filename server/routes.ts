import type { Express } from "express";
import { createServer, type Server } from "node:http";

import { registerUsersRoutes } from "./modules/users/users.routes";
import { registerProfilesRoutes } from "./modules/profiles/profiles.routes";
import { registerFollowsRoutes } from "./modules/follows/follows.routes";
import { registerWalletRoutes } from "./modules/wallet/wallet.routes";
import { registerSponsorsRoutes } from "./modules/sponsors/sponsors.routes";
import { registerPerksRoutes } from "./modules/perks/perks.routes";
import { registerMembershipsRoutes } from "./modules/memberships/memberships.routes";
import { registerNotificationsRoutes } from "./modules/notifications/notifications.routes";
import { registerTicketsRoutes } from "./modules/tickets/tickets.routes";
import { registerStripeRoutes } from "./modules/stripe/stripe.routes";
import { registerDashboardRoutes } from "./modules/dashboard/dashboard.routes";
import { registerCpidRoutes } from "./modules/cpid/cpid.routes";
import { registerLocationsRoutes } from "./modules/locations/locations.routes";
import { registerCommunitiesRoutes } from "./modules/communities/communities.routes";
import { registerDiscoverRoutes } from "./modules/discover/discover.routes";
import { registerEventsRoutes } from "./modules/events/events.routes";
import { registerBusinessesRoutes } from "./modules/businesses/businesses.routes";
import { registerMoviesRoutes } from "./modules/movies/movies.routes";
import { registerRestaurantsRoutes } from "./modules/restaurants/restaurants.routes";
import { registerActivitiesRoutes } from "./modules/activities/activities.routes";
import { registerShoppingRoutes } from "./modules/shopping/shopping.routes";
import { registerIndigenousRoutes } from "./modules/indigenous/indigenous.routes";

import { seedApiEndpoint } from "./seed-data";

export async function registerRoutes(app: Express): Promise<Server> {
  registerUsersRoutes(app);
  registerProfilesRoutes(app);
  registerFollowsRoutes(app);
  registerWalletRoutes(app);
  registerSponsorsRoutes(app);
  registerPerksRoutes(app);
  registerMembershipsRoutes(app);
  registerNotificationsRoutes(app);
  registerTicketsRoutes(app);
  registerStripeRoutes(app);
  registerDashboardRoutes(app);
  registerCpidRoutes(app);
  registerLocationsRoutes(app);
  registerCommunitiesRoutes(app);
  registerDiscoverRoutes(app);
  registerEventsRoutes(app);
  registerBusinessesRoutes(app);
  registerMoviesRoutes(app);
  registerRestaurantsRoutes(app);
  registerActivitiesRoutes(app);
  registerShoppingRoutes(app);
  registerIndigenousRoutes(app);

  app.post("/api/seed", seedApiEndpoint);

  const httpServer = createServer(app);
  return httpServer;
}

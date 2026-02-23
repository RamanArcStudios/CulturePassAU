import type { Express, Request, Response } from "express";
import { createServer, type Server } from "node:http";
import { generateCpid } from "./cpid";

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

import * as usersService from "./modules/users/users.service";
import * as profilesService from "./modules/profiles/profiles.service";
import * as sponsorsService from "./modules/sponsors/sponsors.service";
import * as perksService from "./modules/perks/perks.service";
import * as membershipsService from "./modules/memberships/memberships.service";
import * as notificationsService from "./modules/notifications/notifications.service";
import * as ticketsService from "./modules/tickets/tickets.service";
import * as walletService from "./modules/wallet/wallet.service";

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

  app.post("/api/seed", async (_req: Request, res: Response) => {
    try {
      const existing = await profilesService.getAllProfiles();
      if (existing.length > 0) {
        return res.json({ message: "Already seeded", count: existing.length });
      }

      const seedProfiles = [
        { name: "Indian Community Australia", slug: "indian-community-au", entityType: "community", description: "Connecting Indian diaspora across Australia through events, culture, and community support.", category: "Cultural Community", city: "Sydney", country: "Australia", latitude: -33.8688, longitude: 151.2093, socialLinks: { facebook: "https://facebook.com/indiancommunityau", instagram: "https://instagram.com/indiancommunityau" }, images: [], tags: ["indian", "cultural", "community"], followersCount: 2450, membersCount: 2450, rating: 4.8 },
        { name: "Chinese Cultural Society", slug: "chinese-cultural-society", entityType: "community", description: "Celebrating Chinese heritage and traditions in Australia and New Zealand.", category: "Cultural Community", city: "Melbourne", country: "Australia", latitude: -37.8136, longitude: 144.9631, socialLinks: { facebook: "https://facebook.com/chinesecultural", instagram: "https://instagram.com/chinesecultural" }, images: [], tags: ["chinese", "cultural"], followersCount: 1890, membersCount: 1890, rating: 4.7 },
        { name: "Filipino Network NZ", slug: "filipino-network-nz", entityType: "community", description: "Supporting Filipino community in New Zealand with events, resources, and networking.", category: "Cultural Community", city: "Auckland", country: "New Zealand", latitude: -36.8485, longitude: 174.7633, socialLinks: { instagram: "https://instagram.com/filipinonz" }, images: [], tags: ["filipino", "networking"], followersCount: 1200, membersCount: 1200, rating: 4.6 },
        { name: "CulturePass Events Pty Ltd", slug: "culturepass-events", entityType: "organisation", description: "Premier cultural events organiser connecting communities across Australia and New Zealand.", category: "Events Organisation", city: "Sydney", country: "Australia", latitude: -33.8688, longitude: 151.2093, website: "https://culturepass.com", socialLinks: { linkedin: "https://linkedin.com/company/culturepass", twitter: "https://twitter.com/culturepass" }, images: [], tags: ["events", "multicultural"], followersCount: 5200, rating: 4.9 },
        { name: "Multicultural Arts Victoria", slug: "multicultural-arts-vic", entityType: "organisation", description: "Supporting and promoting culturally diverse arts and artists.", category: "Arts Organisation", city: "Melbourne", country: "Australia", latitude: -37.8136, longitude: 144.9631, website: "https://multiculturalarts.com.au", socialLinks: { facebook: "https://facebook.com/multiculturalartsvic", instagram: "https://instagram.com/multiculturalartsvic" }, images: [], tags: ["arts", "multicultural", "victoria"], followersCount: 3100, rating: 4.7 },
        { name: "Sydney Opera House", slug: "sydney-opera-house", entityType: "venue", description: "Iconic performing arts centre and UNESCO World Heritage Site.", category: "Performing Arts", city: "Sydney", country: "Australia", address: "Bennelong Point, Sydney NSW 2000", latitude: -33.8568, longitude: 151.2153, website: "https://sydneyoperahouse.com", socialLinks: { facebook: "https://facebook.com/sydneyoperahouse", instagram: "https://instagram.com/sydneyoperahouse", twitter: "https://twitter.com/sydneyoperahouse", youtube: "https://youtube.com/sydneyoperahouse" }, images: [], tags: ["opera", "performing arts", "landmark"], followersCount: 15000, rating: 4.9, openingHours: "Mon-Sun: 9am-11pm" },
        { name: "Melbourne Convention Centre", slug: "melbourne-convention", entityType: "venue", description: "World-class convention and exhibition centre in South Wharf.", category: "Convention Centre", city: "Melbourne", country: "Australia", address: "1 Convention Centre Pl, South Wharf VIC 3006", latitude: -37.8252, longitude: 144.9529, website: "https://mcec.com.au", socialLinks: { linkedin: "https://linkedin.com/company/mcec" }, images: [], tags: ["convention", "events", "exhibitions"], followersCount: 8900, rating: 4.6, openingHours: "Mon-Sun: 8am-10pm" },
        { name: "Spice of India", slug: "spice-of-india", entityType: "business", description: "Authentic North Indian cuisine with traditional recipes and premium ingredients.", category: "Restaurant", city: "Sydney", country: "Australia", address: "42 Elizabeth Street, Sydney NSW 2000", latitude: -33.8718, longitude: 151.2082, phone: "02 9123 4567", socialLinks: { instagram: "https://instagram.com/spiceofindia", facebook: "https://facebook.com/spiceofindia" }, images: [], tags: ["indian", "restaurant", "fine dining"], followersCount: 890, rating: 4.5, openingHours: "Tue-Sun: 11am-10pm" },
        { name: "Sari Silk Boutique", slug: "sari-silk-boutique", entityType: "business", description: "Premium Indian fashion, bridal wear, and traditional clothing.", category: "Fashion", city: "Melbourne", country: "Australia", address: "156 Chapel Street, Prahran VIC 3181", latitude: -37.8508, longitude: 144.9931, socialLinks: { instagram: "https://instagram.com/sarisilk", tiktok: "https://tiktok.com/@sarisilk" }, images: [], tags: ["fashion", "indian", "bridal"], followersCount: 2300, rating: 4.7, openingHours: "Mon-Sat: 10am-6pm" },
        { name: "Dragon Palace", slug: "dragon-palace", entityType: "business", description: "Award-winning Chinese restaurant featuring Cantonese and Sichuan cuisine.", category: "Restaurant", city: "Auckland", country: "New Zealand", address: "95 Queen Street, Auckland 1010", latitude: -36.8461, longitude: 174.7660, phone: "+64 9 555 1234", socialLinks: { facebook: "https://facebook.com/dragonpalace", instagram: "https://instagram.com/dragonpalace" }, images: [], tags: ["chinese", "restaurant"], followersCount: 1200, rating: 4.6, openingHours: "Mon-Sun: 11am-11pm" },
        { name: "City of Sydney Council", slug: "city-of-sydney", entityType: "council", description: "Local government authority for the City of Sydney, promoting multicultural events and community programs.", category: "Local Government", city: "Sydney", country: "Australia", address: "Town Hall House, 456 Kent St, Sydney NSW 2000", latitude: -33.8736, longitude: 151.2069, website: "https://cityofsydney.nsw.gov.au", socialLinks: { facebook: "https://facebook.com/cityofsydney", twitter: "https://twitter.com/cityofsydney", linkedin: "https://linkedin.com/company/cityofsydney" }, images: [], tags: ["government", "multicultural", "grants"], followersCount: 12000, rating: 4.3 },
        { name: "Auckland Council", slug: "auckland-council", entityType: "council", description: "Auckland's local authority supporting diverse communities and cultural festivals.", category: "Local Government", city: "Auckland", country: "New Zealand", address: "135 Albert Street, Auckland 1010", latitude: -36.8485, longitude: 174.7633, website: "https://aucklandcouncil.govt.nz", socialLinks: { facebook: "https://facebook.com/aucklandcouncil", twitter: "https://twitter.com/aklcouncil" }, images: [], tags: ["government", "auckland"], followersCount: 9500, rating: 4.1 },
        { name: "Department of Home Affairs", slug: "dept-home-affairs", entityType: "government", description: "Australian Government department responsible for immigration, citizenship, and multicultural affairs.", category: "Federal Government", city: "Canberra", country: "Australia", website: "https://homeaffairs.gov.au", socialLinks: { twitter: "https://twitter.com/AusBorderForce", linkedin: "https://linkedin.com/company/department-of-home-affairs" }, images: [], tags: ["immigration", "citizenship", "multicultural"], followersCount: 25000, rating: 3.8 },
        { name: "Ministry of Ethnic Communities", slug: "ministry-ethnic-communities", entityType: "government", description: "New Zealand government ministry focused on ethnic communities, promoting inclusion and diversity.", category: "National Government", city: "Wellington", country: "New Zealand", website: "https://ethniccommunities.govt.nz", socialLinks: { facebook: "https://facebook.com/ethniccommunities", twitter: "https://twitter.com/ethniccommNZ" }, images: [], tags: ["ethnic", "diversity", "inclusion"], followersCount: 8000, rating: 4.0 },
        { name: "Priya Sharma", slug: "priya-sharma", entityType: "artist", description: "Classical Bharatanatyam dancer and choreographer bringing South Indian dance to Australian stages.", category: "Dancer", city: "Melbourne", country: "Australia", bio: "Award-winning dancer with 15+ years of experience performing at cultural festivals worldwide.", socialLinks: { instagram: "https://instagram.com/priyasharma", youtube: "https://youtube.com/priyasharma", spotify: "https://open.spotify.com/artist/priya" }, images: [], tags: ["dance", "bharatanatyam", "classical", "indian"], followersCount: 4500, rating: 4.9, isVerified: true },
        { name: "DJ Kai Lin", slug: "dj-kai-lin", entityType: "artist", description: "Fusion DJ blending Asian electronic beats with traditional Chinese instruments.", category: "Musician", city: "Sydney", country: "Australia", bio: "Headlining cultural festivals across Australia, NZ, and Asia since 2019.", socialLinks: { instagram: "https://instagram.com/djkailin", tiktok: "https://tiktok.com/@djkailin", spotify: "https://open.spotify.com/artist/djkailin" }, images: [], tags: ["dj", "electronic", "fusion", "chinese"], followersCount: 8200, rating: 4.8, isVerified: true },
        { name: "Ravi Patel", slug: "ravi-patel", entityType: "artist", description: "Stand-up comedian known for hilarious cross-cultural comedy about the immigrant experience.", category: "Comedian", city: "Auckland", country: "New Zealand", bio: "Netflix special 'Between Two Cultures' streamed in 12 countries.", socialLinks: { instagram: "https://instagram.com/ravipatel", youtube: "https://youtube.com/ravipatel", twitter: "https://twitter.com/ravipatel" }, images: [], tags: ["comedy", "stand-up", "indian"], followersCount: 12000, rating: 4.7, isVerified: true },
      ];

      const createdProfiles = [];
      for (const p of seedProfiles) {
        const created = await profilesService.createProfile(p as any);
        createdProfiles.push(created);
      }

      for (const cp of createdProfiles) {
        await generateCpid(cp.id, cp.entityType);
      }

      const seedSponsors = [
        { name: "Telstra", description: "Australia's leading telecommunications company supporting multicultural communities.", logoUrl: "", websiteUrl: "https://telstra.com.au", sponsorType: "corporate", city: "Melbourne", country: "Australia", socialLinks: { linkedin: "https://linkedin.com/company/telstra", twitter: "https://twitter.com/telstra" }, contactEmail: "partnerships@telstra.com.au" },
        { name: "ANZ Bank", description: "Banking partner empowering diverse communities through financial inclusion programs.", logoUrl: "", websiteUrl: "https://anz.com.au", sponsorType: "corporate", city: "Sydney", country: "Australia", socialLinks: { linkedin: "https://linkedin.com/company/anz-bank", facebook: "https://facebook.com/ANZAustralia" }, contactEmail: "community@anz.com.au" },
        { name: "SBS Australia", description: "Australia's multicultural and multilingual broadcaster, celebrating diversity in media.", logoUrl: "", websiteUrl: "https://sbs.com.au", sponsorType: "corporate", city: "Sydney", country: "Australia", socialLinks: { instagram: "https://instagram.com/sbsaustralia", twitter: "https://twitter.com/SBS" }, contactEmail: "partnerships@sbs.com.au" },
        { name: "Auckland Foundation", description: "Community trust supporting cultural initiatives and events in Auckland.", logoUrl: "", websiteUrl: "https://aucklandfoundation.org.nz", sponsorType: "local", city: "Auckland", country: "New Zealand", socialLinks: { facebook: "https://facebook.com/aucklandfoundation" }, contactEmail: "grants@aucklandfoundation.org.nz" },
      ];

      const createdSponsors = [];
      for (const s of seedSponsors) {
        const created = await sponsorsService.createSponsor(s as any);
        createdSponsors.push(created);
      }

      for (const cs of createdSponsors) {
        await generateCpid(cs.id, "sponsor");
      }

      const seedPerks = [
        { title: "20% Off First Event Ticket", description: "Get 20% off your first event ticket purchase on CulturePass.", perkType: "discount_percent", discountPercent: 20, providerType: "platform", providerName: "CulturePass", category: "tickets", startDate: new Date(), endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), usageLimit: 1000, perUserLimit: 1 },
        { title: "Free Entry to Community Meetups", description: "Attend any community meetup event for free this month.", perkType: "free_ticket", providerType: "platform", providerName: "CulturePass", category: "events", startDate: new Date(), endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), usageLimit: 500, perUserLimit: 3 },
        { title: "$10 Off at Spice of India", description: "Enjoy $10 off your meal when you dine at Spice of India.", perkType: "discount_fixed", discountFixedCents: 1000, providerType: "business", providerName: "Spice of India", category: "dining", startDate: new Date(), endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), usageLimit: 200, perUserLimit: 2 },
        { title: "Early Access to Festival Tickets", description: "Premium members get 48-hour early access to major festival ticket sales.", perkType: "early_access", providerType: "platform", providerName: "CulturePass", category: "tickets", isMembershipRequired: true, requiredMembershipTier: "premium", startDate: new Date(), endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) },
        { title: "VIP Upgrade at Diwali Festival", description: "Free VIP upgrade for CulturePass members at the Diwali Festival.", perkType: "vip_upgrade", providerType: "sponsor", providerName: "Telstra", category: "events", isMembershipRequired: true, requiredMembershipTier: "premium", startDate: new Date(), endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), usageLimit: 50 },
        { title: "15% Off Sari Silk Boutique", description: "Show your CulturePass app for 15% off any purchase at Sari Silk Boutique.", perkType: "discount_percent", discountPercent: 15, providerType: "business", providerName: "Sari Silk Boutique", category: "shopping", startDate: new Date(), endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), usageLimit: 300, perUserLimit: 2 },
        { title: "$5 Wallet Cashback", description: "Get $5 credited to your CulturePass Wallet on your next ticket purchase over $30.", perkType: "cashback", discountFixedCents: 500, providerType: "platform", providerName: "CulturePass", category: "wallet", startDate: new Date(), endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), usageLimit: 1000, perUserLimit: 1 },
      ];

      for (const pk of seedPerks) {
        await perksService.createPerk(pk as any);
      }

      const demoPassword = process.env.DEMO_USER_PASSWORD || "demo123";
      const demoUser = await usersService.createUser({ username: "demo", password: demoPassword });
      await usersService.updateUser(demoUser.id, {
        displayName: "Alex Chen",
        email: "alex@culturepass.com",
        bio: "Cultural explorer and community builder. Passionate about connecting people through shared heritage.",
        city: "Sydney",
        country: "Australia",
        location: "Sydney, Australia",
        socialLinks: { instagram: "https://instagram.com/alexchen", linkedin: "https://linkedin.com/in/alexchen", twitter: "https://twitter.com/alexchen" },
        images: [],
        latitude: -33.8688,
        longitude: 151.2093,
      });
      await generateCpid(demoUser.id, "user");

      const adminPassword = process.env.ADMIN_USER_PASSWORD;
      if (!adminPassword) {
        throw new Error("ADMIN_USER_PASSWORD environment variable is required for seeding the super admin account");
      }
      const adminUser = await usersService.createUser({ username: "superadmin", password: adminPassword });
      await usersService.updateUser(adminUser.id, {
        displayName: "Super Admin",
        email: "jiobaba369@gmail.com",
        bio: "CulturePass Super Administrator",
        city: "Sydney",
        country: "Australia",
        location: "Sydney, Australia",
        role: "super_admin",
        isVerified: true,
      } as any);
      await generateCpid(adminUser.id, "user");

      const notifData = [
        { userId: demoUser.id, title: "Welcome to CulturePass!", message: "Start exploring cultural events and communities near you.", type: "system" },
        { userId: demoUser.id, title: "Diwali Festival 2026", message: "Early bird tickets are now available! Book before they sell out.", type: "event" },
        { userId: demoUser.id, title: "New Perk Available", message: "Get 20% off your first event ticket purchase.", type: "perk" },
        { userId: demoUser.id, title: "Community Update", message: "Indian Community Australia posted a new event.", type: "community" },
      ];
      for (const n of notifData) {
        await notificationsService.createNotification(n as any);
      }

      const ticketData = [
        { userId: demoUser.id, eventId: "evt-001", eventTitle: "Diwali Festival of Lights 2026", eventDate: "2026-10-25", eventTime: "6:00 PM", eventVenue: "Sydney Opera House Forecourt", tierName: "VIP", quantity: 2, totalPrice: 120.00, currency: "AUD", status: "confirmed", imageColor: "#FF6B35" },
        { userId: demoUser.id, eventId: "evt-002", eventTitle: "Chinese New Year Gala", eventDate: "2026-02-17", eventTime: "7:30 PM", eventVenue: "Melbourne Convention Centre", tierName: "General", quantity: 1, totalPrice: 45.00, currency: "AUD", status: "used", imageColor: "#E74C3C" },
        { userId: demoUser.id, eventId: "evt-003", eventTitle: "Bollywood Night Live", eventDate: "2026-03-15", eventTime: "8:00 PM", eventVenue: "Darling Harbour Theatre", tierName: "Premium", quantity: 3, totalPrice: 225.00, currency: "AUD", status: "confirmed", imageColor: "#9B59B6" },
        { userId: demoUser.id, eventId: "evt-004", eventTitle: "Cultural Food Festival", eventDate: "2026-04-10", eventTime: "11:00 AM", eventVenue: "Centennial Park", tierName: "General", quantity: 2, totalPrice: 30.00, currency: "AUD", status: "confirmed", imageColor: "#2ECC71" },
      ];
      for (const t of ticketData) {
        await ticketsService.createTicket(t as any);
      }

      await membershipsService.createMembership({ userId: demoUser.id, tier: "plus" } as any);
      await walletService.addFunds(demoUser.id, 45.50);

      res.json({ message: "Seeded successfully", profiles: seedProfiles.length, sponsors: seedSponsors.length, perks: seedPerks.length, users: 1, tickets: ticketData.length });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

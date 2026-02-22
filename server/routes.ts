import type { Express, Request, Response } from "express";
import { createServer, type Server } from "node:http";
import { storage } from "./storage";

function p(val: string | string[]): string { return Array.isArray(val) ? val[0] : val; }

export async function registerRoutes(app: Express): Promise<Server> {
  // === Users ===
  app.get("/api/users", async (_req: Request, res: Response) => {
    const users = await storage.getAllUsers();
    res.json(users);
  });

  app.get("/api/users/:id", async (req: Request, res: Response) => {
    const user = await storage.getUser(p(req.params.id));
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  });

  app.post("/api/users", async (req: Request, res: Response) => {
    try {
      const user = await storage.createUser(req.body);
      res.status(201).json(user);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.put("/api/users/:id", async (req: Request, res: Response) => {
    const user = await storage.updateUser(p(req.params.id), req.body);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  });

  // === Profiles (communities, orgs, venues, businesses, councils, governments, artists) ===
  app.get("/api/profiles", async (req: Request, res: Response) => {
    const entityType = req.query.type as string;
    const profiles = entityType
      ? await storage.getProfilesByType(entityType)
      : await storage.getAllProfiles();
    res.json(profiles);
  });

  app.get("/api/profiles/:id", async (req: Request, res: Response) => {
    const profile = await storage.getProfile(p(req.params.id)) || await storage.getProfileBySlug(p(req.params.id));
    if (!profile) return res.status(404).json({ error: "Profile not found" });
    res.json(profile);
  });

  app.post("/api/profiles", async (req: Request, res: Response) => {
    try {
      const profile = await storage.createProfile(req.body);
      res.status(201).json(profile);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.put("/api/profiles/:id", async (req: Request, res: Response) => {
    const profile = await storage.updateProfile(p(req.params.id), req.body);
    if (!profile) return res.status(404).json({ error: "Profile not found" });
    res.json(profile);
  });

  app.delete("/api/profiles/:id", async (req: Request, res: Response) => {
    const deleted = await storage.deleteProfile(p(req.params.id));
    if (!deleted) return res.status(404).json({ error: "Profile not found" });
    res.json({ success: true });
  });

  // === Follows ===
  app.post("/api/follow", async (req: Request, res: Response) => {
    const { followerId, targetId, targetType } = req.body;
    const follow = await storage.follow(followerId, targetId, targetType);
    res.json(follow);
  });

  app.post("/api/unfollow", async (req: Request, res: Response) => {
    const { followerId, targetId } = req.body;
    const result = await storage.unfollow(followerId, targetId);
    res.json({ success: result });
  });

  app.get("/api/followers/:targetId", async (req: Request, res: Response) => {
    const followers = await storage.getFollowers(p(req.params.targetId));
    res.json(followers);
  });

  app.get("/api/following/:userId", async (req: Request, res: Response) => {
    const following = await storage.getFollowing(p(req.params.userId));
    res.json(following);
  });

  app.get("/api/is-following", async (req: Request, res: Response) => {
    const { followerId, targetId } = req.query;
    const result = await storage.isFollowing(followerId as string, targetId as string);
    res.json({ isFollowing: result });
  });

  // === Likes ===
  app.post("/api/like", async (req: Request, res: Response) => {
    const { userId, targetId, targetType } = req.body;
    const like = await storage.likeEntity(userId, targetId, targetType);
    res.json(like);
  });

  app.post("/api/unlike", async (req: Request, res: Response) => {
    const { userId, targetId } = req.body;
    const result = await storage.unlikeEntity(userId, targetId);
    res.json({ success: result });
  });

  app.get("/api/is-liked", async (req: Request, res: Response) => {
    const { userId, targetId } = req.query;
    const result = await storage.isLiked(userId as string, targetId as string);
    res.json({ isLiked: result });
  });

  // === Reviews ===
  app.get("/api/reviews/:targetId", async (req: Request, res: Response) => {
    const reviews = await storage.getReviews(p(req.params.targetId));
    res.json(reviews);
  });

  app.post("/api/reviews", async (req: Request, res: Response) => {
    try {
      const review = await storage.createReview(req.body);
      res.status(201).json(review);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.delete("/api/reviews/:id", async (req: Request, res: Response) => {
    const deleted = await storage.deleteReview(p(req.params.id));
    if (!deleted) return res.status(404).json({ error: "Review not found" });
    res.json({ success: true });
  });

  // === Members ===
  app.get("/api/members/:profileId", async (req: Request, res: Response) => {
    const members = await storage.getMembers(p(req.params.profileId));
    res.json(members);
  });

  // === Payment Methods ===
  app.get("/api/payment-methods/:userId", async (req: Request, res: Response) => {
    const methods = await storage.getPaymentMethods(p(req.params.userId));
    res.json(methods);
  });

  app.post("/api/payment-methods", async (req: Request, res: Response) => {
    try {
      const method = await storage.createPaymentMethod(req.body);
      res.status(201).json(method);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.delete("/api/payment-methods/:id", async (req: Request, res: Response) => {
    const deleted = await storage.deletePaymentMethod(p(req.params.id));
    if (!deleted) return res.status(404).json({ error: "Payment method not found" });
    res.json({ success: true });
  });

  app.put("/api/payment-methods/:userId/default/:methodId", async (req: Request, res: Response) => {
    const method = await storage.setDefaultPaymentMethod(p(req.params.userId), p(req.params.methodId));
    if (!method) return res.status(404).json({ error: "Method not found" });
    res.json(method);
  });

  // === Transactions ===
  app.get("/api/transactions/:userId", async (req: Request, res: Response) => {
    const txs = await storage.getTransactions(p(req.params.userId));
    res.json(txs);
  });

  // === Wallet ===
  app.get("/api/wallet/:userId", async (req: Request, res: Response) => {
    const wallet = await storage.getWallet(p(req.params.userId));
    res.json(wallet || { balance: 0, currency: "AUD" });
  });

  app.post("/api/wallet/:userId/topup", async (req: Request, res: Response) => {
    const { amount } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ error: "Invalid amount" });
    const wallet = await storage.addFunds(p(req.params.userId), amount);
    res.json(wallet);
  });

  app.post("/api/wallet/:userId/pay", async (req: Request, res: Response) => {
    const { amount, description } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ error: "Invalid amount" });
    const wallet = await storage.deductFunds(p(req.params.userId), amount, description);
    if (!wallet) return res.status(400).json({ error: "Insufficient funds" });
    res.json(wallet);
  });

  // === Sponsors ===
  app.get("/api/sponsors", async (_req: Request, res: Response) => {
    const sponsors = await storage.getAllSponsors();
    res.json(sponsors);
  });

  app.get("/api/sponsors/:id", async (req: Request, res: Response) => {
    const sponsor = await storage.getSponsor(p(req.params.id));
    if (!sponsor) return res.status(404).json({ error: "Sponsor not found" });
    res.json(sponsor);
  });

  app.post("/api/sponsors", async (req: Request, res: Response) => {
    try {
      const sponsor = await storage.createSponsor(req.body);
      res.status(201).json(sponsor);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.put("/api/sponsors/:id", async (req: Request, res: Response) => {
    const sponsor = await storage.updateSponsor(p(req.params.id), req.body);
    if (!sponsor) return res.status(404).json({ error: "Sponsor not found" });
    res.json(sponsor);
  });

  app.delete("/api/sponsors/:id", async (req: Request, res: Response) => {
    const deleted = await storage.deleteSponsor(p(req.params.id));
    if (!deleted) return res.status(404).json({ error: "Sponsor not found" });
    res.json({ success: true });
  });

  // Event sponsors
  app.get("/api/event-sponsors/:eventId", async (req: Request, res: Response) => {
    const sponsors = await storage.getEventSponsors(p(req.params.eventId));
    res.json(sponsors);
  });

  app.post("/api/event-sponsors", async (req: Request, res: Response) => {
    const { eventId, sponsorId, tier } = req.body;
    const es = await storage.addEventSponsor(eventId, sponsorId, tier || "bronze");
    res.status(201).json(es);
  });

  app.delete("/api/event-sponsors/:id", async (req: Request, res: Response) => {
    const deleted = await storage.removeEventSponsor(p(req.params.id));
    if (!deleted) return res.status(404).json({ error: "Event sponsor not found" });
    res.json({ success: true });
  });

  // Sponsor placements
  app.get("/api/sponsor-placements", async (req: Request, res: Response) => {
    const type = req.query.type as string;
    const placements = await storage.getActivePlacements(type);
    res.json(placements);
  });

  app.post("/api/sponsor-placements", async (req: Request, res: Response) => {
    const placement = await storage.createPlacement(req.body);
    res.status(201).json(placement);
  });

  // === Perks ===
  app.get("/api/perks", async (req: Request, res: Response) => {
    const category = req.query.category as string;
    const perks = category
      ? await storage.getPerksByCategory(category)
      : await storage.getAllPerks();
    res.json(perks);
  });

  app.get("/api/perks/:id", async (req: Request, res: Response) => {
    const perk = await storage.getPerk(p(req.params.id));
    if (!perk) return res.status(404).json({ error: "Perk not found" });
    res.json(perk);
  });

  app.post("/api/perks", async (req: Request, res: Response) => {
    try {
      const perk = await storage.createPerk(req.body);
      res.status(201).json(perk);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.put("/api/perks/:id", async (req: Request, res: Response) => {
    const perk = await storage.updatePerk(p(req.params.id), req.body);
    if (!perk) return res.status(404).json({ error: "Perk not found" });
    res.json(perk);
  });

  app.delete("/api/perks/:id", async (req: Request, res: Response) => {
    const deleted = await storage.deletePerk(p(req.params.id));
    if (!deleted) return res.status(404).json({ error: "Perk not found" });
    res.json({ success: true });
  });

  // Perk redemptions
  app.post("/api/perks/:id/redeem", async (req: Request, res: Response) => {
    const { userId, transactionId } = req.body;
    const redemption = await storage.redeemPerk(p(req.params.id), userId, transactionId);
    if (!redemption) return res.status(400).json({ error: "Cannot redeem perk - limit reached or perk expired" });
    res.json(redemption);
  });

  app.get("/api/redemptions/:userId", async (req: Request, res: Response) => {
    const redemptions = await storage.getUserRedemptions(p(req.params.userId));
    res.json(redemptions);
  });

  // === Memberships ===
  app.get("/api/membership/:userId", async (req: Request, res: Response) => {
    const membership = await storage.getMembership(p(req.params.userId));
    res.json(membership || { tier: "free", status: "active" });
  });

  app.post("/api/membership", async (req: Request, res: Response) => {
    try {
      const membership = await storage.createMembership(req.body);
      res.status(201).json(membership);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.put("/api/membership/:id", async (req: Request, res: Response) => {
    const membership = await storage.updateMembership(p(req.params.id), req.body);
    if (!membership) return res.status(404).json({ error: "Membership not found" });
    res.json(membership);
  });

  // === Notifications ===
  app.get("/api/notifications/:userId", async (req: Request, res: Response) => {
    const notifs = await storage.getNotifications(p(req.params.userId));
    res.json(notifs);
  });

  app.get("/api/notifications/:userId/unread-count", async (req: Request, res: Response) => {
    const count = await storage.getUnreadCount(p(req.params.userId));
    res.json({ count });
  });

  app.post("/api/notifications", async (req: Request, res: Response) => {
    try {
      const notif = await storage.createNotification(req.body);
      res.status(201).json(notif);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.put("/api/notifications/:id/read", async (req: Request, res: Response) => {
    const notif = await storage.markNotificationRead(p(req.params.id));
    if (!notif) return res.status(404).json({ error: "Notification not found" });
    res.json(notif);
  });

  app.put("/api/notifications/:userId/read-all", async (req: Request, res: Response) => {
    await storage.markAllNotificationsRead(p(req.params.userId));
    res.json({ success: true });
  });

  app.delete("/api/notifications/:id", async (req: Request, res: Response) => {
    const deleted = await storage.deleteNotification(p(req.params.id));
    if (!deleted) return res.status(404).json({ error: "Notification not found" });
    res.json({ success: true });
  });

  // === Tickets ===
  app.get("/api/tickets/:userId", async (req: Request, res: Response) => {
    const tickets = await storage.getTickets(p(req.params.userId));
    res.json(tickets);
  });

  app.get("/api/tickets/:userId/count", async (req: Request, res: Response) => {
    const count = await storage.getTicketCount(p(req.params.userId));
    res.json({ count });
  });

  app.get("/api/ticket/:id", async (req: Request, res: Response) => {
    const ticket = await storage.getTicket(p(req.params.id));
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });
    res.json(ticket);
  });

  app.post("/api/tickets", async (req: Request, res: Response) => {
    try {
      const ticket = await storage.createTicket(req.body);
      res.status(201).json(ticket);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.put("/api/tickets/:id/cancel", async (req: Request, res: Response) => {
    const ticket = await storage.cancelTicket(p(req.params.id));
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });
    res.json(ticket);
  });

  // === Seed data endpoint ===
  app.post("/api/seed", async (_req: Request, res: Response) => {
    try {
      const existing = await storage.getAllProfiles();
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
        // Artists
        { name: "Priya Sharma", slug: "priya-sharma", entityType: "artist", description: "Classical Bharatanatyam dancer and choreographer bringing South Indian dance to Australian stages.", category: "Dancer", city: "Melbourne", country: "Australia", bio: "Award-winning dancer with 15+ years of experience performing at cultural festivals worldwide.", socialLinks: { instagram: "https://instagram.com/priyasharma", youtube: "https://youtube.com/priyasharma", spotify: "https://open.spotify.com/artist/priya" }, images: [], tags: ["dance", "bharatanatyam", "classical", "indian"], followersCount: 4500, rating: 4.9, isVerified: true },
        { name: "DJ Kai Lin", slug: "dj-kai-lin", entityType: "artist", description: "Fusion DJ blending Asian electronic beats with traditional Chinese instruments.", category: "Musician", city: "Sydney", country: "Australia", bio: "Headlining cultural festivals across Australia, NZ, and Asia since 2019.", socialLinks: { instagram: "https://instagram.com/djkailin", tiktok: "https://tiktok.com/@djkailin", spotify: "https://open.spotify.com/artist/djkailin" }, images: [], tags: ["dj", "electronic", "fusion", "chinese"], followersCount: 8200, rating: 4.8, isVerified: true },
        { name: "Ravi Patel", slug: "ravi-patel", entityType: "artist", description: "Stand-up comedian known for hilarious cross-cultural comedy about the immigrant experience.", category: "Comedian", city: "Auckland", country: "New Zealand", bio: "Netflix special 'Between Two Cultures' streamed in 12 countries.", socialLinks: { instagram: "https://instagram.com/ravipatel", youtube: "https://youtube.com/ravipatel", twitter: "https://twitter.com/ravipatel" }, images: [], tags: ["comedy", "stand-up", "indian"], followersCount: 12000, rating: 4.7, isVerified: true },
      ];

      for (const p of seedProfiles) {
        await storage.createProfile(p as any);
      }

      // Seed sponsors
      const seedSponsors = [
        { name: "Telstra", description: "Australia's leading telecommunications company supporting multicultural communities.", logoUrl: "", websiteUrl: "https://telstra.com.au", sponsorType: "corporate", city: "Melbourne", country: "Australia", socialLinks: { linkedin: "https://linkedin.com/company/telstra", twitter: "https://twitter.com/telstra" }, contactEmail: "partnerships@telstra.com.au" },
        { name: "ANZ Bank", description: "Banking partner empowering diverse communities through financial inclusion programs.", logoUrl: "", websiteUrl: "https://anz.com.au", sponsorType: "corporate", city: "Sydney", country: "Australia", socialLinks: { linkedin: "https://linkedin.com/company/anz-bank", facebook: "https://facebook.com/ANZAustralia" }, contactEmail: "community@anz.com.au" },
        { name: "SBS Australia", description: "Australia's multicultural and multilingual broadcaster, celebrating diversity in media.", logoUrl: "", websiteUrl: "https://sbs.com.au", sponsorType: "corporate", city: "Sydney", country: "Australia", socialLinks: { instagram: "https://instagram.com/sbsaustralia", twitter: "https://twitter.com/SBS" }, contactEmail: "partnerships@sbs.com.au" },
        { name: "Auckland Foundation", description: "Community trust supporting cultural initiatives and events in Auckland.", logoUrl: "", websiteUrl: "https://aucklandfoundation.org.nz", sponsorType: "local", city: "Auckland", country: "New Zealand", socialLinks: { facebook: "https://facebook.com/aucklandfoundation" }, contactEmail: "grants@aucklandfoundation.org.nz" },
      ];

      for (const s of seedSponsors) {
        await storage.createSponsor(s as any);
      }

      // Seed perks
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
        await storage.createPerk(pk as any);
      }

      // Seed a demo user
      const demoUser = await storage.createUser({ username: "demo", password: "demo123" });
      await storage.updateUser(demoUser.id, {
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

      // Seed Super Admin user
      const adminUser = await storage.createUser({ username: "superadmin", password: "admin2026" });
      await storage.updateUser(adminUser.id, {
        displayName: "Super Admin",
        email: "jiobaba369@gmail.com",
        bio: "CulturePass Super Administrator",
        city: "Sydney",
        country: "Australia",
        location: "Sydney, Australia",
        role: "super_admin",
        isVerified: true,
      } as any);

      // Seed notifications for demo user
      const notifData = [
        { userId: demoUser.id, title: "Welcome to CulturePass!", message: "Start exploring cultural events and communities near you.", type: "system" },
        { userId: demoUser.id, title: "Diwali Festival 2026", message: "Early bird tickets are now available! Book before they sell out.", type: "event" },
        { userId: demoUser.id, title: "New Perk Available", message: "Get 20% off your first event ticket purchase.", type: "perk" },
        { userId: demoUser.id, title: "Community Update", message: "Indian Community Australia posted a new event.", type: "community" },
      ];
      for (const n of notifData) {
        await storage.createNotification(n as any);
      }

      // Seed sample tickets for demo user
      const ticketData = [
        { userId: demoUser.id, eventId: "evt-001", eventTitle: "Diwali Festival of Lights 2026", eventDate: "2026-10-25", eventTime: "6:00 PM", eventVenue: "Sydney Opera House Forecourt", tierName: "VIP", quantity: 2, totalPrice: 120.00, currency: "AUD", status: "confirmed", imageColor: "#FF6B35" },
        { userId: demoUser.id, eventId: "evt-002", eventTitle: "Chinese New Year Gala", eventDate: "2026-02-17", eventTime: "7:30 PM", eventVenue: "Melbourne Convention Centre", tierName: "General", quantity: 1, totalPrice: 45.00, currency: "AUD", status: "used", imageColor: "#E74C3C" },
        { userId: demoUser.id, eventId: "evt-003", eventTitle: "Bollywood Night Live", eventDate: "2026-03-15", eventTime: "8:00 PM", eventVenue: "Darling Harbour Theatre", tierName: "Premium", quantity: 3, totalPrice: 225.00, currency: "AUD", status: "confirmed", imageColor: "#9B59B6" },
        { userId: demoUser.id, eventId: "evt-004", eventTitle: "Cultural Food Festival", eventDate: "2026-04-10", eventTime: "11:00 AM", eventVenue: "Centennial Park", tierName: "General", quantity: 2, totalPrice: 30.00, currency: "AUD", status: "confirmed", imageColor: "#2ECC71" },
      ];
      for (const t of ticketData) {
        await storage.createTicket(t as any);
      }

      // Seed membership for demo user
      await storage.createMembership({ userId: demoUser.id, tier: "plus" } as any);

      // Add funds to demo user wallet
      await storage.addFunds(demoUser.id, 45.50);

      res.json({ message: "Seeded successfully", profiles: seedProfiles.length, sponsors: seedSponsors.length, perks: seedPerks.length, users: 1, tickets: ticketData.length });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

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

  // === Profiles (communities, orgs, venues, businesses, councils, governments) ===
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
        { name: "Auckland Council", slug: "auckland-council", entityType: "council", description: "Auckland's local authority supporting diverse communities and cultural festivals.", category: "Local Government", city: "Auckland", country: "New Zealand", address: "135 Albert Street, Auckland 1010", latitude: -36.8485, longitude: 174.7633, website: "https://aucklandcouncil.govt.nz", socialLinks: { facebook: "https://facebook.com/aucklandcouncil", twitter: "https://twitter.com/aaborroaklcouncil" }, images: [], tags: ["government", "auckland"], followersCount: 9500, rating: 4.1 },
        { name: "Department of Home Affairs", slug: "dept-home-affairs", entityType: "government", description: "Australian Government department responsible for immigration, citizenship, and multicultural affairs.", category: "Federal Government", city: "Canberra", country: "Australia", website: "https://homeaffairs.gov.au", socialLinks: { twitter: "https://twitter.com/AusBorderForce", linkedin: "https://linkedin.com/company/department-of-home-affairs" }, images: [], tags: ["immigration", "citizenship", "multicultural"], followersCount: 25000, rating: 3.8 },
        { name: "Ministry of Ethnic Communities", slug: "ministry-ethnic-communities", entityType: "government", description: "New Zealand government ministry focused on ethnic communities, promoting inclusion and diversity.", category: "National Government", city: "Wellington", country: "New Zealand", website: "https://ethniccommunities.govt.nz", socialLinks: { facebook: "https://facebook.com/ethniccommunities", twitter: "https://twitter.com/ethniccommNZ" }, images: [], tags: ["ethnic", "diversity", "inclusion"], followersCount: 8000, rating: 4.0 },
      ];

      for (const p of seedProfiles) {
        await storage.createProfile(p as any);
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

      res.json({ message: "Seeded successfully", profiles: seedProfiles.length, users: 1 });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

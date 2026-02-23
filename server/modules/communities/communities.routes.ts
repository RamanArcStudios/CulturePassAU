import type { Express, Request, Response } from "express";
import * as communitiesService from "./communities.service";

export function registerCommunitiesRoutes(app: Express) {
  app.get("/api/communities", async (req: Request, res: Response) => {
    try {
      const { type, indigenous } = req.query;
      if (indigenous === "true") {
        const results = await communitiesService.getIndigenousCommunities();
        return res.json(results);
      }
      if (type) {
        const results = await communitiesService.getCommunitiesByType(type as string);
        return res.json(results);
      }
      const results = await communitiesService.getAllCommunities();
      res.json(results);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/communities/user/:userId", async (req: Request, res: Response) => {
    try {
      const results = await communitiesService.getUserCommunities(req.params.userId as string);
      res.json(results);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/communities/:idOrSlug", async (req: Request, res: Response) => {
    try {
      const param = req.params.idOrSlug as string;
      let community = await communitiesService.getCommunityById(param);
      if (!community) {
        community = await communitiesService.getCommunityBySlug(param);
      }
      if (!community) return res.status(404).json({ error: "Community not found" });
      res.json(community);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/communities/join", async (req: Request, res: Response) => {
    try {
      const { userId, communityId } = req.body;
      if (!userId || !communityId) return res.status(400).json({ error: "userId and communityId are required" });
      const result = await communitiesService.joinCommunity(userId, communityId);
      res.json(result);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/communities/leave", async (req: Request, res: Response) => {
    try {
      const { userId, communityId } = req.body;
      if (!userId || !communityId) return res.status(400).json({ error: "userId and communityId are required" });
      const removed = await communitiesService.leaveCommunity(userId, communityId);
      res.json({ success: removed });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/communities/seed", async (_req: Request, res: Response) => {
    try {
      const result = await communitiesService.seedCommunities();
      res.json({ message: "Communities seeded", ...result });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });
}

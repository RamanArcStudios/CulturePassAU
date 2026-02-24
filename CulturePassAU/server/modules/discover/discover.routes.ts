import type { Express, Request, Response } from "express";
import { getDiscoverFeed } from "./discover.service";

const SECTION_TYPE_TO_TITLE: Record<string, string> = {
  nearYou: "Near You",
  yourCommunities: "Your Communities",
  firstNationsSpotlight: "First Nations Spotlight",
  fromYourHomeland: "From Your Homeland",
  recommended: "Recommended For You",
  trending: "Trending Events",
  explore: "Communities to Explore",
};

/** Registers discover-related API routes on the Express app */
export function registerDiscoverRoutes(app: Express) {
  /**
   * GET /api/discover/:userId
   * Returns a personalised discover feed for the given user.
   * Optional query params: city, country
   */
  app.get("/api/discover/:userId", async (req: Request, res: Response) => {
    try {
      const userId = req.params.userId as string;
      const city = req.query.city as string | undefined;
      const country = req.query.country as string | undefined;
      const feed = await getDiscoverFeed(userId, city, country);
      res.json(feed);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  /**
   * GET /api/discover/:userId/section/:sectionType
   * Returns a single section from the discover feed.
   * sectionType: nearYou | yourCommunities | firstNationsSpotlight |
   *              fromYourHomeland | recommended | trending | explore
   */
  app.get("/api/discover/:userId/section/:sectionType", async (req: Request, res: Response) => {
    try {
      const userId = req.params.userId as string;
      const sectionType = req.params.sectionType as string;
      const city = req.query.city as string | undefined;
      const country = req.query.country as string | undefined;

      const title = SECTION_TYPE_TO_TITLE[sectionType];
      if (!title) {
        return res.status(400).json({
          error: `Invalid section type. Must be one of: ${Object.keys(SECTION_TYPE_TO_TITLE).join(", ")}`,
        });
      }

      const feed = await getDiscoverFeed(userId, city, country);
      const section = feed.sections.find((s) => s.title === title);

      if (!section) {
        return res.json({ section: null, meta: feed.meta });
      }

      res.json({ section, meta: feed.meta });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });
}

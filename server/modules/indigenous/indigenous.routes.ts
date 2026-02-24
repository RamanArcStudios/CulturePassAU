import type { Express, Request, Response } from "express";
import { routeParam } from "../route-params";
import * as indigenousService from "./indigenous.service";

export function registerIndigenousRoutes(app: Express) {
  app.get("/api/indigenous/spotlights", async (_req: Request, res: Response) => {
    try {
      const results = await indigenousService.getAllSpotlights();
      res.json(results);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/indigenous/traditional-lands/:city", async (req: Request, res: Response) => {
    try {
      const city = routeParam(req.params.city);
      const country = (req.query.country as string) || "Australia";
      const result = await indigenousService.getTraditionalLand(city, country);
      if (!result) return res.status(404).json({ error: "Traditional land not found" });
      res.json(result);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/indigenous/traditional-lands", async (req: Request, res: Response) => {
    try {
      const { city, country } = req.query;
      if (city && country) {
        const result = await indigenousService.getTraditionalLand(city as string, country as string);
        return res.json(result || null);
      }
      const results = await indigenousService.getAllTraditionalLands();
      res.json(results);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });
}

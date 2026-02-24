import type { Express, Request, Response } from "express";
import { routeParam } from "../route-params";
import * as businessesService from "./businesses.service";

export function registerBusinessesRoutes(app: Express) {
  app.get("/api/businesses", async (req: Request, res: Response) => {
    try {
      const { country, city, category, indigenous } = req.query;
      const results = await businessesService.getAllBusinesses({
        country: country as string | undefined,
        city: city as string | undefined,
        category: category as string | undefined,
        indigenous: indigenous === "true" ? true : indigenous === "false" ? false : undefined,
      });
      res.json(results);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/businesses/:id", async (req: Request, res: Response) => {
    try {
      const business = await businessesService.getBusinessById(routeParam(req.params.id));
      if (!business) return res.status(404).json({ error: "Business not found" });
      res.json(business);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });
}

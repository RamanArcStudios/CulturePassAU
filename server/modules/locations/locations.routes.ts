import type { Express, Request, Response } from "express";
import * as locationsService from "./locations.service";

export function registerLocationsRoutes(app: Express) {
  app.get("/api/locations", async (req: Request, res: Response) => {
    try {
      const { type, countryCode } = req.query;
      if (type) {
        const results = await locationsService.getLocationsByType(type as "country" | "state" | "city");
        return res.json(results);
      }
      if (countryCode) {
        const results = await locationsService.getCitiesByCountry(countryCode as string);
        return res.json(results);
      }
      const results = await locationsService.getAllLocations();
      res.json(results);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/locations/:slug", async (req: Request, res: Response) => {
    try {
      const loc = await locationsService.getLocationBySlug(req.params.slug as string);
      if (!loc) return res.status(404).json({ error: "Location not found" });
      res.json(loc);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/locations/:id/children", async (req: Request, res: Response) => {
    try {
      const children = await locationsService.getChildLocations(req.params.id as string);
      res.json(children);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/locations/seed", async (_req: Request, res: Response) => {
    try {
      const result = await locationsService.seedLocations();
      res.json({ message: "Locations seeded", ...result });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });
}

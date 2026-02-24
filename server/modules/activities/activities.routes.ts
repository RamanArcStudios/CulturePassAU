import type { Express, Request, Response } from "express";
import { routeParam } from "../route-params";
import * as activitiesService from "./activities.service";

export function registerActivitiesRoutes(app: Express) {
  app.get("/api/activities", async (req: Request, res: Response) => {
    try {
      const { country, city, category, indigenous } = req.query;
      const results = await activitiesService.getAllActivities({
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

  app.get("/api/activities/:id", async (req: Request, res: Response) => {
    try {
      const activity = await activitiesService.getActivityById(routeParam(req.params.id));
      if (!activity) return res.status(404).json({ error: "Activity not found" });
      res.json(activity);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });
}

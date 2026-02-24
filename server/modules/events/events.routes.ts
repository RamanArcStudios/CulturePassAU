import type { Express, Request, Response } from "express";
import { routeParam } from "../route-params";
import * as eventsService from "./events.service";

export function registerEventsRoutes(app: Express) {
  app.get("/api/events/search", async (req: Request, res: Response) => {
    try {
      const q = req.query.q as string;
      if (!q) return res.json([]);
      const results = await eventsService.searchEvents(q);
      res.json(results);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/events", async (req: Request, res: Response) => {
    try {
      const { country, city, category, featured } = req.query;
      const results = await eventsService.getAllEvents({
        country: country as string | undefined,
        city: city as string | undefined,
        category: category as string | undefined,
        featured: featured === "true" ? true : featured === "false" ? false : undefined,
      });
      res.json(results);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/events/:id", async (req: Request, res: Response) => {
    try {
      const event = await eventsService.getEventById(routeParam(req.params.id));
      if (!event) return res.status(404).json({ error: "Event not found" });
      res.json(event);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });
}

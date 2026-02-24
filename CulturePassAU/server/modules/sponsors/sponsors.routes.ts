import type { Express, Request, Response } from "express";
import * as sponsorsService from "./sponsors.service";

function p(val: string | string[]): string { return Array.isArray(val) ? val[0] : val; }

export function registerSponsorsRoutes(app: Express) {
  app.get("/api/sponsors", async (_req: Request, res: Response) => {
    const sponsors = await sponsorsService.getAllSponsors();
    res.json(sponsors);
  });

  app.get("/api/sponsors/:id", async (req: Request, res: Response) => {
    const sponsor = await sponsorsService.getSponsor(p(req.params.id));
    if (!sponsor) return res.status(404).json({ error: "Sponsor not found" });
    res.json(sponsor);
  });

  app.post("/api/sponsors", async (req: Request, res: Response) => {
    try {
      const sponsor = await sponsorsService.createSponsor(req.body);
      res.status(201).json(sponsor);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.put("/api/sponsors/:id", async (req: Request, res: Response) => {
    const sponsor = await sponsorsService.updateSponsor(p(req.params.id), req.body);
    if (!sponsor) return res.status(404).json({ error: "Sponsor not found" });
    res.json(sponsor);
  });

  app.delete("/api/sponsors/:id", async (req: Request, res: Response) => {
    const deleted = await sponsorsService.deleteSponsor(p(req.params.id));
    if (!deleted) return res.status(404).json({ error: "Sponsor not found" });
    res.json({ success: true });
  });

  app.get("/api/event-sponsors/:eventId", async (req: Request, res: Response) => {
    const sponsors = await sponsorsService.getEventSponsors(p(req.params.eventId));
    res.json(sponsors);
  });

  app.post("/api/event-sponsors", async (req: Request, res: Response) => {
    const { eventId, sponsorId, tier } = req.body;
    const es = await sponsorsService.addEventSponsor(eventId, sponsorId, tier || "bronze");
    res.status(201).json(es);
  });

  app.delete("/api/event-sponsors/:id", async (req: Request, res: Response) => {
    const deleted = await sponsorsService.removeEventSponsor(p(req.params.id));
    if (!deleted) return res.status(404).json({ error: "Event sponsor not found" });
    res.json({ success: true });
  });

  app.get("/api/sponsor-placements", async (req: Request, res: Response) => {
    const type = req.query.type as string;
    const placements = await sponsorsService.getActivePlacements(type);
    res.json(placements);
  });

  app.post("/api/sponsor-placements", async (req: Request, res: Response) => {
    const placement = await sponsorsService.createPlacement(req.body);
    res.status(201).json(placement);
  });
}

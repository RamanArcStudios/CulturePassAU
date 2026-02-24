import type { Express, Request, Response } from "express";
import * as profilesService from "./profiles.service";

function p(val: string | string[]): string { return Array.isArray(val) ? val[0] : val; }

export function registerProfilesRoutes(app: Express) {
  app.get("/api/profiles", async (req: Request, res: Response) => {
    const entityType = req.query.type as string;
    const profiles = entityType
      ? await profilesService.getProfilesByType(entityType)
      : await profilesService.getAllProfiles();
    res.json(profiles);
  });

  app.get("/api/profiles/:id", async (req: Request, res: Response) => {
    const profile = await profilesService.getProfile(p(req.params.id)) || await profilesService.getProfileBySlug(p(req.params.id));
    if (!profile) return res.status(404).json({ error: "Profile not found" });
    res.json(profile);
  });

  app.post("/api/profiles", async (req: Request, res: Response) => {
    try {
      const profile = await profilesService.createProfile(req.body);
      res.status(201).json(profile);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.put("/api/profiles/:id", async (req: Request, res: Response) => {
    const profile = await profilesService.updateProfile(p(req.params.id), req.body);
    if (!profile) return res.status(404).json({ error: "Profile not found" });
    res.json(profile);
  });

  app.delete("/api/profiles/:id", async (req: Request, res: Response) => {
    const deleted = await profilesService.deleteProfile(p(req.params.id));
    if (!deleted) return res.status(404).json({ error: "Profile not found" });
    res.json({ success: true });
  });
}

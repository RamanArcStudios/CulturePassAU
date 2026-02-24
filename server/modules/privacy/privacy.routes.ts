import type { Express, Request, Response } from "express";
import * as privacyService from "./privacy.service";

function p(val: string | string[]): string { return Array.isArray(val) ? val[0] : val; }

export function registerPrivacyRoutes(app: Express) {
  app.get("/api/privacy/settings/:userId", async (req: Request, res: Response) => {
    try {
      const settings = await privacyService.getPrivacySettings(p(req.params.userId));
      res.json(settings);
    } catch (e: any) {
      if (e.message === "User not found") {
        return res.status(404).json({ error: e.message });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/privacy/settings/:userId", async (req: Request, res: Response) => {
    try {
      const settings = await privacyService.updatePrivacySettings(p(req.params.userId), req.body);
      res.json(settings);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });
}

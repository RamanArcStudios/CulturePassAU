import type { Express, Request, Response } from "express";
import { generateCpid, lookupCpid, getAllRegistryEntries } from "../../cpid";

function p(val: string | string[]): string { return Array.isArray(val) ? val[0] : val; }

export function registerCpidRoutes(app: Express) {
  app.get("/api/cpid/registry", async (_req: Request, res: Response) => {
    const entries = await getAllRegistryEntries();
    res.json(entries);
  });

  app.get("/api/cpid/lookup/:cpid", async (req: Request, res: Response) => {
    const result = await lookupCpid(p(req.params.cpid));
    if (!result) return res.status(404).json({ error: "CPID not found" });
    res.json(result);
  });

  app.post("/api/cpid/generate", async (req: Request, res: Response) => {
    try {
      const { targetId, entityType } = req.body;
      if (!targetId || !entityType) return res.status(400).json({ error: "targetId and entityType are required" });
      const cpid = await generateCpid(targetId, entityType);
      res.json({ culturePassId: cpid, targetId, entityType });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });
}

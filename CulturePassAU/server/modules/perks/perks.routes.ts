import type { Express, Request, Response } from "express";
import * as perksService from "./perks.service";

function p(val: string | string[]): string { return Array.isArray(val) ? val[0] : val; }

export function registerPerksRoutes(app: Express) {
  app.get("/api/perks", async (req: Request, res: Response) => {
    const category = req.query.category as string;
    const perks = category
      ? await perksService.getPerksByCategory(category)
      : await perksService.getAllPerks();
    res.json(perks);
  });

  app.get("/api/perks/:id", async (req: Request, res: Response) => {
    const perk = await perksService.getPerk(p(req.params.id));
    if (!perk) return res.status(404).json({ error: "Perk not found" });
    res.json(perk);
  });

  app.post("/api/perks", async (req: Request, res: Response) => {
    try {
      const perk = await perksService.createPerk(req.body);
      res.status(201).json(perk);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.put("/api/perks/:id", async (req: Request, res: Response) => {
    const perk = await perksService.updatePerk(p(req.params.id), req.body);
    if (!perk) return res.status(404).json({ error: "Perk not found" });
    res.json(perk);
  });

  app.delete("/api/perks/:id", async (req: Request, res: Response) => {
    const deleted = await perksService.deletePerk(p(req.params.id));
    if (!deleted) return res.status(404).json({ error: "Perk not found" });
    res.json({ success: true });
  });

  app.post("/api/perks/:id/redeem", async (req: Request, res: Response) => {
    const { userId, transactionId } = req.body;
    const redemption = await perksService.redeemPerk(p(req.params.id), userId, transactionId);
    if (!redemption) return res.status(400).json({ error: "Cannot redeem perk - limit reached or perk expired" });
    res.json(redemption);
  });

  app.get("/api/redemptions/:userId", async (req: Request, res: Response) => {
    const redemptions = await perksService.getUserRedemptions(p(req.params.userId));
    res.json(redemptions);
  });
}

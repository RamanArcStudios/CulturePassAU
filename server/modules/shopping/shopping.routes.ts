import type { Express, Request, Response } from "express";
import * as shoppingService from "./shopping.service";

export function registerShoppingRoutes(app: Express) {
  app.get("/api/shopping", async (req: Request, res: Response) => {
    try {
      const { country, city, category } = req.query;
      const results = await shoppingService.getAllShopping({
        country: country as string | undefined,
        city: city as string | undefined,
        category: category as string | undefined,
      });
      res.json(results);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/shopping/:id", async (req: Request, res: Response) => {
    try {
      const item = await shoppingService.getShoppingById(req.params.id);
      if (!item) return res.status(404).json({ error: "Shopping item not found" });
      res.json(item);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });
}

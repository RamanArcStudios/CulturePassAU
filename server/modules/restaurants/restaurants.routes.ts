import type { Express, Request, Response } from "express";
import { routeParam } from "../route-params";
import * as restaurantsService from "./restaurants.service";

export function registerRestaurantsRoutes(app: Express) {
  app.get("/api/restaurants", async (req: Request, res: Response) => {
    try {
      const { country, city, cuisine } = req.query;
      const results = await restaurantsService.getAllRestaurants({
        country: country as string | undefined,
        city: city as string | undefined,
        cuisine: cuisine as string | undefined,
      });
      res.json(results);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/restaurants/:id", async (req: Request, res: Response) => {
    try {
      const restaurant = await restaurantsService.getRestaurantById(routeParam(req.params.id));
      if (!restaurant) return res.status(404).json({ error: "Restaurant not found" });
      res.json(restaurant);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });
}

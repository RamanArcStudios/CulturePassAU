import type { Express, Request, Response } from "express";
import { routeParam } from "../route-params";
import * as moviesService from "./movies.service";

export function registerMoviesRoutes(app: Express) {
  app.get("/api/movies", async (req: Request, res: Response) => {
    try {
      const { country, city, genre, trending } = req.query;
      const results = await moviesService.getAllMovies({
        country: country as string | undefined,
        city: city as string | undefined,
        genre: genre as string | undefined,
        trending: trending === "true" ? true : trending === "false" ? false : undefined,
      });
      res.json(results);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/movies/:id", async (req: Request, res: Response) => {
    try {
      const movie = await moviesService.getMovieById(routeParam(req.params.id));
      if (!movie) return res.status(404).json({ error: "Movie not found" });
      res.json(movie);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });
}

import type { Express, Request, Response } from "express";
import * as usersService from "./users.service";

function p(val: string | string[]): string { return Array.isArray(val) ? val[0] : val; }

export function registerUsersRoutes(app: Express) {
  app.get("/api/users", async (_req: Request, res: Response) => {
    const users = await usersService.getAllUsers();
    res.json(users);
  });

  app.get("/api/users/:id", async (req: Request, res: Response) => {
    const user = await usersService.getUser(p(req.params.id));
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  });

  app.post("/api/users", async (req: Request, res: Response) => {
    try {
      const user = await usersService.createUser(req.body);
      res.status(201).json(user);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.put("/api/users/:id", async (req: Request, res: Response) => {
    const user = await usersService.updateUser(p(req.params.id), req.body);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  });
}

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

  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const { username, password, displayName, email } = req.body;

      // Check if username already exists
      const existingUser = await usersService.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ error: "Username already taken" });
      }

      // Create new user
      const user = await usersService.createUser({ username, password });
      const updatedUser = await usersService.updateUser(user.id, { displayName, email });

      // Return user without password
      res.status(201).json({
        user: {
          id: updatedUser?.id ?? user.id,
          username: updatedUser?.username ?? user.username,
          displayName: updatedUser?.displayName ?? user.displayName,
          email: updatedUser?.email ?? user.email,
        },
      });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;

      // Look up user by username
      const user = await usersService.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ error: "Invalid username or password" });
      }

      // Compare password directly (plain text for MVP)
      if (user.password !== password) {
        return res.status(401).json({ error: "Invalid username or password" });
      }

      // Return user without password
      res.json({
        user: {
          id: user.id,
          username: user.username,
          displayName: user.displayName,
          email: user.email,
        },
      });
    } catch (e: any) {
      res.status(401).json({ error: e.message });
    }
  });
}

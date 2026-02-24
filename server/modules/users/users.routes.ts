import type { Express, Request, Response } from "express";
import { rateLimit } from "express-rate-limit";
import { z } from "zod";
import * as usersService from "./users.service";

function p(val: string | string[]): string { return Array.isArray(val) ? val[0] : val; }

const privacySettingsSchema = z.object({
  profileVisibility: z.boolean(),
  dataSharing: z.boolean(),
  activityStatus: z.boolean(),
  showLocation: z.boolean(),
});

const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many attempts, please try again later." },
});

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

  app.get("/api/users/:id/privacy", async (req: Request, res: Response) => {
    try {
      const settings = await usersService.getPrivacySettings(p(req.params.id));
      res.json(settings);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.put("/api/users/:id/privacy", async (req: Request, res: Response) => {
    try {
      const parsed = privacySettingsSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid privacy settings payload", details: parsed.error.issues });
      }
      await usersService.updatePrivacySettings(p(req.params.id), parsed.data);
      res.json({ ok: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/auth/register", authRateLimit, async (req: Request, res: Response) => {
    try {
      const { username, password, displayName, email } = req.body;

      // Check if username already exists
      const existingUser = await usersService.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ error: "Username already taken" });
      }

      // Create new user (password is hashed inside createUser)
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

  app.post("/api/auth/login", authRateLimit, async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;

      // Look up user by username
      const user = await usersService.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ error: "Invalid username or password" });
      }

      // Verify password using bcrypt
      const passwordValid = await usersService.verifyPassword(password, user.password);
      if (!passwordValid) {
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

  app.delete("/api/auth/account", authRateLimit, async (req: Request, res: Response) => {
    try {
      const { userId, password } = req.body;
      if (!userId || !password) {
        return res.status(400).json({ error: "userId and password are required" });
      }

      const user = await usersService.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Require password re-confirmation before deletion
      const passwordValid = await usersService.verifyPassword(password, user.password);
      if (!passwordValid) {
        return res.status(401).json({ error: "Incorrect password" });
      }

      await usersService.deleteUser(userId);
      res.json({ ok: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });
}

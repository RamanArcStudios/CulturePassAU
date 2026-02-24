import type { Express, Request, Response } from "express";
import { randomBytes, scryptSync, timingSafeEqual, createHmac } from "node:crypto";
import * as usersService from "./users.service";
import { rateLimit } from "../../errors";

function p(val: string | string[]): string { return Array.isArray(val) ? val[0] : val; }

const AUTH_SECRET = process.env.AUTH_SECRET ?? "cp-dev-secret-change-in-prod";
if (process.env.NODE_ENV === "production" && !process.env.AUTH_SECRET) {
  console.warn("WARNING: AUTH_SECRET env var is not set. Using insecure default — set AUTH_SECRET before deploying.");
}
const TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, stored: string): boolean {
  const [salt, hashHex] = stored.split(":");
  if (!salt || !hashHex) return false;
  const inputHash = scryptSync(password, salt, 64);
  const storedHash = Buffer.from(hashHex, "hex");
  if (inputHash.length !== storedHash.length) return false;
  return timingSafeEqual(inputHash, storedHash);
}

function issueToken(userId: string, username: string): string {
  const payload = Buffer.from(
    JSON.stringify({ uid: userId, usr: username, iat: Date.now(), exp: Date.now() + TOKEN_TTL_MS })
  ).toString("base64url");
  const sig = createHmac("sha256", AUTH_SECRET).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

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

      // Create new user with hashed password
      const user = await usersService.createUser({ username, password: hashPassword(password) });
      const updatedUser = await usersService.updateUser(user.id, { displayName, email });

      const resolvedUser = {
        id: updatedUser?.id ?? user.id,
        username: updatedUser?.username ?? user.username,
        displayName: updatedUser?.displayName ?? user.displayName,
        email: updatedUser?.email ?? user.email,
      };

      // Return user without password plus a signed auth token
      res.status(201).json({
        user: resolvedUser,
        token: issueToken(resolvedUser.id, resolvedUser.username),
      });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
      if (!rateLimit(`auth:login:${clientIp}`, 10, 60000)) {
        return res.status(429).json({ error: "Too many login attempts. Please try again later." });
      }

      const { username, password } = req.body;

      // Look up user by username
      const user = await usersService.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ error: "Invalid username or password" });
      }

      // Verify password using constant-time hash comparison
      if (!verifyPassword(password, user.password)) {
        return res.status(401).json({ error: "Invalid username or password" });
      }

      // Return user without password plus a signed auth token
      res.json({
        user: {
          id: user.id,
          username: user.username,
          displayName: user.displayName,
          email: user.email,
        },
        token: issueToken(user.id, user.username),
      });
    } catch (e: any) {
      res.status(401).json({ error: e.message });
    }
  });

  app.delete("/api/account/:id", async (req: Request, res: Response) => {
    try {
      const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
      if (!rateLimit(`auth:delete:${clientIp}`, 5, 60000)) {
        return res.status(429).json({ error: "Too many requests. Please try again later." });
      }

      const { password } = req.body;
      if (!password) {
        return res.status(400).json({ error: "Password is required to confirm deletion" });
      }

      const user = await usersService.getUser(p(req.params.id));
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      if (!verifyPassword(password, user.password)) {
        return res.status(401).json({ error: "Incorrect password" });
      }

      const deleted = await usersService.deleteUser(p(req.params.id));
      if (!deleted) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });
}

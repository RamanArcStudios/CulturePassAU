import type { Express, Request, Response } from "express";
import * as ticketsService from "../tickets/tickets.service";
import * as usersService from "../users/users.service";
import * as perksService from "../perks/perks.service";
import { db } from "../../db";
import { eq } from "drizzle-orm";
import { movies, restaurants, activities, shopping, communities } from "@shared/schema";

export function registerDashboardRoutes(app: Express) {
  app.post("/api/dashboard/login", async (req: Request, res: Response) => {
    const { username, password } = req.body;
    const adminPassword = process.env.ADMIN_USER_PASSWORD || "admin123";
    if (username === "admin" && password === adminPassword) {
      res.json({ success: true });
    } else {
      res.status(401).json({ success: false, error: "Invalid credentials" });
    }
  });

  app.get("/api/dashboard/stats", async (_req: Request, res: Response) => {
    try {
      const allTickets = await ticketsService.getAllTickets();
      const allUsers = await usersService.getAllUsers();
      const allPerks = await perksService.getAllPerks();

      const totalRevenue = allTickets.reduce((sum, t) => sum + (t.totalPrice || 0), 0);
      const platformRevenue = allTickets.reduce((sum, t) => sum + (t.platformFee || 0), 0);
      const organizerRevenue = allTickets.reduce((sum, t) => sum + (t.organizerAmount || 0), 0);
      const scannedTickets = allTickets.filter(t => t.status === 'used').length;
      const confirmedTickets = allTickets.filter(t => t.status === 'confirmed').length;
      const cancelledTickets = allTickets.filter(t => t.status === 'cancelled').length;

      const eventMap = new Map<string, { eventId: string; eventTitle: string; tickets: number; revenue: number; scanned: number; organizerAmount: number }>();
      for (const t of allTickets) {
        const existing = eventMap.get(t.eventId) || { eventId: t.eventId, eventTitle: t.eventTitle, tickets: 0, revenue: 0, scanned: 0, organizerAmount: 0 };
        existing.tickets += (t.quantity || 1);
        existing.revenue += (t.totalPrice || 0);
        existing.organizerAmount += (t.organizerAmount || 0);
        if (t.status === 'used') existing.scanned += (t.quantity || 1);
        eventMap.set(t.eventId, existing);
      }

      res.json({
        totalTickets: allTickets.length,
        confirmedTickets,
        scannedTickets,
        cancelledTickets,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        platformRevenue: Math.round(platformRevenue * 100) / 100,
        organizerRevenue: Math.round(organizerRevenue * 100) / 100,
        totalUsers: allUsers.length,
        totalPerks: allPerks.length,
        eventBreakdown: Array.from(eventMap.values()).sort((a, b) => b.revenue - a.revenue),
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/dashboard/promotions", async (_req: Request, res: Response) => {
    try {
      const [moviesData, restaurantsData, activitiesData, shoppingData, communitiesData] = await Promise.all([
        db.select({ id: movies.id, name: movies.title, isPromoted: movies.isPromoted }).from(movies),
        db.select({ id: restaurants.id, name: restaurants.name, isPromoted: restaurants.isPromoted }).from(restaurants),
        db.select({ id: activities.id, name: activities.name, isPromoted: activities.isPromoted }).from(activities),
        db.select({ id: shopping.id, name: shopping.name, isPromoted: shopping.isPromoted }).from(shopping),
        db.select({ id: communities.id, name: communities.name, isPromoted: communities.isPromoted }).from(communities),
      ]);

      res.json({
        movies: moviesData,
        restaurants: restaurantsData,
        activities: activitiesData,
        shopping: shoppingData,
        communities: communitiesData,
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.patch("/api/dashboard/promotions", async (req: Request, res: Response) => {
    try {
      const { table, id, isPromoted } = req.body;

      const allowedTables = ["movies", "restaurants", "activities", "shopping", "communities"];
      if (!allowedTables.includes(table)) {
        return res.status(400).json({ error: "Invalid table name" });
      }

      let tableRef: any;
      switch (table) {
        case "movies":
          tableRef = movies;
          break;
        case "restaurants":
          tableRef = restaurants;
          break;
        case "activities":
          tableRef = activities;
          break;
        case "shopping":
          tableRef = shopping;
          break;
        case "communities":
          tableRef = communities;
          break;
      }

      await db.update(tableRef).set({ isPromoted }).where(eq(tableRef.id, id));

      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });
}

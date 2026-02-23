import type { Express, Request, Response } from "express";
import * as ticketsService from "../tickets/tickets.service";
import * as usersService from "../users/users.service";
import * as perksService from "../perks/perks.service";

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
}

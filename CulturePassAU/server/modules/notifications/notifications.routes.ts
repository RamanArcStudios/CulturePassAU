import type { Express, Request, Response } from "express";
import * as notificationsService from "./notifications.service";

function p(val: string | string[]): string { return Array.isArray(val) ? val[0] : val; }

export function registerNotificationsRoutes(app: Express) {
  app.get("/api/notifications/:userId", async (req: Request, res: Response) => {
    const notifs = await notificationsService.getNotifications(p(req.params.userId));
    res.json(notifs);
  });

  app.get("/api/notifications/:userId/unread-count", async (req: Request, res: Response) => {
    const count = await notificationsService.getUnreadCount(p(req.params.userId));
    res.json({ count });
  });

  app.post("/api/notifications", async (req: Request, res: Response) => {
    try {
      const notif = await notificationsService.createNotification(req.body);
      res.status(201).json(notif);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.put("/api/notifications/:id/read", async (req: Request, res: Response) => {
    const notif = await notificationsService.markNotificationRead(p(req.params.id));
    if (!notif) return res.status(404).json({ error: "Notification not found" });
    res.json(notif);
  });

  app.put("/api/notifications/:userId/read-all", async (req: Request, res: Response) => {
    await notificationsService.markAllNotificationsRead(p(req.params.userId));
    res.json({ success: true });
  });

  app.delete("/api/notifications/:id", async (req: Request, res: Response) => {
    const deleted = await notificationsService.deleteNotification(p(req.params.id));
    if (!deleted) return res.status(404).json({ error: "Notification not found" });
    res.json({ success: true });
  });
}

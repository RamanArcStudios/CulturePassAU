import { db } from "../../db";
import { eq, and, desc } from "drizzle-orm";
import {
  notifications,
  type Notification, type InsertNotification,
} from "@shared/schema";

/** Returns all notifications for a user ordered by date descending */
export async function getNotifications(userId: string): Promise<Notification[]> {
  return db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt));
}

/** Returns the count of unread notifications for a user */
export async function getUnreadCount(userId: string): Promise<number> {
  const result = await db.select().from(notifications).where(
    and(eq(notifications.userId, userId), eq(notifications.isRead, false))
  );
  return result.length;
}

/** Creates a new notification */
export async function createNotification(data: InsertNotification): Promise<Notification> {
  const [n] = await db.insert(notifications).values(data).returning();
  return n;
}

/** Marks a single notification as read */
export async function markNotificationRead(id: string): Promise<Notification | undefined> {
  const [n] = await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, id)).returning();
  return n;
}

/** Marks all notifications as read for a user */
export async function markAllNotificationsRead(userId: string): Promise<boolean> {
  await db.update(notifications).set({ isRead: true }).where(eq(notifications.userId, userId));
  return true;
}

/** Deletes a notification by ID */
export async function deleteNotification(id: string): Promise<boolean> {
  const result = await db.delete(notifications).where(eq(notifications.id, id)).returning();
  return result.length > 0;
}

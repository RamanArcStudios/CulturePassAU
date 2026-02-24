import { db } from "../../db";
import { eq, and, ilike, inArray, sql } from "drizzle-orm";
import { events, type Event } from "@shared/schema";

export async function getAllEvents(filters?: {
  country?: string;
  city?: string;
  category?: string;
  featured?: boolean;
}): Promise<Event[]> {
  const conditions: any[] = [];
  if (filters?.country) conditions.push(eq(events.country, filters.country));
  if (filters?.city) conditions.push(eq(events.city, filters.city));
  if (filters?.category) conditions.push(eq(events.category, filters.category));
  if (filters?.featured !== undefined) conditions.push(eq(events.isFeatured, filters.featured));
  const where = conditions.length > 0 ? and(...conditions) : undefined;
  return where ? db.select().from(events).where(where) : db.select().from(events);
}

export async function getEventById(id: string): Promise<Event | undefined> {
  const [e] = await db.select().from(events).where(eq(events.id, id));
  return e;
}

export async function getEventsByIds(ids: string[]): Promise<Event[]> {
  if (ids.length === 0) return [];
  return db.select().from(events).where(inArray(events.id, ids));
}

export async function searchEvents(query: string): Promise<Event[]> {
  const pattern = `%${query}%`;
  return db
    .select()
    .from(events)
    .where(
      sql`${ilike(events.title, pattern)} OR ${ilike(events.description, pattern)}`
    );
}

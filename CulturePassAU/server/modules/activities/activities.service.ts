import { db } from "../../db";
import { eq, and, sql } from "drizzle-orm";
import { activities, type Activity } from "@shared/schema";

export async function getAllActivities(filters?: {
  country?: string;
  city?: string;
  category?: string;
  indigenous?: boolean;
}): Promise<Activity[]> {
  const conditions: any[] = [];
  if (filters?.country) conditions.push(eq(activities.country, filters.country));
  if (filters?.city) conditions.push(eq(activities.city, filters.city));
  if (filters?.category) conditions.push(eq(activities.category, filters.category));
  if (filters?.indigenous !== undefined) {
    conditions.push(sql`jsonb_array_length(COALESCE(${activities.indigenousTags}, '[]'::jsonb)) > 0`);
  }
  const where = conditions.length > 0 ? and(...conditions) : undefined;
  return where ? db.select().from(activities).where(where) : db.select().from(activities);
}

export async function getActivityById(id: string): Promise<Activity | undefined> {
  const [a] = await db.select().from(activities).where(eq(activities.id, id));
  return a;
}

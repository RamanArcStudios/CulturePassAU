import { db } from "../../db";
import { eq, and } from "drizzle-orm";
import { restaurants, type Restaurant } from "@shared/schema";

export async function getAllRestaurants(filters?: {
  country?: string;
  city?: string;
  cuisine?: string;
}): Promise<Restaurant[]> {
  const conditions: any[] = [];
  if (filters?.country) conditions.push(eq(restaurants.country, filters.country));
  if (filters?.city) conditions.push(eq(restaurants.city, filters.city));
  if (filters?.cuisine) conditions.push(eq(restaurants.cuisine, filters.cuisine));
  const where = conditions.length > 0 ? and(...conditions) : undefined;
  return where ? db.select().from(restaurants).where(where) : db.select().from(restaurants);
}

export async function getRestaurantById(id: string): Promise<Restaurant | undefined> {
  const [r] = await db.select().from(restaurants).where(eq(restaurants.id, id));
  return r;
}

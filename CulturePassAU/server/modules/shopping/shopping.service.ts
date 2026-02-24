import { db } from "../../db";
import { eq, and } from "drizzle-orm";
import { shopping, type Shopping } from "@shared/schema";

export async function getAllShopping(filters?: {
  country?: string;
  city?: string;
  category?: string;
}): Promise<Shopping[]> {
  const conditions: any[] = [];
  if (filters?.country) conditions.push(eq(shopping.country, filters.country));
  if (filters?.city) conditions.push(eq(shopping.city, filters.city));
  if (filters?.category) conditions.push(eq(shopping.category, filters.category));
  const where = conditions.length > 0 ? and(...conditions) : undefined;
  return where ? db.select().from(shopping).where(where) : db.select().from(shopping);
}

export async function getShoppingById(id: string): Promise<Shopping | undefined> {
  const [s] = await db.select().from(shopping).where(eq(shopping.id, id));
  return s;
}

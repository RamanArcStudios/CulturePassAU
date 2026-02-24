import { db } from "../../db";
import { eq, and } from "drizzle-orm";
import { businesses, type Business } from "@shared/schema";

export async function getAllBusinesses(filters?: {
  country?: string;
  city?: string;
  category?: string;
  indigenous?: boolean;
}): Promise<Business[]> {
  const conditions: any[] = [];
  if (filters?.country) conditions.push(eq(businesses.country, filters.country));
  if (filters?.city) conditions.push(eq(businesses.city, filters.city));
  if (filters?.category) conditions.push(eq(businesses.category, filters.category));
  if (filters?.indigenous !== undefined) conditions.push(eq(businesses.isIndigenousOwned, filters.indigenous));
  const where = conditions.length > 0 ? and(...conditions) : undefined;
  return where ? db.select().from(businesses).where(where) : db.select().from(businesses);
}

export async function getBusinessById(id: string): Promise<Business | undefined> {
  const [b] = await db.select().from(businesses).where(eq(businesses.id, id));
  return b;
}

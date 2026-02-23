import { db } from "../../db";
import { eq, and } from "drizzle-orm";
import {
  indigenousSpotlights,
  traditionalLands,
  type IndigenousSpotlight,
  type TraditionalLand,
} from "@shared/schema";

export async function getAllSpotlights(): Promise<IndigenousSpotlight[]> {
  return db.select().from(indigenousSpotlights);
}

export async function getTraditionalLand(
  city: string,
  country: string
): Promise<TraditionalLand | undefined> {
  const [tl] = await db
    .select()
    .from(traditionalLands)
    .where(and(eq(traditionalLands.city, city), eq(traditionalLands.country, country)));
  return tl;
}

export async function getAllTraditionalLands(): Promise<TraditionalLand[]> {
  return db.select().from(traditionalLands);
}

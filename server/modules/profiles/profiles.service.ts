import { db } from "../../db";
import { eq, desc } from "drizzle-orm";
import {
  profiles,
  type Profile, type InsertProfile,
} from "@shared/schema";

/** Retrieves a profile by its unique ID */
export async function getProfile(id: string): Promise<Profile | undefined> {
  const [profile] = await db.select().from(profiles).where(eq(profiles.id, id));
  return profile;
}

/** Retrieves a profile by its URL slug */
export async function getProfileBySlug(slug: string): Promise<Profile | undefined> {
  const [profile] = await db.select().from(profiles).where(eq(profiles.slug, slug));
  return profile;
}

/** Returns all profiles matching a specific entity type */
export async function getProfilesByType(entityType: Profile["entityType"]): Promise<Profile[]> {
  return db.select().from(profiles).where(eq(profiles.entityType, entityType)).orderBy(desc(profiles.createdAt));
}

/** Returns all profiles ordered by creation date descending */
export async function getAllProfiles(): Promise<Profile[]> {
  return db.select().from(profiles).orderBy(desc(profiles.createdAt));
}

/** Creates a new profile */
export async function createProfile(data: InsertProfile): Promise<Profile> {
  const [profile] = await db.insert(profiles).values(data).returning();
  return profile;
}

/** Updates an existing profile by ID */
export async function updateProfile(id: string, data: Partial<Profile>): Promise<Profile | undefined> {
  const [profile] = await db.update(profiles).set({ ...data, updatedAt: new Date() }).where(eq(profiles.id, id)).returning();
  return profile;
}

/** Deletes a profile by ID, returns true if deleted */
export async function deleteProfile(id: string): Promise<boolean> {
  const result = await db.delete(profiles).where(eq(profiles.id, id)).returning();
  return result.length > 0;
}

import { db } from "../../db";
import { eq, and, desc, lte, gte } from "drizzle-orm";
import {
  sponsors, eventSponsors, sponsorPlacements,
  type Sponsor, type InsertSponsor,
  type EventSponsor, type SponsorPlacement,
} from "@shared/schema";

/** Retrieves a sponsor by ID */
export async function getSponsor(id: string): Promise<Sponsor | undefined> {
  const [s] = await db.select().from(sponsors).where(eq(sponsors.id, id));
  return s;
}

/** Returns all active sponsors */
export async function getAllSponsors(): Promise<Sponsor[]> {
  return db.select().from(sponsors).where(eq(sponsors.status, "active")).orderBy(desc(sponsors.createdAt));
}

/** Creates a new sponsor */
export async function createSponsor(data: InsertSponsor): Promise<Sponsor> {
  const [s] = await db.insert(sponsors).values(data).returning();
  return s;
}

/** Updates a sponsor by ID */
export async function updateSponsor(id: string, data: Partial<Sponsor>): Promise<Sponsor | undefined> {
  const [s] = await db.update(sponsors).set(data).where(eq(sponsors.id, id)).returning();
  return s;
}

/** Soft-deletes a sponsor by archiving it */
export async function deleteSponsor(id: string): Promise<boolean> {
  const result = await db.update(sponsors).set({ status: "archived" }).where(eq(sponsors.id, id)).returning();
  return result.length > 0;
}

/** Returns all sponsors associated with an event, with sponsor details */
export async function getEventSponsors(eventId: string): Promise<(EventSponsor & { sponsor?: Sponsor })[]> {
  const es = await db.select().from(eventSponsors).where(eq(eventSponsors.eventId, eventId)).orderBy(desc(eventSponsors.logoPriority));
  const results = [];
  for (const e of es) {
    const sponsor = await getSponsor(e.sponsorId);
    results.push({ ...e, sponsor });
  }
  return results;
}

/** Adds a sponsor to an event with a tier level */
export async function addEventSponsor(eventId: string, sponsorId: string, tier: string): Promise<EventSponsor> {
  const [es] = await db.insert(eventSponsors).values({ eventId, sponsorId, tier }).returning();
  return es;
}

/** Removes an event sponsor association */
export async function removeEventSponsor(id: string): Promise<boolean> {
  const result = await db.delete(eventSponsors).where(eq(eventSponsors.id, id)).returning();
  return result.length > 0;
}

/** Returns active sponsor placements, optionally filtered by type */
export async function getActivePlacements(placementType?: string): Promise<(SponsorPlacement & { sponsor?: Sponsor })[]> {
  const now = new Date();
  let query = db.select().from(sponsorPlacements);
  const placements = placementType
    ? await query.where(and(eq(sponsorPlacements.placementType, placementType), lte(sponsorPlacements.startDate!, now), gte(sponsorPlacements.endDate!, now))).orderBy(desc(sponsorPlacements.weight))
    : await query.orderBy(desc(sponsorPlacements.weight));
  const results = [];
  for (const p of placements) {
    const sponsor = await getSponsor(p.sponsorId);
    results.push({ ...p, sponsor });
  }
  return results;
}

/** Creates a new sponsor placement */
export async function createPlacement(data: Partial<SponsorPlacement>): Promise<SponsorPlacement> {
  const [p] = await db.insert(sponsorPlacements).values(data as any).returning();
  return p;
}

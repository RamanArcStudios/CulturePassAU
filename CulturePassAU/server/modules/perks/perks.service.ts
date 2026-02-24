import { db } from "../../db";
import { eq, and, desc, sql } from "drizzle-orm";
import {
  perks, perkRedemptions,
  type Perk, type InsertPerk,
  type PerkRedemption,
} from "@shared/schema";

/** Retrieves a perk by its unique ID */
export async function getPerk(id: string): Promise<Perk | undefined> {
  const [p] = await db.select().from(perks).where(eq(perks.id, id));
  return p;
}

/** Returns all active perks */
export async function getAllPerks(): Promise<Perk[]> {
  return db.select().from(perks).where(eq(perks.status, "active")).orderBy(desc(perks.createdAt));
}

/** Returns active perks filtered by category */
export async function getPerksByCategory(category: string): Promise<Perk[]> {
  return db.select().from(perks).where(and(eq(perks.status, "active"), eq(perks.category!, category))).orderBy(desc(perks.createdAt));
}

/** Creates a new perk */
export async function createPerk(data: InsertPerk): Promise<Perk> {
  const [p] = await db.insert(perks).values(data).returning();
  return p;
}

/** Updates an existing perk by ID */
export async function updatePerk(id: string, data: Partial<Perk>): Promise<Perk | undefined> {
  const [p] = await db.update(perks).set({ ...data, updatedAt: new Date() }).where(eq(perks.id, id)).returning();
  return p;
}

/** Soft-deletes a perk by archiving it */
export async function deletePerk(id: string): Promise<boolean> {
  const result = await db.update(perks).set({ status: "archived" }).where(eq(perks.id, id)).returning();
  return result.length > 0;
}

/** Redeems a perk for a user if limits allow, returns null if not redeemable */
export async function redeemPerk(perkId: string, userId: string, transactionId?: string): Promise<PerkRedemption | null> {
  const perk = await getPerk(perkId);
  if (!perk || perk.status !== "active") return null;

  if (perk.usageLimit && (perk.usedCount || 0) >= perk.usageLimit) return null;

  const userRedemptions = await db.select().from(perkRedemptions).where(
    and(eq(perkRedemptions.perkId, perkId), eq(perkRedemptions.userId, userId))
  );
  if (perk.perUserLimit && userRedemptions.length >= perk.perUserLimit) return null;

  const [redemption] = await db.insert(perkRedemptions).values({ perkId, userId, transactionId }).returning();
  await db.update(perks).set({ usedCount: sql`${perks.usedCount} + 1` }).where(eq(perks.id, perkId));
  return redemption;
}

/** Returns all perk redemptions for a user with perk details */
export async function getUserRedemptions(userId: string): Promise<(PerkRedemption & { perk?: Perk })[]> {
  const redemptions = await db.select().from(perkRedemptions).where(eq(perkRedemptions.userId, userId)).orderBy(desc(perkRedemptions.redeemedAt));
  const results = [];
  for (const r of redemptions) {
    const perk = await getPerk(r.perkId);
    results.push({ ...r, perk });
  }
  return results;
}

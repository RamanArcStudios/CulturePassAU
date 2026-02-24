import { db } from "../../db";
import { eq, and, desc, sql } from "drizzle-orm";
import {
  memberships,
  type Membership, type InsertMembership,
} from "@shared/schema";

/** Retrieves the active membership for a user */
export async function getMembership(userId: string): Promise<Membership | undefined> {
  const [m] = await db.select().from(memberships).where(and(eq(memberships.userId, userId), eq(memberships.status, "active"))).orderBy(desc(memberships.createdAt));
  return m;
}

/** Creates a new membership record */
export async function createMembership(data: InsertMembership): Promise<Membership> {
  const [m] = await db.insert(memberships).values(data).returning();
  return m;
}

/** Updates a membership by its ID */
export async function updateMembership(id: string, data: Partial<Membership>): Promise<Membership | undefined> {
  const [m] = await db.update(memberships).set(data).where(eq(memberships.id, id)).returning();
  return m;
}

/** Retrieves a membership by its Stripe subscription ID */
export async function getMembershipByStripeSubscription(subscriptionId: string): Promise<Membership | undefined> {
  const [m] = await db.select().from(memberships).where(eq(memberships.stripeSubscriptionId, subscriptionId));
  return m;
}

/** Cancels a user's active membership and resets to free tier */
export async function cancelMembership(userId: string): Promise<Membership | undefined> {
  const existing = await getMembership(userId);
  if (!existing) return undefined;
  const [m] = await db.update(memberships).set({
    status: "cancelled",
    tier: "free",
    cashbackMultiplier: 1.0,
    badgeType: "none",
  }).where(eq(memberships.id, existing.id)).returning();
  return m;
}

/** Activates or upgrades a user to CulturePass+ membership */
export async function activatePlusMembership(userId: string, data: {
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
  billingPeriod: string;
  priceCents: number;
  endDate?: Date;
}): Promise<Membership> {
  const existing = await getMembership(userId);
  if (existing) {
    const [m] = await db.update(memberships).set({
      tier: "plus",
      status: "active",
      stripeSubscriptionId: data.stripeSubscriptionId,
      stripeCustomerId: data.stripeCustomerId,
      cashbackMultiplier: 1.02,
      badgeType: "plus",
      billingPeriod: data.billingPeriod,
      priceCents: data.priceCents,
      endDate: data.endDate,
      startDate: new Date(),
    }).where(eq(memberships.id, existing.id)).returning();
    return m;
  }
  const [m] = await db.insert(memberships).values({
    userId,
    tier: "plus",
    status: "active",
    stripeSubscriptionId: data.stripeSubscriptionId,
    stripeCustomerId: data.stripeCustomerId,
    cashbackMultiplier: 1.02,
    badgeType: "plus",
    billingPeriod: data.billingPeriod,
    priceCents: data.priceCents,
    endDate: data.endDate,
  } as any).returning();
  return m;
}

/** Returns the count of active plus members */
export async function getMemberCount(): Promise<number> {
  const result = await db.select().from(memberships).where(
    and(eq(memberships.status, "active"), sql`${memberships.tier} = 'plus'`)
  );
  return result.length;
}

import { db } from "./db";
import { eq } from "drizzle-orm";
import { cpidRegistry, users, profiles, sponsors } from "@shared/schema";

const CHARS = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

function randomCpid(length: number = 6): string {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return result;
}

export async function generateCpid(targetId: string, entityType: string): Promise<string> {
  const existing = await db.select().from(cpidRegistry).where(eq(cpidRegistry.targetId, targetId));
  if (existing.length > 0) return existing[0].culturePassId;

  let attempts = 0;
  while (attempts < 20) {
    const length = attempts < 10 ? 6 : 7;
    const cpid = `CP-${randomCpid(length)}`;

    const collision = await db.select().from(cpidRegistry).where(eq(cpidRegistry.culturePassId, cpid));
    if (collision.length === 0) {
      await db.insert(cpidRegistry).values({ culturePassId: cpid, targetId, entityType });

      if (entityType === "user") {
        await db.update(users).set({ culturePassId: cpid }).where(eq(users.id, targetId));
      } else if (entityType === "sponsor") {
        await db.update(sponsors).set({ culturePassId: cpid }).where(eq(sponsors.id, targetId));
      } else {
        await db.update(profiles).set({ culturePassId: cpid }).where(eq(profiles.id, targetId));
      }

      return cpid;
    }
    attempts++;
  }
  throw new Error("Failed to generate unique CPID after 20 attempts");
}

export async function lookupCpid(cpid: string): Promise<{ targetId: string; entityType: string } | null> {
  const [entry] = await db.select().from(cpidRegistry).where(eq(cpidRegistry.culturePassId, cpid));
  return entry ? { targetId: entry.targetId, entityType: entry.entityType } : null;
}

export async function getAllRegistryEntries() {
  return db.select().from(cpidRegistry);
}

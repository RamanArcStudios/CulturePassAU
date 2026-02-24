import { db } from "../../db";
import { eq } from "drizzle-orm";
import {
  users, wallets, auditLogs,
  type User, type InsertUser,
} from "@shared/schema";

/** Retrieves a user by their unique ID */
export async function getUser(id: string): Promise<User | undefined> {
  const [user] = await db.select().from(users).where(eq(users.id, id));
  return user;
}

/** Retrieves a user by their username */
export async function getUserByUsername(username: string): Promise<User | undefined> {
  const [user] = await db.select().from(users).where(eq(users.username, username));
  return user;
}

/** Retrieves a user by their email */
export async function getUserByEmail(email: string): Promise<User | undefined> {
  const [user] = await db.select().from(users).where(eq(users.email, email));
  return user;
}

/** Creates a new user and initialises their wallet */
export async function createUser(data: InsertUser): Promise<User> {
  const [user] = await db.insert(users).values(data).returning();
  await db.insert(wallets).values({ userId: user.id });
  return user;
}

/** Updates an existing user's data by ID */
export async function updateUser(id: string, data: Partial<User>): Promise<User | undefined> {
  const [user] = await db.update(users).set(data).where(eq(users.id, id)).returning();
  return user;
}

/** Returns all users ordered by creation date */
export async function getAllUsers(): Promise<User[]> {
  return db.select().from(users).orderBy(users.createdAt);
}

/**
 * Permanently deletes a user and all their associated data.
 * Records an audit log entry for the deletion event.
 */
export async function deleteUser(id: string): Promise<boolean> {
  const [user] = await db.select({ id: users.id, username: users.username }).from(users).where(eq(users.id, id));
  if (!user) return false;

  await db.transaction(async (tx) => {
    await tx.insert(auditLogs).values({
      userId: id,
      event: "account_deleted",
      metadata: { username: user.username, deletedAt: new Date().toISOString() },
    });
    await tx.delete(users).where(eq(users.id, id));
  });

  return true;
}

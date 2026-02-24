import { db } from "../../db";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import {
  users, wallets,
  type User, type InsertUser,
} from "@shared/schema";

const SALT_ROUNDS = 12;

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

/** Creates a new user with a hashed password and initialises their wallet */
export async function createUser(data: InsertUser): Promise<User> {
  const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);
  const [user] = await db.insert(users).values({ ...data, password: hashedPassword }).returning();
  await db.insert(wallets).values({ userId: user.id });
  return user;
}

/** Verifies a plain-text password against a user's stored hash */
export async function verifyPassword(plaintext: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plaintext, hash);
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

/** Retrieves privacy settings for a user */
export async function getPrivacySettings(id: string): Promise<User["privacySettings"]> {
  const [user] = await db.select({ privacySettings: users.privacySettings }).from(users).where(eq(users.id, id));
  return user?.privacySettings ?? { profileVisibility: true, dataSharing: false, activityStatus: true, showLocation: true };
}

/** Updates privacy settings for a user */
export async function updatePrivacySettings(id: string, settings: NonNullable<User["privacySettings"]>): Promise<void> {
  await db.update(users).set({ privacySettings: settings }).where(eq(users.id, id));
}

/** Permanently deletes a user and all cascade-linked data */
export async function deleteUser(id: string): Promise<void> {
  await db.delete(users).where(eq(users.id, id));
}

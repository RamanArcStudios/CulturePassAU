import { db } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";
import {
  users, profiles, follows, likes, reviews,
  paymentMethods, transactions, wallets,
  type User, type InsertUser,
  type Profile, type InsertProfile,
  type Review, type InsertReview,
  type PaymentMethod, type InsertPaymentMethod,
  type Transaction, type InsertTransaction,
  type Wallet, type Follow, type Like,
} from "@shared/schema";

export class DatabaseStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(data: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(data).returning();
    await db.insert(wallets).values({ userId: user.id });
    return user;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User | undefined> {
    const [user] = await db.update(users).set(data).where(eq(users.id, id)).returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users).orderBy(desc(users.createdAt));
  }

  // Profiles CRUD
  async getProfile(id: string): Promise<Profile | undefined> {
    const [profile] = await db.select().from(profiles).where(eq(profiles.id, id));
    return profile;
  }

  async getProfileBySlug(slug: string): Promise<Profile | undefined> {
    const [profile] = await db.select().from(profiles).where(eq(profiles.slug, slug));
    return profile;
  }

  async getProfilesByType(entityType: string): Promise<Profile[]> {
    return db.select().from(profiles).where(eq(profiles.entityType, entityType)).orderBy(desc(profiles.createdAt));
  }

  async getAllProfiles(): Promise<Profile[]> {
    return db.select().from(profiles).orderBy(desc(profiles.createdAt));
  }

  async createProfile(data: InsertProfile): Promise<Profile> {
    const [profile] = await db.insert(profiles).values(data).returning();
    return profile;
  }

  async updateProfile(id: string, data: Partial<Profile>): Promise<Profile | undefined> {
    const [profile] = await db.update(profiles).set({ ...data, updatedAt: new Date() }).where(eq(profiles.id, id)).returning();
    return profile;
  }

  async deleteProfile(id: string): Promise<boolean> {
    const result = await db.delete(profiles).where(eq(profiles.id, id)).returning();
    return result.length > 0;
  }

  // Follows
  async follow(followerId: string, targetId: string, targetType: string): Promise<Follow> {
    const existing = await db.select().from(follows).where(
      and(eq(follows.followerId, followerId), eq(follows.targetId, targetId))
    );
    if (existing.length > 0) return existing[0];

    const [follow] = await db.insert(follows).values({ followerId, targetId, targetType }).returning();
    if (targetType === "user") {
      await db.update(users).set({ followersCount: sql`${users.followersCount} + 1` }).where(eq(users.id, targetId));
      await db.update(users).set({ followingCount: sql`${users.followingCount} + 1` }).where(eq(users.id, followerId));
    } else {
      await db.update(profiles).set({ followersCount: sql`${profiles.followersCount} + 1` }).where(eq(profiles.id, targetId));
    }
    return follow;
  }

  async unfollow(followerId: string, targetId: string): Promise<boolean> {
    const existing = await db.select().from(follows).where(
      and(eq(follows.followerId, followerId), eq(follows.targetId, targetId))
    );
    if (existing.length === 0) return false;

    await db.delete(follows).where(and(eq(follows.followerId, followerId), eq(follows.targetId, targetId)));
    const targetType = existing[0].targetType;
    if (targetType === "user") {
      await db.update(users).set({ followersCount: sql`GREATEST(${users.followersCount} - 1, 0)` }).where(eq(users.id, targetId));
      await db.update(users).set({ followingCount: sql`GREATEST(${users.followingCount} - 1, 0)` }).where(eq(users.id, followerId));
    } else {
      await db.update(profiles).set({ followersCount: sql`GREATEST(${profiles.followersCount} - 1, 0)` }).where(eq(profiles.id, targetId));
    }
    return true;
  }

  async getFollowers(targetId: string): Promise<Follow[]> {
    return db.select().from(follows).where(eq(follows.targetId, targetId)).orderBy(desc(follows.createdAt));
  }

  async getFollowing(userId: string): Promise<Follow[]> {
    return db.select().from(follows).where(eq(follows.followerId, userId)).orderBy(desc(follows.createdAt));
  }

  async isFollowing(followerId: string, targetId: string): Promise<boolean> {
    const result = await db.select().from(follows).where(
      and(eq(follows.followerId, followerId), eq(follows.targetId, targetId))
    );
    return result.length > 0;
  }

  // Likes
  async likeEntity(userId: string, targetId: string, targetType: string): Promise<Like> {
    const existing = await db.select().from(likes).where(
      and(eq(likes.userId, userId), eq(likes.targetId, targetId))
    );
    if (existing.length > 0) return existing[0];

    const [like] = await db.insert(likes).values({ userId, targetId, targetType }).returning();
    if (targetType === "user") {
      await db.update(users).set({ likesCount: sql`${users.likesCount} + 1` }).where(eq(users.id, targetId));
    } else {
      await db.update(profiles).set({ likesCount: sql`${profiles.likesCount} + 1` }).where(eq(profiles.id, targetId));
    }
    return like;
  }

  async unlikeEntity(userId: string, targetId: string): Promise<boolean> {
    const existing = await db.select().from(likes).where(
      and(eq(likes.userId, userId), eq(likes.targetId, targetId))
    );
    if (existing.length === 0) return false;

    await db.delete(likes).where(and(eq(likes.userId, userId), eq(likes.targetId, targetId)));
    const targetType = existing[0].targetType;
    if (targetType === "user") {
      await db.update(users).set({ likesCount: sql`GREATEST(${users.likesCount} - 1, 0)` }).where(eq(users.id, targetId));
    } else {
      await db.update(profiles).set({ likesCount: sql`GREATEST(${profiles.likesCount} - 1, 0)` }).where(eq(profiles.id, targetId));
    }
    return true;
  }

  async isLiked(userId: string, targetId: string): Promise<boolean> {
    const result = await db.select().from(likes).where(
      and(eq(likes.userId, userId), eq(likes.targetId, targetId))
    );
    return result.length > 0;
  }

  // Reviews
  async getReviews(targetId: string): Promise<Review[]> {
    return db.select().from(reviews).where(eq(reviews.targetId, targetId)).orderBy(desc(reviews.createdAt));
  }

  async createReview(data: InsertReview): Promise<Review> {
    const [review] = await db.insert(reviews).values(data).returning();
    const allReviews = await this.getReviews(data.targetId);
    const avgRating = allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length;
    await db.update(profiles).set({
      reviewsCount: allReviews.length,
      rating: Math.round(avgRating * 10) / 10,
    }).where(eq(profiles.id, data.targetId));
    return review;
  }

  async deleteReview(id: string): Promise<boolean> {
    const result = await db.delete(reviews).where(eq(reviews.id, id)).returning();
    return result.length > 0;
  }

  // Payment Methods
  async getPaymentMethods(userId: string): Promise<PaymentMethod[]> {
    return db.select().from(paymentMethods).where(eq(paymentMethods.userId, userId)).orderBy(desc(paymentMethods.createdAt));
  }

  async createPaymentMethod(data: InsertPaymentMethod): Promise<PaymentMethod> {
    if (data.isDefault) {
      await db.update(paymentMethods).set({ isDefault: false }).where(eq(paymentMethods.userId, data.userId));
    }
    const [method] = await db.insert(paymentMethods).values(data).returning();
    return method;
  }

  async deletePaymentMethod(id: string): Promise<boolean> {
    const result = await db.delete(paymentMethods).where(eq(paymentMethods.id, id)).returning();
    return result.length > 0;
  }

  async setDefaultPaymentMethod(userId: string, methodId: string): Promise<PaymentMethod | undefined> {
    await db.update(paymentMethods).set({ isDefault: false }).where(eq(paymentMethods.userId, userId));
    const [method] = await db.update(paymentMethods).set({ isDefault: true }).where(eq(paymentMethods.id, methodId)).returning();
    return method;
  }

  // Transactions
  async getTransactions(userId: string): Promise<Transaction[]> {
    return db.select().from(transactions).where(eq(transactions.userId, userId)).orderBy(desc(transactions.createdAt));
  }

  async createTransaction(data: InsertTransaction): Promise<Transaction> {
    const [tx] = await db.insert(transactions).values(data).returning();
    return tx;
  }

  // Wallet
  async getWallet(userId: string): Promise<Wallet | undefined> {
    const [wallet] = await db.select().from(wallets).where(eq(wallets.userId, userId));
    return wallet;
  }

  async addFunds(userId: string, amount: number): Promise<Wallet> {
    let [wallet] = await db.select().from(wallets).where(eq(wallets.userId, userId));
    if (!wallet) {
      [wallet] = await db.insert(wallets).values({ userId, balance: amount }).returning();
    } else {
      [wallet] = await db.update(wallets).set({
        balance: sql`${wallets.balance} + ${amount}`,
        updatedAt: new Date(),
      }).where(eq(wallets.userId, userId)).returning();
    }
    await this.createTransaction({
      userId, type: "credit", amount, description: "Wallet top-up", category: "wallet", status: "completed",
    });
    return wallet;
  }

  async deductFunds(userId: string, amount: number, description: string): Promise<Wallet | null> {
    const [wallet] = await db.select().from(wallets).where(eq(wallets.userId, userId));
    if (!wallet || (wallet.balance || 0) < amount) return null;

    const [updated] = await db.update(wallets).set({
      balance: sql`${wallets.balance} - ${amount}`,
      updatedAt: new Date(),
    }).where(eq(wallets.userId, userId)).returning();

    await this.createTransaction({
      userId, type: "debit", amount, description, category: "payment", status: "completed",
    });
    return updated;
  }

  // Members (followers that are users)
  async getMembers(profileId: string): Promise<User[]> {
    const followerRecords = await db.select().from(follows).where(eq(follows.targetId, profileId));
    if (followerRecords.length === 0) return [];
    const userIds = followerRecords.map(f => f.followerId);
    const members: User[] = [];
    for (const uid of userIds) {
      const user = await this.getUser(uid);
      if (user) members.push(user);
    }
    return members;
  }
}

export const storage = new DatabaseStorage();

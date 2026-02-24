import { db } from "../../db";
import { eq, and, desc, sql } from "drizzle-orm";
import {
  follows, likes, reviews, users, profiles,
  type Follow, type Like,
  type Review, type InsertReview,
  type User,
} from "@shared/schema";

type TargetType = Follow["targetType"];

/** Creates a follow relationship between a follower and a target entity */
export async function follow(followerId: string, targetId: string, targetType: TargetType): Promise<Follow> {
  const existing = await db.select().from(follows).where(
    and(eq(follows.followerId, followerId), eq(follows.targetId, targetId))
  );
  if (existing.length > 0) return existing[0];

  const [f] = await db.insert(follows).values({ followerId, targetId, targetType }).returning();
  if (targetType === "user") {
    await db.update(users).set({ followersCount: sql`${users.followersCount} + 1` }).where(eq(users.id, targetId));
    await db.update(users).set({ followingCount: sql`${users.followingCount} + 1` }).where(eq(users.id, followerId));
  } else {
    await db.update(profiles).set({ followersCount: sql`${profiles.followersCount} + 1` }).where(eq(profiles.id, targetId));
  }
  return f;
}

/** Removes a follow relationship, returns true if unfollowed */
export async function unfollow(followerId: string, targetId: string): Promise<boolean> {
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

/** Returns all followers for a given target entity */
export async function getFollowers(targetId: string): Promise<Follow[]> {
  return db.select().from(follows).where(eq(follows.targetId, targetId)).orderBy(desc(follows.createdAt));
}

/** Returns all entities that a user is following */
export async function getFollowing(userId: string): Promise<Follow[]> {
  return db.select().from(follows).where(eq(follows.followerId, userId)).orderBy(desc(follows.createdAt));
}

/** Checks whether a user is following a target entity */
export async function isFollowing(followerId: string, targetId: string): Promise<boolean> {
  const result = await db.select().from(follows).where(
    and(eq(follows.followerId, followerId), eq(follows.targetId, targetId))
  );
  return result.length > 0;
}

/** Adds a like from a user to a target entity */
export async function likeEntity(userId: string, targetId: string, targetType: TargetType): Promise<Like> {
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

/** Removes a like from a user on a target entity */
export async function unlikeEntity(userId: string, targetId: string): Promise<boolean> {
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

/** Checks whether a user has liked a target entity */
export async function isLiked(userId: string, targetId: string): Promise<boolean> {
  const result = await db.select().from(likes).where(
    and(eq(likes.userId, userId), eq(likes.targetId, targetId))
  );
  return result.length > 0;
}

/** Returns all reviews for a given target entity */
export async function getReviews(targetId: string): Promise<Review[]> {
  return db.select().from(reviews).where(eq(reviews.targetId, targetId)).orderBy(desc(reviews.createdAt));
}

/** Creates a new review and recalculates the target profile's average rating */
export async function createReview(data: InsertReview): Promise<Review> {
  const [review] = await db.insert(reviews).values(data).returning();
  const allReviews = await getReviews(data.targetId);
  const avgRating = allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length;
  await db.update(profiles).set({
    reviewsCount: allReviews.length,
    rating: Math.round(avgRating * 10) / 10,
  }).where(eq(profiles.id, data.targetId));
  return review;
}

/** Deletes a review by ID */
export async function deleteReview(id: string): Promise<boolean> {
  const result = await db.delete(reviews).where(eq(reviews.id, id)).returning();
  return result.length > 0;
}

/** Returns all user members (followers) of a profile */
export async function getMembers(profileId: string): Promise<User[]> {
  const followerRecords = await db.select().from(follows).where(eq(follows.targetId, profileId));
  if (followerRecords.length === 0) return [];
  const members: User[] = [];
  for (const f of followerRecords) {
    const [user] = await db.select().from(users).where(eq(users.id, f.followerId));
    if (user) members.push(user);
  }
  return members;
}

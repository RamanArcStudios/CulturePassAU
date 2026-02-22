import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, jsonb, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name"),
  email: text("email"),
  phone: text("phone"),
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
  coverImageUrl: text("cover_image_url"),
  location: text("location"),
  city: text("city"),
  country: text("country"),
  entityType: text("entity_type").default("user"),
  socialLinks: jsonb("social_links").$type<SocialLinks>(),
  images: jsonb("images").$type<string[]>(),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  website: text("website"),
  isVerified: boolean("is_verified").default(false),
  followersCount: integer("followers_count").default(0),
  followingCount: integer("following_count").default(0),
  likesCount: integer("likes_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const profiles = pgTable("profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  entityType: text("entity_type").notNull(),
  description: text("description"),
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
  coverImageUrl: text("cover_image_url"),
  email: text("email"),
  phone: text("phone"),
  website: text("website"),
  location: text("location"),
  city: text("city"),
  country: text("country"),
  address: text("address"),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  socialLinks: jsonb("social_links").$type<SocialLinks>(),
  images: jsonb("images").$type<string[]>(),
  openingHours: text("opening_hours"),
  category: text("category"),
  tags: jsonb("tags").$type<string[]>(),
  isVerified: boolean("is_verified").default(false),
  followersCount: integer("followers_count").default(0),
  likesCount: integer("likes_count").default(0),
  membersCount: integer("members_count").default(0),
  reviewsCount: integer("reviews_count").default(0),
  rating: doublePrecision("rating").default(0),
  ownerId: varchar("owner_id"),
  metadata: jsonb("metadata").$type<Record<string, any>>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const follows = pgTable("follows", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  followerId: varchar("follower_id").notNull(),
  targetId: varchar("target_id").notNull(),
  targetType: text("target_type").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const likes = pgTable("likes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  targetId: varchar("target_id").notNull(),
  targetType: text("target_type").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const reviews = pgTable("reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  targetId: varchar("target_id").notNull(),
  targetType: text("target_type").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  userName: text("user_name"),
  userAvatar: text("user_avatar"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const paymentMethods = pgTable("payment_methods", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  type: text("type").notNull(),
  label: text("label").notNull(),
  last4: text("last4"),
  brand: text("brand"),
  expiryMonth: integer("expiry_month"),
  expiryYear: integer("expiry_year"),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  type: text("type").notNull(),
  amount: doublePrecision("amount").notNull(),
  currency: text("currency").default("AUD"),
  description: text("description"),
  status: text("status").default("completed"),
  category: text("category"),
  metadata: jsonb("metadata").$type<Record<string, any>>(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const wallets = pgTable("wallets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique(),
  balance: doublePrecision("balance").default(0),
  currency: text("currency").default("AUD"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export interface SocialLinks {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  youtube?: string;
  tiktok?: string;
  website?: string;
  whatsapp?: string;
}

export const ENTITY_TYPES = [
  "user", "community", "organisation", "venue", "business", "council", "government"
] as const;
export type EntityType = typeof ENTITY_TYPES[number];

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertProfileSchema = createInsertSchema(profiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  followersCount: true,
  likesCount: true,
  membersCount: true,
  reviewsCount: true,
  rating: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
});

export const insertPaymentMethodSchema = createInsertSchema(paymentMethods).omit({
  id: true,
  createdAt: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Follow = typeof follows.$inferSelect;
export type Like = typeof likes.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type PaymentMethod = typeof paymentMethods.$inferSelect;
export type InsertPaymentMethod = z.infer<typeof insertPaymentMethodSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Wallet = typeof wallets.$inferSelect;

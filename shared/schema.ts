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

export const sponsors = pgTable("sponsors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  logoUrl: text("logo_url"),
  websiteUrl: text("website_url"),
  socialLinks: jsonb("social_links").$type<SocialLinks>(),
  city: text("city"),
  country: text("country"),
  sponsorType: text("sponsor_type"),
  contactEmail: text("contact_email"),
  status: text("status").default("active"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const eventSponsors = pgTable("event_sponsors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: varchar("event_id").notNull(),
  sponsorId: varchar("sponsor_id").notNull(),
  tier: text("tier").default("bronze"),
  logoPriority: integer("logo_priority").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const sponsorPlacements = pgTable("sponsor_placements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sponsorId: varchar("sponsor_id").notNull(),
  placementType: text("placement_type").notNull(),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  weight: integer("weight").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const perks = pgTable("perks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  perkType: text("perk_type").notNull(),
  discountPercent: integer("discount_percent"),
  discountFixedCents: integer("discount_fixed_cents"),
  providerType: text("provider_type"),
  providerId: varchar("provider_id"),
  providerName: text("provider_name"),
  providerLogo: text("provider_logo"),
  city: text("city"),
  country: text("country"),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  usageLimit: integer("usage_limit"),
  perUserLimit: integer("per_user_limit").default(1),
  usedCount: integer("used_count").default(0),
  isMembershipRequired: boolean("is_membership_required").default(false),
  requiredMembershipTier: text("required_membership_tier"),
  status: text("status").default("active"),
  category: text("category"),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const perkRedemptions = pgTable("perk_redemptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  perkId: varchar("perk_id").notNull(),
  userId: varchar("user_id").notNull(),
  transactionId: varchar("transaction_id"),
  redeemedAt: timestamp("redeemed_at").defaultNow(),
});

export const memberships = pgTable("memberships", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  tier: text("tier").notNull().default("free"),
  startDate: timestamp("start_date").defaultNow(),
  endDate: timestamp("end_date"),
  status: text("status").default("active"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(),
  isRead: boolean("is_read").default(false),
  metadata: jsonb("metadata").$type<Record<string, any>>(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const tickets = pgTable("tickets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  eventId: varchar("event_id").notNull(),
  eventTitle: text("event_title").notNull(),
  eventDate: text("event_date"),
  eventTime: text("event_time"),
  eventVenue: text("event_venue"),
  tierName: text("tier_name"),
  quantity: integer("quantity").default(1),
  totalPrice: doublePrecision("total_price").default(0),
  currency: text("currency").default("AUD"),
  status: text("status").default("confirmed"),
  ticketCode: text("ticket_code"),
  imageColor: text("image_color"),
  createdAt: timestamp("created_at").defaultNow(),
});

export interface SocialLinks {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  youtube?: string;
  tiktok?: string;
  spotify?: string;
  website?: string;
  whatsapp?: string;
}

export const ENTITY_TYPES = [
  "user", "community", "organisation", "venue", "business", "council", "government", "artist", "sponsor"
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

export const insertSponsorSchema = createInsertSchema(sponsors).omit({
  id: true,
  createdAt: true,
});

export const insertPerkSchema = createInsertSchema(perks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  usedCount: true,
});

export const insertMembershipSchema = createInsertSchema(memberships).omit({
  id: true,
  createdAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export const insertTicketSchema = createInsertSchema(tickets).omit({
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
export type Sponsor = typeof sponsors.$inferSelect;
export type InsertSponsor = z.infer<typeof insertSponsorSchema>;
export type EventSponsor = typeof eventSponsors.$inferSelect;
export type SponsorPlacement = typeof sponsorPlacements.$inferSelect;
export type Perk = typeof perks.$inferSelect;
export type InsertPerk = z.infer<typeof insertPerkSchema>;
export type PerkRedemption = typeof perkRedemptions.$inferSelect;
export type Membership = typeof memberships.$inferSelect;
export type InsertMembership = z.infer<typeof insertMembershipSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Ticket = typeof tickets.$inferSelect;
export type InsertTicket = z.infer<typeof insertTicketSchema>;

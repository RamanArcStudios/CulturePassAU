import {
  pgTable,
  text,
  varchar,
  integer,
  boolean,
  timestamp,
  jsonb,
  doublePrecision,
  numeric,
  pgEnum,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

/* ======================================================
   ENUMS
====================================================== */

export const entityTypeEnum = pgEnum("entity_type", [
  "user",
  "community",
  "organisation",
  "venue",
  "business",
  "council",
  "government",
  "artist",
  "sponsor",
]);

export const userRoleEnum = pgEnum("user_role", [
  "user",
  "admin",
  "moderator",
]);

export const membershipTierEnum = pgEnum("membership_tier", [
  "free",
  "plus",
  "pro",
  "vip",
]);

export const statusEnum = pgEnum("status_enum", [
  "active",
  "inactive",
  "pending",
  "completed",
  "cancelled",
]);

/* ======================================================
   USERS
====================================================== */

export const users = pgTable(
  "users",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    culturePassId: varchar("culture_pass_id").unique(),
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
    website: text("website"),

    entityType: entityTypeEnum("entity_type").default("user"),
    role: userRoleEnum("role").default("user"),

    socialLinks: jsonb("social_links").$type<Record<string, string>>(),
    images: jsonb("images").$type<string[]>(),

    latitude: doublePrecision("latitude"),
    longitude: doublePrecision("longitude"),

    originCountry: text("origin_country"),
    originCity: text("origin_city"),
    radiusKm: integer("radius_km").default(50),
    indigenousVisibilityEnabled: boolean("indigenous_visibility_enabled").default(true),
    homelandContentEnabled: boolean("homeland_content_enabled").default(true),
    preferredLanguage: text("preferred_language").default("en"),
    spokenLanguages: jsonb("spoken_languages").$type<string[]>().default(sql`'[]'::jsonb`),

    isVerified: boolean("is_verified").default(false),

    followersCount: integer("followers_count").default(0),
    followingCount: integer("following_count").default(0),
    likesCount: integer("likes_count").default(0),

    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    usernameIdx: uniqueIndex("users_username_idx").on(table.username),
    culturePassIdx: uniqueIndex("users_cpid_idx").on(table.culturePassId),
  })
);

/* ======================================================
   WALLETS (SAFE MONEY)
====================================================== */

export const wallets = pgTable(
  "wallets",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),

    userId: varchar("user_id")
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: "cascade" }),

    balance: numeric("balance", { precision: 12, scale: 2 }).default("0"),

    currency: text("currency").default("AUD"),

    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    userIdx: uniqueIndex("wallet_user_idx").on(table.userId),
  })
);

/* ======================================================
   TRANSACTIONS
====================================================== */

export const transactions = pgTable(
  "transactions",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),

    userId: varchar("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    type: text("type").notNull(),

    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),

    currency: text("currency").default("AUD"),
    description: text("description"),
    category: text("category"),
    status: statusEnum("status").default("completed"),

    metadata: jsonb("metadata").$type<Record<string, any>>(),

    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    userIdx: index("transactions_user_idx").on(table.userId),
    createdIdx: index("transactions_created_idx").on(table.createdAt),
  })
);

/* ======================================================
   FOLLOWS
====================================================== */

export const follows = pgTable(
  "follows",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),

    followerId: varchar("follower_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    targetId: varchar("target_id").notNull(),
    targetType: entityTypeEnum("target_type").notNull(),

    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    followerIdx: index("follows_follower_idx").on(table.followerId),
    targetIdx: index("follows_target_idx").on(table.targetId),
    uniqueFollow: uniqueIndex("unique_follow").on(
      table.followerId,
      table.targetId
    ),
  })
);

/* ======================================================
   REVIEWS
====================================================== */

export const reviews = pgTable(
  "reviews",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),

    userId: varchar("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    targetId: varchar("target_id").notNull(),
    targetType: entityTypeEnum("target_type").notNull(),

    rating: integer("rating")
      .notNull(),

    comment: text("comment"),

    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    uniqueReview: uniqueIndex("unique_review").on(
      table.userId,
      table.targetId
    ),
  })
);

/* ======================================================
   MEMBERSHIPS
====================================================== */

export const memberships = pgTable(
  "memberships",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),

    userId: varchar("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    tier: text("tier").default("free"),

    stripeSubscriptionId: varchar("stripe_subscription_id"),
    stripeCustomerId: varchar("stripe_customer_id"),

    status: text("status").default("active"),

    startDate: timestamp("start_date").defaultNow(),
    endDate: timestamp("end_date"),

    cashbackMultiplier: doublePrecision("cashback_multiplier").default(1.0),
    badgeType: varchar("badge_type").default("none"),
    billingPeriod: varchar("billing_period").default("monthly"),
    priceCents: integer("price_cents").default(0),

    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    userIdx: index("membership_user_idx").on(table.userId),
  })
);

export const profiles = pgTable(
  "profiles",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    entityType: entityTypeEnum("entity_type").notNull(),
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
    socialLinks: jsonb("social_links").$type<Record<string, string>>(),
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
    ownerId: varchar("owner_id").references(() => users.id),
    metadata: jsonb("metadata").$type<Record<string, any>>(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date()),
    culturePassId: varchar("culture_pass_id").unique(),
  }
);

export const likes = pgTable(
  "likes",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    targetId: varchar("target_id").notNull(),
    targetType: entityTypeEnum("target_type").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    uniqueLike: uniqueIndex("unique_like").on(table.userId, table.targetId),
  })
);

export const paymentMethods = pgTable(
  "payment_methods",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    label: text("label").notNull(),
    last4: text("last4"),
    brand: text("brand"),
    expiryMonth: integer("expiry_month"),
    expiryYear: integer("expiry_year"),
    isDefault: boolean("is_default").default(false),
    createdAt: timestamp("created_at").defaultNow(),
  }
);

export const sponsors = pgTable(
  "sponsors",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    name: text("name").notNull(),
    description: text("description"),
    logoUrl: text("logo_url"),
    websiteUrl: text("website_url"),
    socialLinks: jsonb("social_links").$type<Record<string, string>>(),
    city: text("city"),
    country: text("country"),
    sponsorType: text("sponsor_type"),
    contactEmail: text("contact_email"),
    status: text("status").default("active"),
    createdAt: timestamp("created_at").defaultNow(),
    culturePassId: varchar("culture_pass_id"),
  }
);

export const eventSponsors = pgTable(
  "event_sponsors",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    eventId: varchar("event_id").notNull(),
    sponsorId: varchar("sponsor_id")
      .notNull()
      .references(() => sponsors.id, { onDelete: "cascade" }),
    tier: text("tier").default("bronze"),
    logoPriority: integer("logo_priority").default(0),
    createdAt: timestamp("created_at").defaultNow(),
  }
);

export const sponsorPlacements = pgTable(
  "sponsor_placements",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    sponsorId: varchar("sponsor_id")
      .notNull()
      .references(() => sponsors.id, { onDelete: "cascade" }),
    placementType: text("placement_type").notNull(),
    startDate: timestamp("start_date"),
    endDate: timestamp("end_date"),
    weight: integer("weight").default(0),
    createdAt: timestamp("created_at").defaultNow(),
  }
);

export const perks = pgTable(
  "perks",
  {
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
    culturePassId: varchar("culture_pass_id").unique(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date()),
  }
);

export const perkRedemptions = pgTable(
  "perk_redemptions",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    perkId: varchar("perk_id")
      .notNull()
      .references(() => perks.id, { onDelete: "cascade" }),
    userId: varchar("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    transactionId: varchar("transaction_id"),
    redeemedAt: timestamp("redeemed_at").defaultNow(),
  }
);

export const notifications = pgTable(
  "notifications",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    message: text("message").notNull(),
    type: text("type").notNull(),
    isRead: boolean("is_read").default(false),
    metadata: jsonb("metadata").$type<Record<string, any>>(),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    userIdIdx: index("notifications_user_id_idx").on(table.userId),
  })
);

export const tickets = pgTable(
  "tickets",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
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
    qrCode: text("qr_code"),
    imageColor: text("image_color"),
    scannedAt: timestamp("scanned_at"),
    scannedBy: varchar("scanned_by"),
    platformFee: doublePrecision("platform_fee"),
    stripeFee: doublePrecision("stripe_fee"),
    organizerAmount: doublePrecision("organizer_amount"),
    stripePaymentIntentId: text("stripe_payment_intent_id"),
    stripeRefundId: text("stripe_refund_id"),
    paymentStatus: text("payment_status").default("pending"),
    culturePassId: varchar("culture_pass_id").unique(),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    userIdIdx: index("tickets_user_id_idx").on(table.userId),
    eventIdIdx: index("tickets_event_id_idx").on(table.eventId),
    statusIdx: index("tickets_status_idx").on(table.status),
  })
);

export const cpidRegistry = pgTable(
  "cpid_registry",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    culturePassId: varchar("culture_pass_id").unique().notNull(),
    targetId: varchar("target_id").unique().notNull(),
    entityType: text("entity_type").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
  }
);

/* ======================================================
   LOCATION TYPES
====================================================== */

export const locationTypeEnum = pgEnum("location_type", [
  "country",
  "state",
  "city",
]);

/* ======================================================
   LOCATIONS (countries / states / cities hierarchy)
====================================================== */

export const locations = pgTable(
  "locations",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    locationType: locationTypeEnum("location_type").notNull(),
    parentId: varchar("parent_id"),
    countryCode: varchar("country_code", { length: 3 }),
    latitude: doublePrecision("latitude"),
    longitude: doublePrecision("longitude"),
    timezone: text("timezone"),
    population: integer("population"),
    metadata: jsonb("metadata").$type<Record<string, any>>(),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    slugIdx: uniqueIndex("locations_slug_idx").on(table.slug),
    parentIdx: index("locations_parent_idx").on(table.parentId),
    typeIdx: index("locations_type_idx").on(table.locationType),
    countryCodeIdx: index("locations_country_code_idx").on(table.countryCode),
  })
);

/* ======================================================
   COMMUNITY TYPES
====================================================== */

export const communityTypeEnum = pgEnum("community_type", [
  "language",
  "diaspora",
  "indigenous",
  "religion",
  "cultural",
  "interest",
]);

/* ======================================================
   COMMUNITIES (language / diaspora / indigenous / religion groups)
====================================================== */

export const communities = pgTable(
  "communities",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    communityType: communityTypeEnum("community_type").notNull(),
    description: text("description"),
    iconEmoji: text("icon_emoji"),
    countryOfOrigin: varchar("country_of_origin"),
    languageCode: varchar("language_code", { length: 10 }),
    isIndigenous: boolean("is_indigenous").default(false),
    parentCommunityId: varchar("parent_community_id"),
    metadata: jsonb("metadata").$type<Record<string, any>>(),
    verified: boolean("verified").default(false),
    memberCount: integer("member_count").default(0),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    slugIdx: uniqueIndex("communities_slug_idx").on(table.slug),
    typeIdx: index("communities_type_idx").on(table.communityType),
    indigenousIdx: index("communities_indigenous_idx").on(table.isIndigenous),
  })
);

/* ======================================================
   USER ↔ COMMUNITY (many-to-many)
====================================================== */

export const userCommunities = pgTable(
  "user_communities",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    communityId: varchar("community_id")
      .notNull()
      .references(() => communities.id, { onDelete: "cascade" }),
    joinedAt: timestamp("joined_at").defaultNow(),
  },
  (table) => ({
    userIdx: index("uc_user_idx").on(table.userId),
    communityIdx: index("uc_community_idx").on(table.communityId),
    uniqueUserCommunity: uniqueIndex("unique_user_community").on(
      table.userId,
      table.communityId
    ),
  })
);

/* ======================================================
   EVENT ↔ COMMUNITY (many-to-many)
====================================================== */

export const eventCommunities = pgTable(
  "event_communities",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    eventId: varchar("event_id").notNull(),
    communityId: varchar("community_id")
      .notNull()
      .references(() => communities.id, { onDelete: "cascade" }),
    relevanceScore: doublePrecision("relevance_score").default(1.0),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    eventIdx: index("ec_event_idx").on(table.eventId),
    communityIdx: index("ec_community_idx").on(table.communityId),
    uniqueEventCommunity: uniqueIndex("unique_event_community").on(
      table.eventId,
      table.communityId
    ),
  })
);

/* ======================================================
   EVENTS
====================================================== */

export const events = pgTable(
  "events",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    cpid: varchar("cpid").unique(),
    title: text("title").notNull(),
    description: text("description"),
    date: text("date").notNull(),
    time: text("time"),
    venue: text("venue"),
    address: text("address"),
    price: doublePrecision("price").default(0),
    priceLabel: text("price_label"),
    category: text("category"),
    communityTag: text("community_tag"),
    councilTag: text("council_tag"),
    organizer: text("organizer"),
    organizerId: varchar("organizer_id"),
    imageColor: text("image_color"),
    imageUrl: text("image_url"),
    capacity: integer("capacity").default(0),
    attending: integer("attending").default(0),
    isFeatured: boolean("is_featured").default(false),
    isCouncil: boolean("is_council").default(false),
    tiers: jsonb("tiers").$type<{ name: string; price: number; available: number }[]>(),
    country: text("country"),
    city: text("city"),
    indigenousTags: jsonb("indigenous_tags").$type<string[]>(),
    languageTags: jsonb("language_tags").$type<string[]>(),
    nationalSignificance: doublePrecision("national_significance").default(0),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    categoryIdx: index("events_category_idx").on(table.category),
    cityIdx: index("events_city_idx").on(table.city),
    countryIdx: index("events_country_idx").on(table.country),
    featuredIdx: index("events_featured_idx").on(table.isFeatured),
  })
);

/* ======================================================
   BUSINESSES
====================================================== */

export const businesses = pgTable(
  "businesses",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    cpid: varchar("cpid").unique(),
    name: text("name").notNull(),
    category: text("category"),
    description: text("description"),
    rating: doublePrecision("rating").default(0),
    reviews: integer("reviews").default(0),
    location: text("location"),
    phone: text("phone"),
    services: jsonb("services").$type<string[]>(),
    color: text("color"),
    icon: text("icon"),
    isVerified: boolean("is_verified").default(false),
    priceRange: text("price_range"),
    imageUrl: text("image_url"),
    country: text("country"),
    city: text("city"),
    isIndigenousOwned: boolean("is_indigenous_owned").default(false),
    supplyNationRegistered: boolean("supply_nation_registered").default(false),
    indigenousCategory: text("indigenous_category"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    categoryIdx: index("businesses_category_idx").on(table.category),
    cityIdx: index("businesses_city_idx").on(table.city),
  })
);

/* ======================================================
   MOVIES
====================================================== */

export const movies = pgTable(
  "movies",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    cpid: varchar("cpid").unique(),
    title: text("title").notNull(),
    genre: jsonb("genre").$type<string[]>(),
    language: text("language"),
    duration: text("duration"),
    rating: text("rating"),
    imdbScore: doublePrecision("imdb_score").default(0),
    description: text("description"),
    director: text("director"),
    cast: jsonb("cast").$type<string[]>(),
    releaseDate: text("release_date"),
    posterColor: text("poster_color"),
    posterUrl: text("poster_url"),
    icon: text("icon"),
    showtimes: jsonb("showtimes").$type<{ cinema: string; times: string[]; price: number }[]>(),
    isTrending: boolean("is_trending").default(false),
    country: text("country"),
    city: text("city"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    cityIdx: index("movies_city_idx").on(table.city),
  })
);

/* ======================================================
   RESTAURANTS
====================================================== */

export const restaurants = pgTable(
  "restaurants",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    cpid: varchar("cpid").unique(),
    name: text("name").notNull(),
    cuisine: text("cuisine"),
    description: text("description"),
    rating: doublePrecision("rating").default(0),
    reviews: integer("reviews").default(0),
    priceRange: text("price_range"),
    location: text("location"),
    address: text("address"),
    phone: text("phone"),
    hours: text("hours"),
    features: jsonb("features").$type<string[]>(),
    color: text("color"),
    icon: text("icon"),
    isOpen: boolean("is_open").default(true),
    deliveryAvailable: boolean("delivery_available").default(false),
    reservationAvailable: boolean("reservation_available").default(false),
    menuHighlights: jsonb("menu_highlights").$type<string[]>(),
    imageUrl: text("image_url"),
    country: text("country"),
    city: text("city"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    cuisineIdx: index("restaurants_cuisine_idx").on(table.cuisine),
    cityIdx: index("restaurants_city_idx").on(table.city),
  })
);

/* ======================================================
   ACTIVITIES
====================================================== */

export const activities = pgTable(
  "activities",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    cpid: varchar("cpid").unique(),
    name: text("name").notNull(),
    category: text("category"),
    description: text("description"),
    location: text("location"),
    price: doublePrecision("price").default(0),
    priceLabel: text("price_label"),
    rating: doublePrecision("rating").default(0),
    reviews: integer("reviews").default(0),
    duration: text("duration"),
    color: text("color"),
    icon: text("icon"),
    highlights: jsonb("highlights").$type<string[]>(),
    ageGroup: text("age_group"),
    isPopular: boolean("is_popular").default(false),
    imageUrl: text("image_url"),
    country: text("country"),
    city: text("city"),
    indigenousTags: jsonb("indigenous_tags").$type<string[]>(),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    categoryIdx: index("activities_category_idx").on(table.category),
    cityIdx: index("activities_city_idx").on(table.city),
  })
);

/* ======================================================
   SHOPPING
====================================================== */

export const shopping = pgTable(
  "shopping",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    cpid: varchar("cpid").unique(),
    name: text("name").notNull(),
    category: text("category"),
    description: text("description"),
    location: text("location"),
    rating: doublePrecision("rating").default(0),
    reviews: integer("reviews").default(0),
    color: text("color"),
    icon: text("icon"),
    deals: jsonb("deals").$type<{ title: string; discount: string; validTill: string }[]>(),
    isOpen: boolean("is_open").default(true),
    deliveryAvailable: boolean("delivery_available").default(false),
    imageUrl: text("image_url"),
    country: text("country"),
    city: text("city"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    categoryIdx: index("shopping_category_idx").on(table.category),
    cityIdx: index("shopping_city_idx").on(table.city),
  })
);

/* ======================================================
   INDIGENOUS SPOTLIGHTS
====================================================== */

export const indigenousSpotlights = pgTable(
  "indigenous_spotlights",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    title: text("title").notNull(),
    description: text("description"),
    imageUrl: text("image_url"),
    type: text("type"),
    createdAt: timestamp("created_at").defaultNow(),
  }
);

/* ======================================================
   TRADITIONAL LANDS
====================================================== */

export const traditionalLands = pgTable(
  "traditional_lands",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    city: text("city").notNull(),
    country: text("country").notNull(),
    traditionalName: text("traditional_name").notNull(),
    peoples: text("peoples").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    cityIdx: uniqueIndex("traditional_lands_city_idx").on(table.city, table.country),
  })
);

/* ======================================================
   TYPES
====================================================== */

export type User = typeof users.$inferSelect;
export type Wallet = typeof wallets.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
export type Follow = typeof follows.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type Membership = typeof memberships.$inferSelect;
export type Profile = typeof profiles.$inferSelect;
export type Like = typeof likes.$inferSelect;
export type PaymentMethod = typeof paymentMethods.$inferSelect;
export type Sponsor = typeof sponsors.$inferSelect;
export type EventSponsor = typeof eventSponsors.$inferSelect;
export type SponsorPlacement = typeof sponsorPlacements.$inferSelect;
export type Perk = typeof perks.$inferSelect;
export type PerkRedemption = typeof perkRedemptions.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type Ticket = typeof tickets.$inferSelect;
export type CpidRegistry = typeof cpidRegistry.$inferSelect;
export type Location = typeof locations.$inferSelect;
export type Community = typeof communities.$inferSelect;
export type UserCommunity = typeof userCommunities.$inferSelect;
export type EventCommunity = typeof eventCommunities.$inferSelect;
export type Event = typeof events.$inferSelect;
export type Business = typeof businesses.$inferSelect;
export type Movie = typeof movies.$inferSelect;
export type Restaurant = typeof restaurants.$inferSelect;
export type Activity = typeof activities.$inferSelect;
export type Shopping = typeof shopping.$inferSelect;
export type IndigenousSpotlight = typeof indigenousSpotlights.$inferSelect;
export type TraditionalLand = typeof traditionalLands.$inferSelect;

/* ======================================================
   INSERT SCHEMAS
====================================================== */

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
});

export const insertMembershipSchema = createInsertSchema(memberships).omit({
  id: true,
  createdAt: true,
});

export const insertProfileSchema = createInsertSchema(profiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
});

export const insertPaymentMethodSchema = createInsertSchema(paymentMethods).omit({
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
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export const insertTicketSchema = createInsertSchema(tickets).omit({
  id: true,
  createdAt: true,
});

export const insertLocationSchema = createInsertSchema(locations).omit({
  id: true,
  createdAt: true,
});

export const insertCommunitySchema = createInsertSchema(communities).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type InsertMembership = z.infer<typeof insertMembershipSchema>;
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type InsertPaymentMethod = z.infer<typeof insertPaymentMethodSchema>;
export type InsertSponsor = z.infer<typeof insertSponsorSchema>;
export type InsertLocation = z.infer<typeof insertLocationSchema>;
export type InsertCommunity = z.infer<typeof insertCommunitySchema>;
export type InsertPerk = z.infer<typeof insertPerkSchema>;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type InsertTicket = z.infer<typeof insertTicketSchema>;
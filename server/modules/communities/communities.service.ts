import { db } from "../../db";
import { eq, and } from "drizzle-orm";
import {
  communities,
  userCommunities,
  eventCommunities,
  type Community,
  type UserCommunity,
  type EventCommunity,
} from "@shared/schema";

/** Returns all communities ordered by name */
export async function getAllCommunities(): Promise<Community[]> {
  return db.select().from(communities).orderBy(communities.name);
}

/** Looks up a single community by its URL-friendly slug */
export async function getCommunityBySlug(slug: string): Promise<Community | undefined> {
  const [c] = await db.select().from(communities).where(eq(communities.slug, slug));
  return c;
}

/** Looks up a single community by its unique ID */
export async function getCommunityById(id: string): Promise<Community | undefined> {
  const [c] = await db.select().from(communities).where(eq(communities.id, id));
  return c;
}

/** Returns communities filtered by community type */
export async function getCommunitiesByType(type: string): Promise<Community[]> {
  return db.select().from(communities).where(eq(communities.communityType, type as any)).orderBy(communities.name);
}

/** Returns all indigenous communities */
export async function getIndigenousCommunities(): Promise<Community[]> {
  return db.select().from(communities).where(eq(communities.isIndigenous, true)).orderBy(communities.name);
}

/** Creates a new community record */
export async function createCommunity(data: typeof communities.$inferInsert): Promise<Community> {
  const [c] = await db.insert(communities).values(data).returning();
  return c;
}

/** Adds a user to a community (join) */
export async function joinCommunity(userId: string, communityId: string): Promise<UserCommunity> {
  const [uc] = await db.insert(userCommunities).values({ userId, communityId }).returning();
  return uc;
}

/** Removes a user from a community (leave) */
export async function leaveCommunity(userId: string, communityId: string): Promise<boolean> {
  const result = await db
    .delete(userCommunities)
    .where(and(eq(userCommunities.userId, userId), eq(userCommunities.communityId, communityId)))
    .returning();
  return result.length > 0;
}

/** Returns all communities a user has joined, with full community details */
export async function getUserCommunities(userId: string): Promise<Community[]> {
  const rows = await db
    .select({ community: communities })
    .from(userCommunities)
    .innerJoin(communities, eq(userCommunities.communityId, communities.id))
    .where(eq(userCommunities.userId, userId));
  return rows.map((r) => r.community);
}

/** Returns all user IDs that are members of a community */
export async function getCommunityMembers(communityId: string): Promise<string[]> {
  const rows = await db
    .select({ userId: userCommunities.userId })
    .from(userCommunities)
    .where(eq(userCommunities.communityId, communityId));
  return rows.map((r) => r.userId);
}

/** Returns all communities linked to a specific event */
export async function getEventCommunities(eventId: string): Promise<Community[]> {
  const rows = await db
    .select({ community: communities })
    .from(eventCommunities)
    .innerJoin(communities, eq(eventCommunities.communityId, communities.id))
    .where(eq(eventCommunities.eventId, eventId));
  return rows.map((r) => r.community);
}

/** Links an event to a community with an optional relevance score */
export async function linkEventToCommunity(eventId: string, communityId: string, relevanceScore?: number): Promise<EventCommunity> {
  const [ec] = await db
    .insert(eventCommunities)
    .values({ eventId, communityId, relevanceScore: relevanceScore ?? 1.0 })
    .returning();
  return ec;
}

/** Seeds the database with diaspora, indigenous, language, and religion communities */
export async function seedCommunities(): Promise<{ count: number }> {
  const existing = await getAllCommunities();
  if (existing.length > 0) {
    return { count: 0 };
  }

  const seedData: Array<typeof communities.$inferInsert> = [
    { id: "com-indian", name: "Indian Diaspora", slug: "indian-diaspora", communityType: "diaspora" as const, description: "Connecting the Indian diaspora across the globe.", iconEmoji: "🇮🇳", countryOfOrigin: "IN" },
    { id: "com-chinese", name: "Chinese Diaspora", slug: "chinese-diaspora", communityType: "diaspora" as const, description: "Celebrating Chinese heritage and traditions worldwide.", iconEmoji: "🇨🇳", countryOfOrigin: "CN" },
    { id: "com-filipino", name: "Filipino Diaspora", slug: "filipino-diaspora", communityType: "diaspora" as const, description: "Supporting Filipino communities abroad.", iconEmoji: "🇵🇭", countryOfOrigin: "PH" },
    { id: "com-vietnamese", name: "Vietnamese Diaspora", slug: "vietnamese-diaspora", communityType: "diaspora" as const, description: "Connecting Vietnamese communities worldwide.", iconEmoji: "🇻🇳", countryOfOrigin: "VN" },
    { id: "com-lebanese", name: "Lebanese Diaspora", slug: "lebanese-diaspora", communityType: "diaspora" as const, description: "Uniting the Lebanese diaspora globally.", iconEmoji: "🇱🇧", countryOfOrigin: "LB" },
    { id: "com-greek", name: "Greek Diaspora", slug: "greek-diaspora", communityType: "diaspora" as const, description: "Preserving and celebrating Greek culture abroad.", iconEmoji: "🇬🇷", countryOfOrigin: "GR" },
    { id: "com-italian", name: "Italian Diaspora", slug: "italian-diaspora", communityType: "diaspora" as const, description: "Celebrating Italian heritage and la dolce vita.", iconEmoji: "🇮🇹", countryOfOrigin: "IT" },
    { id: "com-korean", name: "Korean Diaspora", slug: "korean-diaspora", communityType: "diaspora" as const, description: "Connecting Korean communities worldwide.", iconEmoji: "🇰🇷", countryOfOrigin: "KR" },
    { id: "com-japanese", name: "Japanese Diaspora", slug: "japanese-diaspora", communityType: "diaspora" as const, description: "Preserving Japanese traditions and culture globally.", iconEmoji: "🇯🇵", countryOfOrigin: "JP" },
    { id: "com-sri-lankan", name: "Sri Lankan Diaspora", slug: "sri-lankan-diaspora", communityType: "diaspora" as const, description: "Connecting Sri Lankan communities worldwide.", iconEmoji: "🇱🇰", countryOfOrigin: "LK" },
    { id: "com-samoan", name: "Samoan Diaspora", slug: "samoan-diaspora", communityType: "diaspora" as const, description: "Celebrating Samoan culture and fa'a Samoa.", iconEmoji: "🇼🇸", countryOfOrigin: "WS" },
    { id: "com-tongan", name: "Tongan Diaspora", slug: "tongan-diaspora", communityType: "diaspora" as const, description: "Connecting the Tongan community globally.", iconEmoji: "🇹🇴", countryOfOrigin: "TO" },
    { id: "com-pakistani", name: "Pakistani Diaspora", slug: "pakistani-diaspora", communityType: "diaspora" as const, description: "Uniting Pakistani communities worldwide.", iconEmoji: "🇵🇰", countryOfOrigin: "PK" },
    { id: "com-bangladeshi", name: "Bangladeshi Diaspora", slug: "bangladeshi-diaspora", communityType: "diaspora" as const, description: "Connecting Bangladeshi communities globally.", iconEmoji: "🇧🇩", countryOfOrigin: "BD" },
    { id: "com-iranian", name: "Iranian Diaspora", slug: "iranian-diaspora", communityType: "diaspora" as const, description: "Preserving Persian heritage and culture.", iconEmoji: "🇮🇷", countryOfOrigin: "IR" },
    { id: "com-ethiopian", name: "Ethiopian Diaspora", slug: "ethiopian-diaspora", communityType: "diaspora" as const, description: "Celebrating Ethiopian culture and community.", iconEmoji: "🇪🇹", countryOfOrigin: "ET" },
    { id: "com-somali", name: "Somali Diaspora", slug: "somali-diaspora", communityType: "diaspora" as const, description: "Connecting Somali communities worldwide.", iconEmoji: "🇸🇴", countryOfOrigin: "SO" },
    { id: "com-south-african", name: "South African Diaspora", slug: "south-african-diaspora", communityType: "diaspora" as const, description: "Uniting South African communities abroad.", iconEmoji: "🇿🇦", countryOfOrigin: "ZA" },

    { id: "com-aboriginal", name: "Aboriginal Australian", slug: "aboriginal-australian", communityType: "indigenous" as const, description: "First Nations peoples of mainland Australia and Tasmania.", iconEmoji: "🪃", isIndigenous: true, countryOfOrigin: "AU" },
    { id: "com-torres-strait", name: "Torres Strait Islander", slug: "torres-strait-islander", communityType: "indigenous" as const, description: "Indigenous peoples of the Torres Strait Islands.", iconEmoji: "🌊", isIndigenous: true, countryOfOrigin: "AU" },
    { id: "com-maori", name: "Māori", slug: "maori", communityType: "indigenous" as const, description: "Tangata whenua — the indigenous Polynesian people of Aotearoa New Zealand.", iconEmoji: "🌿", isIndigenous: true, countryOfOrigin: "NZ" },
    { id: "com-first-nations-ca", name: "First Nations (Canada)", slug: "first-nations-canada", communityType: "indigenous" as const, description: "Indigenous peoples of Canada including First Nations, Inuit, and Métis.", iconEmoji: "🍁", isIndigenous: true, countryOfOrigin: "CA" },

    { id: "com-hindi", name: "Hindi Speakers", slug: "hindi-speakers", communityType: "language" as const, description: "Community for Hindi-speaking people worldwide.", iconEmoji: "🗣️", languageCode: "hi" },
    { id: "com-mandarin", name: "Mandarin Speakers", slug: "mandarin-speakers", communityType: "language" as const, description: "Community for Mandarin Chinese speakers.", iconEmoji: "🗣️", languageCode: "zh" },
    { id: "com-cantonese", name: "Cantonese Speakers", slug: "cantonese-speakers", communityType: "language" as const, description: "Community for Cantonese speakers worldwide.", iconEmoji: "🗣️", languageCode: "yue" },
    { id: "com-tamil", name: "Tamil Speakers", slug: "tamil-speakers", communityType: "language" as const, description: "Community for Tamil-speaking people globally.", iconEmoji: "🗣️", languageCode: "ta" },
    { id: "com-tagalog", name: "Tagalog Speakers", slug: "tagalog-speakers", communityType: "language" as const, description: "Community for Tagalog and Filipino speakers.", iconEmoji: "🗣️", languageCode: "tl" },
    { id: "com-vietnamese-lang", name: "Vietnamese Speakers", slug: "vietnamese-speakers", communityType: "language" as const, description: "Community for Vietnamese-speaking people.", iconEmoji: "🗣️", languageCode: "vi" },
    { id: "com-arabic", name: "Arabic Speakers", slug: "arabic-speakers", communityType: "language" as const, description: "Community for Arabic speakers worldwide.", iconEmoji: "🗣️", languageCode: "ar" },
    { id: "com-greek-lang", name: "Greek Speakers", slug: "greek-speakers", communityType: "language" as const, description: "Community for Greek-speaking people.", iconEmoji: "🗣️", languageCode: "el" },
    { id: "com-italian-lang", name: "Italian Speakers", slug: "italian-speakers", communityType: "language" as const, description: "Community for Italian-speaking people.", iconEmoji: "🗣️", languageCode: "it" },
    { id: "com-korean-lang", name: "Korean Speakers", slug: "korean-speakers", communityType: "language" as const, description: "Community for Korean-speaking people.", iconEmoji: "🗣️", languageCode: "ko" },
    { id: "com-japanese-lang", name: "Japanese Speakers", slug: "japanese-speakers", communityType: "language" as const, description: "Community for Japanese-speaking people.", iconEmoji: "🗣️", languageCode: "ja" },
    { id: "com-urdu", name: "Urdu Speakers", slug: "urdu-speakers", communityType: "language" as const, description: "Community for Urdu-speaking people worldwide.", iconEmoji: "🗣️", languageCode: "ur" },
    { id: "com-bengali", name: "Bengali Speakers", slug: "bengali-speakers", communityType: "language" as const, description: "Community for Bengali-speaking people.", iconEmoji: "🗣️", languageCode: "bn" },
    { id: "com-farsi", name: "Farsi Speakers", slug: "farsi-speakers", communityType: "language" as const, description: "Community for Farsi/Persian speakers.", iconEmoji: "🗣️", languageCode: "fa" },
    { id: "com-samoan-lang", name: "Samoan Speakers", slug: "samoan-speakers", communityType: "language" as const, description: "Community for Samoan-speaking people.", iconEmoji: "🗣️", languageCode: "sm" },
    { id: "com-tongan-lang", name: "Tongan Speakers", slug: "tongan-speakers", communityType: "language" as const, description: "Community for Tongan-speaking people.", iconEmoji: "🗣️", languageCode: "to" },
    { id: "com-te-reo", name: "Te Reo Māori Speakers", slug: "te-reo-maori-speakers", communityType: "language" as const, description: "Community for Te Reo Māori speakers and learners.", iconEmoji: "🗣️", languageCode: "mi" },

    { id: "com-hindu", name: "Hindu Community", slug: "hindu-community", communityType: "religion" as const, description: "Community for people of Hindu faith.", iconEmoji: "🕉️" },
    { id: "com-buddhist", name: "Buddhist Community", slug: "buddhist-community", communityType: "religion" as const, description: "Community for people of Buddhist faith.", iconEmoji: "☸️" },
    { id: "com-sikh", name: "Sikh Community", slug: "sikh-community", communityType: "religion" as const, description: "Community for people of Sikh faith.", iconEmoji: "🙏" },
    { id: "com-muslim", name: "Muslim Community", slug: "muslim-community", communityType: "religion" as const, description: "Community for people of Islamic faith.", iconEmoji: "☪️" },
    { id: "com-christian", name: "Christian Community", slug: "christian-community", communityType: "religion" as const, description: "Community for people of Christian faith.", iconEmoji: "✝️" },
    { id: "com-jewish", name: "Jewish Community", slug: "jewish-community", communityType: "religion" as const, description: "Community for people of Jewish faith.", iconEmoji: "✡️" },
  ];

  await db.insert(communities).values(seedData);

  return { count: seedData.length };
}

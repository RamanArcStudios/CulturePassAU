import {
  sampleEvents,
  sampleCommunities,
  sampleBusinesses,
  sampleActivities,
  indigenousSpotlights,
  EventData,
} from "../../../data/mockData";
import { getUser } from "../users/users.service";
import { getUserCommunities, getAllCommunities } from "../communities/communities.service";
import { getLocationById, getCitiesByCountry } from "../locations/locations.service";
import { db } from "../../db";
import { communities, userCommunities } from "@shared/schema";

export interface DiscoverSection<T = any> {
  title: string;
  subtitle?: string;
  type: 'events' | 'communities' | 'businesses' | 'activities' | 'spotlight' | 'mixed';
  items: T[];
  priority: number;
}

export interface DiscoverFeed {
  sections: DiscoverSection[];
  meta: {
    userId: string;
    city: string;
    country: string;
    generatedAt: string;
    totalItems: number;
    algorithmVersion: string;
  };
}

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function getOriginCommunityTags(originCountry: string): string[] {
  const mapping: Record<string, string[]> = {
    india: ["Indian", "Tamil", "Malayalee", "Punjabi", "Bengali", "Gujarati", "Telugu"],
    china: ["Chinese"],
    philippines: ["Filipino"],
    vietnam: ["Vietnamese"],
    lebanon: ["Lebanese"],
    greece: ["Greek"],
    italy: ["Italian"],
    korea: ["Korean"],
    "south korea": ["Korean"],
    japan: ["Japanese"],
    "sri lanka": ["Sri Lankan", "Tamil"],
    pakistan: ["Pakistani", "Punjabi"],
    bangladesh: ["Bengali", "Bangladeshi"],
    iran: ["Iranian", "Persian"],
    samoa: ["Samoan", "Pacific Islander"],
    tonga: ["Tongan", "Pacific Islander"],
    fiji: ["Fijian", "Pacific Islander"],
    nepal: ["Nepali"],
    thailand: ["Thai"],
    malaysia: ["Malaysian"],
    indonesia: ["Indonesian"],
    turkey: ["Turkish"],
    egypt: ["Egyptian"],
    ethiopia: ["Ethiopian"],
    somalia: ["Somali"],
    "south africa": ["South African"],
  };
  return mapping[originCountry.toLowerCase()] ?? [];
}

function getCommunityRelatedTags(communityName: string): string[] {
  const mapping: Record<string, string[]> = {
    "indian diaspora": ["Indian", "Tamil", "Malayalee", "Punjabi", "Bengali", "Gujarati", "Telugu"],
    "chinese diaspora": ["Chinese", "Cantonese", "Mandarin"],
    "filipino diaspora": ["Filipino"],
    "vietnamese diaspora": ["Vietnamese"],
    "lebanese diaspora": ["Lebanese", "Arabic"],
    "greek diaspora": ["Greek"],
    "italian diaspora": ["Italian"],
    "korean diaspora": ["Korean"],
    "japanese diaspora": ["Japanese"],
    "sri lankan diaspora": ["Sri Lankan", "Tamil"],
    "samoan diaspora": ["Samoan", "Pacific Islander"],
    "tongan diaspora": ["Tongan", "Pacific Islander"],
    "pakistani diaspora": ["Pakistani", "Punjabi"],
    "bangladeshi diaspora": ["Bangladeshi", "Bengali"],
    "iranian diaspora": ["Iranian", "Persian"],
    "ethiopian diaspora": ["Ethiopian"],
    "somali diaspora": ["Somali"],
    "south african diaspora": ["South African"],
    "aboriginal australian": ["Aboriginal", "Indigenous", "First Nations"],
    "torres strait islander": ["Torres Strait", "Indigenous"],
    "māori": ["Maori", "Māori", "Indigenous"],
    "first nations (canada)": ["First Nations", "Indigenous"],
    "hindi speakers": ["Hindi", "Indian", "Tamil", "Malayalee", "Punjabi"],
    "mandarin speakers": ["Chinese", "Mandarin"],
    "cantonese speakers": ["Chinese", "Cantonese"],
    "tamil speakers": ["Tamil"],
    "tagalog speakers": ["Filipino"],
    "vietnamese speakers": ["Vietnamese"],
    "arabic speakers": ["Arabic", "Lebanese"],
    "greek speakers": ["Greek"],
    "italian speakers": ["Italian"],
    "korean speakers": ["Korean"],
    "japanese speakers": ["Japanese"],
    "urdu speakers": ["Pakistani", "Urdu"],
    "bengali speakers": ["Bengali", "Bangladeshi"],
    "farsi speakers": ["Iranian", "Persian"],
    "samoan speakers": ["Samoan"],
    "tongan speakers": ["Tongan"],
    "te reo māori speakers": ["Maori", "Māori"],
  };
  return mapping[communityName.toLowerCase()] ?? [communityName];
}

const COMMUNITY_TAG_TO_LANGUAGES: Record<string, string[]> = {
  malayalee: ["Malayalam", "Hindi", "English"],
  tamil: ["Tamil", "English"],
  punjabi: ["Punjabi", "Hindi", "English"],
  bengali: ["Bengali", "English"],
  gujarati: ["Gujarati", "Hindi", "English"],
  telugu: ["Telugu", "Hindi", "English"],
  indian: ["Hindi", "English"],
  chinese: ["Mandarin", "Cantonese", "English"],
  filipino: ["Tagalog", "English"],
  vietnamese: ["Vietnamese", "English"],
  lebanese: ["Arabic", "English"],
  greek: ["Greek", "English"],
  italian: ["Italian", "English"],
  korean: ["Korean", "English"],
  japanese: ["Japanese", "English"],
  arabic: ["Arabic", "English"],
  multicultural: ["English"],
  "aboriginal & torres strait islander": ["English"],
};

const NATIONAL_SIGNIFICANCE_EVENTS: Record<string, number> = {
  e1: 0.9,
  e2: 0.85,
  ei1: 0.95,
  ei2: 0.8,
  ei3: 0.75,
  ei5: 0.9,
};

function getEventLanguageTags(event: EventData): string[] {
  if (event.languageTags && event.languageTags.length > 0) return event.languageTags;
  const tag = event.communityTag.toLowerCase();
  return COMMUNITY_TAG_TO_LANGUAGES[tag] || ["English"];
}

function getEventNationalSignificance(event: EventData): number {
  if (event.nationalSignificance !== undefined) return event.nationalSignificance;
  return NATIONAL_SIGNIFICANCE_EVENTS[event.id] || 0;
}

// --- NORMALIZED SCORING FUNCTIONS (0-1 scale) ---

function normalizeLocationScore(event: EventData, userCity: string, userCountry: string, userLat?: number | null, userLng?: number | null, radiusKm?: number): number {
  let score = 0;
  if (userCity && event.city.toLowerCase() === userCity.toLowerCase()) {
    score = 1.0;
  } else if (userCountry && event.country.toLowerCase() === userCountry.toLowerCase()) {
    score = 0.5;
  }

  if (userLat != null && userLng != null) {
    const cityCoords = getCityCoords(event.city, event.country);
    if (cityCoords) {
      const dist = haversineDistance(userLat, userLng, cityCoords.lat, cityCoords.lng);
      const radius = radiusKm || 50;
      if (dist <= radius) {
        const distScore = 1.0 - (dist / radius);
        score = Math.max(score, distScore);
      }
    }
  }

  return Math.min(score, 1.0);
}

function normalizeCommunityScore(event: EventData, relatedTags: string[]): number {
  if (!relatedTags.length) return 0;
  const tag = event.communityTag.toLowerCase();
  const exactMatch = relatedTags.some(t => t === tag);
  if (exactMatch) return 1.0;
  const partialMatch = relatedTags.some(t => tag.includes(t) || t.includes(tag));
  if (partialMatch) return 0.6;
  return 0;
}

function normalizeLanguageScore(event: EventData, userLanguages: string[]): number {
  if (!userLanguages.length) return 0;
  const eventLangs = getEventLanguageTags(event).map(l => l.toLowerCase());
  const userLangs = userLanguages.map(l => l.toLowerCase());

  const nonEnglishMatches = userLangs.filter(
    ul => ul !== "english" && eventLangs.some(el => el === ul)
  );
  if (nonEnglishMatches.length > 0) return 1.0;

  const englishMatch = userLangs.includes("english") && eventLangs.includes("english");
  if (englishMatch) return 0.2;

  return 0;
}

function normalizeHomelandScore(event: EventData, originTags: string[], userCountry: string): number {
  if (!originTags.length) return 0;
  const tag = event.communityTag.toLowerCase();
  const isHomeland = originTags.some(t => t.toLowerCase() === tag);
  if (!isHomeland) return 0;

  const isLocal = event.country.toLowerCase() === userCountry.toLowerCase();
  return isLocal ? 1.0 : 0.7;
}

function normalizeIndigenousScore(event: EventData, enabled: boolean): number {
  if (!enabled) return 0;
  if (event.indigenousTags && event.indigenousTags.length > 0) return 1.0;
  return 0;
}

function normalizeTrendingScore(event: EventData, maxAttending: number): number {
  if (maxAttending === 0) return 0;
  return event.attending / maxAttending;
}

function normalizeFeaturedScore(event: EventData): number {
  return event.isFeatured ? 1.0 : 0;
}

function normalizeNationalSignificanceScore(event: EventData): number {
  return getEventNationalSignificance(event);
}

const WEIGHTS = {
  location: 0.25,
  community: 0.20,
  language: 0.15,
  homeland: 0.15,
  indigenous: 0.08,
  trending: 0.07,
  featured: 0.05,
  nationalSignificance: 0.05,
};

function computeCompositeScore(
  event: EventData,
  userCity: string,
  userCountry: string,
  relatedTags: string[],
  userLanguages: string[],
  originTags: string[],
  indigenousEnabled: boolean,
  maxAttending: number,
  userLat?: number | null,
  userLng?: number | null,
  radiusKm?: number,
): number {
  const loc = normalizeLocationScore(event, userCity, userCountry, userLat, userLng, radiusKm);
  const comm = normalizeCommunityScore(event, relatedTags);
  const lang = normalizeLanguageScore(event, userLanguages);
  const home = normalizeHomelandScore(event, originTags, userCountry);
  const indig = normalizeIndigenousScore(event, indigenousEnabled);
  const trend = normalizeTrendingScore(event, maxAttending);
  const feat = normalizeFeaturedScore(event);
  const natSig = normalizeNationalSignificanceScore(event);

  return (
    WEIGHTS.location * loc +
    WEIGHTS.community * comm +
    WEIGHTS.language * lang +
    WEIGHTS.homeland * home +
    WEIGHTS.indigenous * indig +
    WEIGHTS.trending * trend +
    WEIGHTS.featured * feat +
    WEIGHTS.nationalSignificance * natSig
  );
}

export async function getDiscoverFeed(
  userId: string,
  userCity?: string,
  userCountry?: string
): Promise<DiscoverFeed> {
  const user = await getUser(userId);

  const city = user?.city || userCity || "";
  const country = user?.country || userCountry || "";
  const originCountry = user?.originCountry || "";
  const radiusKm = user?.radiusKm ?? 50;
  const indigenousVisibilityEnabled = user?.indigenousVisibilityEnabled ?? true;
  const homelandContentEnabled = user?.homelandContentEnabled ?? true;
  const userLat = user?.latitude;
  const userLng = user?.longitude;
  const userLanguages: string[] = (user as any)?.spokenLanguages || [];

  const userComms = user ? await getUserCommunities(userId) : [];
  const userCommNames = userComms.map((c) => c.name.toLowerCase());
  const allRelatedTags = userCommNames.flatMap((cn) => getCommunityRelatedTags(cn)).map((t) => t.toLowerCase());
  const originTags = originCountry ? getOriginCommunityTags(originCountry) : [];

  const maxAttending = Math.max(...sampleEvents.map(e => e.attending), 1);

  const sections: DiscoverSection[] = [];
  const shownEventIds = new Set<string>();

  // --- Section 1: Near You (priority 1) ---
  const nearYouScored = sampleEvents
    .map((evt) => {
      const score = normalizeLocationScore(evt, city, country, userLat, userLng, radiusKm);
      return { event: evt, score };
    })
    .filter((e) => e.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  if (nearYouScored.length > 0) {
    const items = nearYouScored.map((e) => e.event);
    items.forEach((e) => shownEventIds.add(e.id));
    sections.push({
      title: "Near You",
      subtitle: city ? `Events in and around ${city}` : undefined,
      type: "events",
      items,
      priority: 1,
    });
  }

  // --- Section 2: Your Communities (priority 2) ---
  if (userCommNames.length > 0) {
    const commEvents = sampleEvents.filter((evt) =>
      allRelatedTags.some(
        (tag) =>
          evt.communityTag.toLowerCase().includes(tag) ||
          tag.includes(evt.communityTag.toLowerCase())
      )
    );
    const commCommunities = sampleCommunities.filter((c) =>
      allRelatedTags.some(
        (tag) =>
          c.name.toLowerCase().includes(tag) || tag.includes(c.name.toLowerCase())
      )
    );
    const mixedItems = [...commEvents, ...commCommunities];
    if (mixedItems.length > 0) {
      commEvents.forEach((e) => shownEventIds.add(e.id));
      sections.push({
        title: "Your Communities",
        subtitle: "Events and groups you belong to",
        type: "mixed",
        items: mixedItems,
        priority: 2,
      });
    }
  }

  // --- Section 3: First Nations Spotlight (priority 3) ---
  if (indigenousVisibilityEnabled) {
    const indigenousEvents = sampleEvents.filter(
      (evt) => evt.indigenousTags && evt.indigenousTags.length > 0
    );
    const indigenousBusinesses = sampleBusinesses.filter(
      (b) => b.isIndigenousOwned || b.id.startsWith("bi")
    );
    const indigenousActivities = sampleActivities.filter(
      (a) => a.indigenousTags && a.indigenousTags.length > 0
    );
    const spotlightItems = [
      ...indigenousEvents,
      ...indigenousSpotlights,
      ...indigenousBusinesses,
      ...indigenousActivities,
    ];
    if (spotlightItems.length > 0) {
      indigenousEvents.forEach((e) => shownEventIds.add(e.id));
      sections.push({
        title: "First Nations Spotlight",
        subtitle: "Celebrating Indigenous culture and businesses",
        type: "spotlight",
        items: spotlightItems,
        priority: 3,
      });
    }
  }

  // --- Section 4: From Your Homeland (priority 4) ---
  if (homelandContentEnabled && originTags.length > 0) {
    const homelandEvents = sampleEvents.filter((evt) =>
      originTags.some((tag) => evt.communityTag.toLowerCase() === tag.toLowerCase())
    );
    if (homelandEvents.length > 0) {
      homelandEvents.forEach((e) => shownEventIds.add(e.id));
      sections.push({
        title: "From Your Homeland",
        subtitle: `Content connected to ${originCountry}`,
        type: "events",
        items: homelandEvents,
        priority: 4,
      });
    }
  }

  // --- Section 5: Homeland Moments (priority 5) ---
  if (homelandContentEnabled && originTags.length > 0 && city) {
    const homelandMoments = sampleEvents.filter((evt) => {
      const isOriginCulture = originTags.some(
        (tag) => evt.communityTag.toLowerCase() === tag.toLowerCase()
      );
      const isLocal = evt.city.toLowerCase() === city.toLowerCase() ||
                      evt.country.toLowerCase() === country.toLowerCase();
      return isOriginCulture && isLocal && !shownEventIds.has(evt.id);
    });
    if (homelandMoments.length > 0) {
      homelandMoments.forEach((e) => shownEventIds.add(e.id));
      sections.push({
        title: "Homeland Moments",
        subtitle: `Your culture, celebrated locally in ${city}`,
        type: "events",
        items: homelandMoments,
        priority: 5,
      });
    }
  }

  // --- Section 6: In Your Language (priority 6) ---
  if (userLanguages.length > 0) {
    const nonEnglishLangs = userLanguages.filter(l => l.toLowerCase() !== "english");
    if (nonEnglishLangs.length > 0) {
      const langEvents = sampleEvents.filter((evt) => {
        if (shownEventIds.has(evt.id)) return false;
        const eventLangs = getEventLanguageTags(evt).map(l => l.toLowerCase());
        return nonEnglishLangs.some(ul => eventLangs.includes(ul.toLowerCase()));
      });
      if (langEvents.length > 0) {
        const langNames = nonEnglishLangs.slice(0, 2).join(" & ");
        langEvents.forEach((e) => shownEventIds.add(e.id));
        sections.push({
          title: "In Your Language",
          subtitle: `Events in ${langNames}`,
          type: "events",
          items: langEvents.slice(0, 10),
          priority: 6,
        });
      }
    }
  }

  // --- Section 7: Recommended For You (priority 7) ---
  const unseenEvents = sampleEvents.filter((e) => !shownEventIds.has(e.id));
  const recommendedScored = unseenEvents
    .map((evt) => ({
      event: evt,
      score: computeCompositeScore(
        evt, city, country, allRelatedTags, userLanguages,
        originTags, indigenousVisibilityEnabled, maxAttending,
        userLat, userLng, radiusKm
      ),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 15);

  if (recommendedScored.length > 0) {
    sections.push({
      title: "Recommended For You",
      subtitle: "Personalised picks based on your interests",
      type: "events",
      items: recommendedScored.map((e) => e.event),
      priority: 7,
    });
  }

  // --- Section 8: Trending Events (priority 8) ---
  const trending = [...sampleEvents]
    .sort((a, b) => b.attending - a.attending)
    .slice(0, 10);
  if (trending.length > 0) {
    sections.push({
      title: "Trending Events",
      subtitle: "Most popular right now",
      type: "events",
      items: trending,
      priority: 8,
    });
  }

  // --- Section 9: Communities to Explore (priority 9) ---
  try {
    const allComms = await getAllCommunities();
    const userCommIds = new Set(userComms.map((c) => c.id));
    const exploreCommunities = allComms
      .filter((c) => !userCommIds.has(c.id))
      .slice(0, 10);
    if (exploreCommunities.length > 0) {
      sections.push({
        title: "Communities to Explore",
        subtitle: "Discover new groups to join",
        type: "communities",
        items: exploreCommunities,
        priority: 9,
      });
    }
  } catch {
  }

  sections.sort((a, b) => a.priority - b.priority);

  const totalItems = sections.reduce((sum, s) => sum + s.items.length, 0);

  return {
    sections,
    meta: {
      userId,
      city,
      country,
      generatedAt: new Date().toISOString(),
      totalItems,
      algorithmVersion: "2.0",
    },
  };
}

function getCityCoords(
  city: string,
  country: string
): { lat: number; lng: number } | null {
  const coords: Record<string, { lat: number; lng: number }> = {
    "sydney,australia": { lat: -33.8688, lng: 151.2093 },
    "melbourne,australia": { lat: -37.8136, lng: 144.9631 },
    "brisbane,australia": { lat: -27.4698, lng: 153.0251 },
    "perth,australia": { lat: -31.9505, lng: 115.8605 },
    "adelaide,australia": { lat: -34.9285, lng: 138.6007 },
    "canberra,australia": { lat: -35.2809, lng: 149.13 },
    "hobart,australia": { lat: -42.8821, lng: 147.3272 },
    "darwin,australia": { lat: -12.4634, lng: 130.8456 },
    "auckland,new zealand": { lat: -36.8485, lng: 174.7633 },
    "wellington,new zealand": { lat: -41.2865, lng: 174.7762 },
    "christchurch,new zealand": { lat: -43.5321, lng: 172.6362 },
    "dubai,united arab emirates": { lat: 25.2048, lng: 55.2708 },
    "abu dhabi,united arab emirates": { lat: 24.4539, lng: 54.3773 },
    "sharjah,united arab emirates": { lat: 25.3463, lng: 55.4209 },
    "london,united kingdom": { lat: 51.5074, lng: -0.1278 },
    "manchester,united kingdom": { lat: 53.4808, lng: -2.2426 },
    "birmingham,united kingdom": { lat: 52.4862, lng: -1.8904 },
    "toronto,canada": { lat: 43.6532, lng: -79.3832 },
    "vancouver,canada": { lat: 49.2827, lng: -123.1207 },
    "montreal,canada": { lat: 45.5017, lng: -73.5673 },
    "calgary,canada": { lat: 51.0447, lng: -114.0719 },
  };
  const key = `${city.toLowerCase()},${country.toLowerCase()}`;
  return coords[key] ?? null;
}

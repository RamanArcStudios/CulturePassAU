import {
  sampleEvents,
  sampleCommunities,
  sampleBusinesses,
  sampleActivities,
  indigenousSpotlights,
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
  };
}

/**
 * Calculates the great-circle distance in kilometres between two
 * geographic coordinates using the Haversine formula.
 */
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

/**
 * Maps a user's origin country name to community tags used in
 * sampleEvents communityTag field for homeland content matching.
 */
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

const SECTION_TITLE_MAP: Record<string, string> = {
  nearYou: "Near You",
  yourCommunities: "Your Communities",
  firstNationsSpotlight: "First Nations Spotlight",
  fromYourHomeland: "From Your Homeland",
  recommended: "Recommended For You",
  trending: "Trending Events",
  explore: "Communities to Explore",
};

/**
 * Builds a personalised discover feed for the given user.
 * Combines location, community, indigenous, and homeland signals
 * to rank and return content sections.
 */
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

  const userComms = user ? await getUserCommunities(userId) : [];
  const userCommNames = userComms.map((c) => c.name.toLowerCase());
  const allRelatedTags = userCommNames.flatMap((cn) => getCommunityRelatedTags(cn)).map((t) => t.toLowerCase());

  const sections: DiscoverSection[] = [];
  const shownEventIds = new Set<string>();

  // --- Section 1: Near You (priority 1) ---
  const nearYouScored = sampleEvents
    .map((evt) => {
      let score = 0;
      if (city && evt.city.toLowerCase() === city.toLowerCase()) score += 10;
      else if (country && evt.country.toLowerCase() === country.toLowerCase()) score += 5;

      if (userLat != null && userLng != null) {
        const cityCoords = getCityCoords(evt.city, evt.country);
        if (cityCoords) {
          const dist = haversineDistance(userLat, userLng, cityCoords.lat, cityCoords.lng);
          if (dist <= radiusKm) score += Math.max(0, 10 - dist / 10);
        }
      }
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
  if (homelandContentEnabled && originCountry) {
    const tags = getOriginCommunityTags(originCountry);
    if (tags.length > 0) {
      const homelandEvents = sampleEvents.filter((evt) =>
        tags.some((tag) => evt.communityTag.toLowerCase() === tag.toLowerCase())
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
  }

  // --- Section 5: Recommended For You (priority 5) ---
  const unseenEvents = sampleEvents.filter((e) => !shownEventIds.has(e.id));
  const recommendedScored = unseenEvents
    .map((evt) => {
      let score = 0;
      if (city && evt.city.toLowerCase() === city.toLowerCase()) score += 5;
      if (country && evt.country.toLowerCase() === country.toLowerCase()) score += 3;
      if (
        allRelatedTags &&
        allRelatedTags.some(
          (tag) =>
            evt.communityTag.toLowerCase().includes(tag) ||
            tag.includes(evt.communityTag.toLowerCase())
        )
      )
        score += 2;
      if (
        indigenousVisibilityEnabled &&
        evt.indigenousTags &&
        evt.indigenousTags.length > 0
      )
        score += 1;
      if (evt.isFeatured) score += 1;
      return { event: evt, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 15);

  if (recommendedScored.length > 0) {
    sections.push({
      title: "Recommended For You",
      subtitle: "Personalised picks based on your interests",
      type: "events",
      items: recommendedScored.map((e) => e.event),
      priority: 5,
    });
  }

  // --- Section 6: Trending Events (priority 6) ---
  const trending = [...sampleEvents]
    .sort((a, b) => b.attending - a.attending)
    .slice(0, 10);
  if (trending.length > 0) {
    sections.push({
      title: "Trending Events",
      subtitle: "Most popular right now",
      type: "events",
      items: trending,
      priority: 6,
    });
  }

  // --- Section 7: Communities to Explore (priority 7) ---
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
        priority: 7,
      });
    }
  } catch {
    // communities table may not be seeded yet
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
    },
  };
}

/**
 * Simple coordinate lookup for known cities used by the Near You
 * distance scoring when the user has lat/lng set on their profile.
 */
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

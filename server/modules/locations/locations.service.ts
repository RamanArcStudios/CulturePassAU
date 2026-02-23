import { db } from "../../db";
import { eq } from "drizzle-orm";
import { locations, type Location } from "@shared/schema";

/** Returns all locations ordered by name */
export async function getAllLocations(): Promise<Location[]> {
  return db.select().from(locations).orderBy(locations.name);
}

/** Returns locations filtered by type (country, state, or city) */
export async function getLocationsByType(type: "country" | "state" | "city"): Promise<Location[]> {
  return db.select().from(locations).where(eq(locations.locationType, type)).orderBy(locations.name);
}

/** Looks up a single location by its URL-friendly slug */
export async function getLocationBySlug(slug: string): Promise<Location | undefined> {
  const [loc] = await db.select().from(locations).where(eq(locations.slug, slug));
  return loc;
}

/** Looks up a single location by its unique ID */
export async function getLocationById(id: string): Promise<Location | undefined> {
  const [loc] = await db.select().from(locations).where(eq(locations.id, id));
  return loc;
}

/** Returns all child locations for a given parent ID */
export async function getChildLocations(parentId: string): Promise<Location[]> {
  return db.select().from(locations).where(eq(locations.parentId, parentId)).orderBy(locations.name);
}

/** Returns all cities belonging to a specific country code */
export async function getCitiesByCountry(countryCode: string): Promise<Location[]> {
  const upperCode = countryCode.toUpperCase();
  return db
    .select()
    .from(locations)
    .where(eq(locations.countryCode, upperCode))
    .orderBy(locations.name);
}

/** Creates a new location record */
export async function createLocation(data: typeof locations.$inferInsert): Promise<Location> {
  const [loc] = await db.insert(locations).values(data).returning();
  return loc;
}

/** Seeds the database with real location data for AU, NZ, AE, GB, and CA */
export async function seedLocations(): Promise<{ countries: number; cities: number }> {
  const existing = await getAllLocations();
  if (existing.length > 0) {
    return { countries: 0, cities: 0 };
  }

  const countryData: Array<typeof locations.$inferInsert> = [
    { id: "loc-au", name: "Australia", slug: "australia", locationType: "country" as const, parentId: null, countryCode: "AU", latitude: -25.2744, longitude: 133.7751, timezone: "Australia/Sydney", metadata: { region: "Oceania" } },
    { id: "loc-nz", name: "New Zealand", slug: "new-zealand", locationType: "country" as const, parentId: null, countryCode: "NZ", latitude: -40.9006, longitude: 174.886, timezone: "Pacific/Auckland", metadata: { region: "Oceania" } },
    { id: "loc-ae", name: "United Arab Emirates", slug: "uae", locationType: "country" as const, parentId: null, countryCode: "AE", latitude: 23.4241, longitude: 53.8478, timezone: "Asia/Dubai", metadata: { region: "Middle East" } },
    { id: "loc-gb", name: "United Kingdom", slug: "united-kingdom", locationType: "country" as const, parentId: null, countryCode: "GB", latitude: 55.3781, longitude: -3.436, timezone: "Europe/London", metadata: { region: "Europe" } },
    { id: "loc-ca", name: "Canada", slug: "canada", locationType: "country" as const, parentId: null, countryCode: "CA", latitude: 56.1304, longitude: -106.3468, timezone: "America/Toronto", metadata: { region: "North America" } },
  ];

  const cityData: Array<typeof locations.$inferInsert> = [
    { id: "loc-au-sydney", name: "Sydney", slug: "sydney", locationType: "city" as const, parentId: "loc-au", countryCode: "AU", latitude: -33.8688, longitude: 151.2093, timezone: "Australia/Sydney" },
    { id: "loc-au-melbourne", name: "Melbourne", slug: "melbourne", locationType: "city" as const, parentId: "loc-au", countryCode: "AU", latitude: -37.8136, longitude: 144.9631, timezone: "Australia/Melbourne" },
    { id: "loc-au-brisbane", name: "Brisbane", slug: "brisbane", locationType: "city" as const, parentId: "loc-au", countryCode: "AU", latitude: -27.4698, longitude: 153.0251, timezone: "Australia/Brisbane" },
    { id: "loc-au-perth", name: "Perth", slug: "perth", locationType: "city" as const, parentId: "loc-au", countryCode: "AU", latitude: -31.9505, longitude: 115.8605, timezone: "Australia/Perth" },
    { id: "loc-au-adelaide", name: "Adelaide", slug: "adelaide", locationType: "city" as const, parentId: "loc-au", countryCode: "AU", latitude: -34.9285, longitude: 138.6007, timezone: "Australia/Adelaide" },
    { id: "loc-au-canberra", name: "Canberra", slug: "canberra", locationType: "city" as const, parentId: "loc-au", countryCode: "AU", latitude: -35.2809, longitude: 149.1300, timezone: "Australia/Sydney" },
    { id: "loc-au-gold-coast", name: "Gold Coast", slug: "gold-coast", locationType: "city" as const, parentId: "loc-au", countryCode: "AU", latitude: -28.0167, longitude: 153.4000, timezone: "Australia/Brisbane" },
    { id: "loc-au-hobart", name: "Hobart", slug: "hobart", locationType: "city" as const, parentId: "loc-au", countryCode: "AU", latitude: -42.8821, longitude: 147.3272, timezone: "Australia/Hobart" },

    { id: "loc-nz-auckland", name: "Auckland", slug: "auckland", locationType: "city" as const, parentId: "loc-nz", countryCode: "NZ", latitude: -36.8485, longitude: 174.7633, timezone: "Pacific/Auckland" },
    { id: "loc-nz-wellington", name: "Wellington", slug: "wellington", locationType: "city" as const, parentId: "loc-nz", countryCode: "NZ", latitude: -41.2865, longitude: 174.7762, timezone: "Pacific/Auckland" },
    { id: "loc-nz-christchurch", name: "Christchurch", slug: "christchurch", locationType: "city" as const, parentId: "loc-nz", countryCode: "NZ", latitude: -43.5321, longitude: 172.6362, timezone: "Pacific/Auckland" },
    { id: "loc-nz-hamilton", name: "Hamilton", slug: "hamilton", locationType: "city" as const, parentId: "loc-nz", countryCode: "NZ", latitude: -37.7870, longitude: 175.2793, timezone: "Pacific/Auckland" },

    { id: "loc-ae-dubai", name: "Dubai", slug: "dubai", locationType: "city" as const, parentId: "loc-ae", countryCode: "AE", latitude: 25.2048, longitude: 55.2708, timezone: "Asia/Dubai" },
    { id: "loc-ae-abu-dhabi", name: "Abu Dhabi", slug: "abu-dhabi", locationType: "city" as const, parentId: "loc-ae", countryCode: "AE", latitude: 24.4539, longitude: 54.3773, timezone: "Asia/Dubai" },
    { id: "loc-ae-sharjah", name: "Sharjah", slug: "sharjah", locationType: "city" as const, parentId: "loc-ae", countryCode: "AE", latitude: 25.3463, longitude: 55.4209, timezone: "Asia/Dubai" },

    { id: "loc-gb-london", name: "London", slug: "london", locationType: "city" as const, parentId: "loc-gb", countryCode: "GB", latitude: 51.5074, longitude: -0.1278, timezone: "Europe/London" },
    { id: "loc-gb-manchester", name: "Manchester", slug: "manchester", locationType: "city" as const, parentId: "loc-gb", countryCode: "GB", latitude: 53.4808, longitude: -2.2426, timezone: "Europe/London" },
    { id: "loc-gb-birmingham", name: "Birmingham", slug: "birmingham", locationType: "city" as const, parentId: "loc-gb", countryCode: "GB", latitude: 52.4862, longitude: -1.8904, timezone: "Europe/London" },
    { id: "loc-gb-edinburgh", name: "Edinburgh", slug: "edinburgh", locationType: "city" as const, parentId: "loc-gb", countryCode: "GB", latitude: 55.9533, longitude: -3.1883, timezone: "Europe/London" },
    { id: "loc-gb-glasgow", name: "Glasgow", slug: "glasgow", locationType: "city" as const, parentId: "loc-gb", countryCode: "GB", latitude: 55.8642, longitude: -4.2518, timezone: "Europe/London" },
    { id: "loc-gb-cardiff", name: "Cardiff", slug: "cardiff", locationType: "city" as const, parentId: "loc-gb", countryCode: "GB", latitude: 51.4816, longitude: -3.1791, timezone: "Europe/London" },

    { id: "loc-ca-toronto", name: "Toronto", slug: "toronto", locationType: "city" as const, parentId: "loc-ca", countryCode: "CA", latitude: 43.6532, longitude: -79.3832, timezone: "America/Toronto" },
    { id: "loc-ca-vancouver", name: "Vancouver", slug: "vancouver", locationType: "city" as const, parentId: "loc-ca", countryCode: "CA", latitude: 49.2827, longitude: -123.1207, timezone: "America/Vancouver" },
    { id: "loc-ca-montreal", name: "Montreal", slug: "montreal", locationType: "city" as const, parentId: "loc-ca", countryCode: "CA", latitude: 45.5017, longitude: -73.5673, timezone: "America/Montreal" },
    { id: "loc-ca-calgary", name: "Calgary", slug: "calgary", locationType: "city" as const, parentId: "loc-ca", countryCode: "CA", latitude: 51.0447, longitude: -114.0719, timezone: "America/Edmonton" },
    { id: "loc-ca-ottawa", name: "Ottawa", slug: "ottawa", locationType: "city" as const, parentId: "loc-ca", countryCode: "CA", latitude: 45.4215, longitude: -75.6972, timezone: "America/Toronto" },
    { id: "loc-ca-edmonton", name: "Edmonton", slug: "edmonton", locationType: "city" as const, parentId: "loc-ca", countryCode: "CA", latitude: 53.5461, longitude: -113.4938, timezone: "America/Edmonton" },
  ];

  await db.insert(locations).values(countryData);
  await db.insert(locations).values(cityData);

  return { countries: countryData.length, cities: cityData.length };
}

import { db } from "./db";
import {
  events,
  businesses,
  movies,
  restaurants,
  activities,
  shopping,
  indigenousSpotlights,
  traditionalLands,
} from "@shared/schema";
import {
  sampleEvents,
  sampleBusinesses,
  sampleMovies,
  sampleRestaurants,
  sampleActivities,
  sampleShopping,
  traditionalLands as traditionalLandsData,
} from "../data/mockData";

const indigenousSpotlightsData = [
  {
    id: "is1",
    title: "NAIDOC Week Celebrations",
    description:
      "Celebrating Aboriginal and Torres Strait Islander culture, history and achievements",
    imageUrl:
      "https://images.unsplash.com/photo-1500043357865-c6b8827edf10?w=800&q=80",
    type: "event",
  },
  {
    id: "is2",
    title: "First Nations Art Exhibition",
    description:
      "Contemporary Indigenous art showcasing traditional and modern techniques",
    imageUrl:
      "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&q=80",
    type: "exhibition",
  },
  {
    id: "is3",
    title: "Aboriginal Cultural Workshops",
    description:
      "Hands-on workshops teaching traditional skills and knowledge",
    imageUrl:
      "https://images.unsplash.com/photo-1528164344885-47b1492b7391?w=800&q=80",
    type: "activity",
  },
];

export async function seedAllData() {
  console.log("Seeding database with mock data...");

  try {
    await db
      .insert(events)
      .values(
        sampleEvents.map((e) => ({
          id: e.id,
          cpid: e.cpid,
          title: e.title,
          description: e.description,
          date: e.date,
          time: e.time,
          venue: e.venue,
          address: e.address,
          price: e.price,
          priceLabel: e.priceLabel,
          category: e.category,
          communityTag: e.communityTag,
          councilTag: e.councilTag,
          organizer: e.organizer,
          organizerId: e.organizerId,
          imageColor: e.imageColor,
          imageUrl: e.imageUrl,
          capacity: e.capacity,
          attending: e.attending,
          isFeatured: e.isFeatured,
          isCouncil: e.isCouncil,
          tiers: e.tiers,
          country: e.country,
          city: e.city,
          indigenousTags: e.indigenousTags,
          languageTags: e.languageTags,
          nationalSignificance: e.nationalSignificance,
        }))
      )
      .onConflictDoNothing({ target: events.id });
    console.log(`Seeded ${sampleEvents.length} events`);

    await db
      .insert(businesses)
      .values(
        sampleBusinesses.map((b) => ({
          id: b.id,
          cpid: b.cpid,
          name: b.name,
          category: b.category,
          description: b.description,
          rating: b.rating,
          reviews: b.reviews,
          location: b.location,
          phone: b.phone,
          services: b.services,
          color: b.color,
          icon: b.icon,
          isVerified: b.isVerified,
          priceRange: b.priceRange,
          imageUrl: b.imageUrl,
          country: b.country,
          city: b.city,
          isIndigenousOwned: b.isIndigenousOwned,
          supplyNationRegistered: b.supplyNationRegistered,
          indigenousCategory: b.indigenousCategory,
        }))
      )
      .onConflictDoNothing({ target: businesses.id });
    console.log(`Seeded ${sampleBusinesses.length} businesses`);

    await db
      .insert(movies)
      .values(
        sampleMovies.map((m) => ({
          id: m.id,
          cpid: m.cpid,
          title: m.title,
          genre: m.genre,
          language: m.language,
          duration: m.duration,
          rating: m.rating,
          imdbScore: m.imdbScore,
          description: m.description,
          director: m.director,
          cast: m.cast,
          releaseDate: m.releaseDate,
          posterColor: m.posterColor,
          posterUrl: m.posterUrl,
          icon: m.icon,
          showtimes: m.showtimes,
          isTrending: m.isTrending,
          country: m.country,
          city: m.city,
        }))
      )
      .onConflictDoNothing({ target: movies.id });
    console.log(`Seeded ${sampleMovies.length} movies`);

    await db
      .insert(restaurants)
      .values(
        sampleRestaurants.map((r) => ({
          id: r.id,
          cpid: r.cpid,
          name: r.name,
          cuisine: r.cuisine,
          description: r.description,
          rating: r.rating,
          reviews: r.reviews,
          priceRange: r.priceRange,
          location: r.location,
          address: r.address,
          phone: r.phone,
          hours: r.hours,
          features: r.features,
          color: r.color,
          icon: r.icon,
          isOpen: r.isOpen,
          deliveryAvailable: r.deliveryAvailable,
          reservationAvailable: r.reservationAvailable,
          menuHighlights: r.menuHighlights,
          imageUrl: r.imageUrl,
          country: r.country,
          city: r.city,
        }))
      )
      .onConflictDoNothing({ target: restaurants.id });
    console.log(`Seeded ${sampleRestaurants.length} restaurants`);

    await db
      .insert(activities)
      .values(
        sampleActivities.map((a) => ({
          id: a.id,
          cpid: a.cpid,
          name: a.name,
          category: a.category,
          description: a.description,
          location: a.location,
          price: a.price,
          priceLabel: a.priceLabel,
          rating: a.rating,
          reviews: a.reviews,
          duration: a.duration,
          color: a.color,
          icon: a.icon,
          highlights: a.highlights,
          ageGroup: a.ageGroup,
          isPopular: a.isPopular,
          imageUrl: a.imageUrl,
          country: a.country,
          city: a.city,
          indigenousTags: a.indigenousTags,
        }))
      )
      .onConflictDoNothing({ target: activities.id });
    console.log(`Seeded ${sampleActivities.length} activities`);

    await db
      .insert(shopping)
      .values(
        sampleShopping.map((s) => ({
          id: s.id,
          cpid: s.cpid,
          name: s.name,
          category: s.category,
          description: s.description,
          location: s.location,
          rating: s.rating,
          reviews: s.reviews,
          color: s.color,
          icon: s.icon,
          deals: s.deals,
          isOpen: s.isOpen,
          deliveryAvailable: s.deliveryAvailable,
          imageUrl: s.imageUrl,
          country: s.country,
          city: s.city,
        }))
      )
      .onConflictDoNothing({ target: shopping.id });
    console.log(`Seeded ${sampleShopping.length} shopping`);

    await db
      .insert(indigenousSpotlights)
      .values(indigenousSpotlightsData)
      .onConflictDoNothing({ target: indigenousSpotlights.id });
    console.log(`Seeded ${indigenousSpotlightsData.length} indigenous spotlights`);

    await db
      .insert(traditionalLands)
      .values(
        traditionalLandsData.map((t, i) => ({
          id: `tl${i + 1}`,
          city: t.city,
          country: t.country,
          traditionalName: t.landName,
          peoples: t.traditionalCustodians,
        }))
      )
      .onConflictDoNothing({ target: traditionalLands.id });
    console.log(`Seeded ${traditionalLandsData.length} traditional lands`);

    console.log("Database seeding complete!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

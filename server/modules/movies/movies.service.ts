import { db } from "../../db";
import { eq, and, sql } from "drizzle-orm";
import { movies, type Movie } from "@shared/schema";

export async function getAllMovies(filters?: {
  country?: string;
  city?: string;
  genre?: string;
  trending?: boolean;
}): Promise<Movie[]> {
  const conditions: any[] = [];
  if (filters?.country) conditions.push(eq(movies.country, filters.country));
  if (filters?.city) conditions.push(eq(movies.city, filters.city));
  if (filters?.genre) conditions.push(sql`${movies.genre} @> ${JSON.stringify([filters.genre])}`);
  if (filters?.trending !== undefined) conditions.push(eq(movies.isTrending, filters.trending));
  const where = conditions.length > 0 ? and(...conditions) : undefined;
  return where ? db.select().from(movies).where(where) : db.select().from(movies);
}

export async function getMovieById(id: string): Promise<Movie | undefined> {
  const [m] = await db.select().from(movies).where(eq(movies.id, id));
  return m;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  city: string;
  state?: string;
  country?: string;
  address: string;
  price: number;
  currency?: string;
  category: string;
  imageUrl?: string;
  organizer: string;
  ticketsAvailable?: number;
  ticketsSold?: number;
}

export interface Artist {
  id: string;
  name: string;
  genre: string;
  bio: string;
  imageUrl: string | null;
  city: string;
  state: string;
  country?: string;
  cpid: string;
  featured?: boolean;
  performances?: number;
  website?: string | null;
  socialLinks?: Record<string, string> | null;
}

export interface Venue {
  id: string;
  name: string;
  venueType: string;
  description?: string;
  address: string;
  city: string;
  state: string;
  country: string;
  capacity?: number;
  images?: string[];
  amenities?: string[];
  contact?: string;
  phone?: string;
  website?: string;
  socialLinks?: Record<string, string> | null;
}

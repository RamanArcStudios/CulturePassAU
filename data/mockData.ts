export interface EventData {
  id: string;
  cpid: string;
  title: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  address: string;
  priceCents: number;
  priceLabel: string;
  category: string;
  communityTag: string;
  councilTag?: string;
  organizer: string;
  organizerId: string;
  imageColor: string;
  imageUrl: string;
  capacity: number;
  attending: number;
  isFeatured: boolean;
  isCouncil: boolean;
  tiers: { name: string; price: number; available: number }[];
  country: string;
  city: string;
  indigenousTags?: string[];
  languageTags?: string[];
  nationalSignificance?: number;
}

export interface CommunityData {
  id: string;
  cpid: string;
  name: string;
  description: string;
  members: number;
  events: number;
  color: string;
  icon: string;
  category: string;
  leaders: string[];
  imageUrl: string;
  country: string;
  city: string;
  isIndigenous?: boolean;
  nationLanguageGroup?: string;
}

export interface BusinessData {
  id: string;
  cpid: string;
  name: string;
  category: string;
  description: string;
  rating: number;
  reviews: number;
  location: string;
  phone: string;
  services: string[];
  color: string;
  icon: string;
  isVerified: boolean;
  priceRange: string;
  imageUrl: string;
  country: string;
  city: string;
  isIndigenousOwned?: boolean;
  supplyNationRegistered?: boolean;
  indigenousCategory?: string;
}

export interface MovieData {
  id: string;
  cpid: string;
  title: string;
  genre: string[];
  language: string;
  duration: string;
  rating: string;
  imdbScore: number;
  description: string;
  director: string;
  cast: string[];
  releaseDate: string;
  posterColor: string;
  posterUrl: string;
  icon: string;
  showtimes: { cinema: string; times: string[]; price: number }[];
  isTrending: boolean;
  country: string;
  city: string;
}

export interface RestaurantData {
  id: string;
  cpid: string;
  name: string;
  cuisine: string;
  description: string;
  rating: number;
  reviews: number;
  priceRange: string;
  location: string;
  address: string;
  phone: string;
  hours: string;
  features: string[];
  color: string;
  icon: string;
  isOpen: boolean;
  deliveryAvailable: boolean;
  reservationAvailable: boolean;
  menuHighlights: string[];
  imageUrl: string;
  country: string;
  city: string;
}

export interface ActivityData {
  id: string;
  cpid: string;
  name: string;
  category: string;
  description: string;
  location: string;
  priceCents: number;
  priceLabel: string;
  rating: number;
  reviews: number;
  duration: string;
  color: string;
  icon: string;
  highlights: string[];
  ageGroup: string;
  isPopular: boolean;
  imageUrl: string;
  country: string;
  city: string;
  indigenousTags?: string[];
}

export interface ShoppingData {
  id: string;
  cpid: string;
  name: string;
  category: string;
  description: string;
  location: string;
  rating: number;
  reviews: number;
  color: string;
  icon: string;
  deals: { title: string; discount: string; validTill: string }[];
  isOpen: boolean;
  deliveryAvailable: boolean;
  imageUrl: string;
  country: string;
  city: string;
}

export interface LocationData {
  country: string;
  countryCode: string;
  cities: string[];
}

export const locations: LocationData[] = [
  { country: 'Australia', countryCode: 'AU', cities: ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Canberra', 'Hobart', 'Darwin'] },
  { country: 'New Zealand', countryCode: 'NZ', cities: ['Auckland', 'Wellington', 'Christchurch', 'Hamilton', 'Dunedin'] },
  { country: 'United Arab Emirates', countryCode: 'AE', cities: ['Dubai', 'Abu Dhabi', 'Sharjah'] },
  { country: 'United Kingdom', countryCode: 'UK', cities: ['London', 'Manchester', 'Birmingham', 'Leeds'] },
  { country: 'Canada', countryCode: 'CA', cities: ['Toronto', 'Vancouver', 'Calgary', 'Montreal'] },
];

export interface TraditionalLandData {
  city: string;
  country: string;
  traditionalCustodians: string;
  landName: string;
  acknowledgement: string;
}

export const traditionalLands: TraditionalLandData[] = [
  { city: 'Sydney', country: 'Australia', traditionalCustodians: 'Gadigal People', landName: 'Gadigal Land', acknowledgement: 'CulturePass acknowledges the Gadigal People of the Eora Nation as the Traditional Custodians of this land.' },
  { city: 'Melbourne', country: 'Australia', traditionalCustodians: 'Wurundjeri Woi-wurrung People', landName: 'Wurundjeri Land', acknowledgement: 'CulturePass acknowledges the Wurundjeri Woi-wurrung People of the Kulin Nation as the Traditional Custodians of this land.' },
  { city: 'Brisbane', country: 'Australia', traditionalCustodians: 'Turrbal and Jagera Peoples', landName: 'Turrbal & Jagera Land', acknowledgement: 'CulturePass acknowledges the Turrbal and Jagera Peoples as the Traditional Custodians of this land.' },
  { city: 'Perth', country: 'Australia', traditionalCustodians: 'Whadjuk Noongar People', landName: 'Whadjuk Noongar Land', acknowledgement: 'CulturePass acknowledges the Whadjuk Noongar People as the Traditional Custodians of this land.' },
  { city: 'Adelaide', country: 'Australia', traditionalCustodians: 'Kaurna People', landName: 'Kaurna Land', acknowledgement: 'CulturePass acknowledges the Kaurna People as the Traditional Custodians of this land.' },
  { city: 'Canberra', country: 'Australia', traditionalCustodians: 'Ngunnawal People', landName: 'Ngunnawal Land', acknowledgement: 'CulturePass acknowledges the Ngunnawal People as the Traditional Custodians of this land.' },
  { city: 'Hobart', country: 'Australia', traditionalCustodians: 'Muwinina People', landName: 'Muwinina Land', acknowledgement: 'CulturePass acknowledges the Muwinina People as the Traditional Custodians of this land.' },
  { city: 'Darwin', country: 'Australia', traditionalCustodians: 'Larrakia People', landName: 'Larrakia Land', acknowledgement: 'CulturePass acknowledges the Larrakia People as the Traditional Custodians of this land.' },
  { city: 'Auckland', country: 'New Zealand', traditionalCustodians: 'Ngāti Whātua Ōrākei', landName: 'Tāmaki Makaurau', acknowledgement: 'CulturePass acknowledges Ngāti Whātua Ōrākei as mana whenua of Tāmaki Makaurau.' },
  { city: 'Wellington', country: 'New Zealand', traditionalCustodians: 'Te Āti Awa, Taranaki Whānui', landName: 'Te Whanganui-a-Tara', acknowledgement: 'CulturePass acknowledges Te Āti Awa and Taranaki Whānui as mana whenua of Te Whanganui-a-Tara.' },
  { city: 'Toronto', country: 'Canada', traditionalCustodians: 'Mississaugas of the Credit', landName: 'Treaty 13 Land', acknowledgement: 'CulturePass acknowledges the Mississaugas of the Credit, Anishnabeg, Chippewa, Haudenosaunee and Wendat peoples as the original inhabitants of this land.' },
  { city: 'Vancouver', country: 'Canada', traditionalCustodians: 'Musqueam, Squamish & Tsleil-Waututh Nations', landName: 'xʷməθkʷəy̓əm Land', acknowledgement: 'CulturePass acknowledges the Musqueam, Squamish and Tsleil-Waututh Nations on whose unceded traditional territory we operate.' },
];

export const communities: string[] = [
  'Aboriginal & Torres Strait Islander', 'First Nations',
  'Malayalee', 'Tamil', 'Punjabi', 'Multicultural', 'Council Events',
  'Business Networking', 'Youth', 'Religious', 'Bengali', 'Gujarati',
  'Telugu', 'Chinese', 'Filipino', 'Korean', 'Pacific Islander',
];

export const interests: string[] = [
  'Music', 'Dance', 'Festivals', 'Kids', 'Sports', 'Networking',
  'Arts', 'Spiritual', 'Business', 'Food & Cooking', 'Language',
  'Wellness', 'Theatre', 'Film', 'Photography',
];

export const interestIcons: Record<string, string> = {
  'Music': 'musical-notes', 'Dance': 'body', 'Festivals': 'sparkles',
  'Kids': 'happy', 'Sports': 'football', 'Networking': 'people',
  'Arts': 'color-palette', 'Spiritual': 'leaf', 'Business': 'briefcase',
  'Food & Cooking': 'restaurant', 'Language': 'chatbubbles', 'Wellness': 'heart',
  'Theatre': 'film', 'Film': 'videocam', 'Photography': 'camera',
};

export const communityIcons: Record<string, string> = {
  'Aboriginal & Torres Strait Islander': 'earth', 'First Nations': 'earth',
  'Malayalee': 'globe', 'Tamil': 'globe', 'Punjabi': 'globe',
  'Multicultural': 'earth', 'Council Events': 'business',
  'Business Networking': 'briefcase', 'Youth': 'rocket', 'Religious': 'leaf',
  'Bengali': 'globe', 'Gujarati': 'globe', 'Telugu': 'globe',
  'Chinese': 'globe', 'Filipino': 'globe', 'Korean': 'globe', 'Pacific Islander': 'globe',
};

export const sampleEvents: EventData[] = [
  {
    id: 'e1', cpid: 'CP-EVT-001', title: 'Onam Grand Celebration 2026',
    description: 'Join us for the biggest Onam celebration in Sydney featuring traditional Onasadya, Thiruvathirakali dance performances, boat races, and cultural programs.',
    date: '2026-03-15', time: '5:00 PM', venue: 'Sydney Olympic Park', address: '7 Olympic Blvd, Sydney NSW 2127',
    priceCents: 4500, priceLabel: 'From $45', category: 'Festivals', communityTag: 'Malayalee',
    organizer: 'Kerala Association of Sydney', organizerId: 'c1', imageColor: '#E85D3A',
    imageUrl: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80',
    capacity: 2000, attending: 1456, isFeatured: true, isCouncil: false,
    tiers: [{ name: 'General', price: 45, available: 344 }, { name: 'VIP', price: 85, available: 120 }, { name: 'Family (4)', price: 150, available: 80 }],
    country: 'Australia', city: 'Sydney',
  },
  {
    id: 'e2', cpid: 'CP-EVT-002', title: 'Tamil Pongal Festival',
    description: 'Celebrate the harvest festival of Pongal with traditional cooking demonstrations, Kolam competitions, folk music, and Bharatanatyam performances.',
    date: '2026-03-20', time: '10:00 AM', venue: 'Parramatta Park', address: 'Pitt St, Parramatta NSW 2150',
    priceCents: 0, priceLabel: 'Free', category: 'Festivals', communityTag: 'Tamil', councilTag: 'City of Parramatta',
    organizer: 'Tamil Cultural Forum', organizerId: 'c2', imageColor: '#1A7A6D',
    imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80',
    capacity: 5000, attending: 3200, isFeatured: true, isCouncil: true,
    tiers: [{ name: 'Free Entry', price: 0, available: 1800 }],
    country: 'Australia', city: 'Sydney',
  },
  {
    id: 'e3', cpid: 'CP-EVT-003', title: 'Multicultural Food & Music Night',
    description: 'An evening celebrating the diversity of our community through food stalls from 20+ cultures, live music performances, and interactive cooking workshops.',
    date: '2026-03-22', time: '6:00 PM', venue: 'Melbourne Convention Centre', address: '1 Convention Centre Pl, Melbourne VIC 3006',
    priceCents: 2500, priceLabel: 'From $25', category: 'Food & Cooking', communityTag: 'Multicultural', councilTag: 'City of Melbourne',
    organizer: 'Multicultural Victoria', organizerId: 'c4', imageColor: '#F2A93B',
    imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80',
    capacity: 3000, attending: 2100, isFeatured: true, isCouncil: true,
    tiers: [{ name: 'Entry', price: 25, available: 900 }, { name: 'VIP Tasting', price: 65, available: 200 }],
    country: 'Australia', city: 'Melbourne',
  },
  {
    id: 'e4', cpid: 'CP-EVT-004', title: 'Bollywood Dance Workshop',
    description: 'Learn the latest Bollywood dance moves with professional choreographers. All skill levels welcome.',
    date: '2026-03-25', time: '7:00 PM', venue: 'Blacktown Arts Centre', address: '78 Flushcombe Rd, Blacktown NSW 2148',
    priceCents: 2000, priceLabel: '$20', category: 'Dance', communityTag: 'Punjabi',
    organizer: 'Bhangra Beats Studio', organizerId: 'c3', imageColor: '#9B59B6',
    imageUrl: 'https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?w=800&q=80',
    capacity: 50, attending: 38, isFeatured: false, isCouncil: false,
    tiers: [{ name: 'Single', price: 20, available: 12 }],
    country: 'Australia', city: 'Sydney',
  },
  {
    id: 'e5', cpid: 'CP-EVT-005', title: 'Auckland Diwali Festival',
    description: 'The biggest Diwali celebration in New Zealand! Fireworks, food stalls, live music, dance performances, and market stalls.',
    date: '2026-04-01', time: '4:00 PM', venue: 'Aotea Square', address: 'Queen St, Auckland 1010',
    priceCents: 0, priceLabel: 'Free', category: 'Festivals', communityTag: 'Multicultural', councilTag: 'Auckland Council',
    organizer: 'Asia NZ Foundation', organizerId: 'c5', imageColor: '#E74C3C',
    imageUrl: 'https://images.unsplash.com/photo-1604871000636-074fa5117945?w=800&q=80',
    capacity: 10000, attending: 7500, isFeatured: true, isCouncil: true,
    tiers: [{ name: 'Free Entry', price: 0, available: 2500 }],
    country: 'New Zealand', city: 'Auckland',
  },
  {
    id: 'e6', cpid: 'CP-EVT-006', title: 'Community Yoga & Wellness Morning',
    description: 'Start your weekend with community yoga, guided meditation, and Ayurvedic wellness talks. Light breakfast included.',
    date: '2026-03-28', time: '7:30 AM', venue: 'Centennial Park', address: 'Grand Dr, Centennial Park NSW 2021',
    priceCents: 1500, priceLabel: '$15', category: 'Wellness', communityTag: 'Multicultural',
    organizer: 'Yoga with Priya', organizerId: 'b3', imageColor: '#2ECC71',
    imageUrl: 'https://images.unsplash.com/photo-1545389336-cf090694435e?w=800&q=80',
    capacity: 100, attending: 72, isFeatured: false, isCouncil: false,
    tiers: [{ name: 'Single', price: 15, available: 28 }],
    country: 'Australia', city: 'Sydney',
  },
  {
    id: 'e7', cpid: 'CP-EVT-007', title: 'Youth Business Pitch Night',
    description: 'Young entrepreneurs from multicultural backgrounds pitch their startup ideas to a panel of experienced mentors and investors.',
    date: '2026-04-05', time: '6:30 PM', venue: 'WeWork George Street', address: '100 Harris St, Pyrmont NSW 2009',
    priceCents: 1000, priceLabel: '$10', category: 'Business', communityTag: 'Youth',
    organizer: 'CulturePass Youth Network', organizerId: 'c7', imageColor: '#3498DB',
    imageUrl: 'https://images.unsplash.com/photo-1559223607-a43c990c692c?w=800&q=80',
    capacity: 150, attending: 110, isFeatured: false, isCouncil: false,
    tiers: [{ name: 'Attendee', price: 10, available: 40 }, { name: 'Pitcher', price: 0, available: 5 }],
    country: 'Australia', city: 'Sydney',
  },
  {
    id: 'e8', cpid: 'CP-EVT-008', title: 'Classical Carnatic Music Concert',
    description: 'An evening of sublime Carnatic music featuring renowned artists from India performing ragas and kritis.',
    date: '2026-04-10', time: '7:00 PM', venue: 'Sydney Town Hall', address: '483 George St, Sydney NSW 2000',
    priceCents: 5500, priceLabel: 'From $55', category: 'Music', communityTag: 'Tamil',
    organizer: 'Carnatic Music Society', organizerId: 'c2', imageColor: '#8E44AD',
    imageUrl: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800&q=80',
    capacity: 800, attending: 520, isFeatured: false, isCouncil: false,
    tiers: [{ name: 'Standard', price: 55, available: 180 }, { name: 'Premium', price: 95, available: 100 }],
    country: 'Australia', city: 'Sydney',
  },
  {
    id: 'e9', cpid: 'CP-EVT-009', title: 'Brisbane Holi Festival of Colours',
    description: 'Celebrate the festival of colours at South Bank with organic colours, Bollywood DJ, food trucks, and dance performances.',
    date: '2026-03-29', time: '11:00 AM', venue: 'South Bank Parklands', address: 'Stanley St, South Brisbane QLD 4101',
    priceCents: 1500, priceLabel: '$15', category: 'Festivals', communityTag: 'Multicultural',
    organizer: 'Indian Association QLD', organizerId: 'c4', imageColor: '#E74C3C',
    imageUrl: 'https://images.unsplash.com/photo-1576444356170-66073046b1bc?w=800&q=80',
    capacity: 4000, attending: 2800, isFeatured: true, isCouncil: false,
    tiers: [{ name: 'General', price: 15, available: 1200 }, { name: 'VIP', price: 40, available: 200 }],
    country: 'Australia', city: 'Brisbane',
  },
  {
    id: 'e10', cpid: 'CP-EVT-010', title: 'Perth Desi Night Live',
    description: 'An evening of live Bollywood and Punjabi music with top DJs, food stalls, and dance floor under the stars.',
    date: '2026-04-12', time: '7:00 PM', venue: 'Langley Park', address: 'Riverside Dr, Perth WA 6000',
    priceCents: 3000, priceLabel: '$30', category: 'Music', communityTag: 'Punjabi',
    organizer: 'Perth Indian Association', organizerId: 'c3', imageColor: '#F2A93B',
    imageUrl: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80',
    capacity: 1500, attending: 980, isFeatured: true, isCouncil: false,
    tiers: [{ name: 'General', price: 30, available: 520 }, { name: 'VIP', price: 60, available: 100 }],
    country: 'Australia', city: 'Perth',
  },
  {
    id: 'e11', cpid: 'CP-EVT-011', title: 'Perth Multicultural Food Fair',
    description: 'A grand food fair celebrating cuisines from over 30 cultures. Live cooking demos, kids activities, and cultural performances.',
    date: '2026-05-03', time: '10:00 AM', venue: 'Forrest Place', address: 'Forrest Pl, Perth WA 6000',
    priceCents: 0, priceLabel: 'Free', category: 'Food & Cooking', communityTag: 'Multicultural', councilTag: 'City of Perth',
    organizer: 'Multicultural WA', organizerId: 'c4', imageColor: '#2ECC71',
    imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80',
    capacity: 6000, attending: 3500, isFeatured: true, isCouncil: true,
    tiers: [{ name: 'Free Entry', price: 0, available: 2500 }],
    country: 'Australia', city: 'Perth',
  },
  {
    id: 'e12', cpid: 'CP-EVT-012', title: 'Brisbane Tamil Sangamam',
    description: 'Annual Tamil cultural gathering with classical music, dance competitions, drama, and authentic Tamil cuisine.',
    date: '2026-04-18', time: '3:00 PM', venue: 'Brisbane City Hall', address: '64 Adelaide St, Brisbane QLD 4000',
    priceCents: 2000, priceLabel: '$20', category: 'Festivals', communityTag: 'Tamil',
    organizer: 'Tamil Society QLD', organizerId: 'c2', imageColor: '#1A7A6D',
    imageUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80',
    capacity: 800, attending: 560, isFeatured: false, isCouncil: false,
    tiers: [{ name: 'General', price: 20, available: 240 }, { name: 'VIP', price: 45, available: 60 }],
    country: 'Australia', city: 'Brisbane',
  },
  {
    id: 'e13', cpid: 'CP-EVT-013', title: 'Wellington Deepavali Celebration',
    description: 'Wellington\'s premier Diwali event with fireworks, traditional lamps, food stalls, and cultural performances at the waterfront.',
    date: '2026-04-08', time: '5:00 PM', venue: 'Frank Kitts Park', address: 'Jervois Quay, Wellington 6011',
    priceCents: 0, priceLabel: 'Free', category: 'Festivals', communityTag: 'Multicultural', councilTag: 'Wellington City Council',
    organizer: 'Wellington Indian Association', organizerId: 'c5', imageColor: '#E85D3A',
    imageUrl: 'https://images.unsplash.com/photo-1574265365744-4c1e22602e9f?w=800&q=80',
    capacity: 3000, attending: 2100, isFeatured: true, isCouncil: true,
    tiers: [{ name: 'Free Entry', price: 0, available: 900 }],
    country: 'New Zealand', city: 'Wellington',
  },
  {
    id: 'e14', cpid: 'CP-EVT-014', title: 'Auckland Holi Splash Festival',
    description: 'Celebrate Holi with organic colours, water play, Bollywood DJs, Indian street food, and family-friendly entertainment.',
    date: '2026-03-22', time: '12:00 PM', venue: 'Western Springs Park', address: '731 Great North Rd, Auckland 1022',
    priceCents: 2000, priceLabel: '$20 NZD', category: 'Festivals', communityTag: 'Multicultural',
    organizer: 'Holi Festival NZ', organizerId: 'c5', imageColor: '#9B59B6',
    imageUrl: 'https://images.unsplash.com/photo-1458682625221-3a45f8a844c7?w=800&q=80',
    capacity: 5000, attending: 3800, isFeatured: true, isCouncil: false,
    tiers: [{ name: 'General', price: 20, available: 1200 }, { name: 'VIP', price: 45, available: 200 }],
    country: 'New Zealand', city: 'Auckland',
  },
  {
    id: 'e15', cpid: 'CP-EVT-015', title: 'Wellington South Asian Film Night',
    description: 'A curated evening of award-winning South Asian short films followed by panel discussion with local filmmakers.',
    date: '2026-05-15', time: '6:30 PM', venue: 'Embassy Theatre', address: '10 Kent Terrace, Wellington 6011',
    priceCents: 1800, priceLabel: '$18 NZD', category: 'Film', communityTag: 'Multicultural',
    organizer: 'NZ South Asian Film Society', organizerId: 'c5', imageColor: '#2C3E50',
    imageUrl: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800&q=80',
    capacity: 400, attending: 280, isFeatured: false, isCouncil: false,
    tiers: [{ name: 'Standard', price: 18, available: 120 }],
    country: 'New Zealand', city: 'Wellington',
  },
  {
    id: 'e16', cpid: 'CP-EVT-016', title: 'Dubai Diwali Gala',
    description: 'A grand Diwali celebration at the luxurious Madinat Jumeirah with live entertainment, fireworks, gourmet Indian dining, and cultural performances.',
    date: '2026-04-20', time: '7:00 PM', venue: 'Madinat Jumeirah', address: 'Al Sufouh Rd, Dubai, UAE',
    priceCents: 12000, priceLabel: 'From AED 450', category: 'Festivals', communityTag: 'Multicultural',
    organizer: 'Indian Association Dubai', organizerId: 'c5', imageColor: '#F2A93B',
    imageUrl: 'https://images.unsplash.com/photo-1514222134-b57cbb8ce073?w=800&q=80',
    capacity: 2000, attending: 1650, isFeatured: true, isCouncil: false,
    tiers: [{ name: 'Standard', price: 120, available: 250 }, { name: 'Premium', price: 220, available: 100 }],
    country: 'United Arab Emirates', city: 'Dubai',
  },
  {
    id: 'e17', cpid: 'CP-EVT-017', title: 'Dubai South Asian Music Festival',
    description: 'Three days of live South Asian music featuring artists from India, Pakistan, and Sri Lanka. Bollywood, Qawwali, and classical fusion.',
    date: '2026-05-08', time: '6:00 PM', venue: 'Dubai World Trade Centre', address: 'Sheikh Zayed Rd, Dubai, UAE',
    priceCents: 8500, priceLabel: 'From AED 310', category: 'Music', communityTag: 'Multicultural',
    organizer: 'Dubai Cultural Authority', organizerId: 'c4', imageColor: '#8E44AD',
    imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80',
    capacity: 5000, attending: 3200, isFeatured: true, isCouncil: false,
    tiers: [{ name: 'Day Pass', price: 85, available: 1800 }, { name: '3-Day Pass', price: 200, available: 500 }],
    country: 'United Arab Emirates', city: 'Dubai',
  },
  {
    id: 'e18', cpid: 'CP-EVT-018', title: 'Abu Dhabi Onam Sadhya',
    description: 'Traditional Onam feast and cultural program featuring Pulikali, Kathakali, and Thiruvathirakali at the Abu Dhabi National Exhibition Centre.',
    date: '2026-04-25', time: '4:00 PM', venue: 'ADNEC', address: 'Khaleej Al Arabi St, Abu Dhabi, UAE',
    priceCents: 6000, priceLabel: 'From AED 220', category: 'Festivals', communityTag: 'Malayalee',
    organizer: 'Kerala Samajam Abu Dhabi', organizerId: 'c1', imageColor: '#E85D3A',
    imageUrl: 'https://images.unsplash.com/photo-1528164344885-47b1492b7391?w=800&q=80',
    capacity: 3000, attending: 2400, isFeatured: true, isCouncil: false,
    tiers: [{ name: 'General', price: 60, available: 400 }, { name: 'VIP', price: 110, available: 200 }],
    country: 'United Arab Emirates', city: 'Abu Dhabi',
  },
  {
    id: 'e19', cpid: 'CP-EVT-019', title: 'Abu Dhabi Yoga & Wellness Retreat',
    description: 'A weekend wellness retreat combining yoga, Ayurvedic workshops, meditation, and holistic health talks at the stunning Saadiyat Beach.',
    date: '2026-05-22', time: '8:00 AM', venue: 'Saadiyat Beach Club', address: 'Saadiyat Island, Abu Dhabi, UAE',
    priceCents: 9500, priceLabel: 'From AED 350', category: 'Wellness', communityTag: 'Multicultural',
    organizer: 'UAE Wellness Collective', organizerId: 'c4', imageColor: '#2ECC71',
    imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80',
    capacity: 200, attending: 140, isFeatured: false, isCouncil: false,
    tiers: [{ name: 'Single Day', price: 95, available: 40 }, { name: 'Weekend Pass', price: 160, available: 20 }],
    country: 'United Arab Emirates', city: 'Abu Dhabi',
  },
  {
    id: 'e20', cpid: 'CP-EVT-020', title: 'Brick Lane Curry Festival',
    description: 'London\'s iconic Brick Lane comes alive with a curry cooking competition, street food stalls, live music, and dance performances.',
    date: '2026-04-05', time: '12:00 PM', venue: 'Brick Lane', address: 'Brick Lane, London E1 6QL',
    priceCents: 0, priceLabel: 'Free', category: 'Food & Cooking', communityTag: 'Multicultural', councilTag: 'Tower Hamlets Council',
    organizer: 'Brick Lane Festival Committee', organizerId: 'c4', imageColor: '#E85D3A',
    imageUrl: 'https://images.unsplash.com/photo-1567337710282-00832b415979?w=800&q=80',
    capacity: 8000, attending: 6200, isFeatured: true, isCouncil: true,
    tiers: [{ name: 'Free Entry', price: 0, available: 1800 }],
    country: 'United Kingdom', city: 'London',
  },
  {
    id: 'e21', cpid: 'CP-EVT-021', title: 'South Bank Cultural Fest',
    description: 'A weekend of South Asian arts, theatre, poetry, and live music on London\'s iconic South Bank featuring emerging and established artists.',
    date: '2026-05-16', time: '11:00 AM', venue: 'Southbank Centre', address: 'Belvedere Rd, London SE1 8XX',
    priceCents: 1500, priceLabel: 'From £12', category: 'Arts', communityTag: 'Multicultural',
    organizer: 'South Asian Arts UK', organizerId: 'c4', imageColor: '#3498DB',
    imageUrl: 'https://images.unsplash.com/photo-1486591038957-45e4b72e6c84?w=800&q=80',
    capacity: 2000, attending: 1400, isFeatured: true, isCouncil: false,
    tiers: [{ name: 'Day Pass', price: 15, available: 600 }, { name: 'Weekend Pass', price: 25, available: 300 }],
    country: 'United Kingdom', city: 'London',
  },
  {
    id: 'e22', cpid: 'CP-EVT-022', title: 'London Navratri Garba Night',
    description: 'Nine nights of Garba and Dandiya celebration at the Excel Centre with live orchestra, authentic Gujarati food, and traditional dress competition.',
    date: '2026-04-15', time: '7:00 PM', venue: 'ExCeL London', address: 'Royal Victoria Dock, London E16 1XL',
    priceCents: 2500, priceLabel: 'From £20', category: 'Dance', communityTag: 'Gujarati',
    organizer: 'London Gujarati Society', organizerId: 'c4', imageColor: '#F2A93B',
    imageUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80',
    capacity: 5000, attending: 4200, isFeatured: true, isCouncil: false,
    tiers: [{ name: 'Single Night', price: 25, available: 800 }, { name: 'Season Pass', price: 180, available: 200 }],
    country: 'United Kingdom', city: 'London',
  },
  {
    id: 'e23', cpid: 'CP-EVT-023', title: 'Manchester Mela',
    description: 'Manchester\'s annual South Asian festival with live music, dance, food, crafts, and a spectacular fireworks finale in Platt Fields Park.',
    date: '2026-05-24', time: '12:00 PM', venue: 'Platt Fields Park', address: 'Wilmslow Rd, Manchester M14 6LA',
    priceCents: 0, priceLabel: 'Free', category: 'Festivals', communityTag: 'Multicultural', councilTag: 'Manchester City Council',
    organizer: 'Manchester Mela Committee', organizerId: 'c4', imageColor: '#E74C3C',
    imageUrl: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800&q=80',
    capacity: 15000, attending: 11000, isFeatured: true, isCouncil: true,
    tiers: [{ name: 'Free Entry', price: 0, available: 4000 }],
    country: 'United Kingdom', city: 'Manchester',
  },
  {
    id: 'e24', cpid: 'CP-EVT-024', title: 'Manchester Bhangra Night',
    description: 'High-energy Bhangra night with live dhol players, Punjabi DJs, and traditional food at Manchester\'s premier Asian venue.',
    date: '2026-04-18', time: '8:00 PM', venue: 'O2 Ritz Manchester', address: 'Whitworth St West, Manchester M1 5NQ',
    priceCents: 2000, priceLabel: 'From £15', category: 'Music', communityTag: 'Punjabi',
    organizer: 'Bhangra Nation UK', organizerId: 'c3', imageColor: '#9B59B6',
    imageUrl: 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=800&q=80',
    capacity: 1200, attending: 950, isFeatured: false, isCouncil: false,
    tiers: [{ name: 'General', price: 20, available: 250 }, { name: 'VIP', price: 40, available: 50 }],
    country: 'United Kingdom', city: 'Manchester',
  },
  {
    id: 'e25', cpid: 'CP-EVT-025', title: 'Scarborough Tamil Festival',
    description: 'A vibrant celebration of Tamil culture in Scarborough with traditional music, dance, food stalls, and cultural exhibitions.',
    date: '2026-05-10', time: '10:00 AM', venue: 'Scarborough Civic Centre', address: '150 Borough Dr, Scarborough ON M1P 4N7',
    priceCents: 0, priceLabel: 'Free', category: 'Festivals', communityTag: 'Tamil', councilTag: 'City of Toronto',
    organizer: 'Tamil Cultural Association of Canada', organizerId: 'c2', imageColor: '#1A7A6D',
    imageUrl: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&q=80',
    capacity: 3000, attending: 2200, isFeatured: true, isCouncil: true,
    tiers: [{ name: 'Free Entry', price: 0, available: 800 }],
    country: 'Canada', city: 'Toronto',
  },
  {
    id: 'e26', cpid: 'CP-EVT-026', title: 'Brampton Vaisakhi Parade',
    description: 'Grand Vaisakhi celebration with a vibrant Nagar Kirtan procession, langar, live Punjabi music, and community gathering.',
    date: '2026-04-13', time: '9:00 AM', venue: 'Brampton City Hall', address: '2 Wellington St W, Brampton ON L6Y 4R2',
    priceCents: 0, priceLabel: 'Free', category: 'Festivals', communityTag: 'Punjabi',
    organizer: 'Sikh Heritage Canada', organizerId: 'c3', imageColor: '#F2A93B',
    imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80',
    capacity: 20000, attending: 15000, isFeatured: true, isCouncil: false,
    tiers: [{ name: 'Free Entry', price: 0, available: 5000 }],
    country: 'Canada', city: 'Toronto',
  },
  {
    id: 'e27', cpid: 'CP-EVT-027', title: 'Toronto Bollywood Film Fest',
    description: 'A weekend showcasing the best of recent Bollywood cinema with special screenings, director Q&As, and after-parties.',
    date: '2026-05-30', time: '2:00 PM', venue: 'TIFF Bell Lightbox', address: '350 King St W, Toronto ON M5V 3X5',
    priceCents: 2500, priceLabel: 'From CAD $25', category: 'Film', communityTag: 'Multicultural',
    organizer: 'Bollywood Canada', organizerId: 'c4', imageColor: '#C0392B',
    imageUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&q=80',
    capacity: 500, attending: 380, isFeatured: false, isCouncil: false,
    tiers: [{ name: 'Single Film', price: 25, available: 120 }, { name: 'Weekend Pass', price: 60, available: 50 }],
    country: 'Canada', city: 'Toronto',
  },
  {
    id: 'e28', cpid: 'CP-EVT-028', title: 'Vancouver Diwali Downtown',
    description: 'Downtown Vancouver lights up for Diwali with a stunning light installation, food trucks, live performances, and fireworks over the harbour.',
    date: '2026-04-22', time: '5:00 PM', venue: 'Jack Poole Plaza', address: '1055 Canada Pl, Vancouver BC V6C 0C3',
    priceCents: 0, priceLabel: 'Free', category: 'Festivals', communityTag: 'Multicultural', councilTag: 'City of Vancouver',
    organizer: 'Vancouver Diwali Committee', organizerId: 'c4', imageColor: '#E74C3C',
    imageUrl: 'https://images.unsplash.com/photo-1604871000636-074fa5117945?w=800&q=80',
    capacity: 8000, attending: 6000, isFeatured: true, isCouncil: true,
    tiers: [{ name: 'Free Entry', price: 0, available: 2000 }],
    country: 'Canada', city: 'Vancouver',
  },
  {
    id: 'e29', cpid: 'CP-EVT-029', title: 'Vancouver Bhangra Blast',
    description: 'Annual Bhangra dance festival with live dhol, Punjabi music, food trucks, and dance competitions on the waterfront.',
    date: '2026-06-06', time: '3:00 PM', venue: 'Granville Island', address: '1661 Duranleau St, Vancouver BC V6H 3S3',
    priceCents: 1500, priceLabel: 'CAD $15', category: 'Dance', communityTag: 'Punjabi',
    organizer: 'BC Bhangra Alliance', organizerId: 'c3', imageColor: '#9B59B6',
    imageUrl: 'https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?w=800&q=80',
    capacity: 2000, attending: 1500, isFeatured: false, isCouncil: false,
    tiers: [{ name: 'General', price: 15, available: 500 }, { name: 'VIP', price: 35, available: 100 }],
    country: 'Canada', city: 'Vancouver',
  },
  {
    id: 'e30', cpid: 'CP-EVT-030', title: 'Dubai Holi Beach Party',
    description: 'Celebrate Holi on the beach with organic colours, water play, Bollywood DJ, and a lavish Indian buffet lunch.',
    date: '2026-03-28', time: '10:00 AM', venue: 'Zero Gravity Beach Club', address: 'Al Sufouh, Dubai Marina, Dubai, UAE',
    priceCents: 10000, priceLabel: 'From AED 370', category: 'Festivals', communityTag: 'Multicultural',
    organizer: 'Desi Events Dubai', organizerId: 'c4', imageColor: '#E74C3C',
    imageUrl: 'https://images.unsplash.com/photo-1576444356170-66073046b1bc?w=800&q=80',
    capacity: 1500, attending: 1200, isFeatured: true, isCouncil: false,
    tiers: [{ name: 'General', price: 100, available: 300 }, { name: 'VIP Brunch', price: 180, available: 80 }],
    country: 'United Arab Emirates', city: 'Dubai',
  },
  {
    id: 'ei1', cpid: 'CP-EVT-I01', title: 'NAIDOC Week Opening Ceremony',
    description: 'Join the national opening ceremony for NAIDOC Week celebrating the history, culture, and achievements of Aboriginal and Torres Strait Islander peoples.',
    date: '2026-07-05', time: '10:00 AM', venue: 'The Domain', address: 'Art Gallery Rd, Sydney NSW 2000',
    priceCents: 0, priceLabel: 'Free', category: 'Festivals', communityTag: 'Aboriginal & Torres Strait Islander',
    organizer: 'First Nations Cultural Council', organizerId: 'ci1', imageColor: '#2C3E50',
    imageUrl: 'https://images.unsplash.com/photo-1534312527009-56c7016453e6?w=800&q=80',
    capacity: 10000, attending: 7500, isFeatured: true, isCouncil: false,
    tiers: [{ name: 'Free Entry', price: 0, available: 2500 }],
    country: 'Australia', city: 'Sydney',
    indigenousTags: ['Indigenous-led', 'NAIDOC Week', 'Cultural Ceremony'],
  },
  {
    id: 'ei2', cpid: 'CP-EVT-I02', title: 'Dreamtime Stories Under the Stars',
    description: 'An enchanting evening of traditional Aboriginal storytelling under the stars, featuring Dreamtime narratives passed down through generations.',
    date: '2026-06-20', time: '7:00 PM', venue: 'Royal Botanic Gardens', address: 'Birdwood Ave, Melbourne VIC 3004',
    priceCents: 2500, priceLabel: '$25', category: 'Arts', communityTag: 'Aboriginal & Torres Strait Islander',
    organizer: 'First Nations Cultural Council', organizerId: 'ci1', imageColor: '#1A5276',
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
    capacity: 300, attending: 240, isFeatured: true, isCouncil: false,
    tiers: [{ name: 'General', price: 25, available: 60 }],
    country: 'Australia', city: 'Melbourne',
    indigenousTags: ['Indigenous-led', 'Cultural Ceremony'],
  },
  {
    id: 'ei3', cpid: 'CP-EVT-I03', title: 'First Nations Art Exhibition',
    description: 'A curated exhibition of contemporary and traditional First Nations art featuring works from emerging and established Aboriginal artists.',
    date: '2026-05-10', time: '10:00 AM', venue: 'QAGOMA', address: 'Stanley Pl, South Brisbane QLD 4101',
    priceCents: 1500, priceLabel: '$15', category: 'Arts', communityTag: 'Aboriginal & Torres Strait Islander',
    organizer: 'First Nations Cultural Council', organizerId: 'ci1', imageColor: '#8B4513',
    imageUrl: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&q=80',
    capacity: 500, attending: 350, isFeatured: false, isCouncil: false,
    tiers: [{ name: 'General', price: 15, available: 150 }],
    country: 'Australia', city: 'Brisbane',
    indigenousTags: ['Indigenous-led', 'First Nations Owned'],
  },
  {
    id: 'ei4', cpid: 'CP-EVT-I04', title: 'Indigenous Bush Tucker Experience',
    description: 'Discover native Australian ingredients and traditional cooking methods in this immersive bush tucker experience led by Aboriginal elders.',
    date: '2026-06-14', time: '11:00 AM', venue: 'Kings Park', address: 'Fraser Ave, Perth WA 6005',
    priceCents: 6500, priceLabel: '$65', category: 'Food & Cooking', communityTag: 'Aboriginal & Torres Strait Islander',
    organizer: 'First Nations Cultural Council', organizerId: 'ci1', imageColor: '#2ECC71',
    imageUrl: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800&q=80',
    capacity: 40, attending: 32, isFeatured: false, isCouncil: false,
    tiers: [{ name: 'General', price: 65, available: 8 }],
    country: 'Australia', city: 'Perth',
    indigenousTags: ['Indigenous-led', 'First Nations Owned'],
  },
  {
    id: 'ei5', cpid: 'CP-EVT-I05', title: 'Reconciliation Week Concert',
    description: 'A powerful concert celebrating reconciliation featuring First Nations musicians, dancers, and spoken word artists at the iconic Sydney Opera House.',
    date: '2026-05-27', time: '7:00 PM', venue: 'Sydney Opera House', address: 'Bennelong Point, Sydney NSW 2000',
    priceCents: 0, priceLabel: 'Free', category: 'Music', communityTag: 'Aboriginal & Torres Strait Islander',
    organizer: 'First Nations Cultural Council', organizerId: 'ci1', imageColor: '#C0392B',
    imageUrl: 'https://images.unsplash.com/photo-1501612780327-45045538702b?w=800&q=80',
    capacity: 5000, attending: 4200, isFeatured: true, isCouncil: false,
    tiers: [{ name: 'Free Entry', price: 0, available: 800 }],
    country: 'Australia', city: 'Sydney',
    indigenousTags: ['Indigenous-led', 'Reconciliation Week'],
  },
  {
    id: 'ei6', cpid: 'CP-EVT-I06', title: 'Didgeridoo & Traditional Dance Workshop',
    description: 'Learn the ancient art of didgeridoo playing and traditional Aboriginal dance in this hands-on workshop led by Indigenous performers.',
    date: '2026-06-28', time: '2:00 PM', venue: 'Museum and Art Gallery of NT', address: '19 Conacher St, Darwin NT 0801',
    priceCents: 3500, priceLabel: '$35', category: 'Dance', communityTag: 'Aboriginal & Torres Strait Islander',
    organizer: 'First Nations Cultural Council', organizerId: 'ci1', imageColor: '#E85D3A',
    imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80',
    capacity: 60, attending: 48, isFeatured: false, isCouncil: false,
    tiers: [{ name: 'General', price: 35, available: 12 }],
    country: 'Australia', city: 'Darwin',
    indigenousTags: ['Indigenous-led', 'Cultural Ceremony'],
  },
];

export const sampleCommunities: CommunityData[] = [
  { id: 'c1', cpid: 'CP-COM-001', name: 'Malayalee Community', description: 'Connecting Kerala diaspora across Australia and New Zealand. Cultural events, language classes, and community support.', members: 12500, events: 45, color: '#E85D3A', icon: 'globe', category: 'Cultural', leaders: ['Arun Kumar', 'Lekha Nair', 'Rajesh Menon'], imageUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80', country: 'Australia', city: 'Sydney' },
  { id: 'c2', cpid: 'CP-COM-002', name: 'Tamil Cultural Forum', description: 'Preserving and celebrating Tamil heritage through language, arts, music, and festivals.', members: 9800, events: 38, color: '#1A7A6D', icon: 'globe', category: 'Cultural', leaders: ['Priya Raman', 'Karthik Subramanian'], imageUrl: 'https://images.unsplash.com/photo-1506869640319-fe1a24fd76cb?w=800&q=80', country: 'Australia', city: 'Sydney' },
  { id: 'c3', cpid: 'CP-COM-003', name: 'Punjabi Association', description: 'Bhangra, music, food, and festivities bringing the vibrant Punjabi culture to the Southern Hemisphere.', members: 7200, events: 28, color: '#F2A93B', icon: 'globe', category: 'Cultural', leaders: ['Harpreet Singh', 'Jasmine Kaur'], imageUrl: 'https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=800&q=80', country: 'Australia', city: 'Sydney' },
  { id: 'c4', cpid: 'CP-COM-004', name: 'Multicultural Victoria', description: 'Celebrating the diversity of Melbourne and Victoria through inclusive community programs and events.', members: 25000, events: 120, color: '#3498DB', icon: 'earth', category: 'Regional', leaders: ['Sarah Chen', 'Ahmed Hassan'], imageUrl: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&q=80', country: 'Australia', city: 'Melbourne' },
  { id: 'c5', cpid: 'CP-COM-005', name: 'Indian Community NZ', description: 'Supporting the Indian diaspora in New Zealand with cultural events, networking, and wellbeing programs.', members: 15000, events: 55, color: '#E74C3C', icon: 'globe', category: 'Cultural', leaders: ['Vikram Patel', 'Anita Sharma'], imageUrl: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=800&q=80', country: 'New Zealand', city: 'Auckland' },
  { id: 'c6', cpid: 'CP-COM-006', name: 'Bengali Association', description: 'Durga Puja, Rabindra Sangeet, and Bengali cultural celebrations bringing the warmth of Bengal to Australia.', members: 4500, events: 22, color: '#9B59B6', icon: 'globe', category: 'Cultural', leaders: ['Dipankar Roy', 'Soma Ghosh'], imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80', country: 'Australia', city: 'Sydney' },
  { id: 'c7', cpid: 'CP-COM-007', name: 'Youth Network', description: 'Empowering young multicultural Australians through mentorship, career development, and social events.', members: 8000, events: 35, color: '#2ECC71', icon: 'rocket', category: 'Youth', leaders: ['Zara Ahmed', 'Jason Li'], imageUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80', country: 'Australia', city: 'Sydney' },
  { id: 'c8', cpid: 'CP-COM-008', name: 'Filipino Community', description: 'Bringing Filipino traditions, food, music, and community spirit to Australian shores.', members: 11000, events: 42, color: '#1ABC9C', icon: 'globe', category: 'Cultural', leaders: ['Maria Santos', 'Carlo Reyes'], imageUrl: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&q=80', country: 'Australia', city: 'Sydney' },
  { id: 'c9', cpid: 'CP-COM-009', name: 'Brisbane Multicultural Hub', description: 'Connecting diverse communities across Brisbane through cultural exchange, events, and social programs.', members: 8500, events: 30, color: '#E74C3C', icon: 'earth', category: 'Regional', leaders: ['Ravi Kapoor', 'Mei Lin'], imageUrl: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&q=80', country: 'Australia', city: 'Brisbane' },
  { id: 'c10', cpid: 'CP-COM-010', name: 'Perth Indian Society', description: 'A vibrant community of Indian professionals and families in Perth sharing culture, food, and celebrations.', members: 6200, events: 25, color: '#F2A93B', icon: 'globe', category: 'Cultural', leaders: ['Deepak Nair', 'Sunita Reddy'], imageUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80', country: 'Australia', city: 'Perth' },
  { id: 'c11', cpid: 'CP-COM-011', name: 'Wellington Desi Collective', description: 'South Asian community group in Wellington organising cultural events, networking, and family activities.', members: 4200, events: 18, color: '#2ECC71', icon: 'globe', category: 'Cultural', leaders: ['Anil Mehta', 'Kavitha Nair'], imageUrl: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=800&q=80', country: 'New Zealand', city: 'Wellington' },
  { id: 'c12', cpid: 'CP-COM-012', name: 'Dubai South Asian Forum', description: 'The largest South Asian community network in Dubai connecting professionals, families, and cultural enthusiasts.', members: 35000, events: 80, color: '#E85D3A', icon: 'earth', category: 'Regional', leaders: ['Suresh Menon', 'Fatima Ali'], imageUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80', country: 'United Arab Emirates', city: 'Dubai' },
  { id: 'c13', cpid: 'CP-COM-013', name: 'Abu Dhabi Kerala Samajam', description: 'Malayalee community organisation in Abu Dhabi promoting Kerala culture, festivals, and mutual support.', members: 18000, events: 40, color: '#1A7A6D', icon: 'globe', category: 'Cultural', leaders: ['Thomas George', 'Lakshmi Pillai'], imageUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80', country: 'United Arab Emirates', city: 'Abu Dhabi' },
  { id: 'c14', cpid: 'CP-COM-014', name: 'London South Asian Network', description: 'Connecting the vibrant South Asian community across London through arts, culture, business, and social events.', members: 42000, events: 150, color: '#9B59B6', icon: 'earth', category: 'Regional', leaders: ['Priya Patel', 'Imran Khan'], imageUrl: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&q=80', country: 'United Kingdom', city: 'London' },
  { id: 'c15', cpid: 'CP-COM-015', name: 'Manchester Desi Community', description: 'Bringing together the South Asian community in Greater Manchester for cultural celebrations, networking, and support.', members: 15000, events: 45, color: '#3498DB', icon: 'globe', category: 'Cultural', leaders: ['Raj Sharma', 'Ayesha Malik'], imageUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80', country: 'United Kingdom', city: 'Manchester' },
  { id: 'c16', cpid: 'CP-COM-016', name: 'Toronto Tamil Community', description: 'One of the largest Tamil communities outside South Asia. Cultural preservation, language programs, and community events.', members: 28000, events: 65, color: '#1A7A6D', icon: 'globe', category: 'Cultural', leaders: ['Kumaran Selvaraj', 'Thilaga Rajan'], imageUrl: 'https://images.unsplash.com/photo-1506869640319-fe1a24fd76cb?w=800&q=80', country: 'Canada', city: 'Toronto' },
  { id: 'c17', cpid: 'CP-COM-017', name: 'Vancouver Indo-Canadian Society', description: 'Celebrating the rich Indo-Canadian heritage in Vancouver through festivals, community service, and cultural programs.', members: 20000, events: 55, color: '#F2A93B', icon: 'globe', category: 'Cultural', leaders: ['Gurpreet Dhillon', 'Rani Bhatia'], imageUrl: 'https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=800&q=80', country: 'Canada', city: 'Vancouver' },
  { id: 'ci1', cpid: 'CP-COM-I01', name: 'First Nations Cultural Council', description: 'Supporting Aboriginal and Torres Strait Islander cultural preservation, community events, and artistic expression across Australia.', members: 12500, events: 45, color: '#1A5276', icon: 'earth', category: 'Indigenous', leaders: ['Uncle Jack', 'Aunty Mabel', 'Dr. Sarah Brown'], imageUrl: 'https://images.unsplash.com/photo-1534312527009-56c7016453e6?w=800&q=80', country: 'Australia', city: 'Sydney', isIndigenous: true, nationLanguageGroup: 'Multi-Nation' },
  { id: 'ci2', cpid: 'CP-COM-I02', name: 'Yolngu Cultural Exchange', description: 'Connecting Yolngu community members with cultural programs, language preservation initiatives, and traditional arts workshops.', members: 3200, events: 18, color: '#8B4513', icon: 'earth', category: 'Indigenous', leaders: ['Elder Wunungmurra', 'Dhopiya Marika'], imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80', country: 'Australia', city: 'Darwin', isIndigenous: true, nationLanguageGroup: 'Yolngu Matha' },
];

export const sampleBusinesses: BusinessData[] = [
  { id: 'b1', cpid: 'CP-BIZ-001', name: 'Spice Route Kitchen', category: 'Restaurants', description: 'Authentic South Indian and Kerala cuisine. Catering available for events up to 500 guests.', rating: 4.8, reviews: 324, location: 'Parramatta, NSW', phone: '+61 2 9876 5432', services: ['Dine-in', 'Catering', 'Event Packages', 'Delivery'], color: '#E85D3A', icon: 'restaurant', isVerified: true, priceRange: '$$', imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80', country: 'Australia', city: 'Sydney' },
  { id: 'b2', cpid: 'CP-BIZ-002', name: 'Ranga Photography', category: 'Photographers', description: 'Specializing in cultural events, weddings, and portraits. Cinematic videography also available.', rating: 4.9, reviews: 189, location: 'Sydney CBD, NSW', phone: '+61 4 1234 5678', services: ['Event Photography', 'Wedding', 'Portrait', 'Videography'], color: '#1A7A6D', icon: 'camera', isVerified: true, priceRange: '$$$', imageUrl: 'https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=800&q=80', country: 'Australia', city: 'Sydney' },
  { id: 'b3', cpid: 'CP-BIZ-003', name: 'Shakti Events & Decor', category: 'Event Planners', description: 'Full-service event planning for cultural celebrations, weddings, and corporate events.', rating: 4.7, reviews: 156, location: 'Melbourne, VIC', phone: '+61 3 9876 1234', services: ['Wedding Planning', 'Decor', 'Stage Design', 'Floral'], color: '#F2A93B', icon: 'flower', isVerified: true, priceRange: '$$$', imageUrl: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80', country: 'Australia', city: 'Melbourne' },
  { id: 'b4', cpid: 'CP-BIZ-004', name: 'Natyam Dance Academy', category: 'Musicians', description: 'Classical and contemporary dance training. Bharatanatyam, Kuchipudi, and Bollywood styles.', rating: 4.9, reviews: 212, location: 'Blacktown, NSW', phone: '+61 2 9876 7890', services: ['Dance Classes', 'Performance', 'Choreography', 'Workshops'], color: '#9B59B6', icon: 'musical-notes', isVerified: false, priceRange: '$$', imageUrl: 'https://images.unsplash.com/photo-1547153760-18fc86c1ae69?w=800&q=80', country: 'Australia', city: 'Sydney' },
  { id: 'b5', cpid: 'CP-BIZ-005', name: 'The Grand Pavilion', category: 'Venues', description: 'Premium event venue with capacity for 1000 guests. Full AV setup and catering partnerships.', rating: 4.6, reviews: 98, location: 'Homebush, NSW', phone: '+61 2 9876 4321', services: ['Venue Hire', 'AV Setup', 'Catering', 'Valet Parking'], color: '#3498DB', icon: 'business', isVerified: true, priceRange: '$$$$', imageUrl: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80', country: 'Australia', city: 'Sydney' },
  { id: 'b6', cpid: 'CP-BIZ-006', name: 'Mehndi by Fatima', category: 'Decorators', description: 'Bridal and event mehndi artistry. Traditional and modern designs for all occasions.', rating: 4.8, reviews: 276, location: 'Auburn, NSW', phone: '+61 4 9876 2345', services: ['Bridal Mehndi', 'Party Mehndi', 'Corporate Events', 'Workshops'], color: '#E74C3C', icon: 'color-palette', isVerified: false, priceRange: '$$', imageUrl: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&q=80', country: 'Australia', city: 'Sydney' },
  { id: 'b7', cpid: 'CP-BIZ-007', name: 'Curry Leaf Catering', category: 'Restaurants', description: 'Premium Sri Lankan and South Indian catering for events of all sizes. Vegetarian specialists.', rating: 4.7, reviews: 145, location: 'Wentworthville, NSW', phone: '+61 2 9876 8765', services: ['Event Catering', 'Meal Prep', 'Cooking Classes', 'Corporate Lunches'], color: '#2ECC71', icon: 'restaurant', isVerified: true, priceRange: '$$', imageUrl: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&q=80', country: 'Australia', city: 'Sydney' },
  { id: 'b8', cpid: 'CP-BIZ-008', name: 'Auckland Indian Bazaar', category: 'Venues', description: 'Multi-purpose event and market space in the heart of Auckland. Perfect for cultural markets and festivals.', rating: 4.5, reviews: 67, location: 'Auckland, NZ', phone: '+64 9 123 4567', services: ['Market Stalls', 'Event Space', 'Pop-up Shop', 'Food Court'], color: '#1ABC9C', icon: 'storefront', isVerified: true, priceRange: '$$', imageUrl: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=800&q=80', country: 'New Zealand', city: 'Auckland' },
  { id: 'b9', cpid: 'CP-BIZ-009', name: 'Brisbane Event Hire', category: 'Event Planners', description: 'Full event hire service including marquees, tables, chairs, lighting, and sound systems for cultural events.', rating: 4.6, reviews: 112, location: 'South Brisbane, QLD', phone: '+61 7 3456 7890', services: ['Marquee Hire', 'Furniture', 'Lighting', 'Sound Systems'], color: '#3498DB', icon: 'construct', isVerified: true, priceRange: '$$', imageUrl: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80', country: 'Australia', city: 'Brisbane' },
  { id: 'b10', cpid: 'CP-BIZ-010', name: 'Perth Spice Kitchen', category: 'Restaurants', description: 'Authentic Indian restaurant and catering service in Perth. Specialising in North and South Indian cuisines.', rating: 4.7, reviews: 198, location: 'Northbridge, WA', phone: '+61 8 9456 1234', services: ['Dine-in', 'Catering', 'Takeaway', 'Delivery'], color: '#E85D3A', icon: 'restaurant', isVerified: true, priceRange: '$$', imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80', country: 'Australia', city: 'Perth' },
  { id: 'b11', cpid: 'CP-BIZ-011', name: 'Perth Wedding Films', category: 'Photographers', description: 'Cinematic wedding videography and photography specialising in South Asian ceremonies and receptions.', rating: 4.8, reviews: 87, location: 'Perth CBD, WA', phone: '+61 8 9456 5678', services: ['Wedding Films', 'Photography', 'Drone Footage', 'Same-day Edit'], color: '#9B59B6', icon: 'camera', isVerified: true, priceRange: '$$$', imageUrl: 'https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=800&q=80', country: 'Australia', city: 'Perth' },
  { id: 'b12', cpid: 'CP-BIZ-012', name: 'Wellington Chai House', category: 'Restaurants', description: 'Cozy chai lounge and Indian street food eatery in the heart of Wellington. Perfect for casual dining.', rating: 4.6, reviews: 134, location: 'Cuba Street, Wellington', phone: '+64 4 567 8901', services: ['Dine-in', 'Takeaway', 'Catering', 'Private Events'], color: '#2ECC71', icon: 'cafe', isVerified: true, priceRange: '$', imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&q=80', country: 'New Zealand', city: 'Wellington' },
  { id: 'b13', cpid: 'CP-BIZ-013', name: 'Auckland Henna Arts', category: 'Decorators', description: 'Professional mehndi and henna art for weddings, festivals, and special occasions across Auckland.', rating: 4.9, reviews: 156, location: 'Mt Roskill, Auckland', phone: '+64 9 234 5678', services: ['Bridal Mehndi', 'Festival Henna', 'Corporate Events', 'Parties'], color: '#E74C3C', icon: 'color-palette', isVerified: true, priceRange: '$$', imageUrl: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&q=80', country: 'New Zealand', city: 'Auckland' },
  { id: 'b14', cpid: 'CP-BIZ-014', name: 'Al Barsha Cultural Centre', category: 'Venues', description: 'Multi-purpose cultural centre in Al Barsha hosting events, exhibitions, and community gatherings for the South Asian community.', rating: 4.7, reviews: 234, location: 'Al Barsha, Dubai', phone: '+971 4 567 8901', services: ['Event Space', 'Exhibition Hall', 'Meeting Rooms', 'Auditorium'], color: '#F2A93B', icon: 'business', isVerified: true, priceRange: '$$$', imageUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80', country: 'United Arab Emirates', city: 'Dubai' },
  { id: 'b15', cpid: 'CP-BIZ-015', name: 'Dubai Desi Photography', category: 'Photographers', description: 'Premium South Asian event and wedding photography in Dubai. Serving the entire UAE.', rating: 4.8, reviews: 312, location: 'Business Bay, Dubai', phone: '+971 50 123 4567', services: ['Wedding Photography', 'Event Coverage', 'Portrait', 'Pre-wedding Shoots'], color: '#1A7A6D', icon: 'camera', isVerified: true, priceRange: '$$$$', imageUrl: 'https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=800&q=80', country: 'United Arab Emirates', city: 'Dubai' },
  { id: 'b16', cpid: 'CP-BIZ-016', name: 'Abu Dhabi Events Co', category: 'Event Planners', description: 'Full-service event management for South Asian celebrations, corporate events, and community festivals in Abu Dhabi.', rating: 4.6, reviews: 178, location: 'Khalidiyah, Abu Dhabi', phone: '+971 2 345 6789', services: ['Event Planning', 'Decor', 'Catering Coordination', 'Entertainment'], color: '#E85D3A', icon: 'calendar', isVerified: true, priceRange: '$$$', imageUrl: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80', country: 'United Arab Emirates', city: 'Abu Dhabi' },
  { id: 'b17', cpid: 'CP-BIZ-017', name: 'Southall Sweet Centre', category: 'Restaurants', description: 'Iconic Indian sweet shop and restaurant on Southall Broadway. Famous for fresh mithai and authentic Punjabi cuisine.', rating: 4.7, reviews: 567, location: 'Southall, London', phone: '+44 20 8574 1234', services: ['Dine-in', 'Takeaway', 'Catering', 'Sweet Boxes'], color: '#F2A93B', icon: 'restaurant', isVerified: true, priceRange: '$', imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&q=80', country: 'United Kingdom', city: 'London' },
  { id: 'b18', cpid: 'CP-BIZ-018', name: 'Brick Lane Studios', category: 'Photographers', description: 'Creative photography studio in East London specialising in cultural events, fashion, and editorial shoots.', rating: 4.8, reviews: 234, location: 'Shoreditch, London', phone: '+44 20 7456 7890', services: ['Event Photography', 'Fashion', 'Studio Hire', 'Video Production'], color: '#9B59B6', icon: 'camera', isVerified: true, priceRange: '$$$', imageUrl: 'https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=800&q=80', country: 'United Kingdom', city: 'London' },
  { id: 'b19', cpid: 'CP-BIZ-019', name: 'Manchester Asian Catering', category: 'Restaurants', description: 'Premium Asian catering service in Manchester for weddings, corporate events, and cultural celebrations.', rating: 4.6, reviews: 189, location: 'Rusholme, Manchester', phone: '+44 161 234 5678', services: ['Wedding Catering', 'Corporate Events', 'Party Platters', 'Delivery'], color: '#E74C3C', icon: 'restaurant', isVerified: true, priceRange: '$$', imageUrl: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&q=80', country: 'United Kingdom', city: 'Manchester' },
  { id: 'b20', cpid: 'CP-BIZ-020', name: 'London Bollywood DJs', category: 'Musicians', description: 'Professional Bollywood and Bhangra DJs for weddings, parties, and cultural events across London and the UK.', rating: 4.9, reviews: 345, location: 'Wembley, London', phone: '+44 20 8903 4567', services: ['Wedding DJ', 'Party DJ', 'Sound & Lighting', 'MC Services'], color: '#3498DB', icon: 'musical-notes', isVerified: true, priceRange: '$$$', imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80', country: 'United Kingdom', city: 'London' },
  { id: 'b21', cpid: 'CP-BIZ-021', name: 'Gerrard India Bazaar Market', category: 'Venues', description: 'Iconic Little India marketplace on Gerrard Street in Toronto. Home to dozens of South Asian shops and eateries.', rating: 4.5, reviews: 456, location: 'Gerrard St E, Toronto', phone: '+1 416 123 4567', services: ['Market Stalls', 'Event Space', 'Food Court', 'Cultural Events'], color: '#1ABC9C', icon: 'storefront', isVerified: true, priceRange: '$$', imageUrl: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=800&q=80', country: 'Canada', city: 'Toronto' },
  { id: 'b22', cpid: 'CP-BIZ-022', name: 'Toronto Desi Weddings', category: 'Event Planners', description: 'Full-service South Asian wedding planning in the Greater Toronto Area. From intimate ceremonies to grand celebrations.', rating: 4.8, reviews: 267, location: 'Mississauga, ON', phone: '+1 416 234 5678', services: ['Wedding Planning', 'Decor', 'Vendor Coordination', 'Day-of Management'], color: '#E85D3A', icon: 'flower', isVerified: true, priceRange: '$$$', imageUrl: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80', country: 'Canada', city: 'Toronto' },
  { id: 'b23', cpid: 'CP-BIZ-023', name: 'Scarborough Tamil Studio', category: 'Photographers', description: 'Professional photography and videography for Tamil weddings, cultural events, and family portraits.', rating: 4.7, reviews: 178, location: 'Scarborough, ON', phone: '+1 416 345 6789', services: ['Wedding Photography', 'Event Coverage', 'Family Portraits', 'Videography'], color: '#1A7A6D', icon: 'camera', isVerified: true, priceRange: '$$', imageUrl: 'https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=800&q=80', country: 'Canada', city: 'Toronto' },
  { id: 'b24', cpid: 'CP-BIZ-024', name: 'Vancouver Spice Catering', category: 'Restaurants', description: 'Authentic Indian catering for weddings, corporate events, and private parties across Metro Vancouver.', rating: 4.7, reviews: 198, location: 'Surrey, BC', phone: '+1 604 123 4567', services: ['Wedding Catering', 'Corporate Lunches', 'Private Chef', 'Meal Prep'], color: '#2ECC71', icon: 'restaurant', isVerified: true, priceRange: '$$', imageUrl: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&q=80', country: 'Canada', city: 'Vancouver' },
  { id: 'b25', cpid: 'CP-BIZ-025', name: 'Vancouver Bollywood Entertainment', category: 'Musicians', description: 'Live Bollywood bands, DJs, and entertainment for South Asian events in Greater Vancouver.', rating: 4.8, reviews: 145, location: 'Vancouver, BC', phone: '+1 604 234 5678', services: ['Live Band', 'DJ Services', 'MC', 'Choreography'], color: '#9B59B6', icon: 'musical-notes', isVerified: true, priceRange: '$$$', imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80', country: 'Canada', city: 'Vancouver' },
  { id: 'bi1', cpid: 'CP-BIZ-I01', name: 'Boomalli Aboriginal Artists', category: 'Art Gallery', description: 'Aboriginal-owned cooperative gallery showcasing contemporary Indigenous art, prints, and sculptures from emerging and established First Nations artists.', rating: 4.9, reviews: 187, location: 'Chippendale, Sydney', phone: '02 8399 3133', services: ['Art Sales', 'Exhibitions', 'Artist Workshops', 'Cultural Tours'], color: '#8B4513', icon: 'color-palette', isVerified: true, priceRange: '$$', imageUrl: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&q=80', country: 'Australia', city: 'Sydney', isIndigenousOwned: true, supplyNationRegistered: true, indigenousCategory: 'Art & Culture' },
  { id: 'bi2', cpid: 'CP-BIZ-I02', name: 'Koskela Design', category: 'Furniture & Homewares', description: 'Indigenous-owned design studio creating contemporary furniture and homewares in collaboration with Aboriginal communities.', rating: 4.8, reviews: 124, location: 'Rosebery, Sydney', phone: '02 9280 0999', services: ['Furniture', 'Homewares', 'Custom Design', 'Corporate Gifts'], color: '#1A5276', icon: 'home', isVerified: true, priceRange: '$$$', imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80', country: 'Australia', city: 'Sydney', isIndigenousOwned: true, supplyNationRegistered: true, indigenousCategory: 'Design' },
  { id: 'bi3', cpid: 'CP-BIZ-I03', name: 'Mabu Mabu', category: 'Restaurant', description: 'First Nations-owned restaurant celebrating native Australian ingredients and Torres Strait Islander cuisine.', rating: 4.7, reviews: 312, location: 'Federation Square, Melbourne', phone: '03 9077 0550', services: ['Dine In', 'Catering', 'Bush Tucker Tasting', 'Cultural Events'], color: '#2ECC71', icon: 'restaurant', isVerified: true, priceRange: '$$', imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80', country: 'Australia', city: 'Melbourne', isIndigenousOwned: true, supplyNationRegistered: false, indigenousCategory: 'Food & Dining' },
];

export const sampleMovies: MovieData[] = [
  {
    id: 'm1', cpid: 'CP-MOV-001', title: 'Aadujeevitham (The Goat Life)', genre: ['Drama', 'Survival'], language: 'Malayalam',
    duration: '2h 52m', rating: 'MA15+', imdbScore: 7.4,
    description: 'A harrowing true story of an Indian immigrant worker who is trapped in the Middle Eastern desert and forced to herd goats under brutal conditions.',
    director: 'Blessy', cast: ['Prithviraj Sukumaran', 'Amala Paul', 'K.R. Gokul'],
    releaseDate: '2026-03-14', posterColor: '#C0392B', posterUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&q=80', icon: 'film',
    showtimes: [
      { cinema: 'Event Cinemas Parramatta', times: ['2:30 PM', '6:00 PM', '9:15 PM'], price: 22 },
      { cinema: 'Hoyts Bankstown', times: ['3:00 PM', '7:30 PM'], price: 20 },
      { cinema: 'Palace Cinemas Norton St', times: ['5:45 PM', '8:30 PM'], price: 24 },
    ],
    isTrending: true, country: 'Australia', city: 'Sydney',
  },
  {
    id: 'm2', cpid: 'CP-MOV-002', title: 'Pushpa 2: The Rule', genre: ['Action', 'Thriller'], language: 'Telugu',
    duration: '3h 20m', rating: 'MA15+', imdbScore: 7.1,
    description: 'Pushpa Raj continues his rise in the smuggling syndicate, facing new enemies and alliances in this action-packed sequel.',
    director: 'Sukumar', cast: ['Allu Arjun', 'Rashmika Mandanna', 'Fahadh Faasil'],
    releaseDate: '2026-03-10', posterColor: '#E85D3A', posterUrl: 'https://images.unsplash.com/photo-1535016120720-40c646be5580?w=400&q=80', icon: 'film',
    showtimes: [
      { cinema: 'Event Cinemas George Street', times: ['1:00 PM', '4:30 PM', '8:00 PM', '11:00 PM'], price: 25 },
      { cinema: 'Hoyts Wetherill Park', times: ['2:00 PM', '6:30 PM', '10:00 PM'], price: 22 },
    ],
    isTrending: true, country: 'Australia', city: 'Sydney',
  },
  {
    id: 'm3', cpid: 'CP-MOV-003', title: 'Jailer 2', genre: ['Action', 'Comedy'], language: 'Tamil',
    duration: '2h 45m', rating: 'M', imdbScore: 6.8,
    description: 'Rajinikanth returns as the retired jailer who must once again take on a criminal empire threatening his family.',
    director: 'Nelson Dilipkumar', cast: ['Rajinikanth', 'Mohanlal', 'Shiva Rajkumar'],
    releaseDate: '2026-03-20', posterColor: '#1A7A6D', posterUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&q=80', icon: 'film',
    showtimes: [
      { cinema: 'Event Cinemas Parramatta', times: ['12:00 PM', '3:30 PM', '7:00 PM', '10:30 PM'], price: 24 },
      { cinema: 'Reading Cinemas Auburn', times: ['1:30 PM', '5:00 PM', '8:30 PM'], price: 20 },
    ],
    isTrending: true, country: 'Australia', city: 'Sydney',
  },
  {
    id: 'm4', cpid: 'CP-MOV-004', title: 'Devara: Part 2', genre: ['Action', 'Drama'], language: 'Telugu',
    duration: '2h 38m', rating: 'MA15+', imdbScore: 7.0,
    description: 'The continuation of the epic saga set in a coastal village, where power, loyalty, and family collide.',
    director: 'Koratala Siva', cast: ['Jr NTR', 'Janhvi Kapoor', 'Saif Ali Khan'],
    releaseDate: '2026-04-05', posterColor: '#2C3E50', posterUrl: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=400&q=80', icon: 'film',
    showtimes: [
      { cinema: 'Event Cinemas George Street', times: ['2:00 PM', '5:30 PM', '9:00 PM'], price: 23 },
    ],
    isTrending: false, country: 'Australia', city: 'Sydney',
  },
  {
    id: 'm5', cpid: 'CP-MOV-005', title: 'Stree 3', genre: ['Horror', 'Comedy'], language: 'Hindi',
    duration: '2h 30m', rating: 'M', imdbScore: 7.3,
    description: 'The beloved horror-comedy franchise returns with new supernatural threats and even bigger laughs in a small Indian town.',
    director: 'Amar Kaushik', cast: ['Rajkummar Rao', 'Shraddha Kapoor', 'Pankaj Tripathi'],
    releaseDate: '2026-03-28', posterColor: '#8E44AD', posterUrl: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400&q=80', icon: 'film',
    showtimes: [
      { cinema: 'Event Cinemas Parramatta', times: ['4:00 PM', '7:30 PM', '10:45 PM'], price: 22 },
      { cinema: 'Hoyts Bankstown', times: ['3:30 PM', '6:45 PM', '10:00 PM'], price: 20 },
    ],
    isTrending: false, country: 'Australia', city: 'Sydney',
  },
  {
    id: 'm6', cpid: 'CP-MOV-006', title: 'Thandel', genre: ['Drama', 'Romance'], language: 'Telugu',
    duration: '2h 25m', rating: 'M', imdbScore: 7.6,
    description: 'Based on true events of fishermen from Srikakulam who accidentally cross into Pakistani waters and face the consequences.',
    director: 'Chandoo Mondeti', cast: ['Naga Chaitanya', 'Sai Pallavi'],
    releaseDate: '2026-03-18', posterColor: '#3498DB', posterUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&q=80', icon: 'film',
    showtimes: [
      { cinema: 'Reading Cinemas Auburn', times: ['2:00 PM', '5:30 PM'], price: 20 },
    ],
    isTrending: false, country: 'Australia', city: 'Sydney',
  },
  {
    id: 'm7', cpid: 'CP-MOV-007', title: 'Aadujeevitham (The Goat Life)', genre: ['Drama', 'Survival'], language: 'Malayalam',
    duration: '2h 52m', rating: 'MA15+', imdbScore: 7.4,
    description: 'A harrowing true story of an Indian immigrant worker who is trapped in the Middle Eastern desert and forced to herd goats under brutal conditions.',
    director: 'Blessy', cast: ['Prithviraj Sukumaran', 'Amala Paul', 'K.R. Gokul'],
    releaseDate: '2026-03-14', posterColor: '#C0392B', posterUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&q=80', icon: 'film',
    showtimes: [
      { cinema: 'Hoyts Melbourne Central', times: ['3:00 PM', '6:30 PM', '9:30 PM'], price: 22 },
      { cinema: 'Village Cinemas Jam Factory', times: ['2:00 PM', '7:00 PM'], price: 21 },
    ],
    isTrending: true, country: 'Australia', city: 'Melbourne',
  },
  {
    id: 'm8', cpid: 'CP-MOV-008', title: 'Pushpa 2: The Rule', genre: ['Action', 'Thriller'], language: 'Telugu',
    duration: '3h 20m', rating: 'MA15+', imdbScore: 7.1,
    description: 'Pushpa Raj continues his rise in the smuggling syndicate, facing new enemies and alliances in this action-packed sequel.',
    director: 'Sukumar', cast: ['Allu Arjun', 'Rashmika Mandanna', 'Fahadh Faasil'],
    releaseDate: '2026-03-10', posterColor: '#E85D3A', posterUrl: 'https://images.unsplash.com/photo-1535016120720-40c646be5580?w=400&q=80', icon: 'film',
    showtimes: [
      { cinema: 'Event Cinemas Brisbane Myer Centre', times: ['1:00 PM', '5:00 PM', '8:30 PM'], price: 22 },
      { cinema: 'Cineplex South Bank', times: ['2:30 PM', '7:00 PM'], price: 20 },
    ],
    isTrending: true, country: 'Australia', city: 'Brisbane',
  },
  {
    id: 'm9', cpid: 'CP-MOV-009', title: 'Jailer 2', genre: ['Action', 'Comedy'], language: 'Tamil',
    duration: '2h 45m', rating: 'M', imdbScore: 6.8,
    description: 'Rajinikanth returns as the retired jailer who must once again take on a criminal empire threatening his family.',
    director: 'Nelson Dilipkumar', cast: ['Rajinikanth', 'Mohanlal', 'Shiva Rajkumar'],
    releaseDate: '2026-03-20', posterColor: '#1A7A6D', posterUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&q=80', icon: 'film',
    showtimes: [
      { cinema: 'Hoyts Perth', times: ['12:30 PM', '4:00 PM', '7:30 PM'], price: 22 },
      { cinema: 'Event Cinemas Innaloo', times: ['2:00 PM', '6:00 PM', '9:30 PM'], price: 20 },
    ],
    isTrending: true, country: 'Australia', city: 'Perth',
  },
  {
    id: 'm10', cpid: 'CP-MOV-010', title: 'Stree 3', genre: ['Horror', 'Comedy'], language: 'Hindi',
    duration: '2h 30m', rating: 'M', imdbScore: 7.3,
    description: 'The beloved horror-comedy franchise returns with new supernatural threats and even bigger laughs in a small Indian town.',
    director: 'Amar Kaushik', cast: ['Rajkummar Rao', 'Shraddha Kapoor', 'Pankaj Tripathi'],
    releaseDate: '2026-03-28', posterColor: '#8E44AD', posterUrl: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400&q=80', icon: 'film',
    showtimes: [
      { cinema: 'Event Cinemas Queen Street', times: ['4:00 PM', '7:00 PM', '10:00 PM'], price: 20 },
      { cinema: 'Hoyts Sylvia Park', times: ['3:00 PM', '6:30 PM', '9:30 PM'], price: 19 },
    ],
    isTrending: false, country: 'New Zealand', city: 'Auckland',
  },
  {
    id: 'm11', cpid: 'CP-MOV-011', title: 'Pushpa 2: The Rule', genre: ['Action', 'Thriller'], language: 'Telugu',
    duration: '3h 20m', rating: 'MA15+', imdbScore: 7.1,
    description: 'Pushpa Raj continues his rise in the smuggling syndicate, facing new enemies and alliances in this action-packed sequel.',
    director: 'Sukumar', cast: ['Allu Arjun', 'Rashmika Mandanna', 'Fahadh Faasil'],
    releaseDate: '2026-03-10', posterColor: '#E85D3A', posterUrl: 'https://images.unsplash.com/photo-1535016120720-40c646be5580?w=400&q=80', icon: 'film',
    showtimes: [
      { cinema: 'Embassy Theatre Wellington', times: ['2:00 PM', '6:00 PM', '9:30 PM'], price: 20 },
    ],
    isTrending: true, country: 'New Zealand', city: 'Wellington',
  },
  {
    id: 'm12', cpid: 'CP-MOV-012', title: 'Aadujeevitham (The Goat Life)', genre: ['Drama', 'Survival'], language: 'Malayalam',
    duration: '2h 52m', rating: 'MA15+', imdbScore: 7.4,
    description: 'A harrowing true story of an Indian immigrant worker who is trapped in the Middle Eastern desert and forced to herd goats under brutal conditions.',
    director: 'Blessy', cast: ['Prithviraj Sukumaran', 'Amala Paul', 'K.R. Gokul'],
    releaseDate: '2026-03-14', posterColor: '#C0392B', posterUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&q=80', icon: 'film',
    showtimes: [
      { cinema: 'VOX Cinemas Mall of Emirates', times: ['1:30 PM', '5:00 PM', '8:30 PM', '11:00 PM'], price: 55 },
      { cinema: 'Reel Cinemas Dubai Mall', times: ['2:00 PM', '6:00 PM', '9:30 PM'], price: 50 },
    ],
    isTrending: true, country: 'United Arab Emirates', city: 'Dubai',
  },
  {
    id: 'm13', cpid: 'CP-MOV-013', title: 'Pushpa 2: The Rule', genre: ['Action', 'Thriller'], language: 'Telugu',
    duration: '3h 20m', rating: 'MA15+', imdbScore: 7.1,
    description: 'Pushpa Raj continues his rise in the smuggling syndicate, facing new enemies and alliances in this action-packed sequel.',
    director: 'Sukumar', cast: ['Allu Arjun', 'Rashmika Mandanna', 'Fahadh Faasil'],
    releaseDate: '2026-03-10', posterColor: '#E85D3A', posterUrl: 'https://images.unsplash.com/photo-1535016120720-40c646be5580?w=400&q=80', icon: 'film',
    showtimes: [
      { cinema: 'VOX Cinemas Yas Mall', times: ['1:00 PM', '4:30 PM', '8:00 PM'], price: 50 },
      { cinema: 'Novo Cinemas Abu Dhabi', times: ['3:00 PM', '7:00 PM', '10:30 PM'], price: 45 },
    ],
    isTrending: true, country: 'United Arab Emirates', city: 'Abu Dhabi',
  },
  {
    id: 'm14', cpid: 'CP-MOV-014', title: 'Jailer 2', genre: ['Action', 'Comedy'], language: 'Tamil',
    duration: '2h 45m', rating: 'M', imdbScore: 6.8,
    description: 'Rajinikanth returns as the retired jailer who must once again take on a criminal empire threatening his family.',
    director: 'Nelson Dilipkumar', cast: ['Rajinikanth', 'Mohanlal', 'Shiva Rajkumar'],
    releaseDate: '2026-03-20', posterColor: '#1A7A6D', posterUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&q=80', icon: 'film',
    showtimes: [
      { cinema: 'Cineworld Leicester Square', times: ['12:00 PM', '3:30 PM', '7:00 PM', '10:30 PM'], price: 18 },
      { cinema: 'Vue West End', times: ['1:30 PM', '5:00 PM', '8:30 PM'], price: 16 },
    ],
    isTrending: true, country: 'United Kingdom', city: 'London',
  },
  {
    id: 'm15', cpid: 'CP-MOV-015', title: 'Stree 3', genre: ['Horror', 'Comedy'], language: 'Hindi',
    duration: '2h 30m', rating: 'M', imdbScore: 7.3,
    description: 'The beloved horror-comedy franchise returns with new supernatural threats and even bigger laughs in a small Indian town.',
    director: 'Amar Kaushik', cast: ['Rajkummar Rao', 'Shraddha Kapoor', 'Pankaj Tripathi'],
    releaseDate: '2026-03-28', posterColor: '#8E44AD', posterUrl: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400&q=80', icon: 'film',
    showtimes: [
      { cinema: 'Odeon Trafford Centre', times: ['4:00 PM', '7:30 PM', '10:30 PM'], price: 14 },
      { cinema: 'Vue Printworks', times: ['3:00 PM', '6:30 PM', '9:30 PM'], price: 12 },
    ],
    isTrending: false, country: 'United Kingdom', city: 'Manchester',
  },
  {
    id: 'm16', cpid: 'CP-MOV-016', title: 'Aadujeevitham (The Goat Life)', genre: ['Drama', 'Survival'], language: 'Malayalam',
    duration: '2h 52m', rating: 'MA15+', imdbScore: 7.4,
    description: 'A harrowing true story of an Indian immigrant worker who is trapped in the Middle Eastern desert and forced to herd goats under brutal conditions.',
    director: 'Blessy', cast: ['Prithviraj Sukumaran', 'Amala Paul', 'K.R. Gokul'],
    releaseDate: '2026-03-14', posterColor: '#C0392B', posterUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&q=80', icon: 'film',
    showtimes: [
      { cinema: 'Cineplex Yonge-Dundas', times: ['1:00 PM', '4:30 PM', '8:00 PM'], price: 16 },
      { cinema: 'Cineplex Scarborough', times: ['2:00 PM', '6:00 PM', '9:30 PM'], price: 14 },
    ],
    isTrending: true, country: 'Canada', city: 'Toronto',
  },
  {
    id: 'm17', cpid: 'CP-MOV-017', title: 'Pushpa 2: The Rule', genre: ['Action', 'Thriller'], language: 'Telugu',
    duration: '3h 20m', rating: 'MA15+', imdbScore: 7.1,
    description: 'Pushpa Raj continues his rise in the smuggling syndicate, facing new enemies and alliances in this action-packed sequel.',
    director: 'Sukumar', cast: ['Allu Arjun', 'Rashmika Mandanna', 'Fahadh Faasil'],
    releaseDate: '2026-03-10', posterColor: '#E85D3A', posterUrl: 'https://images.unsplash.com/photo-1535016120720-40c646be5580?w=400&q=80', icon: 'film',
    showtimes: [
      { cinema: 'Cineplex Metropolis', times: ['1:00 PM', '5:00 PM', '8:30 PM'], price: 16 },
      { cinema: 'SilverCity Riverport', times: ['2:30 PM', '6:30 PM', '10:00 PM'], price: 14 },
    ],
    isTrending: true, country: 'Canada', city: 'Vancouver',
  },
];

export const sampleRestaurants: RestaurantData[] = [
  {
    id: 'r1', cpid: 'CP-RST-001', name: 'Cinnamon Club', cuisine: 'South Indian', description: 'Award-winning South Indian restaurant featuring authentic dosas, idlis, and Kerala-style seafood curries.',
    rating: 4.8, reviews: 542, priceRange: '$$', location: 'Harris Park, NSW', address: '22 Wigram St, Harris Park NSW 2150',
    phone: '+61 2 9687 1234', hours: '11:00 AM - 10:00 PM', features: ['Outdoor Seating', 'BYO', 'Vegan Options', 'Family Friendly'],
    color: '#E85D3A', icon: 'restaurant', isOpen: true, deliveryAvailable: true, reservationAvailable: true,
    menuHighlights: ['Masala Dosa', 'Kerala Fish Curry', 'Appam & Stew', 'Malabar Biryani'],
    imageUrl: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80',
    country: 'Australia', city: 'Sydney',
  },
  {
    id: 'r2', cpid: 'CP-RST-002', name: 'Punjab Palace', cuisine: 'North Indian', description: 'Authentic Punjabi flavours with tandoori specialties, rich curries, and freshly baked naan bread.',
    rating: 4.6, reviews: 389, priceRange: '$$', location: 'Parramatta, NSW', address: '165 Church St, Parramatta NSW 2150',
    phone: '+61 2 9891 5678', hours: '11:30 AM - 11:00 PM', features: ['Buffet Lunch', 'Catering', 'Halal', 'Live Music Fri-Sat'],
    color: '#F2A93B', icon: 'restaurant', isOpen: true, deliveryAvailable: true, reservationAvailable: true,
    menuHighlights: ['Butter Chicken', 'Lamb Rogan Josh', 'Garlic Naan', 'Gulab Jamun'],
    imageUrl: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=800&q=80',
    country: 'Australia', city: 'Sydney',
  },
  {
    id: 'r3', cpid: 'CP-RST-003', name: 'Sakura Garden', cuisine: 'Japanese-Fusion', description: 'Creative Japanese-Asian fusion cuisine with fresh sushi, ramen, and innovative cocktails.',
    rating: 4.7, reviews: 276, priceRange: '$$$', location: 'Sydney CBD, NSW', address: '88 George St, Sydney NSW 2000',
    phone: '+61 2 9252 1234', hours: '12:00 PM - 10:30 PM', features: ['Sake Bar', 'Omakase', 'Private Dining', 'City Views'],
    color: '#E74C3C', icon: 'restaurant', isOpen: true, deliveryAvailable: false, reservationAvailable: true,
    menuHighlights: ['Dragon Roll', 'Tonkotsu Ramen', 'Wagyu Tataki', 'Matcha Tiramisu'],
    imageUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&q=80',
    country: 'Australia', city: 'Sydney',
  },
  {
    id: 'r4', cpid: 'CP-RST-004', name: 'Chai & Chaat', cuisine: 'Street Food', description: 'Vibrant Indian street food experience with authentic chaats, chai varieties, and quick bites.',
    rating: 4.5, reviews: 198, priceRange: '$', location: 'Wentworthville, NSW', address: '45 Dunmore St, Wentworthville NSW 2145',
    phone: '+61 2 9631 9876', hours: '8:00 AM - 9:00 PM', features: ['Takeaway', 'Breakfast Menu', 'Vegan Options', 'Quick Service'],
    color: '#2ECC71', icon: 'cafe', isOpen: true, deliveryAvailable: true, reservationAvailable: false,
    menuHighlights: ['Pani Puri', 'Vada Pav', 'Masala Chai', 'Jalebi'],
    imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&q=80',
    country: 'Australia', city: 'Sydney',
  },
  {
    id: 'r5', cpid: 'CP-RST-005', name: 'The Colombo Kitchen', cuisine: 'Sri Lankan', description: 'Traditional Sri Lankan cuisine with fiery curries, hoppers, and signature sambols in a cozy setting.',
    rating: 4.9, reviews: 312, priceRange: '$$', location: 'Auburn, NSW', address: '12 South Parade, Auburn NSW 2144',
    phone: '+61 2 9646 5432', hours: '11:00 AM - 10:00 PM', features: ['BYOB', 'Gluten Free Options', 'Catering', 'Authentic Spices'],
    color: '#9B59B6', icon: 'restaurant', isOpen: true, deliveryAvailable: true, reservationAvailable: true,
    menuHighlights: ['Egg Hoppers', 'Lamprais', 'Kottu Roti', 'Watalappan'],
    imageUrl: 'https://images.unsplash.com/photo-1567337710282-00832b415979?w=800&q=80',
    country: 'Australia', city: 'Sydney',
  },
  {
    id: 'r6', cpid: 'CP-RST-006', name: 'Naan & Kabab', cuisine: 'Afghan', description: 'Traditional Afghan grills and kebabs cooked over charcoal, served with fresh naan and aromatic rice.',
    rating: 4.4, reviews: 167, priceRange: '$$', location: 'Merrylands, NSW', address: '280 Merrylands Rd, Merrylands NSW 2160',
    phone: '+61 2 9637 4321', hours: '10:00 AM - 11:00 PM', features: ['Halal', 'Family Platters', 'Outdoor Dining', 'Late Night'],
    color: '#1A7A6D', icon: 'restaurant', isOpen: true, deliveryAvailable: true, reservationAvailable: false,
    menuHighlights: ['Chapli Kebab', 'Afghani Pulao', 'Mantu', 'Firni'],
    imageUrl: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800&q=80',
    country: 'Australia', city: 'Sydney',
  },
  {
    id: 'r7', cpid: 'CP-RST-007', name: 'Melbourne Masala House', cuisine: 'North Indian', description: 'Award-winning North Indian restaurant on Lygon Street with rich curries, tandoori specialties, and craft cocktails.',
    rating: 4.7, reviews: 423, priceRange: '$$', location: 'Carlton, VIC', address: '245 Lygon St, Carlton VIC 3053',
    phone: '+61 3 9347 1234', hours: '11:30 AM - 10:30 PM', features: ['BYO', 'Outdoor Seating', 'Vegan Menu', 'Catering'],
    color: '#F2A93B', icon: 'restaurant', isOpen: true, deliveryAvailable: true, reservationAvailable: true,
    menuHighlights: ['Butter Chicken', 'Lamb Biryani', 'Paneer Tikka', 'Mango Lassi'],
    imageUrl: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=800&q=80',
    country: 'Australia', city: 'Melbourne',
  },
  {
    id: 'r8', cpid: 'CP-RST-008', name: 'Brisbane Curry Palace', cuisine: 'South Indian', description: 'Authentic South Indian vegetarian restaurant in South Bank with traditional banana leaf meals.',
    rating: 4.6, reviews: 287, priceRange: '$', location: 'South Bank, QLD', address: '12 Grey St, South Brisbane QLD 4101',
    phone: '+61 7 3255 1234', hours: '10:00 AM - 9:30 PM', features: ['Vegetarian', 'Banana Leaf Meals', 'BYO', 'Quick Service'],
    color: '#2ECC71', icon: 'restaurant', isOpen: true, deliveryAvailable: true, reservationAvailable: false,
    menuHighlights: ['Thali Meals', 'Masala Dosa', 'Filter Coffee', 'Pongal'],
    imageUrl: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80',
    country: 'Australia', city: 'Brisbane',
  },
  {
    id: 'r9', cpid: 'CP-RST-009', name: 'Perth Tandoori Nights', cuisine: 'North Indian', description: 'Premium Indian dining in Northbridge with live tandoor cooking, craft beers, and weekend buffet.',
    rating: 4.5, reviews: 312, priceRange: '$$', location: 'Northbridge, WA', address: '88 James St, Northbridge WA 6003',
    phone: '+61 8 9228 1234', hours: '11:00 AM - 11:00 PM', features: ['Live Tandoor', 'Buffet', 'Craft Beer', 'Late Night'],
    color: '#E85D3A', icon: 'restaurant', isOpen: true, deliveryAvailable: true, reservationAvailable: true,
    menuHighlights: ['Tandoori Platter', 'Dal Makhani', 'Seekh Kebab', 'Rasmalai'],
    imageUrl: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=800&q=80',
    country: 'Australia', city: 'Perth',
  },
  {
    id: 'r10', cpid: 'CP-RST-010', name: 'Auckland Dosa Corner', cuisine: 'South Indian', description: 'Popular South Indian eatery in Mt Roskill serving crispy dosas, uttapam, and traditional filter coffee.',
    rating: 4.7, reviews: 234, priceRange: '$', location: 'Mt Roskill, Auckland', address: '594 Dominion Rd, Mt Roskill, Auckland 1041',
    phone: '+64 9 620 1234', hours: '8:00 AM - 9:00 PM', features: ['Vegetarian', 'Takeaway', 'Breakfast', 'Quick Service'],
    color: '#1A7A6D', icon: 'restaurant', isOpen: true, deliveryAvailable: true, reservationAvailable: false,
    menuHighlights: ['Paper Dosa', 'Idli Sambar', 'Mysore Masala Dosa', 'Filter Coffee'],
    imageUrl: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80',
    country: 'New Zealand', city: 'Auckland',
  },
  {
    id: 'r11', cpid: 'CP-RST-011', name: 'Wellington Spice Trail', cuisine: 'Sri Lankan', description: 'Modern Sri Lankan restaurant on Cuba Street with signature hoppers, curries, and tropical cocktails.',
    rating: 4.8, reviews: 178, priceRange: '$$', location: 'Cuba Street, Wellington', address: '42 Cuba St, Wellington 6011',
    phone: '+64 4 384 5678', hours: '11:00 AM - 10:00 PM', features: ['Cocktail Bar', 'Vegan Options', 'Private Dining', 'Live Music'],
    color: '#9B59B6', icon: 'restaurant', isOpen: true, deliveryAvailable: false, reservationAvailable: true,
    menuHighlights: ['Egg Hoppers', 'Black Pork Curry', 'Pol Sambol', 'Watalappan'],
    imageUrl: 'https://images.unsplash.com/photo-1567337710282-00832b415979?w=800&q=80',
    country: 'New Zealand', city: 'Wellington',
  },
  {
    id: 'r12', cpid: 'CP-RST-012', name: 'Ravi Restaurant Dubai', cuisine: 'North Indian', description: 'Legendary Pakistani-Indian restaurant in Satwa serving authentic Punjabi food at unbeatable prices since 1978.',
    rating: 4.6, reviews: 1245, priceRange: '$', location: 'Satwa, Dubai', address: 'Al Satwa Rd, Dubai, UAE',
    phone: '+971 4 331 5353', hours: '5:00 AM - 3:00 AM', features: ['24hr Nearly', 'Halal', 'Takeaway', 'Family Friendly'],
    color: '#E85D3A', icon: 'restaurant', isOpen: true, deliveryAvailable: true, reservationAvailable: false,
    menuHighlights: ['Butter Chicken', 'Brain Masala', 'Seekh Kebab', 'Naan'],
    imageUrl: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=800&q=80',
    country: 'United Arab Emirates', city: 'Dubai',
  },
  {
    id: 'r13', cpid: 'CP-RST-013', name: 'Calicut Notebook Abu Dhabi', cuisine: 'South Indian', description: 'Authentic Kerala and Malabar cuisine in Abu Dhabi with traditional biryanis, seafood, and desserts.',
    rating: 4.7, reviews: 567, priceRange: '$$', location: 'Electra Street, Abu Dhabi', address: 'Electra St, Abu Dhabi, UAE',
    phone: '+971 2 633 4567', hours: '7:00 AM - 12:00 AM', features: ['Halal', 'Family Sections', 'Catering', 'Delivery'],
    color: '#1A7A6D', icon: 'restaurant', isOpen: true, deliveryAvailable: true, reservationAvailable: true,
    menuHighlights: ['Malabar Biryani', 'Kerala Fish Curry', 'Pathiri', 'Payasam'],
    imageUrl: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80',
    country: 'United Arab Emirates', city: 'Abu Dhabi',
  },
  {
    id: 'r14', cpid: 'CP-RST-014', name: 'Al Ustad Special Kebab', cuisine: 'Afghan', description: 'Iconic Middle Eastern and Afghan kebab restaurant in Old Dubai known for its charcoal-grilled meats.',
    rating: 4.5, reviews: 890, priceRange: '$$', location: 'Al Fahidi, Dubai', address: 'Al Fahidi St, Bur Dubai, UAE',
    phone: '+971 4 397 8989', hours: '11:00 AM - 1:00 AM', features: ['Halal', 'Charcoal Grill', 'Late Night', 'Historic Location'],
    color: '#F2A93B', icon: 'restaurant', isOpen: true, deliveryAvailable: true, reservationAvailable: false,
    menuHighlights: ['Special Kebab', 'Afghani Tikka', 'Hummus', 'Kuboos'],
    imageUrl: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800&q=80',
    country: 'United Arab Emirates', city: 'Dubai',
  },
  {
    id: 'r15', cpid: 'CP-RST-015', name: 'Dishoom King\'s Cross', cuisine: 'North Indian', description: 'Award-winning Bombay-inspired cafe serving all-day Indian cuisine in a stunning converted transit shed.',
    rating: 4.8, reviews: 2345, priceRange: '$$', location: 'King\'s Cross, London', address: '5 Stable St, London N1C 4AB',
    phone: '+44 20 7420 9321', hours: '8:00 AM - 11:00 PM', features: ['Breakfast', 'Cocktails', 'Vegan Menu', 'Iconic Setting'],
    color: '#E85D3A', icon: 'restaurant', isOpen: true, deliveryAvailable: true, reservationAvailable: true,
    menuHighlights: ['Black Daal', 'Bacon Naan Roll', 'Chicken Ruby', 'Gunpowder Potatoes'],
    imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80',
    country: 'United Kingdom', city: 'London',
  },
  {
    id: 'r16', cpid: 'CP-RST-016', name: 'Tayyabs', cuisine: 'North Indian', description: 'Legendary Punjabi restaurant on Fieldgate Street serving fiery grilled lamb chops and BYO since 1972.',
    rating: 4.6, reviews: 1890, priceRange: '$', location: 'Whitechapel, London', address: '83-89 Fieldgate St, London E1 1JU',
    phone: '+44 20 7247 9543', hours: '12:00 PM - 11:30 PM', features: ['BYO', 'Halal', 'No Reservations', 'Cash Preferred'],
    color: '#F2A93B', icon: 'restaurant', isOpen: true, deliveryAvailable: false, reservationAvailable: false,
    menuHighlights: ['Lamb Chops', 'Seekh Kebab', 'Karahi Chicken', 'Lassi'],
    imageUrl: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=800&q=80',
    country: 'United Kingdom', city: 'London',
  },
  {
    id: 'r17', cpid: 'CP-RST-017', name: 'Curry Mile Favourites', cuisine: 'North Indian', description: 'Popular curry house on Manchester\'s famous Curry Mile serving generous portions of authentic Punjabi food.',
    rating: 4.5, reviews: 567, priceRange: '$', location: 'Rusholme, Manchester', address: 'Wilmslow Rd, Rusholme, Manchester M14 5TH',
    phone: '+44 161 224 1234', hours: '12:00 PM - 12:00 AM', features: ['BYO', 'Halal', 'Late Night', 'Family Friendly'],
    color: '#E74C3C', icon: 'restaurant', isOpen: true, deliveryAvailable: true, reservationAvailable: true,
    menuHighlights: ['Chicken Tikka Masala', 'Lamb Karahi', 'Peshwari Naan', 'Kulfi'],
    imageUrl: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=800&q=80',
    country: 'United Kingdom', city: 'Manchester',
  },
  {
    id: 'r18', cpid: 'CP-RST-018', name: 'Lahore Tikka House', cuisine: 'North Indian', description: 'Iconic Pakistani restaurant on Gerrard Street serving Toronto\'s best biryani and grilled meats since 1996.',
    rating: 4.7, reviews: 1456, priceRange: '$', location: 'Gerrard St E, Toronto', address: '1365 Gerrard St E, Toronto ON M4L 1Z3',
    phone: '+1 416 406 1668', hours: '11:00 AM - 2:00 AM', features: ['Halal', 'Late Night', 'Takeaway', 'Cash Only'],
    color: '#E85D3A', icon: 'restaurant', isOpen: true, deliveryAvailable: true, reservationAvailable: false,
    menuHighlights: ['Chicken Biryani', 'Seekh Kebab', 'Nihari', 'Tandoori Chicken'],
    imageUrl: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=800&q=80',
    country: 'Canada', city: 'Toronto',
  },
  {
    id: 'r19', cpid: 'CP-RST-019', name: 'Scarborough Dosa House', cuisine: 'South Indian', description: 'Authentic South Indian vegetarian restaurant in Scarborough with crispy dosas and traditional thalis.',
    rating: 4.6, reviews: 678, priceRange: '$', location: 'Scarborough, ON', address: '1270 Ellesmere Rd, Scarborough ON M1P 2X4',
    phone: '+1 416 431 1234', hours: '9:00 AM - 10:00 PM', features: ['Vegetarian', 'Family Style', 'Catering', 'Takeaway'],
    color: '#1A7A6D', icon: 'restaurant', isOpen: true, deliveryAvailable: true, reservationAvailable: false,
    menuHighlights: ['Ghee Roast Dosa', 'Chettinad Thali', 'Idli Platter', 'Filter Coffee'],
    imageUrl: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80',
    country: 'Canada', city: 'Toronto',
  },
  {
    id: 'r20', cpid: 'CP-RST-020', name: 'Vij\'s Restaurant', cuisine: 'North Indian', description: 'Renowned Indian restaurant by celebrity chef Vikram Vij serving innovative Indian cuisine with local ingredients.',
    rating: 4.9, reviews: 2100, priceRange: '$$$', location: 'Cambie Village, Vancouver', address: '3106 Cambie St, Vancouver BC V5Z 2W2',
    phone: '+1 604 736 6664', hours: '5:30 PM - 10:00 PM', features: ['No Reservations', 'Wine List', 'Innovative Menu', 'Celebrity Chef'],
    color: '#9B59B6', icon: 'restaurant', isOpen: true, deliveryAvailable: false, reservationAvailable: false,
    menuHighlights: ['Lamb Popsicles', 'Wine-marinated Chicken', 'Jackfruit Curry', 'Chai'],
    imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80',
    country: 'Canada', city: 'Vancouver',
  },
  {
    id: 'r21', cpid: 'CP-RST-021', name: 'Vancouver Chaat House', cuisine: 'Street Food', description: 'Vibrant Indian street food spot on Main Street with authentic chaats, kathi rolls, and fresh juices.',
    rating: 4.5, reviews: 345, priceRange: '$', location: 'Main Street, Vancouver', address: '3050 Main St, Vancouver BC V5T 3G3',
    phone: '+1 604 879 1234', hours: '11:00 AM - 9:00 PM', features: ['Vegetarian Options', 'Takeaway', 'Quick Service', 'Fresh Juices'],
    color: '#2ECC71', icon: 'cafe', isOpen: true, deliveryAvailable: true, reservationAvailable: false,
    menuHighlights: ['Bhel Puri', 'Kathi Roll', 'Samosa Chaat', 'Mango Lassi'],
    imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&q=80',
    country: 'Canada', city: 'Vancouver',
  },
];

export const sampleActivities: ActivityData[] = [
  {
    id: 'a1', cpid: 'CP-ACT-001', name: 'Luna Park Sydney', category: 'Theme Parks', description: 'Iconic harbourside amusement park with thrilling rides, games, and spectacular views of the Sydney Harbour Bridge.',
    location: 'Milsons Point, NSW', priceCents: 5500, priceLabel: 'From $55', rating: 4.5, reviews: 2340,
    duration: 'Full Day', color: '#E85D3A', icon: 'happy', highlights: ['Harbour Views', 'Family Rides', 'Roller Coasters', 'Night Events'],
    ageGroup: 'All Ages', isPopular: true,
    imageUrl: 'https://images.unsplash.com/photo-1513889961551-628c1e5e2ee9?w=800&q=80',
    country: 'Australia', city: 'Sydney',
  },
  {
    id: 'a2', cpid: 'CP-ACT-002', name: 'Escape Room Challenge', category: 'Gaming', description: 'Themed escape rooms with cultural puzzles and mysteries. Perfect for team building and family fun.',
    location: 'Parramatta, NSW', priceCents: 3500, priceLabel: '$35/person', rating: 4.7, reviews: 456,
    duration: '60 min', color: '#9B59B6', icon: 'key', highlights: ['Cultural Themes', 'Team Building', 'Multiple Difficulty Levels', 'Private Bookings'],
    ageGroup: '12+', isPopular: true,
    imageUrl: 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=800&q=80',
    country: 'Australia', city: 'Sydney',
  },
  {
    id: 'a3', cpid: 'CP-ACT-003', name: 'Pottery & Chai Workshop', category: 'Workshops', description: 'Learn traditional Indian pottery techniques while enjoying authentic chai and cultural stories.',
    location: 'Newtown, NSW', priceCents: 7500, priceLabel: '$75/person', rating: 4.9, reviews: 128,
    duration: '3 hours', color: '#F2A93B', icon: 'color-palette', highlights: ['Hands-on', 'Materials Included', 'Take Home Creation', 'Chai Included'],
    ageGroup: 'Adults', isPopular: false,
    imageUrl: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&q=80',
    country: 'Australia', city: 'Sydney',
  },
  {
    id: 'a4', cpid: 'CP-ACT-004', name: 'Taronga Zoo Cultural Trail', category: 'Nature', description: 'Explore the zoo with a guided cultural trail connecting Australian wildlife to Indigenous and multicultural stories.',
    location: 'Mosman, NSW', priceCents: 4900, priceLabel: '$49', rating: 4.6, reviews: 1890,
    duration: 'Half Day', color: '#2ECC71', icon: 'leaf', highlights: ['Guided Tours', 'Wildlife Shows', 'Cultural Stories', 'Ferry Access'],
    ageGroup: 'All Ages', isPopular: true,
    imageUrl: 'https://images.unsplash.com/photo-1534567153574-2b12153a87f0?w=800&q=80',
    country: 'Australia', city: 'Sydney',
  },
  {
    id: 'a5', cpid: 'CP-ACT-005', name: 'Bollywood Dance Fitness', category: 'Fitness', description: 'High-energy Bollywood-inspired dance workout combining cardio with Bollywood and Bhangra moves.',
    location: 'Blacktown, NSW', priceCents: 2500, priceLabel: '$25/class', rating: 4.8, reviews: 267,
    duration: '1 hour', color: '#E74C3C', icon: 'fitness', highlights: ['Cardio Workout', 'No Experience Needed', 'All Fitness Levels', 'Music & Fun'],
    ageGroup: '16+', isPopular: true,
    imageUrl: 'https://images.unsplash.com/photo-1524594152303-9fd13543fe6e?w=800&q=80',
    country: 'Australia', city: 'Sydney',
  },
  {
    id: 'a6', cpid: 'CP-ACT-006', name: 'Cooking Masterclass: Biryani', category: 'Workshops', description: 'Learn the art of making authentic Hyderabadi Biryani from a professional chef. Includes all ingredients and a meal.',
    location: 'Harris Park, NSW', priceCents: 8900, priceLabel: '$89/person', rating: 4.9, reviews: 98,
    duration: '3 hours', color: '#1A7A6D', icon: 'restaurant', highlights: ['Professional Chef', 'All Ingredients', 'Recipe Book', 'Lunch Included'],
    ageGroup: 'Adults', isPopular: false,
    imageUrl: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80',
    country: 'Australia', city: 'Sydney',
  },
  {
    id: 'a7', cpid: 'CP-ACT-007', name: 'Laser Tag Arena', category: 'Gaming', description: 'Indoor laser tag arena with themed battlegrounds. Perfect for birthday parties and group events.',
    location: 'Liverpool, NSW', priceCents: 2000, priceLabel: '$20/game', rating: 4.3, reviews: 512,
    duration: '30 min', color: '#3498DB', icon: 'flash', highlights: ['Birthday Packages', 'Group Discounts', 'Multiple Arenas', 'Arcade Games'],
    ageGroup: '8+', isPopular: false,
    imageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80',
    country: 'Australia', city: 'Sydney',
  },
  {
    id: 'a8', cpid: 'CP-ACT-008', name: 'Melbourne Street Art Walk', category: 'Workshops', description: 'Guided walking tour through Melbourne\'s iconic laneways discovering street art, murals, and cultural stories.',
    location: 'CBD, VIC', priceCents: 4000, priceLabel: '$40/person', rating: 4.8, reviews: 567,
    duration: '2.5 hours', color: '#E74C3C', icon: 'walk', highlights: ['Expert Guide', 'Hidden Laneways', 'Photo Ops', 'Coffee Stop'],
    ageGroup: 'All Ages', isPopular: true,
    imageUrl: 'https://images.unsplash.com/photo-1514222134-b57cbb8ce073?w=800&q=80',
    country: 'Australia', city: 'Melbourne',
  },
  {
    id: 'a9', cpid: 'CP-ACT-009', name: 'Melbourne Cricket Ground Tour', category: 'Nature', description: 'Behind-the-scenes tour of the iconic MCG including player rooms, media centre, and members pavilion.',
    location: 'East Melbourne, VIC', priceCents: 3500, priceLabel: '$35', rating: 4.6, reviews: 890,
    duration: '1.5 hours', color: '#2ECC71', icon: 'football', highlights: ['Behind the Scenes', 'Player Areas', 'Museum', 'Photo Ops'],
    ageGroup: 'All Ages', isPopular: true,
    imageUrl: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&q=80',
    country: 'Australia', city: 'Melbourne',
  },
  {
    id: 'a10', cpid: 'CP-ACT-010', name: 'Brisbane River Kayak', category: 'Nature', description: 'Guided kayak tour along the Brisbane River with city skyline views and wildlife spotting.',
    location: 'Kangaroo Point, QLD', priceCents: 6500, priceLabel: '$65/person', rating: 4.7, reviews: 345,
    duration: '2 hours', color: '#3498DB', icon: 'water', highlights: ['City Views', 'Wildlife', 'All Equipment', 'Photo Ops'],
    ageGroup: '12+', isPopular: true,
    imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80',
    country: 'Australia', city: 'Brisbane',
  },
  {
    id: 'a11', cpid: 'CP-ACT-011', name: 'Perth Sunset Camel Ride', category: 'Nature', description: 'Unique camel ride along Cable Beach at sunset with stunning Indian Ocean views.',
    location: 'Scarborough Beach, WA', priceCents: 7500, priceLabel: '$75/person', rating: 4.8, reviews: 234,
    duration: '1 hour', color: '#F2A93B', icon: 'sunny', highlights: ['Sunset Views', 'Beach Walk', 'Photo Package', 'Refreshments'],
    ageGroup: 'All Ages', isPopular: true,
    imageUrl: 'https://images.unsplash.com/photo-1451337516015-6b6e9a44a8a3?w=800&q=80',
    country: 'Australia', city: 'Perth',
  },
  {
    id: 'a12', cpid: 'CP-ACT-012', name: 'Auckland Harbour Cruise', category: 'Nature', description: 'Scenic harbour cruise around Auckland\'s Waitemata Harbour with views of Rangitoto Island and the skyline.',
    location: 'Viaduct Harbour, Auckland', priceCents: 5500, priceLabel: '$55 NZD', rating: 4.6, reviews: 456,
    duration: '1.5 hours', color: '#3498DB', icon: 'boat', highlights: ['Island Views', 'Commentary', 'Bar on Board', 'Photo Ops'],
    ageGroup: 'All Ages', isPopular: true,
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
    country: 'New Zealand', city: 'Auckland',
  },
  {
    id: 'a13', cpid: 'CP-ACT-013', name: 'Wellington Cable Car & Gardens', category: 'Nature', description: 'Ride the iconic Wellington Cable Car to the Botanic Gardens and enjoy panoramic views of the harbour.',
    location: 'Lambton Quay, Wellington', priceCents: 1200, priceLabel: '$12 NZD', rating: 4.7, reviews: 1234,
    duration: '2 hours', color: '#2ECC71', icon: 'leaf', highlights: ['Cable Car', 'Botanic Gardens', 'Harbour Views', 'Museum'],
    ageGroup: 'All Ages', isPopular: true,
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
    country: 'New Zealand', city: 'Wellington',
  },
  {
    id: 'a14', cpid: 'CP-ACT-014', name: 'Dubai Desert Safari', category: 'Nature', description: 'Thrilling desert safari with dune bashing, camel riding, BBQ dinner, and traditional belly dance performance.',
    location: 'Dubai Desert', priceCents: 8000, priceLabel: 'From AED 295', rating: 4.7, reviews: 3456,
    duration: '6 hours', color: '#F2A93B', icon: 'sunny', highlights: ['Dune Bashing', 'Camel Ride', 'BBQ Dinner', 'Entertainment'],
    ageGroup: 'All Ages', isPopular: true,
    imageUrl: 'https://images.unsplash.com/photo-1451337516015-6b6e9a44a8a3?w=800&q=80',
    country: 'United Arab Emirates', city: 'Dubai',
  },
  {
    id: 'a15', cpid: 'CP-ACT-015', name: 'Abu Dhabi Louvre Visit', category: 'Workshops', description: 'Guided tour of the stunning Louvre Abu Dhabi museum featuring art and artifacts from around the world.',
    location: 'Saadiyat Island, Abu Dhabi', priceCents: 6500, priceLabel: 'From AED 240', rating: 4.9, reviews: 2100,
    duration: '3 hours', color: '#9B59B6', icon: 'color-palette', highlights: ['World-class Art', 'Architecture', 'Guided Tour', 'Gift Shop'],
    ageGroup: 'All Ages', isPopular: true,
    imageUrl: 'https://images.unsplash.com/photo-1564399579883-451a5d44ec08?w=800&q=80',
    country: 'United Arab Emirates', city: 'Abu Dhabi',
  },
  {
    id: 'a16', cpid: 'CP-ACT-016', name: 'Dubai Gold Souk Walking Tour', category: 'Workshops', description: 'Guided walk through the historic Gold Souk and Spice Souk in Deira with shopping tips and cultural insights.',
    location: 'Deira, Dubai', priceCents: 3500, priceLabel: 'From AED 130', rating: 4.5, reviews: 890,
    duration: '2 hours', color: '#F2A93B', icon: 'diamond', highlights: ['Gold Souk', 'Spice Souk', 'Shopping Tips', 'History'],
    ageGroup: 'All Ages', isPopular: true,
    imageUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80',
    country: 'United Arab Emirates', city: 'Dubai',
  },
  {
    id: 'a17', cpid: 'CP-ACT-017', name: 'London Southall Walking Tour', category: 'Workshops', description: 'Cultural walking tour of London\'s Little India in Southall exploring temples, shops, street food, and history.',
    location: 'Southall, London', priceCents: 2000, priceLabel: 'From £16', rating: 4.7, reviews: 345,
    duration: '2.5 hours', color: '#E85D3A', icon: 'walk', highlights: ['Temples', 'Street Food', 'Shopping', 'Cultural History'],
    ageGroup: 'All Ages', isPopular: true,
    imageUrl: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=800&q=80',
    country: 'United Kingdom', city: 'London',
  },
  {
    id: 'a18', cpid: 'CP-ACT-018', name: 'London Bollywood Dance Class', category: 'Fitness', description: 'Fun Bollywood dance fitness class in Wembley with professional choreographers. All levels welcome.',
    location: 'Wembley, London', priceCents: 1500, priceLabel: '£12/class', rating: 4.8, reviews: 234,
    duration: '1 hour', color: '#E74C3C', icon: 'fitness', highlights: ['Cardio Workout', 'Professional Tutors', 'All Levels', 'Social Fun'],
    ageGroup: '16+', isPopular: true,
    imageUrl: 'https://images.unsplash.com/photo-1524594152303-9fd13543fe6e?w=800&q=80',
    country: 'United Kingdom', city: 'London',
  },
  {
    id: 'a19', cpid: 'CP-ACT-019', name: 'Manchester Curry Mile Food Tour', category: 'Workshops', description: 'Guided food tour along Manchester\'s Curry Mile tasting dishes from 5 different restaurants.',
    location: 'Rusholme, Manchester', priceCents: 4500, priceLabel: '£35/person', rating: 4.6, reviews: 278,
    duration: '3 hours', color: '#2ECC71', icon: 'restaurant', highlights: ['5 Restaurants', 'Cultural Stories', 'All Food Included', 'Local Guide'],
    ageGroup: 'Adults', isPopular: true,
    imageUrl: 'https://images.unsplash.com/photo-1567337710282-00832b415979?w=800&q=80',
    country: 'United Kingdom', city: 'Manchester',
  },
  {
    id: 'a20', cpid: 'CP-ACT-020', name: 'Toronto Little India Bazaar Walk', category: 'Workshops', description: 'Explore Toronto\'s Gerrard India Bazaar with a local guide discovering shops, eateries, and South Asian culture.',
    location: 'Gerrard St E, Toronto', priceCents: 3000, priceLabel: 'CAD $30', rating: 4.6, reviews: 189,
    duration: '2 hours', color: '#1ABC9C', icon: 'walk', highlights: ['Shopping', 'Street Food', 'Cultural History', 'Local Guide'],
    ageGroup: 'All Ages', isPopular: true,
    imageUrl: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=800&q=80',
    country: 'Canada', city: 'Toronto',
  },
  {
    id: 'a21', cpid: 'CP-ACT-021', name: 'Toronto Cricket in the Park', category: 'Fitness', description: 'Casual weekend cricket matches at Sunnybrook Park open to all skill levels. Equipment provided.',
    location: 'Sunnybrook Park, Toronto', priceCents: 1000, priceLabel: 'CAD $10', rating: 4.4, reviews: 156,
    duration: '3 hours', color: '#2ECC71', icon: 'football', highlights: ['All Levels', 'Equipment Provided', 'Social Sport', 'BBQ After'],
    ageGroup: '12+', isPopular: false,
    imageUrl: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&q=80',
    country: 'Canada', city: 'Toronto',
  },
  {
    id: 'a22', cpid: 'CP-ACT-022', name: 'Vancouver Yoga on the Beach', category: 'Fitness', description: 'Sunrise yoga sessions on Kitsilano Beach combining traditional yoga with ocean views and fresh air.',
    location: 'Kitsilano Beach, Vancouver', priceCents: 2000, priceLabel: 'CAD $20', rating: 4.8, reviews: 312,
    duration: '1 hour', color: '#2ECC71', icon: 'leaf', highlights: ['Beach Setting', 'Sunrise Session', 'All Levels', 'Mats Provided'],
    ageGroup: '16+', isPopular: true,
    imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80',
    country: 'Canada', city: 'Vancouver',
  },
  {
    id: 'a23', cpid: 'CP-ACT-023', name: 'Vancouver Spice Market Tour', category: 'Workshops', description: 'Guided tour of Vancouver\'s South Asian markets on Main Street with spice shopping and cooking tips.',
    location: 'Main Street, Vancouver', priceCents: 3500, priceLabel: 'CAD $35', rating: 4.5, reviews: 145,
    duration: '2 hours', color: '#F2A93B', icon: 'restaurant', highlights: ['Spice Shopping', 'Cooking Tips', 'Tasting', 'Recipe Card'],
    ageGroup: 'Adults', isPopular: false,
    imageUrl: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&q=80',
    country: 'Canada', city: 'Vancouver',
  },
  {
    id: 'ai1', cpid: 'CP-ACT-I01', name: 'Aboriginal Cultural Walking Tour', category: 'Cultural Tours',
    description: 'Guided walk through Sydney exploring Aboriginal rock art, middens, and sacred sites with a Gadigal knowledge keeper.',
    location: 'The Rocks, Sydney', priceCents: 4500, priceLabel: '$45', rating: 4.9, reviews: 234,
    duration: '2.5 hours', color: '#1A5276', icon: 'walk', highlights: ['Rock Art', 'Dreamtime Stories', 'Bush Medicine', 'Sacred Sites'],
    ageGroup: 'All Ages', isPopular: true,
    imageUrl: 'https://images.unsplash.com/photo-1500043357865-c6b8827edf10?w=800&q=80',
    country: 'Australia', city: 'Sydney', indigenousTags: ['Indigenous-led', 'First Nations Owned'],
  },
  {
    id: 'ai2', cpid: 'CP-ACT-I02', name: 'Boomerang & Spear Throwing Workshop', category: 'Outdoor Adventure',
    description: 'Learn traditional boomerang and spear throwing techniques from Aboriginal elders in a hands-on bush workshop.',
    location: 'Kings Park, Perth', priceCents: 5500, priceLabel: '$55', rating: 4.8, reviews: 156,
    duration: '2 hours', color: '#8B4513', icon: 'fitness', highlights: ['Boomerang Throwing', 'Spear Technique', 'Bush Skills', 'Cultural Storytelling'],
    ageGroup: 'Ages 8+', isPopular: true,
    imageUrl: 'https://images.unsplash.com/photo-1528164344885-47b1492b7391?w=800&q=80',
    country: 'Australia', city: 'Perth', indigenousTags: ['Indigenous-led'],
  },
];

export const sampleShopping: ShoppingData[] = [
  {
    id: 's1', cpid: 'CP-SHP-001', name: 'Spice World Indian Groceries', category: 'Groceries', description: 'Largest Indian grocery store in Western Sydney with spices, fresh produce, and imported goods from across South Asia.',
    location: 'Harris Park, NSW', rating: 4.6, reviews: 678, color: '#E85D3A', icon: 'cart',
    deals: [{ title: 'Basmati Rice 10kg', discount: '20% Off', validTill: '2026-04-01' }, { title: 'Fresh Curry Leaves', discount: 'Buy 2 Get 1', validTill: '2026-03-31' }],
    isOpen: true, deliveryAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&q=80',
    country: 'Australia', city: 'Sydney',
  },
  {
    id: 's2', cpid: 'CP-SHP-002', name: 'Silk & Sari Boutique', category: 'Fashion', description: 'Premium collection of silk sarees, lehengas, and ethnic wear for all occasions. Custom tailoring available.',
    location: 'Parramatta, NSW', rating: 4.8, reviews: 234, color: '#9B59B6', icon: 'shirt',
    deals: [{ title: 'Wedding Collection', discount: '30% Off', validTill: '2026-04-15' }, { title: 'Kids Ethnic Wear', discount: 'Flat $20 Off', validTill: '2026-03-30' }],
    isOpen: true, deliveryAvailable: false,
    imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80',
    country: 'Australia', city: 'Sydney',
  },
  {
    id: 's3', cpid: 'CP-SHP-003', name: 'Golden Jewellers', category: 'Jewellery', description: 'Traditional and contemporary Indian gold and diamond jewellery. BIS hallmarked. EMI available.',
    location: 'Toongabbie, NSW', rating: 4.7, reviews: 189, color: '#F2A93B', icon: 'diamond',
    deals: [{ title: 'Making Charges', discount: '50% Off', validTill: '2026-04-10' }],
    isOpen: true, deliveryAvailable: false,
    imageUrl: 'https://images.unsplash.com/photo-1515562141589-67f0d569b986?w=800&q=80',
    country: 'Australia', city: 'Sydney',
  },
  {
    id: 's4', cpid: 'CP-SHP-004', name: 'Desi Electronics Hub', category: 'Electronics', description: 'Refurbished phones, accessories, and electronics. Repair services and screen replacement available.',
    location: 'Auburn, NSW', rating: 4.3, reviews: 312, color: '#3498DB', icon: 'phone-portrait',
    deals: [{ title: 'Screen Protectors', discount: 'Buy 1 Get 1', validTill: '2026-03-31' }, { title: 'Phone Cases', discount: '40% Off', validTill: '2026-04-05' }],
    isOpen: true, deliveryAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=800&q=80',
    country: 'Australia', city: 'Sydney',
  },
  {
    id: 's5', cpid: 'CP-SHP-005', name: 'Ayurveda Health Store', category: 'Health & Wellness', description: 'Authentic Ayurvedic products, herbal supplements, essential oils, and natural skincare from India.',
    location: 'Wentworthville, NSW', rating: 4.5, reviews: 145, color: '#2ECC71', icon: 'leaf',
    deals: [{ title: 'Immunity Boosters', discount: '25% Off', validTill: '2026-04-20' }],
    isOpen: true, deliveryAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&q=80',
    country: 'Australia', city: 'Sydney',
  },
  {
    id: 's6', cpid: 'CP-SHP-006', name: 'Bindiya Books & Gifts', category: 'Books & Gifts', description: 'Books in Hindi, Tamil, Malayalam, and more. Cultural gifts, handicrafts, and spiritual items.',
    location: 'Blacktown, NSW', rating: 4.4, reviews: 98, color: '#E74C3C', icon: 'book',
    deals: [{ title: 'Children Books Set', discount: '3 for $25', validTill: '2026-03-28' }],
    isOpen: true, deliveryAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
    country: 'Australia', city: 'Sydney',
  },
  {
    id: 's7', cpid: 'CP-SHP-007', name: 'Melbourne Sari Palace', category: 'Fashion', description: 'Designer sarees, lehengas, and Indo-Western fusion wear in Melbourne\'s fashion district.',
    location: 'Dandenong, VIC', rating: 4.7, reviews: 198, color: '#9B59B6', icon: 'shirt',
    deals: [{ title: 'Bridal Collection', discount: '25% Off', validTill: '2026-04-30' }, { title: 'Festive Wear', discount: 'Flat $30 Off', validTill: '2026-04-15' }],
    isOpen: true, deliveryAvailable: false,
    imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80',
    country: 'Australia', city: 'Melbourne',
  },
  {
    id: 's8', cpid: 'CP-SHP-008', name: 'Brisbane Indian Supermarket', category: 'Groceries', description: 'Comprehensive Indian grocery store in Brisbane with spices, lentils, frozen foods, and fresh vegetables.',
    location: 'Woolloongabba, QLD', rating: 4.5, reviews: 234, color: '#E85D3A', icon: 'cart',
    deals: [{ title: 'Atta 10kg', discount: '15% Off', validTill: '2026-04-10' }, { title: 'Ghee 1kg', discount: '$2 Off', validTill: '2026-03-31' }],
    isOpen: true, deliveryAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&q=80',
    country: 'Australia', city: 'Brisbane',
  },
  {
    id: 's9', cpid: 'CP-SHP-009', name: 'Perth Spice Emporium', category: 'Groceries', description: 'Perth\'s premier Indian grocery and spice store with fresh produce, snacks, and imported specialties.',
    location: 'Cannington, WA', rating: 4.6, reviews: 178, color: '#1A7A6D', icon: 'cart',
    deals: [{ title: 'Masala Pack Bundle', discount: '30% Off', validTill: '2026-04-15' }],
    isOpen: true, deliveryAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&q=80',
    country: 'Australia', city: 'Perth',
  },
  {
    id: 's10', cpid: 'CP-SHP-010', name: 'Auckland Indian Mart', category: 'Groceries', description: 'One-stop Indian grocery store in Auckland with wide range of spices, snacks, and frozen foods.',
    location: 'Sandringham, Auckland', rating: 4.5, reviews: 312, color: '#E85D3A', icon: 'cart',
    deals: [{ title: 'Basmati Rice 5kg', discount: '$3 Off', validTill: '2026-04-01' }, { title: 'Papadum Pack', discount: 'Buy 2 Get 1', validTill: '2026-03-31' }],
    isOpen: true, deliveryAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&q=80',
    country: 'New Zealand', city: 'Auckland',
  },
  {
    id: 's11', cpid: 'CP-SHP-011', name: 'Wellington Sari Shop', category: 'Fashion', description: 'Beautiful collection of sarees, salwar kameez, and Indo-Western wear in central Wellington.',
    location: 'Cuba Street, Wellington', rating: 4.6, reviews: 89, color: '#9B59B6', icon: 'shirt',
    deals: [{ title: 'Festival Collection', discount: '20% Off', validTill: '2026-04-20' }],
    isOpen: true, deliveryAvailable: false,
    imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80',
    country: 'New Zealand', city: 'Wellington',
  },
  {
    id: 's12', cpid: 'CP-SHP-012', name: 'Gold Souk Jewellery Dubai', category: 'Jewellery', description: 'Iconic gold jewellery store in Dubai\'s Gold Souk offering traditional and contemporary Indian designs at competitive prices.',
    location: 'Deira Gold Souk, Dubai', rating: 4.7, reviews: 1234, color: '#F2A93B', icon: 'diamond',
    deals: [{ title: 'Wedding Gold Sets', discount: '10% Off Making', validTill: '2026-05-01' }, { title: 'Diamond Earrings', discount: '15% Off', validTill: '2026-04-15' }],
    isOpen: true, deliveryAvailable: false,
    imageUrl: 'https://images.unsplash.com/photo-1515562141589-67f0d569b986?w=800&q=80',
    country: 'United Arab Emirates', city: 'Dubai',
  },
  {
    id: 's13', cpid: 'CP-SHP-013', name: 'Lulu Hypermarket Spices', category: 'Groceries', description: 'Massive hypermarket with an extensive Indian grocery section, fresh produce, and imported goods from India.',
    location: 'Al Wahda Mall, Abu Dhabi', rating: 4.6, reviews: 2345, color: '#E85D3A', icon: 'cart',
    deals: [{ title: 'Indian Spice Bundle', discount: '25% Off', validTill: '2026-04-30' }, { title: 'Fresh Coconut', discount: 'AED 3 Each', validTill: '2026-03-31' }],
    isOpen: true, deliveryAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&q=80',
    country: 'United Arab Emirates', city: 'Abu Dhabi',
  },
  {
    id: 's14', cpid: 'CP-SHP-014', name: 'Meena Bazaar Dubai', category: 'Fashion', description: 'Famous ethnic wear destination in Bur Dubai with designer sarees, lehengas, and men\'s ethnic wear.',
    location: 'Bur Dubai', rating: 4.5, reviews: 890, color: '#9B59B6', icon: 'shirt',
    deals: [{ title: 'Eid Collection', discount: '30% Off', validTill: '2026-05-10' }, { title: 'Kids Wear', discount: 'Flat AED 50 Off', validTill: '2026-04-20' }],
    isOpen: true, deliveryAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80',
    country: 'United Arab Emirates', city: 'Dubai',
  },
  {
    id: 's15', cpid: 'CP-SHP-015', name: 'Southall Broadway Market', category: 'Groceries', description: 'London\'s Little India marketplace with Indian groceries, sweets, spices, and fresh produce.',
    location: 'Southall, London', rating: 4.6, reviews: 567, color: '#E85D3A', icon: 'cart',
    deals: [{ title: 'Fresh Mangoes', discount: '£1 Off/kg', validTill: '2026-04-30' }, { title: 'Spice Box Set', discount: '20% Off', validTill: '2026-04-15' }],
    isOpen: true, deliveryAvailable: false,
    imageUrl: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&q=80',
    country: 'United Kingdom', city: 'London',
  },
  {
    id: 's16', cpid: 'CP-SHP-016', name: 'East London Sari House', category: 'Fashion', description: 'Designer and everyday sarees, lehengas, and Asian fashion on Brick Lane with custom tailoring.',
    location: 'Brick Lane, London', rating: 4.7, reviews: 345, color: '#9B59B6', icon: 'shirt',
    deals: [{ title: 'Silk Sarees', discount: '25% Off', validTill: '2026-04-30' }, { title: 'Bridal Package', discount: '£100 Off', validTill: '2026-05-15' }],
    isOpen: true, deliveryAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80',
    country: 'United Kingdom', city: 'London',
  },
  {
    id: 's17', cpid: 'CP-SHP-017', name: 'Manchester Desi Store', category: 'Groceries', description: 'Comprehensive South Asian grocery store on Curry Mile with fresh produce, spices, and imported snacks.',
    location: 'Rusholme, Manchester', rating: 4.4, reviews: 234, color: '#2ECC71', icon: 'cart',
    deals: [{ title: 'Lentils Pack', discount: '15% Off', validTill: '2026-04-10' }, { title: 'Ready Meals', discount: '3 for £5', validTill: '2026-03-31' }],
    isOpen: true, deliveryAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&q=80',
    country: 'United Kingdom', city: 'Manchester',
  },
  {
    id: 's18', cpid: 'CP-SHP-018', name: 'Gerrard India Bazaar', category: 'Groceries', description: 'Iconic South Asian marketplace on Gerrard Street with groceries, fashion, jewellery, and cultural goods.',
    location: 'Gerrard St E, Toronto', rating: 4.5, reviews: 890, color: '#1ABC9C', icon: 'cart',
    deals: [{ title: 'Atta 20lb', discount: 'CAD $2 Off', validTill: '2026-04-15' }, { title: 'Frozen Snacks', discount: 'Buy 3 Get 1', validTill: '2026-03-31' }],
    isOpen: true, deliveryAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&q=80',
    country: 'Canada', city: 'Toronto',
  },
  {
    id: 's19', cpid: 'CP-SHP-019', name: 'Scarborough Tamil Jewellers', category: 'Jewellery', description: 'Trusted Tamil jewellery store in Scarborough with traditional South Indian gold designs and custom work.',
    location: 'Scarborough, ON', rating: 4.7, reviews: 456, color: '#F2A93B', icon: 'diamond',
    deals: [{ title: 'Bridal Gold Set', discount: '15% Off Making', validTill: '2026-05-01' }],
    isOpen: true, deliveryAvailable: false,
    imageUrl: 'https://images.unsplash.com/photo-1515562141589-67f0d569b986?w=800&q=80',
    country: 'Canada', city: 'Toronto',
  },
  {
    id: 's20', cpid: 'CP-SHP-020', name: 'Vancouver Punjabi Market', category: 'Groceries', description: 'Historic Punjabi Market on Main Street with Indian groceries, sweets, fashion, and cultural items.',
    location: 'Main Street, Vancouver', rating: 4.5, reviews: 567, color: '#E85D3A', icon: 'cart',
    deals: [{ title: 'Fresh Naan Bundle', discount: 'CAD $1 Off', validTill: '2026-04-10' }, { title: 'Mithai Box', discount: '20% Off', validTill: '2026-04-30' }],
    isOpen: true, deliveryAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&q=80',
    country: 'Canada', city: 'Vancouver',
  },
  {
    id: 's21', cpid: 'CP-SHP-021', name: 'Vancouver Desi Fashion', category: 'Fashion', description: 'Trendy Indo-Western fashion boutique in Surrey with designer wear, accessories, and custom tailoring.',
    location: 'Surrey, BC', rating: 4.6, reviews: 189, color: '#9B59B6', icon: 'shirt',
    deals: [{ title: 'Festive Collection', discount: '25% Off', validTill: '2026-04-20' }, { title: 'Mens Kurta', discount: 'CAD $15 Off', validTill: '2026-04-05' }],
    isOpen: true, deliveryAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80',
    country: 'Canada', city: 'Vancouver',
  },
];

export const businessCategories = [
  { label: 'All', icon: 'grid', color: '#1C1C1E' },
  { label: 'Restaurants', icon: 'restaurant', color: '#E85D3A' },
  { label: 'Event Planners', icon: 'calendar', color: '#1A7A6D' },
  { label: 'Decorators', icon: 'color-palette', color: '#9B59B6' },
  { label: 'Musicians', icon: 'musical-notes', color: '#3498DB' },
  { label: 'Venues', icon: 'business', color: '#F2A93B' },
  { label: 'Photographers', icon: 'camera', color: '#E74C3C' },
];

export const exploreCategories = [
  { label: 'All', icon: 'apps' },
  { label: 'Events', icon: 'calendar' },
  { label: 'Indigenous', icon: 'earth' },
  { label: 'Free', icon: 'gift' },
  { label: 'Council', icon: 'business' },
  { label: 'Food', icon: 'restaurant' },
  { label: 'Music', icon: 'musical-notes' },
  { label: 'Dance', icon: 'body' },
  { label: 'Wellness', icon: 'heart' },
];

export const movieGenres = [
  { label: 'All', icon: 'film', color: '#1C1C1E' },
  { label: 'Action', icon: 'flash', color: '#E85D3A' },
  { label: 'Drama', icon: 'heart', color: '#9B59B6' },
  { label: 'Comedy', icon: 'happy', color: '#F2A93B' },
  { label: 'Horror', icon: 'skull', color: '#2C3E50' },
  { label: 'Thriller', icon: 'eye', color: '#E74C3C' },
  { label: 'Romance', icon: 'heart-circle', color: '#E91E63' },
];

export const restaurantCuisines = [
  { label: 'All', icon: 'restaurant', color: '#1C1C1E' },
  { label: 'South Indian', icon: 'flame', color: '#E85D3A' },
  { label: 'North Indian', icon: 'star', color: '#F2A93B' },
  { label: 'Sri Lankan', icon: 'leaf', color: '#9B59B6' },
  { label: 'Street Food', icon: 'fast-food', color: '#2ECC71' },
  { label: 'Afghan', icon: 'bonfire', color: '#1A7A6D' },
  { label: 'Japanese-Fusion', icon: 'fish', color: '#E74C3C' },
];

export const activityCategories = [
  { label: 'All', icon: 'compass', color: '#1C1C1E' },
  { label: 'Theme Parks', icon: 'happy', color: '#E85D3A' },
  { label: 'Gaming', icon: 'game-controller', color: '#9B59B6' },
  { label: 'Workshops', icon: 'construct', color: '#F2A93B' },
  { label: 'Nature', icon: 'leaf', color: '#2ECC71' },
  { label: 'Fitness', icon: 'fitness', color: '#E74C3C' },
];

export const shoppingCategories = [
  { label: 'All', icon: 'bag-handle', color: '#1C1C1E' },
  { label: 'Groceries', icon: 'cart', color: '#E85D3A' },
  { label: 'Fashion', icon: 'shirt', color: '#9B59B6' },
  { label: 'Jewellery', icon: 'diamond', color: '#F2A93B' },
  { label: 'Electronics', icon: 'phone-portrait', color: '#3498DB' },
  { label: 'Health & Wellness', icon: 'leaf', color: '#2ECC71' },
  { label: 'Books & Gifts', icon: 'book', color: '#E74C3C' },
];

export const superAppSections = [
  { id: 'movies', label: 'Movies', icon: 'film', color: '#C0392B', route: '/movies' },
  { id: 'restaurants', label: 'Restaurants', icon: 'restaurant', color: '#E85D3A', route: '/restaurants' },
  { id: 'activities', label: 'Activities', icon: 'compass', color: '#F2A93B', route: '/activities' },
  { id: 'shopping', label: 'Shopping', icon: 'bag-handle', color: '#9B59B6', route: '/shopping' },
  { id: 'events', label: 'Events', icon: 'calendar', color: '#1A7A6D', route: '/explore' },
  { id: 'directory', label: 'Directory', icon: 'storefront', color: '#3498DB', route: '/directory' },
];

export interface IndigenousSpotlightData {
  id: string;
  type: 'artist' | 'business' | 'event' | 'community';
  title: string;
  subtitle: string;
  description: string;
  imageUrl: string;
  linkId: string;
  linkType: string;
  nation?: string;
}

export const indigenousSpotlights: IndigenousSpotlightData[] = [
  { id: 'is1', type: 'artist', title: 'Artist of the Week', subtitle: 'Warrina Designs', description: 'Contemporary Aboriginal textile art blending traditional dot painting with modern fashion design.', imageUrl: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&q=80', linkId: 'bi1', linkType: 'business', nation: 'Wiradjuri' },
  { id: 'is2', type: 'business', title: 'Indigenous Business Feature', subtitle: 'Mabu Mabu Restaurant', description: 'Torres Strait Islander cuisine celebrating native Australian ingredients in the heart of Melbourne.', imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80', linkId: 'bi3', linkType: 'business', nation: 'Torres Strait Islander' },
  { id: 'is3', type: 'event', title: 'Cultural Event', subtitle: 'NAIDOC Week Opening', description: 'Annual celebration honouring the history, culture, and achievements of Aboriginal and Torres Strait Islander peoples.', imageUrl: 'https://images.unsplash.com/photo-1534312527009-56c7016453e6?w=800&q=80', linkId: 'ei1', linkType: 'event', nation: 'Multi-Nation' },
  { id: 'is4', type: 'community', title: 'Community of the Month', subtitle: 'First Nations Cultural Council', description: 'Supporting cultural preservation and artistic expression for Aboriginal communities across Australia.', imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80', linkId: 'ci1', linkType: 'community', nation: 'Multi-Nation' },
];

export const acknowledgementOfCountry = "CulturePass acknowledges the Traditional Custodians of the lands on which events are held and recognises Aboriginal and Torres Strait Islander peoples as the First Nations of Australia. We pay our respects to Elders past, present, and emerging.";

export interface EventData {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  address: string;
  price: number;
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
}

export interface CommunityData {
  id: string;
  name: string;
  description: string;
  members: number;
  events: number;
  color: string;
  icon: string;
  category: string;
  leaders: string[];
  imageUrl: string;
}

export interface BusinessData {
  id: string;
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
}

export interface MovieData {
  id: string;
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
}

export interface RestaurantData {
  id: string;
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
}

export interface ActivityData {
  id: string;
  name: string;
  category: string;
  description: string;
  location: string;
  price: number;
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
}

export interface ShoppingData {
  id: string;
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

export const communities: string[] = [
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
  'Malayalee': 'globe', 'Tamil': 'globe', 'Punjabi': 'globe',
  'Multicultural': 'earth', 'Council Events': 'business',
  'Business Networking': 'briefcase', 'Youth': 'rocket', 'Religious': 'leaf',
  'Bengali': 'globe', 'Gujarati': 'globe', 'Telugu': 'globe',
  'Chinese': 'globe', 'Filipino': 'globe', 'Korean': 'globe', 'Pacific Islander': 'globe',
};

export const sampleEvents: EventData[] = [
  {
    id: 'e1', title: 'Onam Grand Celebration 2026',
    description: 'Join us for the biggest Onam celebration in Sydney featuring traditional Onasadya, Thiruvathirakali dance performances, boat races, and cultural programs.',
    date: '2026-03-15', time: '5:00 PM', venue: 'Sydney Olympic Park', address: '7 Olympic Blvd, Sydney NSW 2127',
    price: 45, priceLabel: 'From $45', category: 'Festivals', communityTag: 'Malayalee',
    organizer: 'Kerala Association of Sydney', organizerId: 'c1', imageColor: '#E85D3A',
    imageUrl: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80',
    capacity: 2000, attending: 1456, isFeatured: true, isCouncil: false,
    tiers: [{ name: 'General', price: 45, available: 344 }, { name: 'VIP', price: 85, available: 120 }, { name: 'Family (4)', price: 150, available: 80 }],
  },
  {
    id: 'e2', title: 'Tamil Pongal Festival',
    description: 'Celebrate the harvest festival of Pongal with traditional cooking demonstrations, Kolam competitions, folk music, and Bharatanatyam performances.',
    date: '2026-03-20', time: '10:00 AM', venue: 'Parramatta Park', address: 'Pitt St, Parramatta NSW 2150',
    price: 0, priceLabel: 'Free', category: 'Festivals', communityTag: 'Tamil', councilTag: 'City of Parramatta',
    organizer: 'Tamil Cultural Forum', organizerId: 'c2', imageColor: '#1A7A6D',
    imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80',
    capacity: 5000, attending: 3200, isFeatured: true, isCouncil: true,
    tiers: [{ name: 'Free Entry', price: 0, available: 1800 }],
  },
  {
    id: 'e3', title: 'Multicultural Food & Music Night',
    description: 'An evening celebrating the diversity of our community through food stalls from 20+ cultures, live music performances, and interactive cooking workshops.',
    date: '2026-03-22', time: '6:00 PM', venue: 'Melbourne Convention Centre', address: '1 Convention Centre Pl, Melbourne VIC 3006',
    price: 25, priceLabel: 'From $25', category: 'Food & Cooking', communityTag: 'Multicultural', councilTag: 'City of Melbourne',
    organizer: 'Multicultural Victoria', organizerId: 'c4', imageColor: '#F2A93B',
    imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80',
    capacity: 3000, attending: 2100, isFeatured: true, isCouncil: true,
    tiers: [{ name: 'Entry', price: 25, available: 900 }, { name: 'VIP Tasting', price: 65, available: 200 }],
  },
  {
    id: 'e4', title: 'Bollywood Dance Workshop',
    description: 'Learn the latest Bollywood dance moves with professional choreographers. All skill levels welcome.',
    date: '2026-03-25', time: '7:00 PM', venue: 'Blacktown Arts Centre', address: '78 Flushcombe Rd, Blacktown NSW 2148',
    price: 20, priceLabel: '$20', category: 'Dance', communityTag: 'Punjabi',
    organizer: 'Bhangra Beats Studio', organizerId: 'c3', imageColor: '#9B59B6',
    imageUrl: 'https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?w=800&q=80',
    capacity: 50, attending: 38, isFeatured: false, isCouncil: false,
    tiers: [{ name: 'Single', price: 20, available: 12 }],
  },
  {
    id: 'e5', title: 'Auckland Diwali Festival',
    description: 'The biggest Diwali celebration in New Zealand! Fireworks, food stalls, live music, dance performances, and market stalls.',
    date: '2026-04-01', time: '4:00 PM', venue: 'Aotea Square', address: 'Queen St, Auckland 1010',
    price: 0, priceLabel: 'Free', category: 'Festivals', communityTag: 'Multicultural', councilTag: 'Auckland Council',
    organizer: 'Asia NZ Foundation', organizerId: 'c5', imageColor: '#E74C3C',
    imageUrl: 'https://images.unsplash.com/photo-1604871000636-074fa5117945?w=800&q=80',
    capacity: 10000, attending: 7500, isFeatured: true, isCouncil: true,
    tiers: [{ name: 'Free Entry', price: 0, available: 2500 }],
  },
  {
    id: 'e6', title: 'Community Yoga & Wellness Morning',
    description: 'Start your weekend with community yoga, guided meditation, and Ayurvedic wellness talks. Light breakfast included.',
    date: '2026-03-28', time: '7:30 AM', venue: 'Centennial Park', address: 'Grand Dr, Centennial Park NSW 2021',
    price: 15, priceLabel: '$15', category: 'Wellness', communityTag: 'Multicultural',
    organizer: 'Yoga with Priya', organizerId: 'b3', imageColor: '#2ECC71',
    imageUrl: 'https://images.unsplash.com/photo-1545389336-cf090694435e?w=800&q=80',
    capacity: 100, attending: 72, isFeatured: false, isCouncil: false,
    tiers: [{ name: 'Single', price: 15, available: 28 }],
  },
  {
    id: 'e7', title: 'Youth Business Pitch Night',
    description: 'Young entrepreneurs from multicultural backgrounds pitch their startup ideas to a panel of experienced mentors and investors.',
    date: '2026-04-05', time: '6:30 PM', venue: 'WeWork George Street', address: '100 Harris St, Pyrmont NSW 2009',
    price: 10, priceLabel: '$10', category: 'Business', communityTag: 'Youth',
    organizer: 'CulturePass Youth Network', organizerId: 'c7', imageColor: '#3498DB',
    imageUrl: 'https://images.unsplash.com/photo-1559223607-a43c990c692c?w=800&q=80',
    capacity: 150, attending: 110, isFeatured: false, isCouncil: false,
    tiers: [{ name: 'Attendee', price: 10, available: 40 }, { name: 'Pitcher', price: 0, available: 5 }],
  },
  {
    id: 'e8', title: 'Classical Carnatic Music Concert',
    description: 'An evening of sublime Carnatic music featuring renowned artists from India performing ragas and kritis.',
    date: '2026-04-10', time: '7:00 PM', venue: 'Sydney Town Hall', address: '483 George St, Sydney NSW 2000',
    price: 55, priceLabel: 'From $55', category: 'Music', communityTag: 'Tamil',
    organizer: 'Carnatic Music Society', organizerId: 'c2', imageColor: '#8E44AD',
    imageUrl: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800&q=80',
    capacity: 800, attending: 520, isFeatured: false, isCouncil: false,
    tiers: [{ name: 'Standard', price: 55, available: 180 }, { name: 'Premium', price: 95, available: 100 }],
  },
];

export const sampleCommunities: CommunityData[] = [
  { id: 'c1', name: 'Malayalee Community', description: 'Connecting Kerala diaspora across Australia and New Zealand. Cultural events, language classes, and community support.', members: 12500, events: 45, color: '#E85D3A', icon: 'globe', category: 'Cultural', leaders: ['Arun Kumar', 'Lekha Nair', 'Rajesh Menon'], imageUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80' },
  { id: 'c2', name: 'Tamil Cultural Forum', description: 'Preserving and celebrating Tamil heritage through language, arts, music, and festivals.', members: 9800, events: 38, color: '#1A7A6D', icon: 'globe', category: 'Cultural', leaders: ['Priya Raman', 'Karthik Subramanian'], imageUrl: 'https://images.unsplash.com/photo-1506869640319-fe1a24fd76cb?w=800&q=80' },
  { id: 'c3', name: 'Punjabi Association', description: 'Bhangra, music, food, and festivities bringing the vibrant Punjabi culture to the Southern Hemisphere.', members: 7200, events: 28, color: '#F2A93B', icon: 'globe', category: 'Cultural', leaders: ['Harpreet Singh', 'Jasmine Kaur'], imageUrl: 'https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=800&q=80' },
  { id: 'c4', name: 'Multicultural Victoria', description: 'Celebrating the diversity of Melbourne and Victoria through inclusive community programs and events.', members: 25000, events: 120, color: '#3498DB', icon: 'earth', category: 'Regional', leaders: ['Sarah Chen', 'Ahmed Hassan'], imageUrl: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&q=80' },
  { id: 'c5', name: 'Indian Community NZ', description: 'Supporting the Indian diaspora in New Zealand with cultural events, networking, and wellbeing programs.', members: 15000, events: 55, color: '#E74C3C', icon: 'globe', category: 'Cultural', leaders: ['Vikram Patel', 'Anita Sharma'], imageUrl: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=800&q=80' },
  { id: 'c6', name: 'Bengali Association', description: 'Durga Puja, Rabindra Sangeet, and Bengali cultural celebrations bringing the warmth of Bengal to Australia.', members: 4500, events: 22, color: '#9B59B6', icon: 'globe', category: 'Cultural', leaders: ['Dipankar Roy', 'Soma Ghosh'], imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80' },
  { id: 'c7', name: 'Youth Network', description: 'Empowering young multicultural Australians through mentorship, career development, and social events.', members: 8000, events: 35, color: '#2ECC71', icon: 'rocket', category: 'Youth', leaders: ['Zara Ahmed', 'Jason Li'], imageUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80' },
  { id: 'c8', name: 'Filipino Community', description: 'Bringing Filipino traditions, food, music, and community spirit to Australian shores.', members: 11000, events: 42, color: '#1ABC9C', icon: 'globe', category: 'Cultural', leaders: ['Maria Santos', 'Carlo Reyes'], imageUrl: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&q=80' },
];

export const sampleBusinesses: BusinessData[] = [
  { id: 'b1', name: 'Spice Route Kitchen', category: 'Restaurants', description: 'Authentic South Indian and Kerala cuisine. Catering available for events up to 500 guests.', rating: 4.8, reviews: 324, location: 'Parramatta, NSW', phone: '+61 2 9876 5432', services: ['Dine-in', 'Catering', 'Event Packages', 'Delivery'], color: '#E85D3A', icon: 'restaurant', isVerified: true, priceRange: '$$', imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80' },
  { id: 'b2', name: 'Ranga Photography', category: 'Photographers', description: 'Specializing in cultural events, weddings, and portraits. Cinematic videography also available.', rating: 4.9, reviews: 189, location: 'Sydney CBD, NSW', phone: '+61 4 1234 5678', services: ['Event Photography', 'Wedding', 'Portrait', 'Videography'], color: '#1A7A6D', icon: 'camera', isVerified: true, priceRange: '$$$', imageUrl: 'https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=800&q=80' },
  { id: 'b3', name: 'Shakti Events & Decor', category: 'Event Planners', description: 'Full-service event planning for cultural celebrations, weddings, and corporate events.', rating: 4.7, reviews: 156, location: 'Melbourne, VIC', phone: '+61 3 9876 1234', services: ['Wedding Planning', 'Decor', 'Stage Design', 'Floral'], color: '#F2A93B', icon: 'flower', isVerified: true, priceRange: '$$$', imageUrl: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80' },
  { id: 'b4', name: 'Natyam Dance Academy', category: 'Musicians', description: 'Classical and contemporary dance training. Bharatanatyam, Kuchipudi, and Bollywood styles.', rating: 4.9, reviews: 212, location: 'Blacktown, NSW', phone: '+61 2 9876 7890', services: ['Dance Classes', 'Performance', 'Choreography', 'Workshops'], color: '#9B59B6', icon: 'musical-notes', isVerified: false, priceRange: '$$', imageUrl: 'https://images.unsplash.com/photo-1547153760-18fc86c1ae69?w=800&q=80' },
  { id: 'b5', name: 'The Grand Pavilion', category: 'Venues', description: 'Premium event venue with capacity for 1000 guests. Full AV setup and catering partnerships.', rating: 4.6, reviews: 98, location: 'Homebush, NSW', phone: '+61 2 9876 4321', services: ['Venue Hire', 'AV Setup', 'Catering', 'Valet Parking'], color: '#3498DB', icon: 'business', isVerified: true, priceRange: '$$$$', imageUrl: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80' },
  { id: 'b6', name: 'Mehndi by Fatima', category: 'Decorators', description: 'Bridal and event mehndi artistry. Traditional and modern designs for all occasions.', rating: 4.8, reviews: 276, location: 'Auburn, NSW', phone: '+61 4 9876 2345', services: ['Bridal Mehndi', 'Party Mehndi', 'Corporate Events', 'Workshops'], color: '#E74C3C', icon: 'color-palette', isVerified: false, priceRange: '$$', imageUrl: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&q=80' },
  { id: 'b7', name: 'Curry Leaf Catering', category: 'Restaurants', description: 'Premium Sri Lankan and South Indian catering for events of all sizes. Vegetarian specialists.', rating: 4.7, reviews: 145, location: 'Wentworthville, NSW', phone: '+61 2 9876 8765', services: ['Event Catering', 'Meal Prep', 'Cooking Classes', 'Corporate Lunches'], color: '#2ECC71', icon: 'restaurant', isVerified: true, priceRange: '$$', imageUrl: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&q=80' },
  { id: 'b8', name: 'Auckland Indian Bazaar', category: 'Venues', description: 'Multi-purpose event and market space in the heart of Auckland. Perfect for cultural markets and festivals.', rating: 4.5, reviews: 67, location: 'Auckland, NZ', phone: '+64 9 123 4567', services: ['Market Stalls', 'Event Space', 'Pop-up Shop', 'Food Court'], color: '#1ABC9C', icon: 'storefront', isVerified: true, priceRange: '$$', imageUrl: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=800&q=80' },
];

export const sampleMovies: MovieData[] = [
  {
    id: 'm1', title: 'Aadujeevitham (The Goat Life)', genre: ['Drama', 'Survival'], language: 'Malayalam',
    duration: '2h 52m', rating: 'MA15+', imdbScore: 7.4,
    description: 'A harrowing true story of an Indian immigrant worker who is trapped in the Middle Eastern desert and forced to herd goats under brutal conditions.',
    director: 'Blessy', cast: ['Prithviraj Sukumaran', 'Amala Paul', 'K.R. Gokul'],
    releaseDate: '2026-03-14', posterColor: '#C0392B', posterUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&q=80', icon: 'film',
    showtimes: [
      { cinema: 'Event Cinemas Parramatta', times: ['2:30 PM', '6:00 PM', '9:15 PM'], price: 22 },
      { cinema: 'Hoyts Bankstown', times: ['3:00 PM', '7:30 PM'], price: 20 },
      { cinema: 'Palace Cinemas Norton St', times: ['5:45 PM', '8:30 PM'], price: 24 },
    ],
    isTrending: true,
  },
  {
    id: 'm2', title: 'Pushpa 2: The Rule', genre: ['Action', 'Thriller'], language: 'Telugu',
    duration: '3h 20m', rating: 'MA15+', imdbScore: 7.1,
    description: 'Pushpa Raj continues his rise in the smuggling syndicate, facing new enemies and alliances in this action-packed sequel.',
    director: 'Sukumar', cast: ['Allu Arjun', 'Rashmika Mandanna', 'Fahadh Faasil'],
    releaseDate: '2026-03-10', posterColor: '#E85D3A', posterUrl: 'https://images.unsplash.com/photo-1535016120720-40c646be5580?w=400&q=80', icon: 'film',
    showtimes: [
      { cinema: 'Event Cinemas George Street', times: ['1:00 PM', '4:30 PM', '8:00 PM', '11:00 PM'], price: 25 },
      { cinema: 'Hoyts Wetherill Park', times: ['2:00 PM', '6:30 PM', '10:00 PM'], price: 22 },
    ],
    isTrending: true,
  },
  {
    id: 'm3', title: 'Jailer 2', genre: ['Action', 'Comedy'], language: 'Tamil',
    duration: '2h 45m', rating: 'M', imdbScore: 6.8,
    description: 'Rajinikanth returns as the retired jailer who must once again take on a criminal empire threatening his family.',
    director: 'Nelson Dilipkumar', cast: ['Rajinikanth', 'Mohanlal', 'Shiva Rajkumar'],
    releaseDate: '2026-03-20', posterColor: '#1A7A6D', posterUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&q=80', icon: 'film',
    showtimes: [
      { cinema: 'Event Cinemas Parramatta', times: ['12:00 PM', '3:30 PM', '7:00 PM', '10:30 PM'], price: 24 },
      { cinema: 'Reading Cinemas Auburn', times: ['1:30 PM', '5:00 PM', '8:30 PM'], price: 20 },
    ],
    isTrending: true,
  },
  {
    id: 'm4', title: 'Devara: Part 2', genre: ['Action', 'Drama'], language: 'Telugu',
    duration: '2h 38m', rating: 'MA15+', imdbScore: 7.0,
    description: 'The continuation of the epic saga set in a coastal village, where power, loyalty, and family collide.',
    director: 'Koratala Siva', cast: ['Jr NTR', 'Janhvi Kapoor', 'Saif Ali Khan'],
    releaseDate: '2026-04-05', posterColor: '#2C3E50', posterUrl: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=400&q=80', icon: 'film',
    showtimes: [
      { cinema: 'Event Cinemas George Street', times: ['2:00 PM', '5:30 PM', '9:00 PM'], price: 23 },
    ],
    isTrending: false,
  },
  {
    id: 'm5', title: 'Stree 3', genre: ['Horror', 'Comedy'], language: 'Hindi',
    duration: '2h 30m', rating: 'M', imdbScore: 7.3,
    description: 'The beloved horror-comedy franchise returns with new supernatural threats and even bigger laughs in a small Indian town.',
    director: 'Amar Kaushik', cast: ['Rajkummar Rao', 'Shraddha Kapoor', 'Pankaj Tripathi'],
    releaseDate: '2026-03-28', posterColor: '#8E44AD', posterUrl: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400&q=80', icon: 'film',
    showtimes: [
      { cinema: 'Event Cinemas Parramatta', times: ['4:00 PM', '7:30 PM', '10:45 PM'], price: 22 },
      { cinema: 'Hoyts Bankstown', times: ['3:30 PM', '6:45 PM', '10:00 PM'], price: 20 },
    ],
    isTrending: false,
  },
  {
    id: 'm6', title: 'Thandel', genre: ['Drama', 'Romance'], language: 'Telugu',
    duration: '2h 25m', rating: 'M', imdbScore: 7.6,
    description: 'Based on true events of fishermen from Srikakulam who accidentally cross into Pakistani waters and face the consequences.',
    director: 'Chandoo Mondeti', cast: ['Naga Chaitanya', 'Sai Pallavi'],
    releaseDate: '2026-03-18', posterColor: '#3498DB', posterUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&q=80', icon: 'film',
    showtimes: [
      { cinema: 'Reading Cinemas Auburn', times: ['2:00 PM', '5:30 PM'], price: 20 },
    ],
    isTrending: false,
  },
];

export const sampleRestaurants: RestaurantData[] = [
  {
    id: 'r1', name: 'Cinnamon Club', cuisine: 'South Indian', description: 'Award-winning South Indian restaurant featuring authentic dosas, idlis, and Kerala-style seafood curries.',
    rating: 4.8, reviews: 542, priceRange: '$$', location: 'Harris Park, NSW', address: '22 Wigram St, Harris Park NSW 2150',
    phone: '+61 2 9687 1234', hours: '11:00 AM - 10:00 PM', features: ['Outdoor Seating', 'BYO', 'Vegan Options', 'Family Friendly'],
    color: '#E85D3A', icon: 'restaurant', isOpen: true, deliveryAvailable: true, reservationAvailable: true,
    menuHighlights: ['Masala Dosa', 'Kerala Fish Curry', 'Appam & Stew', 'Malabar Biryani'],
    imageUrl: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80',
  },
  {
    id: 'r2', name: 'Punjab Palace', cuisine: 'North Indian', description: 'Authentic Punjabi flavours with tandoori specialties, rich curries, and freshly baked naan bread.',
    rating: 4.6, reviews: 389, priceRange: '$$', location: 'Parramatta, NSW', address: '165 Church St, Parramatta NSW 2150',
    phone: '+61 2 9891 5678', hours: '11:30 AM - 11:00 PM', features: ['Buffet Lunch', 'Catering', 'Halal', 'Live Music Fri-Sat'],
    color: '#F2A93B', icon: 'restaurant', isOpen: true, deliveryAvailable: true, reservationAvailable: true,
    menuHighlights: ['Butter Chicken', 'Lamb Rogan Josh', 'Garlic Naan', 'Gulab Jamun'],
    imageUrl: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=800&q=80',
  },
  {
    id: 'r3', name: 'Sakura Garden', cuisine: 'Japanese-Fusion', description: 'Creative Japanese-Asian fusion cuisine with fresh sushi, ramen, and innovative cocktails.',
    rating: 4.7, reviews: 276, priceRange: '$$$', location: 'Sydney CBD, NSW', address: '88 George St, Sydney NSW 2000',
    phone: '+61 2 9252 1234', hours: '12:00 PM - 10:30 PM', features: ['Sake Bar', 'Omakase', 'Private Dining', 'City Views'],
    color: '#E74C3C', icon: 'restaurant', isOpen: true, deliveryAvailable: false, reservationAvailable: true,
    menuHighlights: ['Dragon Roll', 'Tonkotsu Ramen', 'Wagyu Tataki', 'Matcha Tiramisu'],
    imageUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&q=80',
  },
  {
    id: 'r4', name: 'Chai & Chaat', cuisine: 'Street Food', description: 'Vibrant Indian street food experience with authentic chaats, chai varieties, and quick bites.',
    rating: 4.5, reviews: 198, priceRange: '$', location: 'Wentworthville, NSW', address: '45 Dunmore St, Wentworthville NSW 2145',
    phone: '+61 2 9631 9876', hours: '8:00 AM - 9:00 PM', features: ['Takeaway', 'Breakfast Menu', 'Vegan Options', 'Quick Service'],
    color: '#2ECC71', icon: 'cafe', isOpen: true, deliveryAvailable: true, reservationAvailable: false,
    menuHighlights: ['Pani Puri', 'Vada Pav', 'Masala Chai', 'Jalebi'],
    imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&q=80',
  },
  {
    id: 'r5', name: 'The Colombo Kitchen', cuisine: 'Sri Lankan', description: 'Traditional Sri Lankan cuisine with fiery curries, hoppers, and signature sambols in a cozy setting.',
    rating: 4.9, reviews: 312, priceRange: '$$', location: 'Auburn, NSW', address: '12 South Parade, Auburn NSW 2144',
    phone: '+61 2 9646 5432', hours: '11:00 AM - 10:00 PM', features: ['BYOB', 'Gluten Free Options', 'Catering', 'Authentic Spices'],
    color: '#9B59B6', icon: 'restaurant', isOpen: true, deliveryAvailable: true, reservationAvailable: true,
    menuHighlights: ['Egg Hoppers', 'Lamprais', 'Kottu Roti', 'Watalappan'],
    imageUrl: 'https://images.unsplash.com/photo-1567337710282-00832b415979?w=800&q=80',
  },
  {
    id: 'r6', name: 'Naan & Kabab', cuisine: 'Afghan', description: 'Traditional Afghan grills and kebabs cooked over charcoal, served with fresh naan and aromatic rice.',
    rating: 4.4, reviews: 167, priceRange: '$$', location: 'Merrylands, NSW', address: '280 Merrylands Rd, Merrylands NSW 2160',
    phone: '+61 2 9637 4321', hours: '10:00 AM - 11:00 PM', features: ['Halal', 'Family Platters', 'Outdoor Dining', 'Late Night'],
    color: '#1A7A6D', icon: 'restaurant', isOpen: true, deliveryAvailable: true, reservationAvailable: false,
    menuHighlights: ['Chapli Kebab', 'Afghani Pulao', 'Mantu', 'Firni'],
    imageUrl: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800&q=80',
  },
];

export const sampleActivities: ActivityData[] = [
  {
    id: 'a1', name: 'Luna Park Sydney', category: 'Theme Parks', description: 'Iconic harbourside amusement park with thrilling rides, games, and spectacular views of the Sydney Harbour Bridge.',
    location: 'Milsons Point, NSW', price: 55, priceLabel: 'From $55', rating: 4.5, reviews: 2340,
    duration: 'Full Day', color: '#E85D3A', icon: 'happy', highlights: ['Harbour Views', 'Family Rides', 'Roller Coasters', 'Night Events'],
    ageGroup: 'All Ages', isPopular: true,
    imageUrl: 'https://images.unsplash.com/photo-1513889961551-628c1e5e2ee9?w=800&q=80',
  },
  {
    id: 'a2', name: 'Escape Room Challenge', category: 'Gaming', description: 'Themed escape rooms with cultural puzzles and mysteries. Perfect for team building and family fun.',
    location: 'Parramatta, NSW', price: 35, priceLabel: '$35/person', rating: 4.7, reviews: 456,
    duration: '60 min', color: '#9B59B6', icon: 'key', highlights: ['Cultural Themes', 'Team Building', 'Multiple Difficulty Levels', 'Private Bookings'],
    ageGroup: '12+', isPopular: true,
    imageUrl: 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=800&q=80',
  },
  {
    id: 'a3', name: 'Pottery & Chai Workshop', category: 'Workshops', description: 'Learn traditional Indian pottery techniques while enjoying authentic chai and cultural stories.',
    location: 'Newtown, NSW', price: 75, priceLabel: '$75/person', rating: 4.9, reviews: 128,
    duration: '3 hours', color: '#F2A93B', icon: 'color-palette', highlights: ['Hands-on', 'Materials Included', 'Take Home Creation', 'Chai Included'],
    ageGroup: 'Adults', isPopular: false,
    imageUrl: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&q=80',
  },
  {
    id: 'a4', name: 'Taronga Zoo Cultural Trail', category: 'Nature', description: 'Explore the zoo with a guided cultural trail connecting Australian wildlife to Indigenous and multicultural stories.',
    location: 'Mosman, NSW', price: 49, priceLabel: '$49', rating: 4.6, reviews: 1890,
    duration: 'Half Day', color: '#2ECC71', icon: 'leaf', highlights: ['Guided Tours', 'Wildlife Shows', 'Cultural Stories', 'Ferry Access'],
    ageGroup: 'All Ages', isPopular: true,
    imageUrl: 'https://images.unsplash.com/photo-1534567153574-2b12153a87f0?w=800&q=80',
  },
  {
    id: 'a5', name: 'Bollywood Dance Fitness', category: 'Fitness', description: 'High-energy Bollywood-inspired dance workout combining cardio with Bollywood and Bhangra moves.',
    location: 'Blacktown, NSW', price: 25, priceLabel: '$25/class', rating: 4.8, reviews: 267,
    duration: '1 hour', color: '#E74C3C', icon: 'fitness', highlights: ['Cardio Workout', 'No Experience Needed', 'All Fitness Levels', 'Music & Fun'],
    ageGroup: '16+', isPopular: true,
    imageUrl: 'https://images.unsplash.com/photo-1524594152303-9fd13543fe6e?w=800&q=80',
  },
  {
    id: 'a6', name: 'Cooking Masterclass: Biryani', category: 'Workshops', description: 'Learn the art of making authentic Hyderabadi Biryani from a professional chef. Includes all ingredients and a meal.',
    location: 'Harris Park, NSW', price: 89, priceLabel: '$89/person', rating: 4.9, reviews: 98,
    duration: '3 hours', color: '#1A7A6D', icon: 'restaurant', highlights: ['Professional Chef', 'All Ingredients', 'Recipe Book', 'Lunch Included'],
    ageGroup: 'Adults', isPopular: false,
    imageUrl: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80',
  },
  {
    id: 'a7', name: 'Laser Tag Arena', category: 'Gaming', description: 'Indoor laser tag arena with themed battlegrounds. Perfect for birthday parties and group events.',
    location: 'Liverpool, NSW', price: 20, priceLabel: '$20/game', rating: 4.3, reviews: 512,
    duration: '30 min', color: '#3498DB', icon: 'flash', highlights: ['Birthday Packages', 'Group Discounts', 'Multiple Arenas', 'Arcade Games'],
    ageGroup: '8+', isPopular: false,
    imageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80',
  },
];

export const sampleShopping: ShoppingData[] = [
  {
    id: 's1', name: 'Spice World Indian Groceries', category: 'Groceries', description: 'Largest Indian grocery store in Western Sydney with spices, fresh produce, and imported goods from across South Asia.',
    location: 'Harris Park, NSW', rating: 4.6, reviews: 678, color: '#E85D3A', icon: 'cart',
    deals: [{ title: 'Basmati Rice 10kg', discount: '20% Off', validTill: '2026-04-01' }, { title: 'Fresh Curry Leaves', discount: 'Buy 2 Get 1', validTill: '2026-03-31' }],
    isOpen: true, deliveryAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&q=80',
  },
  {
    id: 's2', name: 'Silk & Sari Boutique', category: 'Fashion', description: 'Premium collection of silk sarees, lehengas, and ethnic wear for all occasions. Custom tailoring available.',
    location: 'Parramatta, NSW', rating: 4.8, reviews: 234, color: '#9B59B6', icon: 'shirt',
    deals: [{ title: 'Wedding Collection', discount: '30% Off', validTill: '2026-04-15' }, { title: 'Kids Ethnic Wear', discount: 'Flat $20 Off', validTill: '2026-03-30' }],
    isOpen: true, deliveryAvailable: false,
    imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80',
  },
  {
    id: 's3', name: 'Golden Jewellers', category: 'Jewellery', description: 'Traditional and contemporary Indian gold and diamond jewellery. BIS hallmarked. EMI available.',
    location: 'Toongabbie, NSW', rating: 4.7, reviews: 189, color: '#F2A93B', icon: 'diamond',
    deals: [{ title: 'Making Charges', discount: '50% Off', validTill: '2026-04-10' }],
    isOpen: true, deliveryAvailable: false,
    imageUrl: 'https://images.unsplash.com/photo-1515562141589-67f0d569b986?w=800&q=80',
  },
  {
    id: 's4', name: 'Desi Electronics Hub', category: 'Electronics', description: 'Refurbished phones, accessories, and electronics. Repair services and screen replacement available.',
    location: 'Auburn, NSW', rating: 4.3, reviews: 312, color: '#3498DB', icon: 'phone-portrait',
    deals: [{ title: 'Screen Protectors', discount: 'Buy 1 Get 1', validTill: '2026-03-31' }, { title: 'Phone Cases', discount: '40% Off', validTill: '2026-04-05' }],
    isOpen: true, deliveryAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=800&q=80',
  },
  {
    id: 's5', name: 'Ayurveda Health Store', category: 'Health & Wellness', description: 'Authentic Ayurvedic products, herbal supplements, essential oils, and natural skincare from India.',
    location: 'Wentworthville, NSW', rating: 4.5, reviews: 145, color: '#2ECC71', icon: 'leaf',
    deals: [{ title: 'Immunity Boosters', discount: '25% Off', validTill: '2026-04-20' }],
    isOpen: true, deliveryAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&q=80',
  },
  {
    id: 's6', name: 'Bindiya Books & Gifts', category: 'Books & Gifts', description: 'Books in Hindi, Tamil, Malayalam, and more. Cultural gifts, handicrafts, and spiritual items.',
    location: 'Blacktown, NSW', rating: 4.4, reviews: 98, color: '#E74C3C', icon: 'book',
    deals: [{ title: 'Children Books Set', discount: '3 for $25', validTill: '2026-03-28' }],
    isOpen: true, deliveryAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
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

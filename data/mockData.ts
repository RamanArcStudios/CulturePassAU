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
  'Malayalee',
  'Tamil',
  'Punjabi',
  'Multicultural',
  'Council Events',
  'Business Networking',
  'Youth',
  'Religious',
  'Bengali',
  'Gujarati',
  'Telugu',
  'Chinese',
  'Filipino',
  'Korean',
  'Pacific Islander',
];

export const interests: string[] = [
  'Music',
  'Dance',
  'Festivals',
  'Kids',
  'Sports',
  'Networking',
  'Arts',
  'Spiritual',
  'Business',
  'Food & Cooking',
  'Language',
  'Wellness',
  'Theatre',
  'Film',
  'Photography',
];

export const interestIcons: Record<string, string> = {
  'Music': 'musical-notes',
  'Dance': 'body',
  'Festivals': 'sparkles',
  'Kids': 'happy',
  'Sports': 'football',
  'Networking': 'people',
  'Arts': 'color-palette',
  'Spiritual': 'leaf',
  'Business': 'briefcase',
  'Food & Cooking': 'restaurant',
  'Language': 'chatbubbles',
  'Wellness': 'heart',
  'Theatre': 'film',
  'Film': 'videocam',
  'Photography': 'camera',
};

export const communityIcons: Record<string, string> = {
  'Malayalee': 'globe',
  'Tamil': 'globe',
  'Punjabi': 'globe',
  'Multicultural': 'earth',
  'Council Events': 'business',
  'Business Networking': 'briefcase',
  'Youth': 'rocket',
  'Religious': 'leaf',
  'Bengali': 'globe',
  'Gujarati': 'globe',
  'Telugu': 'globe',
  'Chinese': 'globe',
  'Filipino': 'globe',
  'Korean': 'globe',
  'Pacific Islander': 'globe',
};

export const sampleEvents: EventData[] = [
  {
    id: 'e1',
    title: 'Onam Grand Celebration 2026',
    description: 'Join us for the biggest Onam celebration in Sydney featuring traditional Onasadya, Thiruvathirakali dance performances, boat races, and cultural programs. A spectacular evening of Kerala traditions brought to life.',
    date: '2026-03-15',
    time: '5:00 PM',
    venue: 'Sydney Olympic Park',
    address: '7 Olympic Blvd, Sydney NSW 2127',
    price: 45,
    priceLabel: 'From $45',
    category: 'Festivals',
    communityTag: 'Malayalee',
    organizer: 'Kerala Association of Sydney',
    organizerId: 'c1',
    imageColor: '#E85D3A',
    capacity: 2000,
    attending: 1456,
    isFeatured: true,
    isCouncil: false,
    tiers: [
      { name: 'General', price: 45, available: 344 },
      { name: 'VIP', price: 85, available: 120 },
      { name: 'Family (4)', price: 150, available: 80 },
    ],
  },
  {
    id: 'e2',
    title: 'Tamil Pongal Festival',
    description: 'Celebrate the harvest festival of Pongal with traditional cooking demonstrations, Kolam competitions, folk music, and Bharatanatyam performances.',
    date: '2026-03-20',
    time: '10:00 AM',
    venue: 'Parramatta Park',
    address: 'Pitt St, Parramatta NSW 2150',
    price: 0,
    priceLabel: 'Free',
    category: 'Festivals',
    communityTag: 'Tamil',
    councilTag: 'City of Parramatta',
    organizer: 'Tamil Cultural Forum',
    organizerId: 'c2',
    imageColor: '#1A7A6D',
    capacity: 5000,
    attending: 3200,
    isFeatured: true,
    isCouncil: true,
    tiers: [
      { name: 'Free Entry', price: 0, available: 1800 },
    ],
  },
  {
    id: 'e3',
    title: 'Multicultural Food & Music Night',
    description: 'An evening celebrating the diversity of our community through food stalls from 20+ cultures, live music performances, and interactive cooking workshops.',
    date: '2026-03-22',
    time: '6:00 PM',
    venue: 'Melbourne Convention Centre',
    address: '1 Convention Centre Pl, Melbourne VIC 3006',
    price: 25,
    priceLabel: 'From $25',
    category: 'Food & Cooking',
    communityTag: 'Multicultural',
    councilTag: 'City of Melbourne',
    organizer: 'Multicultural Victoria',
    organizerId: 'c4',
    imageColor: '#F2A93B',
    capacity: 3000,
    attending: 2100,
    isFeatured: true,
    isCouncil: true,
    tiers: [
      { name: 'Entry', price: 25, available: 900 },
      { name: 'VIP Tasting', price: 65, available: 200 },
    ],
  },
  {
    id: 'e4',
    title: 'Bollywood Dance Workshop',
    description: 'Learn the latest Bollywood dance moves with professional choreographers. All skill levels welcome. Great cardio workout and fun!',
    date: '2026-03-25',
    time: '7:00 PM',
    venue: 'Blacktown Arts Centre',
    address: '78 Flushcombe Rd, Blacktown NSW 2148',
    price: 20,
    priceLabel: '$20',
    category: 'Dance',
    communityTag: 'Punjabi',
    organizer: 'Bhangra Beats Studio',
    organizerId: 'c3',
    imageColor: '#9B59B6',
    capacity: 50,
    attending: 38,
    isFeatured: false,
    isCouncil: false,
    tiers: [
      { name: 'Single', price: 20, available: 12 },
    ],
  },
  {
    id: 'e5',
    title: 'Auckland Diwali Festival',
    description: 'The biggest Diwali celebration in New Zealand! Fireworks, food stalls, live music, dance performances, and market stalls.',
    date: '2026-04-01',
    time: '4:00 PM',
    venue: 'Aotea Square',
    address: 'Queen St, Auckland 1010',
    price: 0,
    priceLabel: 'Free',
    category: 'Festivals',
    communityTag: 'Multicultural',
    councilTag: 'Auckland Council',
    organizer: 'Asia NZ Foundation',
    organizerId: 'c5',
    imageColor: '#E74C3C',
    capacity: 10000,
    attending: 7500,
    isFeatured: true,
    isCouncil: true,
    tiers: [
      { name: 'Free Entry', price: 0, available: 2500 },
    ],
  },
  {
    id: 'e6',
    title: 'Community Yoga & Wellness Morning',
    description: 'Start your weekend with community yoga, guided meditation, and Ayurvedic wellness talks. Light breakfast included.',
    date: '2026-03-28',
    time: '7:30 AM',
    venue: 'Centennial Park',
    address: 'Grand Dr, Centennial Park NSW 2021',
    price: 15,
    priceLabel: '$15',
    category: 'Wellness',
    communityTag: 'Multicultural',
    organizer: 'Yoga with Priya',
    organizerId: 'b3',
    imageColor: '#2ECC71',
    capacity: 100,
    attending: 72,
    isFeatured: false,
    isCouncil: false,
    tiers: [
      { name: 'Single', price: 15, available: 28 },
    ],
  },
  {
    id: 'e7',
    title: 'Youth Business Pitch Night',
    description: 'Young entrepreneurs from multicultural backgrounds pitch their startup ideas to a panel of experienced mentors and investors.',
    date: '2026-04-05',
    time: '6:30 PM',
    venue: 'WeWork George Street',
    address: '100 Harris St, Pyrmont NSW 2009',
    price: 10,
    priceLabel: '$10',
    category: 'Business',
    communityTag: 'Youth',
    organizer: 'CulturePass Youth Network',
    organizerId: 'c7',
    imageColor: '#3498DB',
    capacity: 150,
    attending: 110,
    isFeatured: false,
    isCouncil: false,
    tiers: [
      { name: 'Attendee', price: 10, available: 40 },
      { name: 'Pitcher', price: 0, available: 5 },
    ],
  },
  {
    id: 'e8',
    title: 'Classical Carnatic Music Concert',
    description: 'An evening of sublime Carnatic music featuring renowned artists from India performing ragas and kritis.',
    date: '2026-04-10',
    time: '7:00 PM',
    venue: 'Sydney Town Hall',
    address: '483 George St, Sydney NSW 2000',
    price: 55,
    priceLabel: 'From $55',
    category: 'Music',
    communityTag: 'Tamil',
    organizer: 'Carnatic Music Society',
    organizerId: 'c2',
    imageColor: '#8E44AD',
    capacity: 800,
    attending: 520,
    isFeatured: false,
    isCouncil: false,
    tiers: [
      { name: 'Standard', price: 55, available: 180 },
      { name: 'Premium', price: 95, available: 100 },
    ],
  },
];

export const sampleCommunities: CommunityData[] = [
  { id: 'c1', name: 'Malayalee Community', description: 'Connecting Kerala diaspora across Australia and New Zealand. Cultural events, language classes, and community support.', members: 12500, events: 45, color: '#E85D3A', icon: 'globe', category: 'Cultural', leaders: ['Arun Kumar', 'Lekha Nair', 'Rajesh Menon'] },
  { id: 'c2', name: 'Tamil Cultural Forum', description: 'Preserving and celebrating Tamil heritage through language, arts, music, and festivals.', members: 9800, events: 38, color: '#1A7A6D', icon: 'globe', category: 'Cultural', leaders: ['Priya Raman', 'Karthik Subramanian'] },
  { id: 'c3', name: 'Punjabi Association', description: 'Bhangra, music, food, and festivities bringing the vibrant Punjabi culture to the Southern Hemisphere.', members: 7200, events: 28, color: '#F2A93B', icon: 'globe', category: 'Cultural', leaders: ['Harpreet Singh', 'Jasmine Kaur'] },
  { id: 'c4', name: 'Multicultural Victoria', description: 'Celebrating the diversity of Melbourne and Victoria through inclusive community programs and events.', members: 25000, events: 120, color: '#3498DB', icon: 'earth', category: 'Regional', leaders: ['Sarah Chen', 'Ahmed Hassan'] },
  { id: 'c5', name: 'Indian Community NZ', description: 'Supporting the Indian diaspora in New Zealand with cultural events, networking, and wellbeing programs.', members: 15000, events: 55, color: '#E74C3C', icon: 'globe', category: 'Cultural', leaders: ['Vikram Patel', 'Anita Sharma'] },
  { id: 'c6', name: 'Bengali Association', description: 'Durga Puja, Rabindra Sangeet, and Bengali cultural celebrations bringing the warmth of Bengal to Australia.', members: 4500, events: 22, color: '#9B59B6', icon: 'globe', category: 'Cultural', leaders: ['Dipankar Roy', 'Soma Ghosh'] },
  { id: 'c7', name: 'Youth Network', description: 'Empowering young multicultural Australians through mentorship, career development, and social events.', members: 8000, events: 35, color: '#2ECC71', icon: 'rocket', category: 'Youth', leaders: ['Zara Ahmed', 'Jason Li'] },
  { id: 'c8', name: 'Filipino Community', description: 'Bringing Filipino traditions, food, music, and community spirit to Australian shores.', members: 11000, events: 42, color: '#1ABC9C', icon: 'globe', category: 'Cultural', leaders: ['Maria Santos', 'Carlo Reyes'] },
];

export const sampleBusinesses: BusinessData[] = [
  { id: 'b1', name: 'Spice Route Kitchen', category: 'Restaurants', description: 'Authentic South Indian and Kerala cuisine. Catering available for events up to 500 guests.', rating: 4.8, reviews: 324, location: 'Parramatta, NSW', phone: '+61 2 9876 5432', services: ['Dine-in', 'Catering', 'Event Packages', 'Delivery'], color: '#E85D3A', icon: 'restaurant', isVerified: true, priceRange: '$$' },
  { id: 'b2', name: 'Ranga Photography', category: 'Photographers', description: 'Specializing in cultural events, weddings, and portraits. Cinematic videography also available.', rating: 4.9, reviews: 189, location: 'Sydney CBD, NSW', phone: '+61 4 1234 5678', services: ['Event Photography', 'Wedding', 'Portrait', 'Videography'], color: '#1A7A6D', icon: 'camera', isVerified: true, priceRange: '$$$' },
  { id: 'b3', name: 'Shakti Events & Decor', category: 'Event Planners', description: 'Full-service event planning for cultural celebrations, weddings, and corporate events.', rating: 4.7, reviews: 156, location: 'Melbourne, VIC', phone: '+61 3 9876 1234', services: ['Wedding Planning', 'Decor', 'Stage Design', 'Floral'], color: '#F2A93B', icon: 'flower', isVerified: true, priceRange: '$$$' },
  { id: 'b4', name: 'Natyam Dance Academy', category: 'Musicians', description: 'Classical and contemporary dance training. Bharatanatyam, Kuchipudi, and Bollywood styles.', rating: 4.9, reviews: 212, location: 'Blacktown, NSW', phone: '+61 2 9876 7890', services: ['Dance Classes', 'Performance', 'Choreography', 'Workshops'], color: '#9B59B6', icon: 'musical-notes', isVerified: false, priceRange: '$$' },
  { id: 'b5', name: 'The Grand Pavilion', category: 'Venues', description: 'Premium event venue with capacity for 1000 guests. Full AV setup and catering partnerships.', rating: 4.6, reviews: 98, location: 'Homebush, NSW', phone: '+61 2 9876 4321', services: ['Venue Hire', 'AV Setup', 'Catering', 'Valet Parking'], color: '#3498DB', icon: 'business', isVerified: true, priceRange: '$$$$' },
  { id: 'b6', name: 'Mehndi by Fatima', category: 'Decorators', description: 'Bridal and event mehndi artistry. Traditional and modern designs for all occasions.', rating: 4.8, reviews: 276, location: 'Auburn, NSW', phone: '+61 4 9876 2345', services: ['Bridal Mehndi', 'Party Mehndi', 'Corporate Events', 'Workshops'], color: '#E74C3C', icon: 'color-palette', isVerified: false, priceRange: '$$' },
  { id: 'b7', name: 'Curry Leaf Catering', category: 'Restaurants', description: 'Premium Sri Lankan and South Indian catering for events of all sizes. Vegetarian specialists.', rating: 4.7, reviews: 145, location: 'Wentworthville, NSW', phone: '+61 2 9876 8765', services: ['Event Catering', 'Meal Prep', 'Cooking Classes', 'Corporate Lunches'], color: '#2ECC71', icon: 'restaurant', isVerified: true, priceRange: '$$' },
  { id: 'b8', name: 'Auckland Indian Bazaar', category: 'Venues', description: 'Multi-purpose event and market space in the heart of Auckland. Perfect for cultural markets and festivals.', rating: 4.5, reviews: 67, location: 'Auckland, NZ', phone: '+64 9 123 4567', services: ['Market Stalls', 'Event Space', 'Pop-up Shop', 'Food Court'], color: '#1ABC9C', icon: 'storefront', isVerified: true, priceRange: '$$' },
];

export const businessCategories = [
  'All',
  'Restaurants',
  'Event Planners',
  'Decorators',
  'Musicians',
  'Venues',
  'Photographers',
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

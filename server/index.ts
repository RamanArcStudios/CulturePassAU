import express, { type Request, type Response, type NextFunction } from 'express';
import { randomUUID } from 'node:crypto';

type EntityType = 'community' | 'business' | 'venue' | 'artist' | 'organisation';
type TicketStatus = 'confirmed' | 'used' | 'cancelled' | 'expired';

type AppUser = {
  id: string;
  username: string;
  displayName: string;
  email: string;
  city: string;
  country: string;
  bio?: string;
  avatarUrl?: string;
  socialLinks?: Record<string, string>;
  location?: string;
  culturePassId: string;
};

type AppEvent = {
  id: string;
  title: string;
  communityTag: string;
  venue: string;
  date: string;
  time: string;
  city: string;
  country: string;
  imageUrl?: string;
  imageColor?: string;
  description: string;
};

type AppProfile = {
  id: string;
  name: string;
  entityType: EntityType;
  category: string;
  city: string;
  country: string;
  description: string;
  imageUrl?: string;
  members?: number;
  followers?: number;
  verified?: boolean;
};

type AppTicket = {
  id: string;
  userId: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventVenue: string;
  tierName: string;
  quantity: number;
  totalPriceCents: number;
  currency: string;
  status: TicketStatus;
  ticketCode: string;
  imageColor?: string;
  createdAt: string;
  history: Array<{ at: string; status: TicketStatus; note: string }>;
};

const app = express();
app.use(express.json({ limit: '2mb' }));

const rateBucket = new Map<string, { count: number; resetAt: number }>();
const BAD_WORDS = ['hate', 'abuse', 'stupid', 'idiot'];

const users: AppUser[] = [
  {
    id: 'u1',
    username: 'ramanarc',
    displayName: 'Raman Arc',
    email: 'raman@culturepass.au',
    city: 'Sydney',
    country: 'Australia',
    bio: 'Building human + AI community experiences.',
    location: 'Sydney, Australia',
    culturePassId: 'CP-U1',
    socialLinks: { instagram: 'ramanarc' },
  },
];

const events: AppEvent[] = [
  { id: 'e1', title: 'Startup Launch Night Sydney', communityTag: 'Startup', venue: 'Sydney CBD', date: '2026-03-15', time: '18:00', city: 'Sydney', country: 'Australia', description: 'Networking + founder demos.', imageColor: '#E85D3A' },
  { id: 'e2', title: 'Bollywood Beats Festival', communityTag: 'Indian', venue: 'Parramatta Park', date: '2026-04-02', time: '17:30', city: 'Sydney', country: 'Australia', description: 'Music, dance, and food.', imageColor: '#9B59B6' },
];

const profiles: AppProfile[] = [
  { id: 'c1', name: 'Sydney Startup Circle', entityType: 'community', category: 'Tech', city: 'Sydney', country: 'Australia', description: 'Founders and builders community.', members: 850, verified: true },
  { id: 'b1', name: 'RamanArc Studios', entityType: 'business', category: 'Studio', city: 'Sydney', country: 'Australia', description: 'Digital experiences for culture + community.', followers: 450, verified: true },
];

const privacySettings = new Map<string, Record<string, boolean>>();
const wallets = new Map<string, { id: string; userId: string; balance: number; currency: string; points: number }>();
const memberships = new Map<string, { id: string; userId: string; tier: 'free' | 'plus' | 'premium'; isActive: boolean; validUntil?: string }>();
const notifications = new Map<string, Array<{ id: string; title: string; message: string; read: boolean; createdAt: string }>>();
const tickets: AppTicket[] = [];
const paymentMethods = new Map<string, Array<{ id: string; brand: string; last4: string; isDefault: boolean }>>();
const transactions = new Map<string, Array<{ id: string; type: 'charge' | 'refund'; amountCents: number; createdAt: string; description: string }>>();

for (const user of users) {
  wallets.set(user.id, { id: `w-${user.id}`, userId: user.id, balance: 12500, currency: 'AUD', points: 1200 });
  memberships.set(user.id, { id: `m-${user.id}`, userId: user.id, tier: 'free', isActive: true });
  privacySettings.set(user.id, { profileVisible: true, showEmail: false, showPhone: false, searchable: true });
  notifications.set(user.id, [
    { id: randomUUID(), title: 'Welcome to CulturePass', message: 'Your account is ready.', read: false, createdAt: new Date().toISOString() },
  ]);
  paymentMethods.set(user.id, [{ id: randomUUID(), brand: 'visa', last4: '4242', isDefault: true }]);
  transactions.set(user.id, []);
}

function nowIso() {
  return new Date().toISOString();
}

function requireRateLimit(req: Request, res: Response, next: NextFunction) {
  const key = req.ip ?? 'unknown';
  const current = rateBucket.get(key);
  const now = Date.now();
  if (!current || current.resetAt < now) {
    rateBucket.set(key, { count: 1, resetAt: now + 60_000 });
    return next();
  }
  if (current.count >= 90) {
    return res.status(429).json({ error: 'Too many requests' });
  }
  current.count += 1;
  next();
}

function textHasProfanity(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  const v = value.toLowerCase();
  return BAD_WORDS.some((bad) => v.includes(bad));
}

function moderationCheck(req: Request, res: Response, next: NextFunction) {
  const payload = JSON.stringify(req.body ?? {}).toLowerCase();
  if (BAD_WORDS.some((w) => payload.includes(w))) {
    return res.status(400).json({ error: 'Content rejected by moderation checks' });
  }
  next();
}

function rankItem(item: { title?: string; name?: string; city?: string; category?: string; description?: string }, q: string, city?: string) {
  const query = q.toLowerCase();
  const title = (item.title ?? item.name ?? '').toLowerCase();
  const description = (item.description ?? '').toLowerCase();
  const category = (item.category ?? '').toLowerCase();
  let score = 0;
  if (title === query) score += 100;
  if (title.startsWith(query)) score += 60;
  if (title.includes(query)) score += 35;
  if (description.includes(query)) score += 15;
  if (category.includes(query)) score += 10;
  if (city && item.city?.toLowerCase() === city.toLowerCase()) score += 20;
  return score;
}

app.get('/health', (_req, res) => res.json({ ok: true, at: nowIso() }));

app.use(requireRateLimit);

app.get('/api/users', (_req, res) => res.json(users));
app.get('/api/users/:id', (req, res) => {
  const user = users.find((u) => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});
app.put('/api/users/:id', moderationCheck, (req, res) => {
  const user = users.find((u) => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  if (textHasProfanity(req.body?.displayName) || textHasProfanity(req.body?.bio)) {
    return res.status(400).json({ error: 'Profile content failed moderation' });
  }
  Object.assign(user, req.body, { location: req.body?.location ?? `${req.body?.city ?? user.city}, ${req.body?.country ?? user.country}` });
  return res.json(user);
});

app.get('/api/events', (req, res) => {
  const country = String(req.query.country ?? '').toLowerCase();
  const city = String(req.query.city ?? '').toLowerCase();
  const filtered = events.filter((e) => (!country || e.country.toLowerCase() === country) && (!city || e.city.toLowerCase() === city));
  res.json(filtered);
});
app.get('/api/events/:id', (req, res) => {
  const event = events.find((e) => e.id === req.params.id);
  if (!event) return res.status(404).json({ error: 'Event not found' });
  res.json(event);
});

app.get('/api/communities', (_req, res) => res.json(profiles.filter((p) => p.entityType === 'community')));
app.get('/api/communities/:id', (req, res) => {
  const community = profiles.find((p) => p.id === req.params.id && p.entityType === 'community');
  if (!community) return res.status(404).json({ error: 'Community not found' });
  res.json(community);
});

app.get('/api/profiles', (_req, res) => res.json(profiles));
app.get('/api/profiles/:id', (req, res) => {
  const profile = profiles.find((p) => p.id === req.params.id);
  if (!profile) return res.status(404).json({ error: 'Profile not found' });
  res.json(profile);
});
app.post('/api/profiles', moderationCheck, (req, res) => {
  const profile: AppProfile = {
    id: randomUUID(),
    name: String(req.body?.name ?? 'Untitled'),
    entityType: (req.body?.entityType ?? 'organisation') as EntityType,
    category: String(req.body?.category ?? 'General'),
    city: String(req.body?.city ?? 'Sydney'),
    country: String(req.body?.country ?? 'Australia'),
    description: String(req.body?.description ?? ''),
  };
  profiles.push(profile);
  res.status(201).json(profile);
});
app.get('/api/businesses/:id', (req, res) => {
  const profile = profiles.find((p) => p.id === req.params.id && p.entityType === 'business');
  if (!profile) return res.status(404).json({ error: 'Business not found' });
  res.json(profile);
});

function mapCollection(prefix: string) {
  return events.map((e, i) => ({ id: `${prefix}${i + 1}`, title: e.title, name: e.title, city: e.city, country: e.country, imageUrl: e.imageUrl, category: e.communityTag, description: e.description, venue: e.venue, language: 'English', genre: [e.communityTag], posterUrl: e.imageUrl, priceRange: '$$', location: e.venue, priceLabel: '$25' }));
}
const movies = mapCollection('m');
const restaurants = mapCollection('r');
const activities = mapCollection('a');
const shopping = mapCollection('s');

for (const [path, data] of [
  ['/api/movies', movies],
  ['/api/restaurants', restaurants],
  ['/api/activities', activities],
  ['/api/shopping', shopping],
] as const) {
  app.get(path, (req, res) => {
    const country = String(req.query.country ?? '').toLowerCase();
    const city = String(req.query.city ?? '').toLowerCase();
    res.json(data.filter((x) => (!country || x.country.toLowerCase() === country) && (!city || x.city.toLowerCase() === city)));
  });
  app.get(`${path}/:id`, (req, res) => {
    const item = data.find((x) => x.id === req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  });
}

app.get('/api/wallet/:userId', (req, res) => res.json(wallets.get(req.params.userId) ?? null));
app.get('/api/transactions/:userId', (req, res) => res.json(transactions.get(req.params.userId) ?? []));
app.get('/api/payment-methods/:userId', (req, res) => res.json(paymentMethods.get(req.params.userId) ?? []));
app.post('/api/payment-methods', (req, res) => {
  const userId = String(req.body?.userId ?? '');
  if (!userId) return res.status(400).json({ error: 'userId is required' });
  const current = paymentMethods.get(userId) ?? [];
  const method = { id: randomUUID(), brand: String(req.body?.brand ?? 'visa'), last4: String(req.body?.last4 ?? '4242'), isDefault: current.length === 0 };
  paymentMethods.set(userId, [...current, method]);
  res.status(201).json(method);
});

app.get('/api/membership/:userId', (req, res) => res.json(memberships.get(req.params.userId) ?? null));
app.get('/api/membership/member-count', (_req, res) => {
  const count = [...memberships.values()].filter((m) => m.tier !== 'free').length;
  res.json({ count });
});
app.post('/api/membership/subscribe', (req, res) => {
  const userId = String(req.body?.userId ?? '');
  const tier = (req.body?.tier ?? 'plus') as 'plus' | 'premium';
  const m = memberships.get(userId);
  if (!m) return res.status(404).json({ error: 'Member not found' });
  m.tier = tier;
  m.isActive = true;
  m.validUntil = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString();
  res.json(m);
});
app.post('/api/membership/cancel-subscription', (req, res) => {
  const userId = String(req.body?.userId ?? '');
  const m = memberships.get(userId);
  if (!m) return res.status(404).json({ error: 'Member not found' });
  m.tier = 'free';
  m.isActive = true;
  res.json(m);
});

app.get('/api/tickets/:userId', (req, res) => res.json(tickets.filter((t) => t.userId === req.params.userId)));
app.get('/api/tickets/:userId/count', (req, res) => res.json({ count: tickets.filter((t) => t.userId === req.params.userId && t.status === 'confirmed').length }));
app.get('/api/ticket/:id', (req, res) => {
  const ticket = tickets.find((t) => t.id === req.params.id);
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
  res.json(ticket);
});
app.post('/api/tickets', (req, res) => {
  const userId = String(req.body?.userId ?? users[0].id);
  const eventId = String(req.body?.eventId ?? events[0].id);
  const event = events.find((e) => e.id === eventId);
  if (!event) return res.status(404).json({ error: 'Event not found' });
  const ticket: AppTicket = {
    id: randomUUID(),
    userId,
    eventId,
    eventTitle: event.title,
    eventDate: event.date,
    eventTime: event.time,
    eventVenue: event.venue,
    tierName: String(req.body?.tierName ?? 'General'),
    quantity: Number(req.body?.quantity ?? 1),
    totalPriceCents: Number(req.body?.totalPriceCents ?? 2500),
    currency: 'AUD',
    status: 'confirmed',
    ticketCode: `CP-T-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    imageColor: event.imageColor,
    createdAt: nowIso(),
    history: [{ at: nowIso(), status: 'confirmed', note: 'Ticket created' }],
  };
  tickets.unshift(ticket);
  const tx = transactions.get(userId) ?? [];
  tx.unshift({ id: randomUUID(), type: 'charge', amountCents: ticket.totalPriceCents, createdAt: nowIso(), description: `Ticket purchase: ${ticket.eventTitle}` });
  transactions.set(userId, tx);
  res.status(201).json(ticket);
});
app.put('/api/tickets/:id/cancel', (req, res) => {
  const ticket = tickets.find((t) => t.id === req.params.id);
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
  ticket.status = 'cancelled';
  ticket.history.unshift({ at: nowIso(), status: 'cancelled', note: 'Cancelled by user' });
  const tx = transactions.get(ticket.userId) ?? [];
  tx.unshift({ id: randomUUID(), type: 'refund', amountCents: ticket.totalPriceCents, createdAt: nowIso(), description: `Refund: ${ticket.eventTitle}` });
  transactions.set(ticket.userId, tx);
  res.json(ticket);
});
app.post('/api/tickets/scan', (req, res) => {
  const ticketCode = String(req.body?.ticketCode ?? '').trim();
  const ticket = tickets.find((t) => t.ticketCode === ticketCode);
  if (!ticket) return res.status(404).json({ valid: false, error: 'Invalid ticket code' });
  if (ticket.status !== 'confirmed') {
    return res.status(400).json({ valid: false, error: `Ticket is ${ticket.status}`, ticket });
  }
  ticket.status = 'used';
  ticket.history.unshift({ at: nowIso(), status: 'used', note: `Scanned by ${String(req.body?.scannedBy ?? 'staff')}` });
  res.json({ valid: true, message: 'Ticket scanned successfully', ticket });
});

app.get('/api/perks', (_req, res) => res.json([
  { id: 'p1', title: '20% Off Partner Cafes', requiredTier: 'free', pointsCost: 100 },
  { id: 'p2', title: 'VIP Event Priority Entry', requiredTier: 'plus', pointsCost: 350 },
]));
app.get('/api/perks/:id', (req, res) => res.json({ id: req.params.id, title: 'Perk Detail', requiredTier: 'free', pointsCost: 100 }));
app.post('/api/perks', moderationCheck, (req, res) => res.status(201).json({ id: randomUUID(), ...req.body }));
app.get('/api/redemptions', (_req, res) => res.json([]));

app.get('/api/notifications/:userId', (req, res) => res.json(notifications.get(req.params.userId) ?? []));
app.get('/api/notifications/:userId/unread-count', (req, res) => {
  const list = notifications.get(req.params.userId) ?? [];
  res.json({ count: list.filter((n) => !n.read).length });
});
app.post('/api/notifications/:userId/:id/read', (req, res) => {
  const list = notifications.get(req.params.userId) ?? [];
  list.forEach((n) => {
    if (n.id === req.params.id) n.read = true;
  });
  res.json({ ok: true });
});

app.get('/api/reviews/:profileId', (req, res) => res.json([
  { id: randomUUID(), profileId: req.params.profileId, userId: users[0].id, rating: 5, comment: 'Great community!', createdAt: nowIso() },
]));

app.get('/api/privacy/settings/:userId', (req, res) => res.json(privacySettings.get(req.params.userId) ?? { profileVisible: true, searchable: true }));
app.put('/api/privacy/settings/:userId', (req, res) => {
  const merged = { ...(privacySettings.get(req.params.userId) ?? {}), ...(req.body ?? {}) };
  privacySettings.set(req.params.userId, merged);
  res.json(merged);
});

app.get('/api/cpid/lookup/:cpid', (req, res) => {
  const normalized = req.params.cpid.toUpperCase();
  const user = users.find((u) => u.culturePassId === normalized);
  if (!user) return res.status(404).json({ error: 'CPID not found' });
  res.json({ entityType: 'user', targetId: user.id });
});

app.get('/api/indigenous/traditional-lands', (_req, res) => res.json([{ id: 't1', name: 'Gadigal Land', city: 'Sydney' }]));
app.get('/api/indigenous/spotlights', (_req, res) => res.json([{ id: 's1', title: 'Community Spotlight', description: 'Celebrating local creators.' }]));
app.get('/api/discover/:userId', (_req, res) => res.json({ trendingEvents: events.slice(0, 2), suggestedCommunities: profiles.filter((p) => p.entityType === 'community') }));

app.get('/api/search', (req, res) => {
  const q = String(req.query.q ?? '').trim();
  const type = String(req.query.type ?? 'all');
  const city = String(req.query.city ?? '');
  if (!q) return res.json({ results: [] });

  const buckets: Array<{ id: string; type: string; title: string; subtitle: string; score: number }> = [];
  if (type === 'all' || type === 'event') {
    for (const e of events) {
      const score = rankItem(e, q, city);
      if (score > 0) buckets.push({ id: e.id, type: 'event', title: e.title, subtitle: `${e.communityTag} · ${e.venue}`, score });
    }
  }
  if (type === 'all' || type === 'community') {
    for (const c of profiles.filter((p) => p.entityType === 'community')) {
      const score = rankItem(c, q, city);
      if (score > 0) buckets.push({ id: c.id, type: 'community', title: c.name, subtitle: `${c.category} · ${c.members ?? 0} members`, score });
    }
  }

  buckets.sort((a, b) => b.score - a.score);
  res.json({ results: buckets.map(({ score, ...rest }) => rest) });
});

app.get('/api/search/suggest', (req, res) => {
  const q = String(req.query.q ?? '').toLowerCase().trim();
  if (!q) return res.json({ suggestions: [] });
  const source = [...new Set([...events.map((e) => e.title), ...profiles.map((p) => p.name)])];
  const suggestions = source.filter((s) => s.toLowerCase().includes(q)).slice(0, 8);
  res.json({ suggestions });
});

app.post('/api/stripe/create-checkout-session', (_req, res) => res.json({ url: 'https://checkout.stripe.com/mock-session' }));
app.post('/api/stripe/refund', (req, res) => res.json({ ok: true, ticketId: req.body?.ticketId }));

const port = Number(process.env.PORT ?? 5000);
app.listen(port, () => {
  console.log(`CulturePass mock API listening on port ${port}`);
});

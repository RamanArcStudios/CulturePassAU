import express, { type Request, type Response, type NextFunction } from 'express';
import { randomUUID } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import multer from 'multer';
import sharp from 'sharp';
import { InMemoryTtlCache } from './services/cache';
import { moderationCheck, textHasProfanity } from './middleware/moderation';
import {
  buildSearchCacheKey,
  runSearch,
  runSuggest,
  type SearchQuery,
  type SearchableItem,
  type SearchType,
} from './services/search';
import { getRolloutConfig, isFeatureEnabledForUser } from './services/rollout';

type EntityType = 'community' | 'business' | 'venue' | 'artist' | 'organisation';
type TicketStatus = 'confirmed' | 'used' | 'cancelled' | 'expired';
type TicketPriority = 'low' | 'normal' | 'high' | 'vip';

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
  paymentStatus?: 'pending' | 'paid' | 'refunded' | 'failed';
  priority: TicketPriority;
  ticketCode: string;
  scanCount?: number;
  lastScannedAt?: string;
  staffAuditTrail?: Array<{ at: string; by: string; action: string; note?: string }>;
  stripePaymentIntentId?: string;
  walletPasses?: { apple?: string; google?: string };
  ticketCode: string;
  imageColor?: string;
  createdAt: string;
  history: Array<{ at: string; status: TicketStatus; note: string }>;
};

const app = express();
app.use(express.json({ limit: '2mb' }));
const uploadsDir = path.resolve(process.cwd(), 'uploads');
const imageDir = path.join(uploadsDir, 'images');
const thumbDir = path.join(uploadsDir, 'thumbnails');
fs.mkdirSync(imageDir, { recursive: true });
fs.mkdirSync(thumbDir, { recursive: true });
app.use('/uploads', express.static(uploadsDir));

const rateBucket = new Map<string, { count: number; resetAt: number }>();
const searchCache = new InMemoryTtlCache(45_000);
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
});

const rateBucket = new Map<string, { count: number; resetAt: number }>();
const searchCache = new InMemoryTtlCache(45_000);
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
const notifications = new Map<string, Array<{ id: string; userId: string; title: string; message: string; type: string; isRead: boolean; metadata: Record<string, unknown> | null; createdAt: string }>>();
const tickets: AppTicket[] = [];
const paymentMethods = new Map<string, Array<{ id: string; brand: string; last4: string; isDefault: boolean }>>();
const transactions = new Map<string, Array<{ id: string; type: 'charge' | 'refund'; amountCents: number; createdAt: string; description: string }>>();
const scanEvents: Array<{ id: string; ticketId: string; ticketCode: string; scannedAt: string; scannedBy: string; outcome: 'accepted' | 'duplicate' | 'rejected' }> = [];
const notifications = new Map<string, Array<{ id: string; title: string; message: string; read: boolean; createdAt: string }>>();
const tickets: AppTicket[] = [];
const paymentMethods = new Map<string, Array<{ id: string; brand: string; last4: string; isDefault: boolean }>>();
const transactions = new Map<string, Array<{ id: string; type: 'charge' | 'refund'; amountCents: number; createdAt: string; description: string }>>();

for (const user of users) {
  wallets.set(user.id, { id: `w-${user.id}`, userId: user.id, balance: 12500, currency: 'AUD', points: 1200 });
  memberships.set(user.id, { id: `m-${user.id}`, userId: user.id, tier: 'free', isActive: true });
  privacySettings.set(user.id, { profileVisible: true, showEmail: false, showPhone: false, searchable: true });
  notifications.set(user.id, [
    {
      id: randomUUID(),
      userId: user.id,
      title: 'Welcome to CulturePass',
      message: 'Your account is ready.',
      type: 'system',
      isRead: false,
      metadata: null,
      createdAt: new Date().toISOString(),
    },
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

type ReportStatus = 'pending' | 'reviewing' | 'resolved' | 'dismissed';

type ContentReport = {
  id: string;
  targetType: 'event' | 'community' | 'profile' | 'post' | 'user';
  targetId: string;
  reason: string;
  details?: string;
  reporterUserId?: string;
  status: ReportStatus;
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  moderationNotes?: string;
};

type UploadedMedia = {
  id: string;
  targetType: 'user' | 'profile' | 'event' | 'business' | 'post';
  targetId: string;
  imageUrl: string;
  thumbnailUrl: string;
  width: number;
  height: number;
  createdAt: string;
};

const reports: ContentReport[] = [];
const uploadedMedia: UploadedMedia[] = [];
const reports: ContentReport[] = [];

function parseSearchQuery(req: Request): SearchQuery {
  const tagsInput = String(req.query.tags ?? '').trim();
  const tags = tagsInput ? tagsInput.split(',').map((tag) => tag.trim()).filter(Boolean) : [];

  return {
    q: String(req.query.q ?? '').trim(),
    type: (String(req.query.type ?? 'all').toLowerCase() as SearchType) || 'all',
    city: String(req.query.city ?? '').trim() || undefined,
    country: String(req.query.country ?? '').trim() || undefined,
    tags,
    startDate: String(req.query.startDate ?? '').trim() || undefined,
    endDate: String(req.query.endDate ?? '').trim() || undefined,
    page: Math.max(1, Number(req.query.page ?? 1)),
    pageSize: Math.min(50, Math.max(1, Number(req.query.pageSize ?? 20))),
  };
}

function getSearchCorpus(): SearchableItem[] {
  const eventItems: SearchableItem[] = events.map((event) => ({
    id: event.id,
    type: 'event',
    title: event.title,
    subtitle: `${event.communityTag} · ${event.venue}`,
    description: event.description,
    city: event.city,
    country: event.country,
    tags: [event.communityTag],
    date: event.date,
  }));

  const profileItems: SearchableItem[] = profiles.map((profile) => ({
    id: profile.id,
    type: profile.entityType === 'business' ? 'business' : 'profile',
    title: profile.name,
    subtitle: `${profile.category} · ${profile.city}`,
    description: profile.description,
    city: profile.city,
    country: profile.country,
    tags: [profile.category, profile.entityType],
  }));

  const communityItems: SearchableItem[] = profiles
    .filter((profile) => profile.entityType === 'community')
    .map((profile) => ({
      id: profile.id,
      type: 'community',
      title: profile.name,
      subtitle: `${profile.category} · ${profile.members ?? 0} members`,
      description: profile.description,
      city: profile.city,
      country: profile.country,
      tags: [profile.category, 'community'],
    }));

  return [...eventItems, ...profileItems, ...communityItems];
}

app.get('/health', (_req, res) => res.json({ ok: true, at: nowIso() }));

app.get('/api/rollout/config', (req, res) => {
  const userId = String(req.query.userId ?? 'guest');
  const rollout = getRolloutConfig();
  res.json({
    rollout,
    flags: {
      ticketingPhase6: isFeatureEnabledForUser('ticketingPhase6', userId),
      mediaPipelinePhase4: isFeatureEnabledForUser('mediaPipelinePhase4', userId),
      governancePhase3: isFeatureEnabledForUser('governancePhase3', userId),
    },
  });
});
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
app.delete('/api/payment-methods/:id', (req, res) => {
  for (const [userId, methods] of paymentMethods.entries()) {
    const next = methods.filter((method) => method.id !== req.params.id);
    if (next.length !== methods.length) {
      if (next.length > 0 && !next.some((method) => method.isDefault)) {
        next[0].isDefault = true;
      }
      paymentMethods.set(userId, next);
      return res.json({ ok: true });
    }
  }
  return res.status(404).json({ error: 'Payment method not found' });
});
app.put('/api/payment-methods/:userId/default/:methodId', (req, res) => {
  const methods = paymentMethods.get(req.params.userId) ?? [];
  if (methods.length === 0) return res.status(404).json({ error: 'No payment methods found' });
  let found = false;
  methods.forEach((method) => {
    method.isDefault = method.id === req.params.methodId;
    if (method.isDefault) found = true;
  });
  if (!found) return res.status(404).json({ error: 'Payment method not found' });
  paymentMethods.set(req.params.userId, methods);
  res.json(methods);
});
app.post('/api/wallet/:userId/topup', (req, res) => {
  const wallet = wallets.get(req.params.userId);
  if (!wallet) return res.status(404).json({ error: 'Wallet not found' });
  const amount = Number(req.body?.amount ?? 0);
  if (!Number.isFinite(amount) || amount <= 0) return res.status(400).json({ error: 'amount must be a positive number' });
  wallet.balance += Math.round(amount * 100);
  const tx = transactions.get(req.params.userId) ?? [];
  tx.unshift({
    id: randomUUID(),
    type: 'charge',
    amountCents: Math.round(amount * 100),
    createdAt: nowIso(),
    description: 'Wallet top up',
  });
  transactions.set(req.params.userId, tx);
  res.json(wallet);
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
  const amount = Number(req.body?.totalPriceCents ?? 2500);
  const quantity = Number(req.body?.quantity ?? 1);
  const isVip = Number(req.body?.totalPriceCents ?? 0) >= 10_000;

  const ticket: AppTicket = {
    id: randomUUID(),
    userId,
    eventId,
    eventTitle: event.title,
    eventDate: event.date,
    eventTime: event.time,
    eventVenue: event.venue,
    tierName: String(req.body?.tierName ?? 'General'),
    quantity,
    totalPriceCents: amount,
    currency: 'AUD',
    status: 'confirmed',
    paymentStatus: 'paid',
    priority: isVip ? 'vip' : quantity >= 5 ? 'high' : 'normal',
    ticketCode: `CP-T-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    scanCount: 0,
    staffAuditTrail: [{ at: nowIso(), by: 'system', action: 'ticket_created', note: 'Ticket created and paid' }],
    stripePaymentIntentId: `pi_mock_${randomUUID().slice(0, 8)}`,
    walletPasses: {},
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
  if (ticket.status === 'used') return res.status(400).json({ error: 'Used tickets cannot be cancelled' });
  ticket.status = 'cancelled';
  ticket.paymentStatus = 'refunded';
  ticket.history.unshift({ at: nowIso(), status: 'cancelled', note: 'Cancelled by user' });
  ticket.staffAuditTrail?.unshift({ at: nowIso(), by: String(req.body?.cancelledBy ?? 'user'), action: 'ticket_cancelled' });
  ticket.status = 'cancelled';
  ticket.history.unshift({ at: nowIso(), status: 'cancelled', note: 'Cancelled by user' });
  const tx = transactions.get(ticket.userId) ?? [];
  tx.unshift({ id: randomUUID(), type: 'refund', amountCents: ticket.totalPriceCents, createdAt: nowIso(), description: `Refund: ${ticket.eventTitle}` });
  transactions.set(ticket.userId, tx);
  res.json(ticket);
});
app.post('/api/tickets/scan', (req, res) => {
  const ticketCode = String(req.body?.ticketCode ?? '').trim();
  const scannedBy = String(req.body?.scannedBy ?? 'staff');
  const ticket = tickets.find((t) => t.ticketCode === ticketCode);
  if (!ticket) {
    scanEvents.unshift({ id: randomUUID(), ticketId: 'unknown', ticketCode, scannedAt: nowIso(), scannedBy, outcome: 'rejected' });
    return res.status(404).json({ valid: false, error: 'Invalid ticket code' });
  }
  if (ticket.status !== 'confirmed') {
    scanEvents.unshift({ id: randomUUID(), ticketId: ticket.id, ticketCode, scannedAt: nowIso(), scannedBy, outcome: ticket.status === 'used' ? 'duplicate' : 'rejected' });
    return res.status(400).json({ valid: false, error: `Ticket is ${ticket.status}`, ticket });
  }
  ticket.status = 'used';
  ticket.scanCount = Number(ticket.scanCount ?? 0) + 1;
  ticket.lastScannedAt = nowIso();
  ticket.history.unshift({ at: nowIso(), status: 'used', note: `Scanned by ${scannedBy}` });
  ticket.staffAuditTrail?.unshift({ at: nowIso(), by: scannedBy, action: 'ticket_scanned' });
  scanEvents.unshift({ id: randomUUID(), ticketId: ticket.id, ticketCode, scannedAt: nowIso(), scannedBy, outcome: 'accepted' });
  res.json({ valid: true, message: 'Ticket scanned successfully', ticket });
});

app.get('/api/tickets/:id/history', (req, res) => {
  const ticket = tickets.find((t) => t.id === req.params.id);
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
  res.json({ history: ticket.history, staffAuditTrail: ticket.staffAuditTrail ?? [] });
});

app.get('/api/tickets/admin/scan-events', (_req, res) => {
  res.json(scanEvents.slice(0, 200));
});

app.get('/api/tickets/:id/wallet/apple', (req, res) => {
  const ticket = tickets.find((t) => t.id === req.params.id);
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
  const url = `https://wallet.culturepass.au/apple/${ticket.id}`;
  ticket.walletPasses = { ...(ticket.walletPasses ?? {}), apple: url };
  ticket.staffAuditTrail?.unshift({ at: nowIso(), by: 'user', action: 'apple_wallet_pass_generated' });
  res.json({ url, provider: 'apple', ticketId: ticket.id });
});

app.get('/api/tickets/:id/wallet/google', (req, res) => {
  const ticket = tickets.find((t) => t.id === req.params.id);
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
  const url = `https://wallet.culturepass.au/google/${ticket.id}`;
  ticket.walletPasses = { ...(ticket.walletPasses ?? {}), google: url };
  ticket.staffAuditTrail?.unshift({ at: nowIso(), by: 'user', action: 'google_wallet_pass_generated' });
  res.json({ url, provider: 'google', ticketId: ticket.id });
});

  const ticket = tickets.find((t) => t.ticketCode === ticketCode);
  if (!ticket) return res.status(404).json({ valid: false, error: 'Invalid ticket code' });
  if (ticket.status !== 'confirmed') {
    return res.status(400).json({ valid: false, error: `Ticket is ${ticket.status}`, ticket });
  }
  ticket.status = 'used';
  ticket.history.unshift({ at: nowIso(), status: 'used', note: `Scanned by ${String(req.body?.scannedBy ?? 'staff')}` });
  res.json({ valid: true, message: 'Ticket scanned successfully', ticket });
});

const perks = [
  {
    id: 'p1',
    title: '20% Off Partner Cafes',
    description: 'Save on selected Sydney partner cafes.',
    perkType: 'discount_percent',
    discountPercent: 20,
    discountFixedCents: null,
    providerType: 'business',
    providerId: 'b1',
    providerName: 'RamanArc Studios',
    category: 'dining',
    isMembershipRequired: false,
    requiredMembershipTier: 'free',
    usageLimit: 500,
    usedCount: 34,
    perUserLimit: 2,
    status: 'active',
    startDate: nowIso(),
    endDate: null,
  },
  {
    id: 'p2',
    title: 'VIP Event Priority Entry',
    description: 'Skip the queue at selected community events.',
    perkType: 'vip_upgrade',
    discountPercent: null,
    discountFixedCents: null,
    providerType: 'event',
    providerId: 'e1',
    providerName: 'CulturePass Events',
    category: 'events',
    isMembershipRequired: true,
    requiredMembershipTier: 'plus',
    usageLimit: null,
    usedCount: 10,
    perUserLimit: 1,
    status: 'active',
    startDate: nowIso(),
    endDate: null,
  },
];

const redemptions = new Map<string, Array<{ id: string; perkId: string; userId: string; redeemedAt: string }>>();

app.get('/api/perks', (_req, res) => res.json(perks));
app.get('/api/perks/:id', (req, res) => {
  const perk = perks.find((item) => item.id === req.params.id);
  if (!perk) return res.status(404).json({ error: 'Perk not found' });
  res.json(perk);
});
app.post('/api/perks', moderationCheck, (req, res) => {
  const perk = { id: randomUUID(), ...req.body };
  perks.unshift(perk as any);
  res.status(201).json(perk);
});
app.post('/api/perks/:id/redeem', (req, res) => {
  const perk = perks.find((item) => item.id === req.params.id);
  if (!perk) return res.status(404).json({ error: 'Perk not found' });
  const userId = String(req.body?.userId ?? '');
  if (!userId) return res.status(400).json({ error: 'userId is required' });

  const userRedemptions = redemptions.get(userId) ?? [];
  const alreadyUsed = userRedemptions.filter((item) => item.perkId === req.params.id).length;
  if (perk.perUserLimit && alreadyUsed >= perk.perUserLimit) {
    return res.status(400).json({ error: 'Per-user redemption limit reached' });
  }

  if (perk.isMembershipRequired) {
    const membership = memberships.get(userId);
    if (!membership || membership.tier === 'free') {
      return res.status(403).json({ error: 'Membership tier required for this perk' });
    }
  }

  const redemption = { id: randomUUID(), perkId: req.params.id, userId, redeemedAt: nowIso() };
  userRedemptions.unshift(redemption);
  redemptions.set(userId, userRedemptions);
  perk.usedCount = Number(perk.usedCount ?? 0) + 1;
  res.status(201).json(redemption);
});
app.get('/api/redemptions', (req, res) => {
  const userId = String(req.query.userId ?? users[0].id);
  res.json(redemptions.get(userId) ?? []);
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
  res.json({ count: list.filter((n) => !n.isRead).length });
});
app.put('/api/notifications/:id/read', (req, res) => {
  for (const [userId, list] of notifications.entries()) {
    const item = list.find((n) => n.id === req.params.id);
    if (item) {
      item.isRead = true;
      notifications.set(userId, list);
      return res.json({ ok: true, item });
    }
  }
  return res.status(404).json({ error: 'Notification not found' });
});
app.put('/api/notifications/:userId/read-all', (req, res) => {
  const list = notifications.get(req.params.userId) ?? [];
  list.forEach((item) => {
    item.isRead = true;
  });
  notifications.set(req.params.userId, list);
  res.json({ ok: true, updated: list.length });
});
app.delete('/api/notifications/:id', (req, res) => {
  for (const [userId, list] of notifications.entries()) {
    const next = list.filter((item) => item.id !== req.params.id);
    if (next.length !== list.length) {
      notifications.set(userId, next);
      return res.json({ ok: true });
    }
  }
  return res.status(404).json({ error: 'Notification not found' });
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

app.post('/api/uploads/image', upload.single('image'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'image file is required' });
    if (!file.mimetype.startsWith('image/')) {
      return res.status(400).json({ error: 'Only image uploads are allowed' });
    }

    const metadata = await sharp(file.buffer).metadata();
    if (!metadata.width || !metadata.height) {
      return res.status(400).json({ error: 'Invalid image metadata' });
    }

    const id = randomUUID();
    const imageFilename = `${id}.jpg`;
    const thumbFilename = `${id}.webp`;
    const imagePath = path.join(imageDir, imageFilename);
    const thumbPath = path.join(thumbDir, thumbFilename);

    await sharp(file.buffer)
      .rotate()
      .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 86 })
      .toFile(imagePath);

    await sharp(file.buffer)
      .rotate()
      .resize({ width: 420, height: 420, fit: 'cover', withoutEnlargement: false })
      .webp({ quality: 88 })
      .toFile(thumbPath);

    return res.status(201).json({
      id,
      imageUrl: `/uploads/images/${imageFilename}`,
      thumbnailUrl: `/uploads/thumbnails/${thumbFilename}`,
      width: metadata.width,
      height: metadata.height,
      mimeType: file.mimetype,
      size: file.size,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Image upload failed', details: String(error) });
  }
});

app.post('/api/media/attach', (req, res) => {
  const targetType = String(req.body?.targetType ?? '') as UploadedMedia['targetType'];
  const targetId = String(req.body?.targetId ?? '').trim();
  const imageUrl = String(req.body?.imageUrl ?? '').trim();
  const thumbnailUrl = String(req.body?.thumbnailUrl ?? '').trim();
  const width = Number(req.body?.width ?? 0);
  const height = Number(req.body?.height ?? 0);

  if (!targetType || !targetId || !imageUrl || !thumbnailUrl) {
    return res.status(400).json({ error: 'targetType, targetId, imageUrl and thumbnailUrl are required' });
  }

  const media: UploadedMedia = {
    id: randomUUID(),
    targetType,
    targetId,
    imageUrl,
    thumbnailUrl,
    width,
    height,
    createdAt: nowIso(),
  };
  uploadedMedia.unshift(media);

  if (targetType === 'user') {
    const user = users.find((item) => item.id === targetId);
    if (user) user.avatarUrl = imageUrl;
  }

  if (targetType === 'profile' || targetType === 'business') {
    const profile = profiles.find((item) => item.id === targetId);
    if (profile) profile.imageUrl = imageUrl;
  }

  if (targetType === 'event') {
    const event = events.find((item) => item.id === targetId);
    if (event) event.imageUrl = imageUrl;
  }

  return res.status(201).json(media);
});

app.get('/api/media/:targetType/:targetId', (req, res) => {
  const targetType = req.params.targetType;
  const targetId = req.params.targetId;
  const items = uploadedMedia.filter((item) => item.targetType === targetType && item.targetId === targetId);
  return res.json(items);
});

app.post('/api/reports', moderationCheck, (req, res) => {
  const targetType = String(req.body?.targetType ?? '') as ContentReport['targetType'];
  const targetId = String(req.body?.targetId ?? '').trim();
  const reason = String(req.body?.reason ?? '').trim();
  const details = String(req.body?.details ?? '').trim() || undefined;

  if (!targetType || !targetId || !reason) {
    return res.status(400).json({ error: 'targetType, targetId, and reason are required' });
  }

  const report: ContentReport = {
    id: randomUUID(),
    targetType,
    targetId,
    reason,
    details,
    reporterUserId: String(req.body?.reporterUserId ?? '') || undefined,
    status: 'pending',
    createdAt: nowIso(),
  };

  reports.unshift(report);
  return res.status(201).json(report);
});

app.get('/api/admin/reports', (_req, res) => {
  const grouped = {
    pending: reports.filter((item) => item.status === 'pending').length,
    reviewing: reports.filter((item) => item.status === 'reviewing').length,
    resolved: reports.filter((item) => item.status === 'resolved').length,
    dismissed: reports.filter((item) => item.status === 'dismissed').length,
  };

  res.json({ summary: grouped, reports });
});

app.put('/api/admin/reports/:id/review', (req, res) => {
  const report = reports.find((item) => item.id === req.params.id);
  if (!report) return res.status(404).json({ error: 'Report not found' });

  const status = String(req.body?.status ?? 'reviewing') as ReportStatus;
  if (!['pending', 'reviewing', 'resolved', 'dismissed'].includes(status)) {
    return res.status(400).json({ error: 'Invalid report status' });
  }

  report.status = status;
  report.reviewedAt = nowIso();
  report.reviewedBy = String(req.body?.reviewedBy ?? 'admin');
  report.moderationNotes = String(req.body?.moderationNotes ?? '').trim() || undefined;

  return res.json(report);
});

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
  const query = parseSearchQuery(req);
  if (!query.q) return res.json({ total: 0, page: query.page, pageSize: query.pageSize, results: [] });

  const key = `search:${buildSearchCacheKey(query)}`;
  const cached = searchCache.get<ReturnType<typeof runSearch>>(key);
  if (cached) {
    return res.json({ ...cached, cached: true });
  }

  const payload = runSearch(getSearchCorpus(), query);
  searchCache.set(key, payload, 45_000);
  return res.json({ ...payload, cached: false });
});

app.get('/api/search/suggest', (req, res) => {
  const q = String(req.query.q ?? '').trim();
  if (!q) return res.json({ suggestions: [] });

  const key = `search:suggest:${q.toLowerCase()}`;
  const cached = searchCache.get<string[]>(key);
  if (cached) {
    return res.json({ suggestions: cached, cached: true });
  }

  const suggestions = runSuggest(getSearchCorpus(), q, 8);
  searchCache.set(key, suggestions, 30_000);
  return res.json({ suggestions, cached: false });
});

app.post('/api/stripe/create-checkout-session', (req, res) => {
  const ticket = req.body?.ticketData ?? {};
  const draftId = randomUUID();
  res.json({ checkoutUrl: 'https://checkout.stripe.com/mock-session', ticketId: draftId, paymentIntentId: `pi_mock_${draftId.slice(0, 8)}`, ticket });
});
app.post('/api/stripe/refund', (req, res) => {
  const ticketId = String(req.body?.ticketId ?? '');
  const ticket = tickets.find((t) => t.id === ticketId);
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
  if (ticket.status === 'used') return res.status(400).json({ error: 'Cannot refund used ticket' });

  ticket.status = 'cancelled';
  ticket.paymentStatus = 'refunded';
  ticket.history.unshift({ at: nowIso(), status: 'cancelled', note: 'Refund processed via Stripe endpoint' });
  ticket.staffAuditTrail?.unshift({ at: nowIso(), by: 'system', action: 'stripe_refund_processed' });

  const tx = transactions.get(ticket.userId) ?? [];
  tx.unshift({ id: randomUUID(), type: 'refund', amountCents: ticket.totalPriceCents, createdAt: nowIso(), description: `Refund: ${ticket.eventTitle}` });
  transactions.set(ticket.userId, tx);

  return res.json({ ok: true, ticketId, refundId: `re_mock_${randomUUID().slice(0, 8)}` });
});

app.post('/api/stripe/webhook', (req, res) => {
  const eventType = String(req.body?.type ?? '');
  const ticketId = String(req.body?.data?.object?.metadata?.ticketId ?? '');
  const ticket = tickets.find((t) => t.id === ticketId);

  if (ticket) {
    if (eventType === 'payment_intent.succeeded') {
      ticket.paymentStatus = 'paid';
      ticket.history.unshift({ at: nowIso(), status: ticket.status, note: 'Stripe webhook: payment succeeded' });
    }
    if (eventType === 'charge.refunded') {
      ticket.paymentStatus = 'refunded';
      ticket.status = 'cancelled';
      ticket.history.unshift({ at: nowIso(), status: 'cancelled', note: 'Stripe webhook: refund completed' });
    }
    ticket.staffAuditTrail?.unshift({ at: nowIso(), by: 'stripe_webhook', action: eventType });
  }

  return res.json({ received: true });
});
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

app.post('/api/stripe/create-checkout-session', (req, res) => {
  const ticket = req.body?.ticketData ?? {};
  const draftId = randomUUID();
  res.json({ checkoutUrl: 'https://checkout.stripe.com/mock-session', ticketId: draftId, ticket });
});
app.post('/api/stripe/create-checkout-session', (_req, res) => res.json({ url: 'https://checkout.stripe.com/mock-session' }));
app.post('/api/stripe/refund', (req, res) => res.json({ ok: true, ticketId: req.body?.ticketId }));

const port = Number(process.env.PORT ?? 5000);
app.listen(port, () => {
  console.log(`CulturePass mock API listening on port ${port}`);
});

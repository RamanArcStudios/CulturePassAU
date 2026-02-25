// @ts-check
'use strict';

const { onRequest } = require('firebase-functions/v2/https');
const { randomUUID } = require('crypto');

/**
 * @typedef {'confirmed'|'used'|'cancelled'|'expired'} TicketStatus
 * @typedef {'low'|'normal'|'high'|'vip'} TicketPriority
 * @typedef {{id:string,userId:string,eventId:string,eventTitle:string,eventDate:string,eventTime:string,eventVenue:string,tierName:string,quantity:number,totalPriceCents:number,currency:string,status:TicketStatus,paymentStatus?:string,priority:TicketPriority,ticketCode:string,scanCount?:number,lastScannedAt?:string,staffAuditTrail?:Array<{at:string,by:string,action:string,note?:string}>,stripePaymentIntentId?:string,walletPasses?:{apple?:string,google?:string},imageColor?:string,createdAt:string,history:Array<{at:string,status:TicketStatus,note:string}>}} AppTicket
 */

/** @type {AppTicket[]} */
const tickets = [];

/** @type {Array<{id:string,ticketId:string,ticketCode:string,scannedAt:string,scannedBy:string,outcome:'accepted'|'duplicate'|'rejected'}>} */
const scanEvents = [];

/** @type {Map<string,Array<{id:string,type:'charge'|'refund',amountCents:number,createdAt:string,description:string}>>} */
const transactions = new Map();

const seedEvents = [
  { id: 'e1', title: 'Startup Launch Night Sydney', venue: 'Sydney CBD', date: '2026-03-15', time: '18:00', imageColor: '#E85D3A' },
  { id: 'e2', title: 'Bollywood Beats Festival', venue: 'Parramatta Park', date: '2026-04-02', time: '17:30', imageColor: '#9B59B6' },
];

function nowIso() {
  return new Date().toISOString();
}

/**
 * GET  /user/:userId           — list tickets for a user
 * GET  /user/:userId/count     — count confirmed tickets for a user
 * GET  /id/:id                 — get a single ticket by ID
 * POST /                       — purchase a ticket
 * PUT  /:id/cancel             — cancel a ticket
 * POST /scan                   — scan a ticket (mark as used)
 * GET  /:id/history            — get ticket status history
 * GET  /admin/scan-events      — list recent scan events (staff)
 * GET  /:id/wallet/apple       — generate Apple Wallet pass URL
 * GET  /:id/wallet/google      — generate Google Wallet pass URL
 */
exports.ticketsApi = onRequest((req, res) => {
  res.set('Content-Type', 'application/json');

  const path = (req.path || '/').replace(/^\//, '');
  const parts = path.split('/');

  // GET /user/:userId
  if (req.method === 'GET' && parts[0] === 'user' && parts[1] && !parts[2]) {
    const userId = parts[1];
    return res.status(200).json(tickets.filter((t) => t.userId === userId));
  }

  // GET /user/:userId/count
  if (req.method === 'GET' && parts[0] === 'user' && parts[1] && parts[2] === 'count') {
    const userId = parts[1];
    return res.status(200).json({ count: tickets.filter((t) => t.userId === userId && t.status === 'confirmed').length });
  }

  // GET /id/:id
  if (req.method === 'GET' && parts[0] === 'id' && parts[1]) {
    const ticket = tickets.find((t) => t.id === parts[1]);
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    return res.status(200).json(ticket);
  }

  // POST /scan
  if (req.method === 'POST' && parts[0] === 'scan') {
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
    return res.status(200).json({ valid: true, message: 'Ticket scanned successfully', ticket });
  }

  // GET /admin/scan-events
  if (req.method === 'GET' && parts[0] === 'admin' && parts[1] === 'scan-events') {
    return res.status(200).json(scanEvents.slice(0, 200));
  }

  // GET /:id/history
  if (req.method === 'GET' && parts[0] && parts[1] === 'history') {
    const ticket = tickets.find((t) => t.id === parts[0]);
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    return res.status(200).json({ history: ticket.history, staffAuditTrail: ticket.staffAuditTrail ?? [] });
  }

  // GET /:id/wallet/apple
  if (req.method === 'GET' && parts[0] && parts[1] === 'wallet' && parts[2] === 'apple') {
    const ticket = tickets.find((t) => t.id === parts[0]);
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    const url = `https://wallet.culturepass.au/apple/${ticket.id}`;
    ticket.walletPasses = { ...(ticket.walletPasses ?? {}), apple: url };
    ticket.staffAuditTrail?.unshift({ at: nowIso(), by: 'user', action: 'apple_wallet_pass_generated' });
    return res.status(200).json({ url, provider: 'apple', ticketId: ticket.id });
  }

  // GET /:id/wallet/google
  if (req.method === 'GET' && parts[0] && parts[1] === 'wallet' && parts[2] === 'google') {
    const ticket = tickets.find((t) => t.id === parts[0]);
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    const url = `https://wallet.culturepass.au/google/${ticket.id}`;
    ticket.walletPasses = { ...(ticket.walletPasses ?? {}), google: url };
    ticket.staffAuditTrail?.unshift({ at: nowIso(), by: 'user', action: 'google_wallet_pass_generated' });
    return res.status(200).json({ url, provider: 'google', ticketId: ticket.id });
  }

  // PUT /:id/cancel
  if (req.method === 'PUT' && parts[0] && parts[1] === 'cancel') {
    const ticket = tickets.find((t) => t.id === parts[0]);
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    if (ticket.status === 'used') return res.status(400).json({ error: 'Used tickets cannot be cancelled' });
    ticket.status = 'cancelled';
    ticket.paymentStatus = 'refunded';
    ticket.history.unshift({ at: nowIso(), status: 'cancelled', note: 'Cancelled by user' });
    ticket.staffAuditTrail?.unshift({ at: nowIso(), by: String(req.body?.cancelledBy ?? 'user'), action: 'ticket_cancelled' });
    const tx = transactions.get(ticket.userId) ?? [];
    tx.unshift({ id: randomUUID(), type: 'refund', amountCents: ticket.totalPriceCents, createdAt: nowIso(), description: `Refund: ${ticket.eventTitle}` });
    transactions.set(ticket.userId, tx);
    return res.status(200).json(ticket);
  }

  // POST /
  if (req.method === 'POST' && (!parts[0] || parts[0] === '')) {
    const body = req.body ?? {};
    const userId = String(body.userId ?? 'u1');
    const eventId = String(body.eventId ?? seedEvents[0].id);
    const event = seedEvents.find((e) => e.id === eventId) ?? seedEvents[0];
    const amount = Number(body.totalPriceCents ?? 2500);
    const quantity = Number(body.quantity ?? 1);
    const isVip = amount >= 10_000;
    /** @type {AppTicket} */
    const ticket = {
      id: randomUUID(),
      userId,
      eventId,
      eventTitle: event.title,
      eventDate: event.date,
      eventTime: event.time,
      eventVenue: event.venue,
      tierName: String(body.tierName ?? 'General'),
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
      imageColor: event.imageColor,
      createdAt: nowIso(),
      history: [{ at: nowIso(), status: 'confirmed', note: 'Ticket created' }],
    };
    tickets.unshift(ticket);
    const tx = transactions.get(userId) ?? [];
    tx.unshift({ id: randomUUID(), type: 'charge', amountCents: ticket.totalPriceCents, createdAt: nowIso(), description: `Ticket purchase: ${ticket.eventTitle}` });
    transactions.set(userId, tx);
    return res.status(201).json(ticket);
  }

  return res.status(405).json({ error: 'Method not allowed' });
});

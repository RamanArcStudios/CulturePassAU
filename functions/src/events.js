// @ts-check
'use strict';

const { onRequest } = require('firebase-functions/v2/https');
const { randomUUID } = require('crypto');

/** @type {Array<{id:string,title:string,communityTag:string,venue:string,date:string,time:string,city:string,country:string,description:string,imageUrl?:string,imageColor?:string}>} */
const events = [
  { id: 'e1', title: 'Startup Launch Night Sydney', communityTag: 'Startup', venue: 'Sydney CBD', date: '2026-03-15', time: '18:00', city: 'Sydney', country: 'Australia', description: 'Networking + founder demos.', imageColor: '#E85D3A' },
  { id: 'e2', title: 'Bollywood Beats Festival', communityTag: 'Indian', venue: 'Parramatta Park', date: '2026-04-02', time: '17:30', city: 'Sydney', country: 'Australia', description: 'Music, dance, and food.', imageColor: '#9B59B6' },
];

/**
 * GET  /events          — list all events (optional ?country= and ?city= filters)
 * GET  /events/:id      — get a single event by ID
 * POST /events          — create a new event
 */
exports.eventsApi = onRequest((req, res) => {
  res.set('Content-Type', 'application/json');

  const urlParts = (req.path || '/').replace(/^\//, '').split('/');
  const [segment, eventId] = urlParts;

  // GET /events or GET /events/:id
  if (req.method === 'GET') {
    if (!segment || segment === '') {
      const country = String(req.query.country ?? '').toLowerCase();
      const city = String(req.query.city ?? '').toLowerCase();
      const filtered = events.filter(
        (e) =>
          (!country || e.country.toLowerCase() === country) &&
          (!city || e.city.toLowerCase() === city),
      );
      return res.status(200).json(filtered);
    }
    const event = events.find((e) => e.id === segment);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    return res.status(200).json(event);
  }

  // POST /events
  if (req.method === 'POST' && (!segment || segment === '')) {
    const body = req.body ?? {};
    const event = {
      id: randomUUID(),
      title: String(body.title ?? 'Untitled Event'),
      communityTag: String(body.communityTag ?? 'General'),
      venue: String(body.venue ?? 'TBA'),
      date: String(body.date ?? new Date().toISOString().split('T')[0]),
      time: String(body.time ?? '18:00'),
      city: String(body.city ?? 'Sydney'),
      country: String(body.country ?? 'Australia'),
      description: String(body.description ?? ''),
      imageUrl: body.imageUrl ? String(body.imageUrl) : undefined,
      imageColor: body.imageColor ? String(body.imageColor) : undefined,
    };
    events.push(event);
    return res.status(201).json(event);
  }

  return res.status(405).json({ error: 'Method not allowed' });
});

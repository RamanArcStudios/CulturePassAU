// @ts-check
'use strict';

const { onRequest } = require('firebase-functions/v2/https');
const { randomUUID } = require('crypto');

/** @type {Map<string, Array<{id:string,brand:string,last4:string,isDefault:boolean}>>} */
const paymentMethods = new Map();

/** @type {Map<string, Array<{id:string,type:'charge'|'refund',amountCents:number,createdAt:string,description:string}>>} */
const transactions = new Map();

function nowIso() {
  return new Date().toISOString();
}

/**
 * POST /checkout-session  — create a Stripe checkout session (mock)
 * POST /refund            — refund a ticket payment (mock)
 * GET  /methods/:userId   — list saved payment methods
 * POST /methods           — add a payment method
 * DELETE /methods/:id     — remove a payment method
 * PUT  /methods/:userId/default/:methodId — set default method
 * GET  /transactions/:userId — list transactions
 */
exports.paymentsApi = onRequest((req, res) => {
  res.set('Content-Type', 'application/json');

  const path = (req.path || '/').replace(/^\//, '');
  const parts = path.split('/');

  // POST /checkout-session
  if (req.method === 'POST' && parts[0] === 'checkout-session') {
    const body = req.body ?? {};
    const draftId = randomUUID();
    return res.status(200).json({
      checkoutUrl: 'https://checkout.stripe.com/mock-session',
      ticketId: draftId,
      paymentIntentId: `pi_mock_${draftId.slice(0, 8)}`,
      ticket: body.ticketData ?? {},
    });
  }

  // POST /refund
  if (req.method === 'POST' && parts[0] === 'refund') {
    const ticketId = String(req.body?.ticketId ?? '');
    if (!ticketId) return res.status(400).json({ error: 'ticketId is required' });
    return res.status(200).json({
      ok: true,
      ticketId,
      refundId: `re_mock_${randomUUID().slice(0, 8)}`,
    });
  }

  // GET /methods/:userId
  if (req.method === 'GET' && parts[0] === 'methods' && parts[1]) {
    const userId = parts[1];
    return res.status(200).json(paymentMethods.get(userId) ?? []);
  }

  // POST /methods
  if (req.method === 'POST' && parts[0] === 'methods' && !parts[1]) {
    const body = req.body ?? {};
    const userId = String(body.userId ?? '');
    if (!userId) return res.status(400).json({ error: 'userId is required' });
    const method = {
      id: randomUUID(),
      brand: String(body.brand ?? 'visa'),
      last4: String(body.last4 ?? '0000'),
      isDefault: !paymentMethods.has(userId),
    };
    const current = paymentMethods.get(userId) ?? [];
    paymentMethods.set(userId, [...current, method]);
    return res.status(201).json(method);
  }

  // DELETE /methods/:id
  if (req.method === 'DELETE' && parts[0] === 'methods' && parts[1]) {
    const methodId = parts[1];
    for (const [userId, methods] of paymentMethods.entries()) {
      const next = methods.filter((m) => m.id !== methodId);
      if (next.length !== methods.length) {
        paymentMethods.set(userId, next);
        return res.status(200).json({ ok: true });
      }
    }
    return res.status(404).json({ error: 'Payment method not found' });
  }

  // PUT /methods/:userId/default/:methodId
  if (req.method === 'PUT' && parts[0] === 'methods' && parts[2] === 'default' && parts[3]) {
    const userId = parts[1];
    const methodId = parts[3];
    const methods = paymentMethods.get(userId) ?? [];
    if (methods.length === 0) return res.status(404).json({ error: 'No payment methods found' });
    const updated = methods.map((m) => ({ ...m, isDefault: m.id === methodId }));
    paymentMethods.set(userId, updated);
    return res.status(200).json({ ok: true });
  }

  // GET /transactions/:userId
  if (req.method === 'GET' && parts[0] === 'transactions' && parts[1]) {
    const userId = parts[1];
    return res.status(200).json(transactions.get(userId) ?? []);
  }

  return res.status(405).json({ error: 'Method not allowed' });
});

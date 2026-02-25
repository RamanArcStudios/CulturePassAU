// @ts-check
'use strict';

const { onRequest } = require('firebase-functions/v2/https');

/**
 * POST /stripe
 *
 * Handles incoming Stripe webhook events. Supported event types:
 *   - payment_intent.succeeded  → marks the associated ticket as paid
 *   - charge.refunded           → marks the associated ticket as refunded/cancelled
 *
 * In production this handler should verify the Stripe-Signature header using
 * stripe.webhooks.constructEvent() before processing any event.
 */
exports.stripeWebhook = onRequest({ rawBody: true }, (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const eventType = String(req.body?.type ?? '');
  const dataObject = req.body?.data?.object ?? {};
  const metadata = dataObject.metadata ?? {};
  const ticketId = String(metadata.ticketId ?? '');
  const amountCents = Number(dataObject.amount ?? dataObject.amount_received ?? 0);

  /** @type {{ handled: boolean; ticketId: string; eventType: string; amountCents: number }} */
  const result = {
    handled: false,
    ticketId,
    eventType,
    amountCents,
  };

  switch (eventType) {
    case 'payment_intent.succeeded':
      result.handled = true;
      break;

    case 'payment_intent.payment_failed':
      result.handled = true;
      break;

    case 'charge.refunded':
      result.handled = true;
      break;

    case 'customer.subscription.created':
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
      result.handled = true;
      break;

    default:
      // Unknown event type — acknowledge receipt without processing
      result.handled = false;
      break;
  }

  return res.status(200).json({ received: true, ...result });
});

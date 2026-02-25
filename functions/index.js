// @ts-check
'use strict';

/**
 * CulturePass Firebase Cloud Functions
 *
 * Entry point — re-exports all HTTP callable Cloud Functions.
 *
 * Deployed functions:
 *   eventsApi      — event discovery and management
 *   paymentsApi    — Stripe checkout, refunds, and payment methods
 *   ticketsApi     — ticket purchase, cancellation, and QR scanning
 *   stripeWebhook  — Stripe webhook event handler
 */

const { eventsApi } = require('./src/events');
const { paymentsApi } = require('./src/payments');
const { ticketsApi } = require('./src/tickets');
const { stripeWebhook } = require('./src/webhooks');

module.exports = {
  eventsApi,
  paymentsApi,
  ticketsApi,
  stripeWebhook,
};

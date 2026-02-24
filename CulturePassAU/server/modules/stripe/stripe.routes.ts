import type { Express, Request, Response } from "express";
import { getUncachableStripeClient, getStripePublishableKey } from "../../stripeClient";
import { AppError, ErrorCodes, wrapHandler, rateLimit } from "../../errors";
import * as ticketsService from "../tickets/tickets.service";

export function registerStripeRoutes(app: Express) {
  app.get("/api/stripe/publishable-key", async (_req: Request, res: Response) => {
    try {
      const publishableKey = await getStripePublishableKey();
      res.json({ publishableKey });
    } catch (e: any) {
      res.status(500).json({ error: "Failed to get Stripe publishable key" });
    }
  });

  app.post("/api/stripe/create-payment-intent", async (req: Request, res: Response) => {
    try {
      const { amount, currency, ticketData } = req.body;
      if (!amount || amount <= 0) {
        return res.status(400).json({ error: "Valid amount is required" });
      }

      const stripe = await getUncachableStripeClient();
      const amountInCents = Math.round(amount * 100);

      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: (currency || 'aud').toLowerCase(),
        metadata: {
          eventId: ticketData?.eventId || '',
          eventTitle: ticketData?.eventTitle || '',
          tierName: ticketData?.tierName || '',
          quantity: String(ticketData?.quantity || 1),
          userId: ticketData?.userId || '',
        },
      });

      const ticket = await ticketsService.createTicket({
        ...ticketData,
        stripePaymentIntentId: paymentIntent.id,
        paymentStatus: 'pending',
        status: 'pending',
      });

      res.json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        ticketId: ticket.id,
        ticketCode: ticket.ticketCode,
      });
    } catch (e: any) {
      console.error('Create payment intent error:', e);
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/stripe/create-checkout-session", wrapHandler(async (req: Request, res: Response) => {
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
    if (!rateLimit(`checkout:${clientIp}`, 5, 60000)) {
      throw new AppError(ErrorCodes.RATE_LIMIT_EXCEEDED, 429, 'Too many purchase attempts. Please wait a minute and try again.');
    }

    const { ticketData } = req.body;
    if (!ticketData || !ticketData.userId || !ticketData.eventId) {
      throw new AppError(ErrorCodes.MISSING_REQUIRED_FIELD, 400, 'Ticket data with userId and eventId is required.');
    }
    if (!ticketData.totalPrice || ticketData.totalPrice <= 0) {
      throw new AppError(ErrorCodes.INVALID_AMOUNT, 400, 'A valid ticket price is required.');
    }

    const existingTickets = await ticketsService.getTickets(ticketData.userId);
    const pendingForEvent = existingTickets.find(
      (t: any) => t.eventId === ticketData.eventId && t.status === 'pending' && t.paymentStatus === 'pending'
    );
    if (pendingForEvent) {
      throw new AppError(ErrorCodes.DUPLICATE_PURCHASE, 409, 'You already have a pending purchase for this event. Please complete or cancel it first.');
    }

    const stripe = await getUncachableStripeClient();
    const baseUrl = `https://${process.env.REPLIT_DEV_DOMAIN || process.env.REPLIT_DOMAINS?.split(',')[0] || 'localhost:5000'}`;

    const ticket = await ticketsService.createTicket({
      ...ticketData,
      paymentStatus: 'pending',
      status: 'pending',
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: (ticketData.currency || 'aud').toLowerCase(),
          product_data: {
            name: `${ticketData.eventTitle} - ${ticketData.tierName}`,
            description: `${ticketData.quantity}x ticket(s)`,
          },
          unit_amount: Math.round(ticketData.totalPrice * 100),
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${baseUrl}/api/stripe/checkout-success?session_id={CHECKOUT_SESSION_ID}&ticket_id=${ticket.id}`,
      cancel_url: `${baseUrl}/api/stripe/checkout-cancel?ticket_id=${ticket.id}`,
      metadata: {
        ticketId: ticket.id,
        eventId: ticketData.eventId || '',
        userId: ticketData.userId || '',
      },
    });

    if (session.payment_intent) {
      await ticketsService.updateTicketPayment(ticket.id, {
        stripePaymentIntentId: session.payment_intent as string,
      });
    }

    res.json({
      success: true,
      data: {
        checkoutUrl: session.url,
        sessionId: session.id,
        ticketId: ticket.id,
      },
    });
  }));

  app.get("/api/stripe/checkout-success", async (req: Request, res: Response) => {
    try {
      const { session_id, ticket_id } = req.query;
      if (session_id && ticket_id) {
        const stripe = await getUncachableStripeClient();
        const session = await stripe.checkout.sessions.retrieve(session_id as string);

        if (session.payment_status === 'paid') {
          await ticketsService.updateTicketPayment(ticket_id as string, {
            paymentStatus: 'paid',
            status: 'confirmed',
            stripePaymentIntentId: session.payment_intent as string,
          });
        }
      }

      res.setHeader("Content-Type", "text/html");
      res.send(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Payment Successful</title>
        <style>body{font-family:-apple-system,system-ui,sans-serif;display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0;background:#f0fdf4;color:#166534}
        .container{text-align:center;padding:40px}.icon{font-size:64px;margin-bottom:16px}.title{font-size:24px;font-weight:700;margin-bottom:8px}.sub{font-size:16px;opacity:0.8}
        .close-btn{display:inline-block;margin-top:24px;background:#166534;color:white;padding:12px 32px;border-radius:12px;font-size:16px;font-weight:600;cursor:pointer;border:none}</style>
        <script>setTimeout(function(){try{window.close()}catch(e){}},5000);</script>
        </head><body><div class="container"><div class="icon">&#10003;</div><div class="title">Payment Successful!</div>
        <div class="sub">Your ticket has been confirmed.</div>
        <button class="close-btn" onclick="try{window.close()}catch(e){history.back()}">Return to App</button>
        <div class="sub" style="margin-top:16px;font-size:13px">This page will close automatically...</div></div></body></html>`);
    } catch (e: any) {
      res.status(500).send('Error processing payment confirmation');
    }
  });

  app.get("/api/stripe/checkout-cancel", async (req: Request, res: Response) => {
    const { ticket_id } = req.query;
    if (ticket_id) {
      await ticketsService.updateTicketPayment(ticket_id as string, {
        paymentStatus: 'cancelled',
        status: 'cancelled',
      });
    }

    res.setHeader("Content-Type", "text/html");
    res.send(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Payment Cancelled</title>
      <style>body{font-family:-apple-system,system-ui,sans-serif;display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0;background:#fef2f2;color:#991b1b}
      .container{text-align:center;padding:40px}.icon{font-size:64px;margin-bottom:16px}.title{font-size:24px;font-weight:700;margin-bottom:8px}.sub{font-size:16px;opacity:0.8}
      .close-btn{display:inline-block;margin-top:24px;background:#991b1b;color:white;padding:12px 32px;border-radius:12px;font-size:16px;font-weight:600;cursor:pointer;border:none}</style>
      <script>setTimeout(function(){try{window.close()}catch(e){}},5000);</script>
      </head><body><div class="container"><div class="icon">&#10005;</div><div class="title">Payment Cancelled</div>
      <div class="sub">Your ticket purchase was cancelled.</div>
      <button class="close-btn" onclick="try{window.close()}catch(e){history.back()}">Return to App</button></div></body></html>`);
  });

  app.post("/api/stripe/confirm-payment", async (req: Request, res: Response) => {
    try {
      const { paymentIntentId, ticketId } = req.body;
      if (!paymentIntentId || !ticketId) {
        return res.status(400).json({ error: "paymentIntentId and ticketId required" });
      }

      const stripe = await getUncachableStripeClient();
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      if (paymentIntent.status === 'succeeded') {
        const ticket = await ticketsService.updateTicketPayment(ticketId, {
          paymentStatus: 'paid',
          status: 'confirmed',
        });
        return res.json({ success: true, ticket });
      }

      return res.json({
        success: false,
        status: paymentIntent.status,
        message: `Payment status: ${paymentIntent.status}`,
      });
    } catch (e: any) {
      console.error('Confirm payment error:', e);
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/stripe/refund", wrapHandler(async (req: Request, res: Response) => {
    const { ticketId } = req.body;
    if (!ticketId) {
      throw new AppError(ErrorCodes.MISSING_REQUIRED_FIELD, 400, 'Ticket ID is required.');
    }

    const ticket = await ticketsService.getTicket(ticketId);
    if (!ticket) {
      throw new AppError(ErrorCodes.TICKET_NOT_FOUND, 404, 'Ticket not found.');
    }

    if (ticket.status === 'cancelled') {
      throw new AppError(ErrorCodes.TICKET_ALREADY_CANCELLED, 400, 'This ticket has already been cancelled.');
    }

    if (ticket.status === 'used') {
      throw new AppError(ErrorCodes.TICKET_CANNOT_REFUND, 400, 'Cannot refund a ticket that has already been scanned.');
    }

    if (!ticket.stripePaymentIntentId) {
      const cancelled = await ticketsService.cancelTicket(ticketId);
      return res.json({
        success: true,
        data: {
          message: "Ticket cancelled (no payment to refund)",
          ticket: cancelled,
        },
      });
    }

    const stripe = await getUncachableStripeClient();
    const refund = await stripe.refunds.create({
      payment_intent: ticket.stripePaymentIntentId,
    });

    const updated = await ticketsService.updateTicketPayment(ticketId, {
      status: 'cancelled',
      paymentStatus: 'refunded',
      stripeRefundId: refund.id,
    });

    return res.json({
      success: true,
      data: {
        message: "Payment refunded and ticket cancelled",
        refundId: refund.id,
        ticket: updated,
      },
    });
  }));
}

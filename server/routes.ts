import type { Express, Request, Response } from "express";
import { createServer, type Server } from "node:http";
import { storage } from "./storage";
import { generateCpid, lookupCpid, getAllRegistryEntries } from "./cpid";
import { getUncachableStripeClient, getStripePublishableKey } from "./stripeClient";
import { AppError, ErrorCodes, wrapHandler, rateLimit } from "./errors";

function p(val: string | string[]): string { return Array.isArray(val) ? val[0] : val; }

export async function registerRoutes(app: Express): Promise<Server> {
  // === Users ===
  app.get("/api/users", async (_req: Request, res: Response) => {
    const users = await storage.getAllUsers();
    res.json(users);
  });

  app.get("/api/users/:id", async (req: Request, res: Response) => {
    const user = await storage.getUser(p(req.params.id));
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  });

  app.post("/api/users", async (req: Request, res: Response) => {
    try {
      const user = await storage.createUser(req.body);
      res.status(201).json(user);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.put("/api/users/:id", async (req: Request, res: Response) => {
    const user = await storage.updateUser(p(req.params.id), req.body);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  });

  // === Profiles (communities, orgs, venues, businesses, councils, governments, artists) ===
  app.get("/api/profiles", async (req: Request, res: Response) => {
    const entityType = req.query.type as string;
    const profiles = entityType
      ? await storage.getProfilesByType(entityType)
      : await storage.getAllProfiles();
    res.json(profiles);
  });

  app.get("/api/profiles/:id", async (req: Request, res: Response) => {
    const profile = await storage.getProfile(p(req.params.id)) || await storage.getProfileBySlug(p(req.params.id));
    if (!profile) return res.status(404).json({ error: "Profile not found" });
    res.json(profile);
  });

  app.post("/api/profiles", async (req: Request, res: Response) => {
    try {
      const profile = await storage.createProfile(req.body);
      res.status(201).json(profile);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.put("/api/profiles/:id", async (req: Request, res: Response) => {
    const profile = await storage.updateProfile(p(req.params.id), req.body);
    if (!profile) return res.status(404).json({ error: "Profile not found" });
    res.json(profile);
  });

  app.delete("/api/profiles/:id", async (req: Request, res: Response) => {
    const deleted = await storage.deleteProfile(p(req.params.id));
    if (!deleted) return res.status(404).json({ error: "Profile not found" });
    res.json({ success: true });
  });

  // === Follows ===
  app.post("/api/follow", async (req: Request, res: Response) => {
    const { followerId, targetId, targetType } = req.body;
    const follow = await storage.follow(followerId, targetId, targetType);
    res.json(follow);
  });

  app.post("/api/unfollow", async (req: Request, res: Response) => {
    const { followerId, targetId } = req.body;
    const result = await storage.unfollow(followerId, targetId);
    res.json({ success: result });
  });

  app.get("/api/followers/:targetId", async (req: Request, res: Response) => {
    const followers = await storage.getFollowers(p(req.params.targetId));
    res.json(followers);
  });

  app.get("/api/following/:userId", async (req: Request, res: Response) => {
    const following = await storage.getFollowing(p(req.params.userId));
    res.json(following);
  });

  app.get("/api/is-following", async (req: Request, res: Response) => {
    const { followerId, targetId } = req.query;
    const result = await storage.isFollowing(followerId as string, targetId as string);
    res.json({ isFollowing: result });
  });

  // === Likes ===
  app.post("/api/like", async (req: Request, res: Response) => {
    const { userId, targetId, targetType } = req.body;
    const like = await storage.likeEntity(userId, targetId, targetType);
    res.json(like);
  });

  app.post("/api/unlike", async (req: Request, res: Response) => {
    const { userId, targetId } = req.body;
    const result = await storage.unlikeEntity(userId, targetId);
    res.json({ success: result });
  });

  app.get("/api/is-liked", async (req: Request, res: Response) => {
    const { userId, targetId } = req.query;
    const result = await storage.isLiked(userId as string, targetId as string);
    res.json({ isLiked: result });
  });

  // === Reviews ===
  app.get("/api/reviews/:targetId", async (req: Request, res: Response) => {
    const reviews = await storage.getReviews(p(req.params.targetId));
    res.json(reviews);
  });

  app.post("/api/reviews", async (req: Request, res: Response) => {
    try {
      const review = await storage.createReview(req.body);
      res.status(201).json(review);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.delete("/api/reviews/:id", async (req: Request, res: Response) => {
    const deleted = await storage.deleteReview(p(req.params.id));
    if (!deleted) return res.status(404).json({ error: "Review not found" });
    res.json({ success: true });
  });

  // === Members ===
  app.get("/api/members/:profileId", async (req: Request, res: Response) => {
    const members = await storage.getMembers(p(req.params.profileId));
    res.json(members);
  });

  // === Payment Methods ===
  app.get("/api/payment-methods/:userId", async (req: Request, res: Response) => {
    const methods = await storage.getPaymentMethods(p(req.params.userId));
    res.json(methods);
  });

  app.post("/api/payment-methods", async (req: Request, res: Response) => {
    try {
      const method = await storage.createPaymentMethod(req.body);
      res.status(201).json(method);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.delete("/api/payment-methods/:id", async (req: Request, res: Response) => {
    const deleted = await storage.deletePaymentMethod(p(req.params.id));
    if (!deleted) return res.status(404).json({ error: "Payment method not found" });
    res.json({ success: true });
  });

  app.put("/api/payment-methods/:userId/default/:methodId", async (req: Request, res: Response) => {
    const method = await storage.setDefaultPaymentMethod(p(req.params.userId), p(req.params.methodId));
    if (!method) return res.status(404).json({ error: "Method not found" });
    res.json(method);
  });

  // === Transactions ===
  app.get("/api/transactions/:userId", async (req: Request, res: Response) => {
    const txs = await storage.getTransactions(p(req.params.userId));
    res.json(txs);
  });

  // === Wallet ===
  app.get("/api/wallet/:userId", async (req: Request, res: Response) => {
    const wallet = await storage.getWallet(p(req.params.userId));
    res.json(wallet || { balance: 0, currency: "AUD" });
  });

  app.post("/api/wallet/:userId/topup", async (req: Request, res: Response) => {
    const { amount } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ error: "Invalid amount" });
    const wallet = await storage.addFunds(p(req.params.userId), amount);
    res.json(wallet);
  });

  app.post("/api/wallet/:userId/pay", async (req: Request, res: Response) => {
    const { amount, description } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ error: "Invalid amount" });
    const wallet = await storage.deductFunds(p(req.params.userId), amount, description);
    if (!wallet) return res.status(400).json({ error: "Insufficient funds" });
    res.json(wallet);
  });

  // === Sponsors ===
  app.get("/api/sponsors", async (_req: Request, res: Response) => {
    const sponsors = await storage.getAllSponsors();
    res.json(sponsors);
  });

  app.get("/api/sponsors/:id", async (req: Request, res: Response) => {
    const sponsor = await storage.getSponsor(p(req.params.id));
    if (!sponsor) return res.status(404).json({ error: "Sponsor not found" });
    res.json(sponsor);
  });

  app.post("/api/sponsors", async (req: Request, res: Response) => {
    try {
      const sponsor = await storage.createSponsor(req.body);
      res.status(201).json(sponsor);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.put("/api/sponsors/:id", async (req: Request, res: Response) => {
    const sponsor = await storage.updateSponsor(p(req.params.id), req.body);
    if (!sponsor) return res.status(404).json({ error: "Sponsor not found" });
    res.json(sponsor);
  });

  app.delete("/api/sponsors/:id", async (req: Request, res: Response) => {
    const deleted = await storage.deleteSponsor(p(req.params.id));
    if (!deleted) return res.status(404).json({ error: "Sponsor not found" });
    res.json({ success: true });
  });

  // Event sponsors
  app.get("/api/event-sponsors/:eventId", async (req: Request, res: Response) => {
    const sponsors = await storage.getEventSponsors(p(req.params.eventId));
    res.json(sponsors);
  });

  app.post("/api/event-sponsors", async (req: Request, res: Response) => {
    const { eventId, sponsorId, tier } = req.body;
    const es = await storage.addEventSponsor(eventId, sponsorId, tier || "bronze");
    res.status(201).json(es);
  });

  app.delete("/api/event-sponsors/:id", async (req: Request, res: Response) => {
    const deleted = await storage.removeEventSponsor(p(req.params.id));
    if (!deleted) return res.status(404).json({ error: "Event sponsor not found" });
    res.json({ success: true });
  });

  // Sponsor placements
  app.get("/api/sponsor-placements", async (req: Request, res: Response) => {
    const type = req.query.type as string;
    const placements = await storage.getActivePlacements(type);
    res.json(placements);
  });

  app.post("/api/sponsor-placements", async (req: Request, res: Response) => {
    const placement = await storage.createPlacement(req.body);
    res.status(201).json(placement);
  });

  // === Perks ===
  app.get("/api/perks", async (req: Request, res: Response) => {
    const category = req.query.category as string;
    const perks = category
      ? await storage.getPerksByCategory(category)
      : await storage.getAllPerks();
    res.json(perks);
  });

  app.get("/api/perks/:id", async (req: Request, res: Response) => {
    const perk = await storage.getPerk(p(req.params.id));
    if (!perk) return res.status(404).json({ error: "Perk not found" });
    res.json(perk);
  });

  app.post("/api/perks", async (req: Request, res: Response) => {
    try {
      const perk = await storage.createPerk(req.body);
      res.status(201).json(perk);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.put("/api/perks/:id", async (req: Request, res: Response) => {
    const perk = await storage.updatePerk(p(req.params.id), req.body);
    if (!perk) return res.status(404).json({ error: "Perk not found" });
    res.json(perk);
  });

  app.delete("/api/perks/:id", async (req: Request, res: Response) => {
    const deleted = await storage.deletePerk(p(req.params.id));
    if (!deleted) return res.status(404).json({ error: "Perk not found" });
    res.json({ success: true });
  });

  // Perk redemptions
  app.post("/api/perks/:id/redeem", async (req: Request, res: Response) => {
    const { userId, transactionId } = req.body;
    const redemption = await storage.redeemPerk(p(req.params.id), userId, transactionId);
    if (!redemption) return res.status(400).json({ error: "Cannot redeem perk - limit reached or perk expired" });
    res.json(redemption);
  });

  app.get("/api/redemptions/:userId", async (req: Request, res: Response) => {
    const redemptions = await storage.getUserRedemptions(p(req.params.userId));
    res.json(redemptions);
  });

  // === Memberships ===
  app.get("/api/membership/member-count", async (_req: Request, res: Response) => {
    const count = await storage.getMemberCount();
    res.json({ count });
  });

  app.get("/api/membership/:userId", async (req: Request, res: Response) => {
    const membership = await storage.getMembership(p(req.params.userId));
    res.json(membership || { tier: "free", status: "active" });
  });

  app.post("/api/membership", async (req: Request, res: Response) => {
    try {
      const membership = await storage.createMembership(req.body);
      res.status(201).json(membership);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.put("/api/membership/:id", async (req: Request, res: Response) => {
    const membership = await storage.updateMembership(p(req.params.id), req.body);
    if (!membership) return res.status(404).json({ error: "Membership not found" });
    res.json(membership);
  });

  app.post("/api/membership/subscribe", async (req: Request, res: Response) => {
    try {
      const { userId, billingPeriod } = req.body;
      const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
      if (!rateLimit(`subscribe:${clientIp}`, 3, 120000)) {
        return res.status(429).json({ error: 'Too many subscription attempts. Please wait and try again.' });
      }
      if (!userId) return res.status(400).json({ error: "userId is required" });

      const stripe = await getUncachableStripeClient();
      const baseUrl = `https://${process.env.REPLIT_DEV_DOMAIN || process.env.REPLIT_DOMAINS?.split(',')[0] || 'localhost:5000'}`;

      const isYearly = billingPeriod === 'yearly';
      const priceAmount = isYearly ? 6900 : 799;
      const intervalStr = isYearly ? 'year' : 'month';

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'CulturePass+',
              description: isYearly
                ? 'CulturePass+ Annual Membership - Access. Advantage. Influence.'
                : 'CulturePass+ Monthly Membership - Access. Advantage. Influence.',
            },
            unit_amount: priceAmount,
            recurring: { interval: intervalStr as any },
          },
          quantity: 1,
        }],
        mode: 'subscription',
        success_url: `${baseUrl}/api/membership/subscribe-success?session_id={CHECKOUT_SESSION_ID}&user_id=${userId}&billing_period=${billingPeriod}`,
        cancel_url: `${baseUrl}/api/membership/subscribe-cancel`,
        metadata: {
          userId,
          billingPeriod,
          membershipTier: 'plus',
        },
      });

      res.json({ checkoutUrl: session.url, sessionId: session.id });
    } catch (e: any) {
      console.error('Membership subscribe error:', e);
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/membership/subscribe-success", async (req: Request, res: Response) => {
    try {
      const { session_id, user_id, billing_period } = req.query;
      if (session_id && user_id) {
        const stripe = await getUncachableStripeClient();
        const session = await stripe.checkout.sessions.retrieve(session_id as string);

        const isYearly = billing_period === 'yearly';
        const endDate = new Date();
        if (isYearly) {
          endDate.setFullYear(endDate.getFullYear() + 1);
        } else {
          endDate.setMonth(endDate.getMonth() + 1);
        }

        await storage.activatePlusMembership(user_id as string, {
          stripeSubscriptionId: session.subscription as string,
          stripeCustomerId: session.customer as string,
          billingPeriod: (billing_period as string) || 'monthly',
          priceCents: isYearly ? 6900 : 799,
          endDate,
        });
      }

      res.setHeader("Content-Type", "text/html");
      res.send(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Welcome to CulturePass+</title>
        <style>body{font-family:-apple-system,system-ui,sans-serif;display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0;background:linear-gradient(135deg,#EBF5FB,#D6EAF8);color:#1A5276}
        .container{text-align:center;padding:40px;max-width:400px}.icon{font-size:64px;margin-bottom:16px}.title{font-size:28px;font-weight:700;margin-bottom:8px;background:linear-gradient(135deg,#2E86C1,#1A5276);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
        .sub{font-size:16px;color:#5D6D7E;line-height:1.5}.badge{display:inline-block;background:linear-gradient(135deg,#2E86C1,#1A5276);color:white;padding:6px 16px;border-radius:20px;font-size:14px;font-weight:600;margin-top:16px}
        .close-btn{display:inline-block;margin-top:24px;background:#2E86C1;color:white;padding:12px 32px;border-radius:12px;font-size:16px;font-weight:600;text-decoration:none;cursor:pointer;border:none}</style>
        <script>setTimeout(function(){try{window.close()}catch(e){}},5000);</script>
        </head><body><div class="container"><div class="icon">&#127758;</div><div class="title">Welcome to CulturePass+</div>
        <div class="sub">Your membership is now active. Enjoy early access, exclusive perks, and cashback rewards.</div>
        <div class="badge">Access. Advantage. Influence.</div>
        <button class="close-btn" onclick="try{window.close()}catch(e){history.back()}">Return to App</button>
        <div class="sub" style="margin-top:16px;font-size:13px">This page will close automatically...</div></div></body></html>`);
    } catch (e: any) {
      console.error('Membership success error:', e);
      res.status(500).send('Error activating membership');
    }
  });

  app.get("/api/membership/subscribe-cancel", async (_req: Request, res: Response) => {
    res.setHeader("Content-Type", "text/html");
    res.send(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Subscription Cancelled</title>
      <style>body{font-family:-apple-system,system-ui,sans-serif;display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0;background:#fef2f2;color:#991b1b}
      .container{text-align:center;padding:40px}.icon{font-size:64px;margin-bottom:16px}.title{font-size:24px;font-weight:700;margin-bottom:8px}.sub{font-size:16px;opacity:0.8}
      .close-btn{display:inline-block;margin-top:24px;background:#991b1b;color:white;padding:12px 32px;border-radius:12px;font-size:16px;font-weight:600;cursor:pointer;border:none}</style>
      <script>setTimeout(function(){try{window.close()}catch(e){}},5000);</script>
      </head><body><div class="container"><div class="icon">&#10005;</div><div class="title">Subscription Cancelled</div>
      <div class="sub">No worries! You can upgrade to CulturePass+ anytime.</div>
      <button class="close-btn" onclick="try{window.close()}catch(e){history.back()}">Return to App</button></div></body></html>`);
  });

  app.post("/api/membership/cancel-subscription", async (req: Request, res: Response) => {
    try {
      const { userId } = req.body;
      if (!userId) return res.status(400).json({ error: "userId required" });

      const membership = await storage.getMembership(userId);
      if (!membership || membership.tier === 'free') {
        return res.status(400).json({ error: "No active membership to cancel" });
      }

      if (membership.stripeSubscriptionId) {
        try {
          const stripe = await getUncachableStripeClient();
          await stripe.subscriptions.cancel(membership.stripeSubscriptionId);
        } catch (stripeErr: any) {
          console.error('Stripe cancel error:', stripeErr.message);
        }
      }

      const cancelled = await storage.cancelMembership(userId);
      res.json({ success: true, membership: cancelled });
    } catch (e: any) {
      console.error('Cancel membership error:', e);
      res.status(500).json({ error: e.message });
    }
  });

  // === Notifications ===
  app.get("/api/notifications/:userId", async (req: Request, res: Response) => {
    const notifs = await storage.getNotifications(p(req.params.userId));
    res.json(notifs);
  });

  app.get("/api/notifications/:userId/unread-count", async (req: Request, res: Response) => {
    const count = await storage.getUnreadCount(p(req.params.userId));
    res.json({ count });
  });

  app.post("/api/notifications", async (req: Request, res: Response) => {
    try {
      const notif = await storage.createNotification(req.body);
      res.status(201).json(notif);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.put("/api/notifications/:id/read", async (req: Request, res: Response) => {
    const notif = await storage.markNotificationRead(p(req.params.id));
    if (!notif) return res.status(404).json({ error: "Notification not found" });
    res.json(notif);
  });

  app.put("/api/notifications/:userId/read-all", async (req: Request, res: Response) => {
    await storage.markAllNotificationsRead(p(req.params.userId));
    res.json({ success: true });
  });

  app.delete("/api/notifications/:id", async (req: Request, res: Response) => {
    const deleted = await storage.deleteNotification(p(req.params.id));
    if (!deleted) return res.status(404).json({ error: "Notification not found" });
    res.json({ success: true });
  });

  // === Tickets ===
  app.get("/api/tickets/:userId", async (req: Request, res: Response) => {
    const tickets = await storage.getTickets(p(req.params.userId));
    res.json(tickets);
  });

  app.get("/api/tickets/:userId/count", async (req: Request, res: Response) => {
    const count = await storage.getTicketCount(p(req.params.userId));
    res.json({ count });
  });

  app.get("/api/ticket/:id", async (req: Request, res: Response) => {
    const ticket = await storage.getTicket(p(req.params.id));
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });
    res.json(ticket);
  });

  app.post("/api/tickets", async (req: Request, res: Response) => {
    try {
      const ticket = await storage.createTicket(req.body);
      res.status(201).json(ticket);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.put("/api/tickets/:id/cancel", async (req: Request, res: Response) => {
    const ticket = await storage.cancelTicket(p(req.params.id));
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });
    res.json(ticket);
  });

  app.post("/api/tickets/scan", async (req: Request, res: Response) => {
    try {
      const { ticketCode, scannedBy } = req.body;
      if (!ticketCode) return res.status(400).json({ error: "Ticket code is required" });

      const ticket = await storage.getTicketByCode(ticketCode);
      if (!ticket) return res.status(404).json({ error: "Invalid ticket code", valid: false });

      if (ticket.status === "used") {
        return res.status(400).json({
          error: "Ticket already scanned",
          valid: false,
          ticket,
          scannedAt: ticket.scannedAt,
        });
      }

      if (ticket.status === "cancelled") {
        return res.status(400).json({ error: "Ticket has been cancelled", valid: false, ticket });
      }

      if (ticket.status === "expired") {
        return res.status(400).json({ error: "Ticket has expired", valid: false, ticket });
      }

      const updated = await storage.scanTicket(ticket.id, scannedBy || "staff");
      res.json({ valid: true, message: "Ticket scanned successfully", ticket: updated });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/tickets-all", async (_req: Request, res: Response) => {
    const allTickets = await storage.getAllTickets();
    res.json(allTickets);
  });

  app.get("/api/tickets/event/:eventId", async (req: Request, res: Response) => {
    const eventTickets = await storage.getTicketsByEvent(p(req.params.eventId));
    res.json(eventTickets);
  });

  app.post("/api/tickets/backfill-qr", async (_req: Request, res: Response) => {
    const count = await storage.backfillQRCodes();
    res.json({ message: `Backfilled ${count} tickets with QR codes` });
  });

  // === Stripe Payment Integration ===
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

      const ticket = await storage.createTicket({
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

    const existingTickets = await storage.getTickets(ticketData.userId);
    const pendingForEvent = existingTickets.find(
      (t: any) => t.eventId === ticketData.eventId && t.status === 'pending' && t.paymentStatus === 'pending'
    );
    if (pendingForEvent) {
      throw new AppError(ErrorCodes.DUPLICATE_PURCHASE, 409, 'You already have a pending purchase for this event. Please complete or cancel it first.');
    }

    const stripe = await getUncachableStripeClient();
    const baseUrl = `https://${process.env.REPLIT_DEV_DOMAIN || process.env.REPLIT_DOMAINS?.split(',')[0] || 'localhost:5000'}`;

    const ticket = await storage.createTicket({
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
      await storage.updateTicketPayment(ticket.id, {
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
          await storage.updateTicketPayment(ticket_id as string, {
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
      await storage.updateTicketPayment(ticket_id as string, {
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
        const ticket = await storage.updateTicketPayment(ticketId, {
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

    const ticket = await storage.getTicket(ticketId);
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
      const cancelled = await storage.cancelTicket(ticketId);
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

    const updated = await storage.updateTicketPayment(ticketId, {
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

  app.post("/api/tickets/:id/scan", wrapHandler(async (req: Request, res: Response) => {
    const ticketId = p(req.params.id);
    const { scannedBy } = req.body;

    const ticket = await storage.getTicket(ticketId);
    if (!ticket) {
      throw new AppError(ErrorCodes.TICKET_NOT_FOUND, 404, 'Ticket not found.');
    }

    if (ticket.status === 'used') {
      throw new AppError(ErrorCodes.TICKET_ALREADY_SCANNED, 400, 'This ticket has already been scanned.');
    }

    if (ticket.status === 'cancelled') {
      throw new AppError(ErrorCodes.TICKET_ALREADY_CANCELLED, 400, 'This ticket has been cancelled and is no longer valid.');
    }

    if (ticket.paymentStatus !== 'paid' && ticket.totalPrice && ticket.totalPrice > 0) {
      throw new AppError(ErrorCodes.PAYMENT_PENDING, 400, 'This ticket has not been paid for yet.');
    }

    if (ticket.eventDate) {
      const [year, month, day] = ticket.eventDate.split('-').map(Number);
      if (year && month && day) {
        const eventDate = new Date(year, month - 1, day);
        const dayAfter = new Date(eventDate);
        dayAfter.setDate(dayAfter.getDate() + 1);
        if (new Date() > dayAfter) {
          throw new AppError(ErrorCodes.TICKET_EXPIRED, 400, 'This ticket has expired. The event date has passed.');
        }
      }
    }

    const updated = await storage.updateTicketPayment(ticketId, {
      status: 'used',
      scannedAt: new Date(),
      scannedBy: scannedBy || 'staff',
    } as any);

    return res.json({
      success: true,
      data: {
        message: 'Ticket scanned successfully',
        ticket: updated,
      },
    });
  }));

  app.get("/api/dashboard/stats", async (_req: Request, res: Response) => {
    try {
      const allTickets = await storage.getAllTickets();
      const allUsers = await storage.getAllUsers();
      const allPerks = await storage.getAllPerks();

      const totalRevenue = allTickets.reduce((sum, t) => sum + (t.totalPrice || 0), 0);
      const platformRevenue = allTickets.reduce((sum, t) => sum + (t.platformFee || 0), 0);
      const organizerRevenue = allTickets.reduce((sum, t) => sum + (t.organizerAmount || 0), 0);
      const scannedTickets = allTickets.filter(t => t.status === 'used').length;
      const confirmedTickets = allTickets.filter(t => t.status === 'confirmed').length;
      const cancelledTickets = allTickets.filter(t => t.status === 'cancelled').length;

      const eventMap = new Map<string, { eventId: string; eventTitle: string; tickets: number; revenue: number; scanned: number; organizerAmount: number }>();
      for (const t of allTickets) {
        const existing = eventMap.get(t.eventId) || { eventId: t.eventId, eventTitle: t.eventTitle, tickets: 0, revenue: 0, scanned: 0, organizerAmount: 0 };
        existing.tickets += (t.quantity || 1);
        existing.revenue += (t.totalPrice || 0);
        existing.organizerAmount += (t.organizerAmount || 0);
        if (t.status === 'used') existing.scanned += (t.quantity || 1);
        eventMap.set(t.eventId, existing);
      }

      res.json({
        totalTickets: allTickets.length,
        confirmedTickets,
        scannedTickets,
        cancelledTickets,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        platformRevenue: Math.round(platformRevenue * 100) / 100,
        organizerRevenue: Math.round(organizerRevenue * 100) / 100,
        totalUsers: allUsers.length,
        totalPerks: allPerks.length,
        eventBreakdown: Array.from(eventMap.values()).sort((a, b) => b.revenue - a.revenue),
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // === Wallet Pass Generation ===
  app.get("/api/tickets/:id/wallet/apple", async (req: Request, res: Response) => {
    const ticket = await storage.getTicket(p(req.params.id));
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });
    
    const passData = {
      formatVersion: 1,
      passTypeIdentifier: "pass.com.culturepass.ticket",
      serialNumber: ticket.id,
      teamIdentifier: "CULTUREPASS",
      organizationName: "CulturePass",
      description: ticket.eventTitle,
      foregroundColor: "rgb(255, 255, 255)",
      backgroundColor: ticket.imageColor || "rgb(0, 122, 255)",
      eventTicket: {
        primaryFields: [{ key: "event", label: "EVENT", value: ticket.eventTitle }],
        secondaryFields: [
          { key: "date", label: "DATE", value: ticket.eventDate || "" },
          { key: "time", label: "TIME", value: ticket.eventTime || "" },
        ],
        auxiliaryFields: [
          { key: "venue", label: "VENUE", value: ticket.eventVenue || "" },
          { key: "tier", label: "TIER", value: ticket.tierName || "General" },
        ],
        backFields: [
          { key: "code", label: "TICKET CODE", value: ticket.ticketCode || "" },
          { key: "quantity", label: "QUANTITY", value: String(ticket.quantity || 1) },
        ],
      },
      barcode: {
        message: ticket.ticketCode || ticket.id,
        format: "PKBarcodeFormatQR",
        messageEncoding: "iso-8859-1",
      },
    };
    
    res.json({ pass: passData, message: "Apple Wallet pass generated. In production, this would be a downloadable .pkpass file." });
  });

  app.get("/api/tickets/:id/wallet/google", async (req: Request, res: Response) => {
    const ticket = await storage.getTicket(p(req.params.id));
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });
    
    const passData = {
      id: `culturepass-${ticket.id}`,
      classId: "culturepass.event_ticket",
      eventName: { defaultValue: { language: "en", value: ticket.eventTitle } },
      dateTime: {
        start: ticket.eventDate ? `${ticket.eventDate}T${ticket.eventTime || "00:00"}` : undefined,
      },
      venue: {
        name: { defaultValue: { language: "en", value: ticket.eventVenue || "" } },
      },
      ticketHolderName: "CulturePass Member",
      ticketNumber: ticket.ticketCode || ticket.id,
      seatInfo: {
        section: { defaultValue: { language: "en", value: ticket.tierName || "General" } },
      },
      barcode: {
        type: "QR_CODE",
        value: ticket.ticketCode || ticket.id,
      },
      hexBackgroundColor: ticket.imageColor || "#007AFF",
    };
    
    res.json({ pass: passData, message: "Google Wallet pass generated. In production, this would redirect to Google Wallet save URL." });
  });

  // === Dashboard ===
  app.post("/api/dashboard/login", async (req: Request, res: Response) => {
    const { username, password } = req.body;
    const adminPassword = process.env.ADMIN_USER_PASSWORD || "admin123";
    if (username === "admin" && password === adminPassword) {
      res.json({ success: true });
    } else {
      res.status(401).json({ success: false, error: "Invalid credentials" });
    }
  });

  // === CulturePass ID (CPID) ===
  app.get("/api/cpid/registry", async (_req: Request, res: Response) => {
    const entries = await getAllRegistryEntries();
    res.json(entries);
  });

  app.get("/api/cpid/lookup/:cpid", async (req: Request, res: Response) => {
    const result = await lookupCpid(p(req.params.cpid));
    if (!result) return res.status(404).json({ error: "CPID not found" });
    res.json(result);
  });

  app.post("/api/cpid/generate", async (req: Request, res: Response) => {
    try {
      const { targetId, entityType } = req.body;
      if (!targetId || !entityType) return res.status(400).json({ error: "targetId and entityType are required" });
      const cpid = await generateCpid(targetId, entityType);
      res.json({ culturePassId: cpid, targetId, entityType });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // === Seed data endpoint ===
  app.post("/api/seed", async (_req: Request, res: Response) => {
    try {
      const existing = await storage.getAllProfiles();
      if (existing.length > 0) {
        return res.json({ message: "Already seeded", count: existing.length });
      }

      const seedProfiles = [
        { name: "Indian Community Australia", slug: "indian-community-au", entityType: "community", description: "Connecting Indian diaspora across Australia through events, culture, and community support.", category: "Cultural Community", city: "Sydney", country: "Australia", latitude: -33.8688, longitude: 151.2093, socialLinks: { facebook: "https://facebook.com/indiancommunityau", instagram: "https://instagram.com/indiancommunityau" }, images: [], tags: ["indian", "cultural", "community"], followersCount: 2450, membersCount: 2450, rating: 4.8 },
        { name: "Chinese Cultural Society", slug: "chinese-cultural-society", entityType: "community", description: "Celebrating Chinese heritage and traditions in Australia and New Zealand.", category: "Cultural Community", city: "Melbourne", country: "Australia", latitude: -37.8136, longitude: 144.9631, socialLinks: { facebook: "https://facebook.com/chinesecultural", instagram: "https://instagram.com/chinesecultural" }, images: [], tags: ["chinese", "cultural"], followersCount: 1890, membersCount: 1890, rating: 4.7 },
        { name: "Filipino Network NZ", slug: "filipino-network-nz", entityType: "community", description: "Supporting Filipino community in New Zealand with events, resources, and networking.", category: "Cultural Community", city: "Auckland", country: "New Zealand", latitude: -36.8485, longitude: 174.7633, socialLinks: { instagram: "https://instagram.com/filipinonz" }, images: [], tags: ["filipino", "networking"], followersCount: 1200, membersCount: 1200, rating: 4.6 },
        { name: "CulturePass Events Pty Ltd", slug: "culturepass-events", entityType: "organisation", description: "Premier cultural events organiser connecting communities across Australia and New Zealand.", category: "Events Organisation", city: "Sydney", country: "Australia", latitude: -33.8688, longitude: 151.2093, website: "https://culturepass.com", socialLinks: { linkedin: "https://linkedin.com/company/culturepass", twitter: "https://twitter.com/culturepass" }, images: [], tags: ["events", "multicultural"], followersCount: 5200, rating: 4.9 },
        { name: "Multicultural Arts Victoria", slug: "multicultural-arts-vic", entityType: "organisation", description: "Supporting and promoting culturally diverse arts and artists.", category: "Arts Organisation", city: "Melbourne", country: "Australia", latitude: -37.8136, longitude: 144.9631, website: "https://multiculturalarts.com.au", socialLinks: { facebook: "https://facebook.com/multiculturalartsvic", instagram: "https://instagram.com/multiculturalartsvic" }, images: [], tags: ["arts", "multicultural", "victoria"], followersCount: 3100, rating: 4.7 },
        { name: "Sydney Opera House", slug: "sydney-opera-house", entityType: "venue", description: "Iconic performing arts centre and UNESCO World Heritage Site.", category: "Performing Arts", city: "Sydney", country: "Australia", address: "Bennelong Point, Sydney NSW 2000", latitude: -33.8568, longitude: 151.2153, website: "https://sydneyoperahouse.com", socialLinks: { facebook: "https://facebook.com/sydneyoperahouse", instagram: "https://instagram.com/sydneyoperahouse", twitter: "https://twitter.com/sydneyoperahouse", youtube: "https://youtube.com/sydneyoperahouse" }, images: [], tags: ["opera", "performing arts", "landmark"], followersCount: 15000, rating: 4.9, openingHours: "Mon-Sun: 9am-11pm" },
        { name: "Melbourne Convention Centre", slug: "melbourne-convention", entityType: "venue", description: "World-class convention and exhibition centre in South Wharf.", category: "Convention Centre", city: "Melbourne", country: "Australia", address: "1 Convention Centre Pl, South Wharf VIC 3006", latitude: -37.8252, longitude: 144.9529, website: "https://mcec.com.au", socialLinks: { linkedin: "https://linkedin.com/company/mcec" }, images: [], tags: ["convention", "events", "exhibitions"], followersCount: 8900, rating: 4.6, openingHours: "Mon-Sun: 8am-10pm" },
        { name: "Spice of India", slug: "spice-of-india", entityType: "business", description: "Authentic North Indian cuisine with traditional recipes and premium ingredients.", category: "Restaurant", city: "Sydney", country: "Australia", address: "42 Elizabeth Street, Sydney NSW 2000", latitude: -33.8718, longitude: 151.2082, phone: "02 9123 4567", socialLinks: { instagram: "https://instagram.com/spiceofindia", facebook: "https://facebook.com/spiceofindia" }, images: [], tags: ["indian", "restaurant", "fine dining"], followersCount: 890, rating: 4.5, openingHours: "Tue-Sun: 11am-10pm" },
        { name: "Sari Silk Boutique", slug: "sari-silk-boutique", entityType: "business", description: "Premium Indian fashion, bridal wear, and traditional clothing.", category: "Fashion", city: "Melbourne", country: "Australia", address: "156 Chapel Street, Prahran VIC 3181", latitude: -37.8508, longitude: 144.9931, socialLinks: { instagram: "https://instagram.com/sarisilk", tiktok: "https://tiktok.com/@sarisilk" }, images: [], tags: ["fashion", "indian", "bridal"], followersCount: 2300, rating: 4.7, openingHours: "Mon-Sat: 10am-6pm" },
        { name: "Dragon Palace", slug: "dragon-palace", entityType: "business", description: "Award-winning Chinese restaurant featuring Cantonese and Sichuan cuisine.", category: "Restaurant", city: "Auckland", country: "New Zealand", address: "95 Queen Street, Auckland 1010", latitude: -36.8461, longitude: 174.7660, phone: "+64 9 555 1234", socialLinks: { facebook: "https://facebook.com/dragonpalace", instagram: "https://instagram.com/dragonpalace" }, images: [], tags: ["chinese", "restaurant"], followersCount: 1200, rating: 4.6, openingHours: "Mon-Sun: 11am-11pm" },
        { name: "City of Sydney Council", slug: "city-of-sydney", entityType: "council", description: "Local government authority for the City of Sydney, promoting multicultural events and community programs.", category: "Local Government", city: "Sydney", country: "Australia", address: "Town Hall House, 456 Kent St, Sydney NSW 2000", latitude: -33.8736, longitude: 151.2069, website: "https://cityofsydney.nsw.gov.au", socialLinks: { facebook: "https://facebook.com/cityofsydney", twitter: "https://twitter.com/cityofsydney", linkedin: "https://linkedin.com/company/cityofsydney" }, images: [], tags: ["government", "multicultural", "grants"], followersCount: 12000, rating: 4.3 },
        { name: "Auckland Council", slug: "auckland-council", entityType: "council", description: "Auckland's local authority supporting diverse communities and cultural festivals.", category: "Local Government", city: "Auckland", country: "New Zealand", address: "135 Albert Street, Auckland 1010", latitude: -36.8485, longitude: 174.7633, website: "https://aucklandcouncil.govt.nz", socialLinks: { facebook: "https://facebook.com/aucklandcouncil", twitter: "https://twitter.com/aklcouncil" }, images: [], tags: ["government", "auckland"], followersCount: 9500, rating: 4.1 },
        { name: "Department of Home Affairs", slug: "dept-home-affairs", entityType: "government", description: "Australian Government department responsible for immigration, citizenship, and multicultural affairs.", category: "Federal Government", city: "Canberra", country: "Australia", website: "https://homeaffairs.gov.au", socialLinks: { twitter: "https://twitter.com/AusBorderForce", linkedin: "https://linkedin.com/company/department-of-home-affairs" }, images: [], tags: ["immigration", "citizenship", "multicultural"], followersCount: 25000, rating: 3.8 },
        { name: "Ministry of Ethnic Communities", slug: "ministry-ethnic-communities", entityType: "government", description: "New Zealand government ministry focused on ethnic communities, promoting inclusion and diversity.", category: "National Government", city: "Wellington", country: "New Zealand", website: "https://ethniccommunities.govt.nz", socialLinks: { facebook: "https://facebook.com/ethniccommunities", twitter: "https://twitter.com/ethniccommNZ" }, images: [], tags: ["ethnic", "diversity", "inclusion"], followersCount: 8000, rating: 4.0 },
        // Artists
        { name: "Priya Sharma", slug: "priya-sharma", entityType: "artist", description: "Classical Bharatanatyam dancer and choreographer bringing South Indian dance to Australian stages.", category: "Dancer", city: "Melbourne", country: "Australia", bio: "Award-winning dancer with 15+ years of experience performing at cultural festivals worldwide.", socialLinks: { instagram: "https://instagram.com/priyasharma", youtube: "https://youtube.com/priyasharma", spotify: "https://open.spotify.com/artist/priya" }, images: [], tags: ["dance", "bharatanatyam", "classical", "indian"], followersCount: 4500, rating: 4.9, isVerified: true },
        { name: "DJ Kai Lin", slug: "dj-kai-lin", entityType: "artist", description: "Fusion DJ blending Asian electronic beats with traditional Chinese instruments.", category: "Musician", city: "Sydney", country: "Australia", bio: "Headlining cultural festivals across Australia, NZ, and Asia since 2019.", socialLinks: { instagram: "https://instagram.com/djkailin", tiktok: "https://tiktok.com/@djkailin", spotify: "https://open.spotify.com/artist/djkailin" }, images: [], tags: ["dj", "electronic", "fusion", "chinese"], followersCount: 8200, rating: 4.8, isVerified: true },
        { name: "Ravi Patel", slug: "ravi-patel", entityType: "artist", description: "Stand-up comedian known for hilarious cross-cultural comedy about the immigrant experience.", category: "Comedian", city: "Auckland", country: "New Zealand", bio: "Netflix special 'Between Two Cultures' streamed in 12 countries.", socialLinks: { instagram: "https://instagram.com/ravipatel", youtube: "https://youtube.com/ravipatel", twitter: "https://twitter.com/ravipatel" }, images: [], tags: ["comedy", "stand-up", "indian"], followersCount: 12000, rating: 4.7, isVerified: true },
      ];

      const createdProfiles = [];
      for (const p of seedProfiles) {
        const created = await storage.createProfile(p as any);
        createdProfiles.push(created);
      }

      for (const cp of createdProfiles) {
        await generateCpid(cp.id, cp.entityType);
      }

      // Seed sponsors
      const seedSponsors = [
        { name: "Telstra", description: "Australia's leading telecommunications company supporting multicultural communities.", logoUrl: "", websiteUrl: "https://telstra.com.au", sponsorType: "corporate", city: "Melbourne", country: "Australia", socialLinks: { linkedin: "https://linkedin.com/company/telstra", twitter: "https://twitter.com/telstra" }, contactEmail: "partnerships@telstra.com.au" },
        { name: "ANZ Bank", description: "Banking partner empowering diverse communities through financial inclusion programs.", logoUrl: "", websiteUrl: "https://anz.com.au", sponsorType: "corporate", city: "Sydney", country: "Australia", socialLinks: { linkedin: "https://linkedin.com/company/anz-bank", facebook: "https://facebook.com/ANZAustralia" }, contactEmail: "community@anz.com.au" },
        { name: "SBS Australia", description: "Australia's multicultural and multilingual broadcaster, celebrating diversity in media.", logoUrl: "", websiteUrl: "https://sbs.com.au", sponsorType: "corporate", city: "Sydney", country: "Australia", socialLinks: { instagram: "https://instagram.com/sbsaustralia", twitter: "https://twitter.com/SBS" }, contactEmail: "partnerships@sbs.com.au" },
        { name: "Auckland Foundation", description: "Community trust supporting cultural initiatives and events in Auckland.", logoUrl: "", websiteUrl: "https://aucklandfoundation.org.nz", sponsorType: "local", city: "Auckland", country: "New Zealand", socialLinks: { facebook: "https://facebook.com/aucklandfoundation" }, contactEmail: "grants@aucklandfoundation.org.nz" },
      ];

      const createdSponsors = [];
      for (const s of seedSponsors) {
        const created = await storage.createSponsor(s as any);
        createdSponsors.push(created);
      }

      for (const cs of createdSponsors) {
        await generateCpid(cs.id, "sponsor");
      }

      // Seed perks
      const seedPerks = [
        { title: "20% Off First Event Ticket", description: "Get 20% off your first event ticket purchase on CulturePass.", perkType: "discount_percent", discountPercent: 20, providerType: "platform", providerName: "CulturePass", category: "tickets", startDate: new Date(), endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), usageLimit: 1000, perUserLimit: 1 },
        { title: "Free Entry to Community Meetups", description: "Attend any community meetup event for free this month.", perkType: "free_ticket", providerType: "platform", providerName: "CulturePass", category: "events", startDate: new Date(), endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), usageLimit: 500, perUserLimit: 3 },
        { title: "$10 Off at Spice of India", description: "Enjoy $10 off your meal when you dine at Spice of India.", perkType: "discount_fixed", discountFixedCents: 1000, providerType: "business", providerName: "Spice of India", category: "dining", startDate: new Date(), endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), usageLimit: 200, perUserLimit: 2 },
        { title: "Early Access to Festival Tickets", description: "Premium members get 48-hour early access to major festival ticket sales.", perkType: "early_access", providerType: "platform", providerName: "CulturePass", category: "tickets", isMembershipRequired: true, requiredMembershipTier: "premium", startDate: new Date(), endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) },
        { title: "VIP Upgrade at Diwali Festival", description: "Free VIP upgrade for CulturePass members at the Diwali Festival.", perkType: "vip_upgrade", providerType: "sponsor", providerName: "Telstra", category: "events", isMembershipRequired: true, requiredMembershipTier: "premium", startDate: new Date(), endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), usageLimit: 50 },
        { title: "15% Off Sari Silk Boutique", description: "Show your CulturePass app for 15% off any purchase at Sari Silk Boutique.", perkType: "discount_percent", discountPercent: 15, providerType: "business", providerName: "Sari Silk Boutique", category: "shopping", startDate: new Date(), endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), usageLimit: 300, perUserLimit: 2 },
        { title: "$5 Wallet Cashback", description: "Get $5 credited to your CulturePass Wallet on your next ticket purchase over $30.", perkType: "cashback", discountFixedCents: 500, providerType: "platform", providerName: "CulturePass", category: "wallet", startDate: new Date(), endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), usageLimit: 1000, perUserLimit: 1 },
      ];

      for (const pk of seedPerks) {
        await storage.createPerk(pk as any);
      }

      // Seed a demo user
      const demoPassword = process.env.DEMO_USER_PASSWORD || "demo123";
      const demoUser = await storage.createUser({ username: "demo", password: demoPassword });
      await storage.updateUser(demoUser.id, {
        displayName: "Alex Chen",
        email: "alex@culturepass.com",
        bio: "Cultural explorer and community builder. Passionate about connecting people through shared heritage.",
        city: "Sydney",
        country: "Australia",
        location: "Sydney, Australia",
        socialLinks: { instagram: "https://instagram.com/alexchen", linkedin: "https://linkedin.com/in/alexchen", twitter: "https://twitter.com/alexchen" },
        images: [],
        latitude: -33.8688,
        longitude: 151.2093,
      });
      await generateCpid(demoUser.id, "user");

      // Seed Super Admin user
      const adminPassword = process.env.ADMIN_USER_PASSWORD;
      if (!adminPassword) {
        throw new Error("ADMIN_USER_PASSWORD environment variable is required for seeding the super admin account");
      }
      const adminUser = await storage.createUser({ username: "superadmin", password: adminPassword });
      await storage.updateUser(adminUser.id, {
        displayName: "Super Admin",
        email: "jiobaba369@gmail.com",
        bio: "CulturePass Super Administrator",
        city: "Sydney",
        country: "Australia",
        location: "Sydney, Australia",
        role: "super_admin",
        isVerified: true,
      } as any);
      await generateCpid(adminUser.id, "user");

      // Seed notifications for demo user
      const notifData = [
        { userId: demoUser.id, title: "Welcome to CulturePass!", message: "Start exploring cultural events and communities near you.", type: "system" },
        { userId: demoUser.id, title: "Diwali Festival 2026", message: "Early bird tickets are now available! Book before they sell out.", type: "event" },
        { userId: demoUser.id, title: "New Perk Available", message: "Get 20% off your first event ticket purchase.", type: "perk" },
        { userId: demoUser.id, title: "Community Update", message: "Indian Community Australia posted a new event.", type: "community" },
      ];
      for (const n of notifData) {
        await storage.createNotification(n as any);
      }

      // Seed sample tickets for demo user
      const ticketData = [
        { userId: demoUser.id, eventId: "evt-001", eventTitle: "Diwali Festival of Lights 2026", eventDate: "2026-10-25", eventTime: "6:00 PM", eventVenue: "Sydney Opera House Forecourt", tierName: "VIP", quantity: 2, totalPrice: 120.00, currency: "AUD", status: "confirmed", imageColor: "#FF6B35" },
        { userId: demoUser.id, eventId: "evt-002", eventTitle: "Chinese New Year Gala", eventDate: "2026-02-17", eventTime: "7:30 PM", eventVenue: "Melbourne Convention Centre", tierName: "General", quantity: 1, totalPrice: 45.00, currency: "AUD", status: "used", imageColor: "#E74C3C" },
        { userId: demoUser.id, eventId: "evt-003", eventTitle: "Bollywood Night Live", eventDate: "2026-03-15", eventTime: "8:00 PM", eventVenue: "Darling Harbour Theatre", tierName: "Premium", quantity: 3, totalPrice: 225.00, currency: "AUD", status: "confirmed", imageColor: "#9B59B6" },
        { userId: demoUser.id, eventId: "evt-004", eventTitle: "Cultural Food Festival", eventDate: "2026-04-10", eventTime: "11:00 AM", eventVenue: "Centennial Park", tierName: "General", quantity: 2, totalPrice: 30.00, currency: "AUD", status: "confirmed", imageColor: "#2ECC71" },
      ];
      for (const t of ticketData) {
        await storage.createTicket(t as any);
      }

      // Seed membership for demo user
      await storage.createMembership({ userId: demoUser.id, tier: "plus" } as any);

      // Add funds to demo user wallet
      await storage.addFunds(demoUser.id, 45.50);

      res.json({ message: "Seeded successfully", profiles: seedProfiles.length, sponsors: seedSponsors.length, perks: seedPerks.length, users: 1, tickets: ticketData.length });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

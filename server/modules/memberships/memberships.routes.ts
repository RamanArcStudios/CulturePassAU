import type { Express, Request, Response } from "express";
import * as membershipsService from "./memberships.service";
import { getUncachableStripeClient } from "../../stripeClient";
import { rateLimit } from "../../errors";

function p(val: string | string[]): string { return Array.isArray(val) ? val[0] : val; }

export function registerMembershipsRoutes(app: Express) {
  app.get("/api/membership/member-count", async (_req: Request, res: Response) => {
    const count = await membershipsService.getMemberCount();
    res.json({ count });
  });

  app.get("/api/membership/:userId", async (req: Request, res: Response) => {
    const membership = await membershipsService.getMembership(p(req.params.userId));
    res.json(membership || { tier: "free", status: "active" });
  });

  app.post("/api/membership", async (req: Request, res: Response) => {
    try {
      const membership = await membershipsService.createMembership(req.body);
      res.status(201).json(membership);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.put("/api/membership/:id", async (req: Request, res: Response) => {
    const membership = await membershipsService.updateMembership(p(req.params.id), req.body);
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

        await membershipsService.activatePlusMembership(user_id as string, {
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

      const membership = await membershipsService.getMembership(userId);
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

      const cancelled = await membershipsService.cancelMembership(userId);
      res.json({ success: true, membership: cancelled });
    } catch (e: any) {
      console.error('Cancel membership error:', e);
      res.status(500).json({ error: e.message });
    }
  });
}

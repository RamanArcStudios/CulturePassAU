import type { Express, Request, Response } from "express";
import * as walletService from "./wallet.service";

function p(val: string | string[]): string { return Array.isArray(val) ? val[0] : val; }

export function registerWalletRoutes(app: Express) {
  app.get("/api/payment-methods/:userId", async (req: Request, res: Response) => {
    const methods = await walletService.getPaymentMethods(p(req.params.userId));
    res.json(methods);
  });

  app.post("/api/payment-methods", async (req: Request, res: Response) => {
    try {
      const method = await walletService.createPaymentMethod(req.body);
      res.status(201).json(method);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.delete("/api/payment-methods/:id", async (req: Request, res: Response) => {
    const deleted = await walletService.deletePaymentMethod(p(req.params.id));
    if (!deleted) return res.status(404).json({ error: "Payment method not found" });
    res.json({ success: true });
  });

  app.put("/api/payment-methods/:userId/default/:methodId", async (req: Request, res: Response) => {
    const method = await walletService.setDefaultPaymentMethod(p(req.params.userId), p(req.params.methodId));
    if (!method) return res.status(404).json({ error: "Method not found" });
    res.json(method);
  });

  app.get("/api/transactions/:userId", async (req: Request, res: Response) => {
    const txs = await walletService.getTransactions(p(req.params.userId));
    res.json(txs);
  });

  app.get("/api/wallet/:userId", async (req: Request, res: Response) => {
    const wallet = await walletService.getWallet(p(req.params.userId));
    res.json(wallet || { balance: 0, currency: "AUD" });
  });

  app.post("/api/wallet/:userId/topup", async (req: Request, res: Response) => {
    const { amount } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ error: "Invalid amount" });
    const wallet = await walletService.addFunds(p(req.params.userId), amount);
    res.json(wallet);
  });

  app.post("/api/wallet/:userId/pay", async (req: Request, res: Response) => {
    const { amount, description } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ error: "Invalid amount" });
    const wallet = await walletService.deductFunds(p(req.params.userId), amount, description);
    if (!wallet) return res.status(400).json({ error: "Insufficient funds" });
    res.json(wallet);
  });
}

import { db } from "../../db";
import { eq, desc, sql } from "drizzle-orm";
import {
  paymentMethods, transactions, wallets,
  type PaymentMethod, type InsertPaymentMethod,
  type Transaction, type InsertTransaction,
  type Wallet,
} from "@shared/schema";

/** Returns all payment methods for a user */
export async function getPaymentMethods(userId: string): Promise<PaymentMethod[]> {
  return db.select().from(paymentMethods).where(eq(paymentMethods.userId, userId)).orderBy(desc(paymentMethods.createdAt));
}

/** Creates a new payment method, optionally setting it as default */
export async function createPaymentMethod(data: InsertPaymentMethod): Promise<PaymentMethod> {
  if (data.isDefault) {
    await db.update(paymentMethods).set({ isDefault: false }).where(eq(paymentMethods.userId, data.userId));
  }
  const [method] = await db.insert(paymentMethods).values(data).returning();
  return method;
}

/** Deletes a payment method by ID */
export async function deletePaymentMethod(id: string): Promise<boolean> {
  const result = await db.delete(paymentMethods).where(eq(paymentMethods.id, id)).returning();
  return result.length > 0;
}

/** Sets a specific payment method as the default for a user */
export async function setDefaultPaymentMethod(userId: string, methodId: string): Promise<PaymentMethod | undefined> {
  await db.update(paymentMethods).set({ isDefault: false }).where(eq(paymentMethods.userId, userId));
  const [method] = await db.update(paymentMethods).set({ isDefault: true }).where(eq(paymentMethods.id, methodId)).returning();
  return method;
}

/** Returns all transactions for a user ordered by date descending */
export async function getTransactions(userId: string): Promise<Transaction[]> {
  return db.select().from(transactions).where(eq(transactions.userId, userId)).orderBy(desc(transactions.createdAt));
}

/** Creates a new transaction record */
export async function createTransaction(data: InsertTransaction): Promise<Transaction> {
  const [tx] = await db.insert(transactions).values(data).returning();
  return tx;
}

/** Retrieves the wallet for a given user */
export async function getWallet(userId: string): Promise<Wallet | undefined> {
  const [wallet] = await db.select().from(wallets).where(eq(wallets.userId, userId));
  return wallet;
}

/** Adds funds to a user's wallet, creating the wallet if it doesn't exist */
export async function addFunds(userId: string, amount: number): Promise<Wallet> {
  let [wallet] = await db.select().from(wallets).where(eq(wallets.userId, userId));
  if (!wallet) {
    [wallet] = await db.insert(wallets).values({ userId, balance: String(amount) }).returning();
  } else {
    [wallet] = await db.update(wallets).set({
      balance: sql`${wallets.balance} + ${amount}`,
      updatedAt: new Date(),
    }).where(eq(wallets.userId, userId)).returning();
  }
  await createTransaction({
    userId, type: "credit", amount: String(amount), description: "Wallet top-up", category: "wallet", status: "completed",
  });
  return wallet;
}

/** Deducts funds from a user's wallet if sufficient balance exists */
export async function deductFunds(userId: string, amount: number, description: string): Promise<Wallet | null> {
  const [wallet] = await db.select().from(wallets).where(eq(wallets.userId, userId));
  if (!wallet || Number(wallet.balance || 0) < amount) return null;

  const [updated] = await db.update(wallets).set({
    balance: sql`${wallets.balance} - ${amount}`,
    updatedAt: new Date(),
  }).where(eq(wallets.userId, userId)).returning();

  await createTransaction({
    userId, type: "debit", amount: String(amount), description, category: "payment", status: "completed",
  });
  return updated;
}

import { db } from "../../db";
import { eq, and, desc, sql } from "drizzle-orm";
import QRCode from "qrcode";
import {
  tickets,
  type Ticket, type InsertTicket,
} from "@shared/schema";

/** Returns all tickets for a user */
export async function getTickets(userId: string): Promise<Ticket[]> {
  return db.select().from(tickets).where(eq(tickets.userId, userId)).orderBy(desc(tickets.createdAt));
}

/** Retrieves a single ticket by ID */
export async function getTicket(id: string): Promise<Ticket | undefined> {
  const [t] = await db.select().from(tickets).where(eq(tickets.id, id));
  return t;
}

/** Creates a new ticket with a unique code, QR code, and fee calculations */
export async function createTicket(data: InsertTicket): Promise<Ticket> {
  const code = `CP-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
  const totalPrice = data.totalPrice ? Number(data.totalPrice) : 0;
  const platformFee = Math.round(totalPrice * 0.05 * 100) / 100;
  const stripeFee = Math.round((totalPrice * 0.029 + 0.30) * 100) / 100;
  const organizerAmount = Math.round((totalPrice - platformFee - stripeFee) * 100) / 100;

  let qrDataUrl: string | null = null;
  try {
    qrDataUrl = await QRCode.toDataURL(code, {
      width: 300,
      margin: 2,
      color: { dark: '#000000', light: '#FFFFFF' },
      errorCorrectionLevel: 'M',
    });
  } catch {}

  const [t] = await db.insert(tickets).values({
    ...data,
    ticketCode: code,
    qrCode: qrDataUrl,
    platformFee: totalPrice > 0 ? platformFee : 0,
    stripeFee: totalPrice > 0 ? stripeFee : 0,
    organizerAmount: totalPrice > 0 ? organizerAmount : 0,
  }).returning();
  return t;
}

/** Cancels a ticket by ID */
export async function cancelTicket(id: string): Promise<Ticket | undefined> {
  const [t] = await db.update(tickets).set({ status: "cancelled" }).where(eq(tickets.id, id)).returning();
  return t;
}

/** Updates payment-related fields on a ticket */
export async function updateTicketPayment(id: string, data: Partial<{
  paymentStatus: string;
  status: string;
  stripePaymentIntentId: string;
  stripeRefundId: string;
}>): Promise<Ticket | undefined> {
  const [t] = await db.update(tickets).set(data).where(eq(tickets.id, id)).returning();
  return t;
}

/** Retrieves a ticket by its unique ticket code */
export async function getTicketByCode(code: string): Promise<Ticket | undefined> {
  const [t] = await db.select().from(tickets).where(eq(tickets.ticketCode, code));
  return t;
}

/** Marks a ticket as scanned/used */
export async function scanTicket(id: string, scannedBy: string): Promise<Ticket | undefined> {
  const [t] = await db.update(tickets).set({
    status: "used",
    scannedAt: new Date(),
    scannedBy,
  }).where(eq(tickets.id, id)).returning();
  return t;
}

/** Returns all tickets in the system */
export async function getAllTickets(): Promise<Ticket[]> {
  return db.select().from(tickets).orderBy(desc(tickets.createdAt));
}

/** Returns all tickets for a specific event */
export async function getTicketsByEvent(eventId: string): Promise<Ticket[]> {
  return db.select().from(tickets).where(eq(tickets.eventId, eventId)).orderBy(desc(tickets.createdAt));
}

/** Returns the count of confirmed tickets for a user */
export async function getTicketCount(userId: string): Promise<number> {
  const result = await db.select().from(tickets).where(
    and(eq(tickets.userId, userId), eq(tickets.status, "confirmed"))
  );
  return result.length;
}

/** Backfills QR codes and fee calculations for tickets missing them */
export async function backfillQRCodes(): Promise<number> {
  const ticketsWithoutQR = await db.select().from(tickets).where(
    sql`${tickets.qrCode} IS NULL AND ${tickets.ticketCode} IS NOT NULL`
  );
  let count = 0;
  for (const ticket of ticketsWithoutQR) {
    try {
      const qrDataUrl = await QRCode.toDataURL(ticket.ticketCode!, {
        width: 300, margin: 2,
        color: { dark: '#000000', light: '#FFFFFF' },
        errorCorrectionLevel: 'M',
      });
      const totalPrice = ticket.totalPrice ? Number(ticket.totalPrice) : 0;
      const platformFee = Math.round(totalPrice * 0.05 * 100) / 100;
      const stripeFee = Math.round((totalPrice * 0.029 + 0.30) * 100) / 100;
      const organizerAmount = Math.round((totalPrice - platformFee - stripeFee) * 100) / 100;
      await db.update(tickets).set({
        qrCode: qrDataUrl,
        platformFee: totalPrice > 0 ? platformFee : 0,
        stripeFee: totalPrice > 0 ? stripeFee : 0,
        organizerAmount: totalPrice > 0 ? organizerAmount : 0,
      }).where(eq(tickets.id, ticket.id));
      count++;
    } catch {}
  }
  return count;
}

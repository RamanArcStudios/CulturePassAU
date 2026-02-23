import { db } from "./db";
import { eq, and, desc, sql, lte, gte, inArray } from "drizzle-orm";
import QRCode from "qrcode";
import {
  users, profiles, follows, likes, reviews,
  paymentMethods, transactions, wallets,
  sponsors, eventSponsors, sponsorPlacements,
  perks, perkRedemptions, memberships, notifications, tickets,
  type User, type InsertUser,
  type Profile, type InsertProfile,
  type Review, type InsertReview,
  type PaymentMethod, type InsertPaymentMethod,
  type Transaction, type InsertTransaction,
  type Wallet, type Follow, type Like,
  type Sponsor, type InsertSponsor,
  type EventSponsor, type SponsorPlacement,
  type Perk, type InsertPerk,
  type PerkRedemption,
  type Membership, type InsertMembership,
  type Notification, type InsertNotification,
  type Ticket, type InsertTicket,
} from "@shared/schema";

export class DatabaseStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(data: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(data).returning();
    await db.insert(wallets).values({ userId: user.id });
    return user;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User | undefined> {
    const [user] = await db.update(users).set(data).where(eq(users.id, id)).returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users).orderBy(users.createdAt);
  }

  // Profiles CRUD
  async getProfile(id: string): Promise<Profile | undefined> {
    const [profile] = await db.select().from(profiles).where(eq(profiles.id, id));
    return profile;
  }

  async getProfileBySlug(slug: string): Promise<Profile | undefined> {
    const [profile] = await db.select().from(profiles).where(eq(profiles.slug, slug));
    return profile;
  }

  async getProfilesByType(entityType: string): Promise<Profile[]> {
    return db.select().from(profiles).where(eq(profiles.entityType, entityType)).orderBy(desc(profiles.createdAt));
  }

  async getAllProfiles(): Promise<Profile[]> {
    return db.select().from(profiles).orderBy(desc(profiles.createdAt));
  }

  async createProfile(data: InsertProfile): Promise<Profile> {
    const [profile] = await db.insert(profiles).values(data).returning();
    return profile;
  }

  async updateProfile(id: string, data: Partial<Profile>): Promise<Profile | undefined> {
    const [profile] = await db.update(profiles).set({ ...data, updatedAt: new Date() }).where(eq(profiles.id, id)).returning();
    return profile;
  }

  async deleteProfile(id: string): Promise<boolean> {
    const result = await db.delete(profiles).where(eq(profiles.id, id)).returning();
    return result.length > 0;
  }

  // Follows
  async follow(followerId: string, targetId: string, targetType: string): Promise<Follow> {
    const existing = await db.select().from(follows).where(
      and(eq(follows.followerId, followerId), eq(follows.targetId, targetId))
    );
    if (existing.length > 0) return existing[0];

    const [follow] = await db.insert(follows).values({ followerId, targetId, targetType }).returning();
    if (targetType === "user") {
      await db.update(users).set({ followersCount: sql`${users.followersCount} + 1` }).where(eq(users.id, targetId));
      await db.update(users).set({ followingCount: sql`${users.followingCount} + 1` }).where(eq(users.id, followerId));
    } else {
      await db.update(profiles).set({ followersCount: sql`${profiles.followersCount} + 1` }).where(eq(profiles.id, targetId));
    }
    return follow;
  }

  async unfollow(followerId: string, targetId: string): Promise<boolean> {
    const existing = await db.select().from(follows).where(
      and(eq(follows.followerId, followerId), eq(follows.targetId, targetId))
    );
    if (existing.length === 0) return false;

    await db.delete(follows).where(and(eq(follows.followerId, followerId), eq(follows.targetId, targetId)));
    const targetType = existing[0].targetType;
    if (targetType === "user") {
      await db.update(users).set({ followersCount: sql`GREATEST(${users.followersCount} - 1, 0)` }).where(eq(users.id, targetId));
      await db.update(users).set({ followingCount: sql`GREATEST(${users.followingCount} - 1, 0)` }).where(eq(users.id, followerId));
    } else {
      await db.update(profiles).set({ followersCount: sql`GREATEST(${profiles.followersCount} - 1, 0)` }).where(eq(profiles.id, targetId));
    }
    return true;
  }

  async getFollowers(targetId: string): Promise<Follow[]> {
    return db.select().from(follows).where(eq(follows.targetId, targetId)).orderBy(desc(follows.createdAt));
  }

  async getFollowing(userId: string): Promise<Follow[]> {
    return db.select().from(follows).where(eq(follows.followerId, userId)).orderBy(desc(follows.createdAt));
  }

  async isFollowing(followerId: string, targetId: string): Promise<boolean> {
    const result = await db.select().from(follows).where(
      and(eq(follows.followerId, followerId), eq(follows.targetId, targetId))
    );
    return result.length > 0;
  }

  // Likes
  async likeEntity(userId: string, targetId: string, targetType: string): Promise<Like> {
    const existing = await db.select().from(likes).where(
      and(eq(likes.userId, userId), eq(likes.targetId, targetId))
    );
    if (existing.length > 0) return existing[0];

    const [like] = await db.insert(likes).values({ userId, targetId, targetType }).returning();
    if (targetType === "user") {
      await db.update(users).set({ likesCount: sql`${users.likesCount} + 1` }).where(eq(users.id, targetId));
    } else {
      await db.update(profiles).set({ likesCount: sql`${profiles.likesCount} + 1` }).where(eq(profiles.id, targetId));
    }
    return like;
  }

  async unlikeEntity(userId: string, targetId: string): Promise<boolean> {
    const existing = await db.select().from(likes).where(
      and(eq(likes.userId, userId), eq(likes.targetId, targetId))
    );
    if (existing.length === 0) return false;

    await db.delete(likes).where(and(eq(likes.userId, userId), eq(likes.targetId, targetId)));
    const targetType = existing[0].targetType;
    if (targetType === "user") {
      await db.update(users).set({ likesCount: sql`GREATEST(${users.likesCount} - 1, 0)` }).where(eq(users.id, targetId));
    } else {
      await db.update(profiles).set({ likesCount: sql`GREATEST(${profiles.likesCount} - 1, 0)` }).where(eq(profiles.id, targetId));
    }
    return true;
  }

  async isLiked(userId: string, targetId: string): Promise<boolean> {
    const result = await db.select().from(likes).where(
      and(eq(likes.userId, userId), eq(likes.targetId, targetId))
    );
    return result.length > 0;
  }

  // Reviews
  async getReviews(targetId: string): Promise<Review[]> {
    return db.select().from(reviews).where(eq(reviews.targetId, targetId)).orderBy(desc(reviews.createdAt));
  }

  async createReview(data: InsertReview): Promise<Review> {
    const [review] = await db.insert(reviews).values(data).returning();
    const allReviews = await this.getReviews(data.targetId);
    const avgRating = allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length;
    await db.update(profiles).set({
      reviewsCount: allReviews.length,
      rating: Math.round(avgRating * 10) / 10,
    }).where(eq(profiles.id, data.targetId));
    return review;
  }

  async deleteReview(id: string): Promise<boolean> {
    const result = await db.delete(reviews).where(eq(reviews.id, id)).returning();
    return result.length > 0;
  }

  // Payment Methods
  async getPaymentMethods(userId: string): Promise<PaymentMethod[]> {
    return db.select().from(paymentMethods).where(eq(paymentMethods.userId, userId)).orderBy(desc(paymentMethods.createdAt));
  }

  async createPaymentMethod(data: InsertPaymentMethod): Promise<PaymentMethod> {
    if (data.isDefault) {
      await db.update(paymentMethods).set({ isDefault: false }).where(eq(paymentMethods.userId, data.userId));
    }
    const [method] = await db.insert(paymentMethods).values(data).returning();
    return method;
  }

  async deletePaymentMethod(id: string): Promise<boolean> {
    const result = await db.delete(paymentMethods).where(eq(paymentMethods.id, id)).returning();
    return result.length > 0;
  }

  async setDefaultPaymentMethod(userId: string, methodId: string): Promise<PaymentMethod | undefined> {
    await db.update(paymentMethods).set({ isDefault: false }).where(eq(paymentMethods.userId, userId));
    const [method] = await db.update(paymentMethods).set({ isDefault: true }).where(eq(paymentMethods.id, methodId)).returning();
    return method;
  }

  // Transactions
  async getTransactions(userId: string): Promise<Transaction[]> {
    return db.select().from(transactions).where(eq(transactions.userId, userId)).orderBy(desc(transactions.createdAt));
  }

  async createTransaction(data: InsertTransaction): Promise<Transaction> {
    const [tx] = await db.insert(transactions).values(data).returning();
    return tx;
  }

  // Wallet
  async getWallet(userId: string): Promise<Wallet | undefined> {
    const [wallet] = await db.select().from(wallets).where(eq(wallets.userId, userId));
    return wallet;
  }

  async addFunds(userId: string, amount: number): Promise<Wallet> {
    let [wallet] = await db.select().from(wallets).where(eq(wallets.userId, userId));
    if (!wallet) {
      [wallet] = await db.insert(wallets).values({ userId, balance: String(amount) }).returning();
    } else {
      [wallet] = await db.update(wallets).set({
        balance: sql`${wallets.balance} + ${amount}`,
        updatedAt: new Date(),
      }).where(eq(wallets.userId, userId)).returning();
    }
    await this.createTransaction({
      userId, type: "credit", amount: String(amount), description: "Wallet top-up", category: "wallet", status: "completed",
    });
    return wallet;
  }

  async deductFunds(userId: string, amount: number, description: string): Promise<Wallet | null> {
    const [wallet] = await db.select().from(wallets).where(eq(wallets.userId, userId));
    if (!wallet || Number(wallet.balance || 0) < amount) return null;

    const [updated] = await db.update(wallets).set({
      balance: sql`${wallets.balance} - ${amount}`,
      updatedAt: new Date(),
    }).where(eq(wallets.userId, userId)).returning();

    await this.createTransaction({
      userId, type: "debit", amount: String(amount), description, category: "payment", status: "completed",
    });
    return updated;
  }

  // Members (followers that are users)
  async getMembers(profileId: string): Promise<User[]> {
    const followerRecords = await db.select().from(follows).where(eq(follows.targetId, profileId));
    if (followerRecords.length === 0) return [];
    const userIds = followerRecords.map(f => f.followerId);
    const members: User[] = [];
    for (const uid of userIds) {
      const user = await this.getUser(uid);
      if (user) members.push(user);
    }
    return members;
  }

  // === Sponsors ===
  async getSponsor(id: string): Promise<Sponsor | undefined> {
    const [s] = await db.select().from(sponsors).where(eq(sponsors.id, id));
    return s;
  }

  async getAllSponsors(): Promise<Sponsor[]> {
    return db.select().from(sponsors).where(eq(sponsors.status, "active")).orderBy(desc(sponsors.createdAt));
  }

  async createSponsor(data: InsertSponsor): Promise<Sponsor> {
    const [s] = await db.insert(sponsors).values(data).returning();
    return s;
  }

  async updateSponsor(id: string, data: Partial<Sponsor>): Promise<Sponsor | undefined> {
    const [s] = await db.update(sponsors).set(data).where(eq(sponsors.id, id)).returning();
    return s;
  }

  async deleteSponsor(id: string): Promise<boolean> {
    const result = await db.update(sponsors).set({ status: "archived" }).where(eq(sponsors.id, id)).returning();
    return result.length > 0;
  }

  // Event Sponsors
  async getEventSponsors(eventId: string): Promise<(EventSponsor & { sponsor?: Sponsor })[]> {
    const es = await db.select().from(eventSponsors).where(eq(eventSponsors.eventId, eventId)).orderBy(desc(eventSponsors.logoPriority));
    const results = [];
    for (const e of es) {
      const sponsor = await this.getSponsor(e.sponsorId);
      results.push({ ...e, sponsor });
    }
    return results;
  }

  async addEventSponsor(eventId: string, sponsorId: string, tier: string): Promise<EventSponsor> {
    const [es] = await db.insert(eventSponsors).values({ eventId, sponsorId, tier }).returning();
    return es;
  }

  async removeEventSponsor(id: string): Promise<boolean> {
    const result = await db.delete(eventSponsors).where(eq(eventSponsors.id, id)).returning();
    return result.length > 0;
  }

  // Sponsor Placements
  async getActivePlacements(placementType?: string): Promise<(SponsorPlacement & { sponsor?: Sponsor })[]> {
    const now = new Date();
    let query = db.select().from(sponsorPlacements);
    const placements = placementType
      ? await query.where(and(eq(sponsorPlacements.placementType, placementType), lte(sponsorPlacements.startDate!, now), gte(sponsorPlacements.endDate!, now))).orderBy(desc(sponsorPlacements.weight))
      : await query.orderBy(desc(sponsorPlacements.weight));
    const results = [];
    for (const p of placements) {
      const sponsor = await this.getSponsor(p.sponsorId);
      results.push({ ...p, sponsor });
    }
    return results;
  }

  async createPlacement(data: Partial<SponsorPlacement>): Promise<SponsorPlacement> {
    const [p] = await db.insert(sponsorPlacements).values(data as any).returning();
    return p;
  }

  // === Perks ===
  async getPerk(id: string): Promise<Perk | undefined> {
    const [p] = await db.select().from(perks).where(eq(perks.id, id));
    return p;
  }

  async getAllPerks(): Promise<Perk[]> {
    return db.select().from(perks).where(eq(perks.status, "active")).orderBy(desc(perks.createdAt));
  }

  async getPerksByCategory(category: string): Promise<Perk[]> {
    return db.select().from(perks).where(and(eq(perks.status, "active"), eq(perks.category!, category))).orderBy(desc(perks.createdAt));
  }

  async createPerk(data: InsertPerk): Promise<Perk> {
    const [p] = await db.insert(perks).values(data).returning();
    return p;
  }

  async updatePerk(id: string, data: Partial<Perk>): Promise<Perk | undefined> {
    const [p] = await db.update(perks).set({ ...data, updatedAt: new Date() }).where(eq(perks.id, id)).returning();
    return p;
  }

  async deletePerk(id: string): Promise<boolean> {
    const result = await db.update(perks).set({ status: "archived" }).where(eq(perks.id, id)).returning();
    return result.length > 0;
  }

  // Perk Redemptions
  async redeemPerk(perkId: string, userId: string, transactionId?: string): Promise<PerkRedemption | null> {
    const perk = await this.getPerk(perkId);
    if (!perk || perk.status !== "active") return null;

    if (perk.usageLimit && (perk.usedCount || 0) >= perk.usageLimit) return null;

    const userRedemptions = await db.select().from(perkRedemptions).where(
      and(eq(perkRedemptions.perkId, perkId), eq(perkRedemptions.userId, userId))
    );
    if (perk.perUserLimit && userRedemptions.length >= perk.perUserLimit) return null;

    const [redemption] = await db.insert(perkRedemptions).values({ perkId, userId, transactionId }).returning();
    await db.update(perks).set({ usedCount: sql`${perks.usedCount} + 1` }).where(eq(perks.id, perkId));
    return redemption;
  }

  async getUserRedemptions(userId: string): Promise<(PerkRedemption & { perk?: Perk })[]> {
    const redemptions = await db.select().from(perkRedemptions).where(eq(perkRedemptions.userId, userId)).orderBy(desc(perkRedemptions.redeemedAt));
    const results = [];
    for (const r of redemptions) {
      const perk = await this.getPerk(r.perkId);
      results.push({ ...r, perk });
    }
    return results;
  }

  // === Memberships ===
  async getMembership(userId: string): Promise<Membership | undefined> {
    const [m] = await db.select().from(memberships).where(and(eq(memberships.userId, userId), eq(memberships.status, "active"))).orderBy(desc(memberships.createdAt));
    return m;
  }

  async createMembership(data: InsertMembership): Promise<Membership> {
    const [m] = await db.insert(memberships).values(data).returning();
    return m;
  }

  async updateMembership(id: string, data: Partial<Membership>): Promise<Membership | undefined> {
    const [m] = await db.update(memberships).set(data).where(eq(memberships.id, id)).returning();
    return m;
  }

  // === Notifications ===
  async getNotifications(userId: string): Promise<Notification[]> {
    return db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt));
  }

  async getUnreadCount(userId: string): Promise<number> {
    const result = await db.select().from(notifications).where(
      and(eq(notifications.userId, userId), eq(notifications.isRead, false))
    );
    return result.length;
  }

  async createNotification(data: InsertNotification): Promise<Notification> {
    const [n] = await db.insert(notifications).values(data).returning();
    return n;
  }

  async markNotificationRead(id: string): Promise<Notification | undefined> {
    const [n] = await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, id)).returning();
    return n;
  }

  async markAllNotificationsRead(userId: string): Promise<boolean> {
    await db.update(notifications).set({ isRead: true }).where(eq(notifications.userId, userId));
    return true;
  }

  async deleteNotification(id: string): Promise<boolean> {
    const result = await db.delete(notifications).where(eq(notifications.id, id)).returning();
    return result.length > 0;
  }

  // === Tickets ===
  async getTickets(userId: string): Promise<Ticket[]> {
    return db.select().from(tickets).where(eq(tickets.userId, userId)).orderBy(desc(tickets.createdAt));
  }

  async getTicket(id: string): Promise<Ticket | undefined> {
    const [t] = await db.select().from(tickets).where(eq(tickets.id, id));
    return t;
  }

  async createTicket(data: InsertTicket): Promise<Ticket> {
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

  async cancelTicket(id: string): Promise<Ticket | undefined> {
    const [t] = await db.update(tickets).set({ status: "cancelled" }).where(eq(tickets.id, id)).returning();
    return t;
  }

  async getTicketByCode(code: string): Promise<Ticket | undefined> {
    const [t] = await db.select().from(tickets).where(eq(tickets.ticketCode, code));
    return t;
  }

  async scanTicket(id: string, scannedBy: string): Promise<Ticket | undefined> {
    const [t] = await db.update(tickets).set({
      status: "used",
      scannedAt: new Date(),
      scannedBy,
    }).where(eq(tickets.id, id)).returning();
    return t;
  }

  async getAllTickets(): Promise<Ticket[]> {
    return db.select().from(tickets).orderBy(desc(tickets.createdAt));
  }

  async getTicketsByEvent(eventId: string): Promise<Ticket[]> {
    return db.select().from(tickets).where(eq(tickets.eventId, eventId)).orderBy(desc(tickets.createdAt));
  }

  async getTicketCount(userId: string): Promise<number> {
    const result = await db.select().from(tickets).where(
      and(eq(tickets.userId, userId), eq(tickets.status, "confirmed"))
    );
    return result.length;
  }

  async backfillQRCodes(): Promise<number> {
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
}

export const storage = new DatabaseStorage();

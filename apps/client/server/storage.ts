import { users, subscriptions, installations, supportTickets, referrals, rewards, reminders, waterUsage, ecoImpact } from "@shared/schema";
import type { 
  User, Subscription, Installation, SupportTicket, InsertUser, Referral, Reward, 
  Reminder, InsertReminder, WaterUsage, EcoImpact, InsertWaterUsage, InsertEcoImpact 
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";
import { nanoid } from "nanoid";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserProfile(id: number, data: { username: string; phone: string; address: string | null }): Promise<User>;

  // Subscription
  getSubscription(userId: number): Promise<Subscription | undefined>;
  createSubscription(subscription: Omit<Subscription, "id">): Promise<Subscription>;
  updateSubscription(id: number, data: Partial<Subscription>): Promise<Subscription>;

  // Installation
  getInstallation(userId: number): Promise<Installation | undefined>;
  createInstallation(installation: Omit<Installation, "id">): Promise<Installation>;
  updateInstallation(id: number, status: string): Promise<Installation>;

  // Support
  getSupportTickets(userId: number): Promise<SupportTicket[]>;
  createSupportTicket(ticket: Omit<SupportTicket, "id">): Promise<SupportTicket>;
  updateSupportTicket(id: number, status: string): Promise<SupportTicket>;

  // New referral methods
  getUserByReferralCode(code: string): Promise<User | undefined>;
  getReferrals(userId: number): Promise<Referral[]>;
  createReferral(referral: Omit<Referral, "id">): Promise<Referral>;
  getRewards(userId: number): Promise<Reward[]>;
  createReward(reward: Omit<Reward, "id">): Promise<Reward>;
  updateReward(id: number, status: string): Promise<Reward>;

  // Reminders
  getReminders(userId: number): Promise<Reminder[]>;
  getPendingReminders(): Promise<Reminder[]>;
  createReminder(reminder: Omit<InsertReminder, "id">): Promise<Reminder>;
  updateReminderStatus(id: number, status: string): Promise<Reminder>;

  // Water Usage & Eco Impact
  getWaterUsage(userId: number, startDate?: Date, endDate?: Date): Promise<WaterUsage[]>;
  recordWaterUsage(usage: Omit<InsertWaterUsage, "id">): Promise<WaterUsage>;
  getEcoImpact(userId: number): Promise<EcoImpact | undefined>;
  createOrUpdateEcoImpact(impact: Omit<InsertEcoImpact, "id" | "lastCalculatedAt">): Promise<EcoImpact>;
  calculateEcoImpact(userId: number): Promise<EcoImpact>;

  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const referralCode = nanoid(8);
    const [user] = await db
      .insert(users)
      .values({ ...insertUser, referralCode })
      .returning();
    return user;
  }
  
  async updateUserProfile(id: number, data: { username: string; phone: string; address: string | null }): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  async getSubscription(userId: number): Promise<Subscription | undefined> {
    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId));
    return subscription;
  }

  async createSubscription(subscription: Omit<Subscription, "id">): Promise<Subscription> {
    const [created] = await db
      .insert(subscriptions)
      .values(subscription)
      .returning();
    return created;
  }

  async updateSubscription(id: number, data: Partial<Subscription>): Promise<Subscription> {
    const [updated] = await db
      .update(subscriptions)
      .set(data)
      .where(eq(subscriptions.id, id))
      .returning();
    return updated;
  }

  async getInstallation(userId: number): Promise<Installation | undefined> {
    const [installation] = await db
      .select()
      .from(installations)
      .where(eq(installations.userId, userId));
    return installation;
  }

  async createInstallation(installation: Omit<Installation, "id">): Promise<Installation> {
    const [created] = await db
      .insert(installations)
      .values(installation)
      .returning();
    return created;
  }

  async updateInstallation(id: number, status: string): Promise<Installation> {
    const [updated] = await db
      .update(installations)
      .set({ status })
      .where(eq(installations.id, id))
      .returning();
    return updated;
  }

  async getSupportTickets(userId: number): Promise<SupportTicket[]> {
    return db
      .select()
      .from(supportTickets)
      .where(eq(supportTickets.userId, userId));
  }

  async createSupportTicket(ticket: Omit<SupportTicket, "id">): Promise<SupportTicket> {
    const [created] = await db
      .insert(supportTickets)
      .values(ticket)
      .returning();
    return created;
  }

  async updateSupportTicket(id: number, status: string): Promise<SupportTicket> {
    const [updated] = await db
      .update(supportTickets)
      .set({ status })
      .where(eq(supportTickets.id, id))
      .returning();
    return updated;
  }

  async getUserByReferralCode(code: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.referralCode, code));
    return user;
  }

  async getReferrals(userId: number): Promise<Referral[]> {
    return db.select().from(referrals).where(eq(referrals.referrerId, userId));
  }

  async createReferral(referral: Omit<Referral, "id">): Promise<Referral> {
    const [created] = await db.insert(referrals).values(referral).returning();
    return created;
  }

  async getRewards(userId: number): Promise<Reward[]> {
    return db.select().from(rewards).where(eq(rewards.userId, userId));
  }

  async createReward(reward: Omit<Reward, "id">): Promise<Reward> {
    const [created] = await db.insert(rewards).values(reward).returning();
    return created;
  }

  async updateReward(id: number, status: string): Promise<Reward> {
    const [updated] = await db
      .update(rewards)
      .set({ status })
      .where(eq(rewards.id, id))
      .returning();
    return updated;
  }

  // Reminder methods
  async getReminders(userId: number): Promise<Reminder[]> {
    // Use the pool directly with the correct column name (userId)
    const result = await pool.query(
      `SELECT * FROM reminders WHERE "userId" = $1`,
      [userId]
    );
    return result.rows as Reminder[];
  }

  async getPendingReminders(): Promise<Reminder[]> {
    // Use the pool directly to run raw SQL
    const result = await pool.query(
      `SELECT * FROM reminders WHERE status = 'pending'`
    );
    return result.rows as Reminder[];
  }

  async createReminder(reminder: Omit<InsertReminder, "id">): Promise<Reminder> {
    const [created] = await db
      .insert(reminders)
      .values(reminder)
      .returning();
    return created;
  }

  async updateReminderStatus(id: number, status: string): Promise<Reminder> {
    const [updated] = await db
      .update(reminders)
      .set({ status })
      .where(eq(reminders.id, id))
      .returning();
    return updated;
  }

  // Water Usage methods
  async getWaterUsage(userId: number, startDate?: Date, endDate?: Date): Promise<WaterUsage[]> {
    // Basic query with user filter
    let query = db.select().from(waterUsage).where(eq(waterUsage.userId, userId));
    
    // Use raw SQL query for date filtering if needed
    if (startDate || endDate) {
      let sqlQuery = `SELECT * FROM water_usage WHERE "userId" = $1`;
      const params: any[] = [userId];
      
      if (startDate) {
        sqlQuery += ` AND "date" >= $${params.length + 1}`;
        params.push(startDate);
      }
      
      if (endDate) {
        sqlQuery += ` AND "date" <= $${params.length + 1}`;
        params.push(endDate);
      }
      
      const result = await pool.query(sqlQuery, params);
      return result.rows as WaterUsage[];
    }
    
    return query;
  }

  async recordWaterUsage(usage: Omit<InsertWaterUsage, "id">): Promise<WaterUsage> {
    const now = new Date();
    const [created] = await db
      .insert(waterUsage)
      .values({
        ...usage,
        createdAt: now,
        updatedAt: now,
      })
      .returning();
    return created;
  }

  // Eco Impact methods
  async getEcoImpact(userId: number): Promise<EcoImpact | undefined> {
    const [impact] = await db
      .select()
      .from(ecoImpact)
      .where(eq(ecoImpact.userId, userId));
    return impact;
  }

  async createOrUpdateEcoImpact(impact: Omit<InsertEcoImpact, "id" | "lastCalculatedAt">): Promise<EcoImpact> {
    // Check if eco impact exists for user
    const existingImpact = await this.getEcoImpact(impact.userId);
    const now = new Date();
    
    if (existingImpact) {
      // Update existing record
      const [updated] = await db
        .update(ecoImpact)
        .set({
          ...impact,
          lastCalculatedAt: now,
        })
        .where(eq(ecoImpact.id, existingImpact.id))
        .returning();
      return updated;
    } else {
      // Create new record
      const [created] = await db
        .insert(ecoImpact)
        .values({
          ...impact,
          lastCalculatedAt: now,
        })
        .returning();
      return created;
    }
  }

  async calculateEcoImpact(userId: number): Promise<EcoImpact> {
    // Get all water usage records for this user
    const usageRecords = await this.getWaterUsage(userId);
    
    // Calculation constants
    const BOTTLES_PER_LITRE = 2; // 500ml bottles per litre
    const CO2_PER_BOTTLE = 0.082; // kg of CO2 per plastic bottle
    const WATER_SAVINGS_MULTIPLIER = 3; // RO systems use less water in production vs bottled
    
    // Calculate total litres used
    const totalLitresUsed = usageRecords.reduce(
      (total, record) => total + Number(record.litresUsed), 
      0
    );
    
    // Calculate impact metrics
    const plasticBottlesSaved = Math.round(totalLitresUsed * BOTTLES_PER_LITRE);
    const co2Reduced = (plasticBottlesSaved * CO2_PER_BOTTLE).toFixed(2);
    const waterSaved = (totalLitresUsed * WATER_SAVINGS_MULTIPLIER).toFixed(2);
    
    // Create or update the eco impact record
    return this.createOrUpdateEcoImpact({
      userId,
      plasticBottlesSaved,
      co2Reduced,
      waterSaved,
    });
  }
}

export const storage = new DatabaseStorage();
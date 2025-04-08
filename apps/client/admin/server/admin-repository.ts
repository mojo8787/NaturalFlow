import { eq, and, desc, sql } from 'drizzle-orm';
import { db } from './db';
import { 
  users, subscriptions, installations, supportTickets, 
  adminUsers, adminActivityLogs,
  InsertAdminUser, InsertAdminActivityLog,
  AdminUser
} from '@shared/schema';

export class AdminRepository {
  // User management
  async getAllUsers() {
    return db.select().from(users).orderBy(desc(users.id));
  }
  
  async getUserWithDetails(userId: number) {
    // Get user with their subscription, installation, and tickets
    const user = await db.select().from(users).where(eq(users.id, userId));
    const subscription = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId));
    const installation = await db.select().from(installations).where(eq(installations.userId, userId));
    const tickets = await db.select().from(supportTickets).where(eq(supportTickets.userId, userId));
    
    return { user: user[0], subscription: subscription[0], installation: installation[0], tickets };
  }
  
  // Installation management
  async getPendingInstallations() {
    return db.select({
      installation: installations,
      user: {
        username: users.username,
        phone: users.phone,
        address: users.address
      }
    })
    .from(installations)
    .innerJoin(users, eq(installations.userId, users.id))
    .where(eq(installations.status, 'pending'))
    .orderBy(installations.scheduledDate);
  }
  
  async updateInstallationStatus(id: number, status: string, technicianNotes?: string) {
    return db.update(installations)
      .set({ 
        status, 
        notes: technicianNotes
      })
      .where(eq(installations.id, id))
      .returning();
  }
  
  // Support ticket management
  async getOpenSupportTickets() {
    return db.select({
      ticket: supportTickets,
      user: {
        username: users.username,
        phone: users.phone
      }
    })
    .from(supportTickets)
    .innerJoin(users, eq(supportTickets.userId, users.id))
    .where(eq(supportTickets.status, 'open'))
    .orderBy(supportTickets.createdAt);
  }

  async updateSupportTicketStatus(id: number, status: string) {
    return db.update(supportTickets)
      .set({ status })
      .where(eq(supportTickets.id, id))
      .returning();
  }
  
  // Admin user management
  async getAdminByUsername(username: string) {
    const results = await db.select()
      .from(adminUsers)
      .where(eq(adminUsers.username, username));
    return results[0];
  }
  
  async getAdminById(id: number) {
    const results = await db.select()
      .from(adminUsers)
      .where(eq(adminUsers.id, id));
    return results[0];
  }
  
  async createAdminUser(data: InsertAdminUser) {
    const [admin] = await db.insert(adminUsers)
      .values(data)
      .returning();
    return admin;
  }

  async updateLastLogin(id: number) {
    return db.update(adminUsers)
      .set({ lastLogin: new Date() })
      .where(eq(adminUsers.id, id))
      .returning();
  }
  
  // Activity logging
  async logAdminActivity(data: InsertAdminActivityLog) {
    return db.insert(adminActivityLogs)
      .values(data)
      .returning();
  }
  
  // Dashboard statistics
  async getDashboardStats() {
    const userCount = await db.select({ count: sql<number>`count(*)` }).from(users);
    const activeSubscriptions = await db.select({ count: sql<number>`count(*)` })
      .from(subscriptions)
      .where(eq(subscriptions.status, 'active'));
    const pendingInstallations = await db.select({ count: sql<number>`count(*)` })
      .from(installations)
      .where(eq(installations.status, 'pending'));
    const openTickets = await db.select({ count: sql<number>`count(*)` })
      .from(supportTickets)
      .where(eq(supportTickets.status, 'open'));
      
    return {
      totalUsers: userCount[0].count,
      activeSubscriptions: activeSubscriptions[0].count,
      pendingInstallations: pendingInstallations[0].count,
      openTickets: openTickets[0].count
    };
  }
}

export const adminRepository = new AdminRepository();
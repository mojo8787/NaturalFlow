import { pgTable, text, serial, integer, boolean, timestamp, decimal, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  phone: text("phone").notNull(),
  address: text("address"),
  coordinates: text("coordinates"),
  city: text("city"),
  state: text("state"),
  country: text("country"),
  zipCode: text("zip_code"),
  referralCode: text("referral_code").unique(), // unique code for each user
  email: text("email"), // Added for Stripe integration
});

export const referrals = pgTable("referrals", {
  id: serial("id").primaryKey(),
  referrerId: integer("referrer_id").notNull(), // user who referred
  referredId: integer("referred_id").notNull(), // user who was referred
  status: text("status").notNull(), // pending, completed
  createdAt: timestamp("created_at").notNull(),
});

export const rewards = pgTable("rewards", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  referralId: integer("referral_id").notNull(),
  discountAmount: integer("discount_amount").notNull(), // in JOD
  status: text("status").notNull(), // active, used, expired
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull(),
});

export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  status: text("status").notNull(), // active, pending, cancelled
  startDate: timestamp("start_date").notNull(),
  nextBillingDate: timestamp("next_billing_date").notNull(),
  stripeCustomerId: text("stripe_customer_id"), // Stripe customer ID
  stripeSubscriptionId: text("stripe_subscription_id"), // Stripe subscription ID
});

export const installations = pgTable("installations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  scheduledDate: timestamp("scheduled_date").notNull(),
  status: text("status").notNull(), // scheduled, completed, cancelled
  notes: text("notes"),
});

export const supportTickets = pgTable("support_tickets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull(), // open, in_progress, resolved
  createdAt: timestamp("created_at").notNull(),
  imageUrl: text("image_url"), // URL to the uploaded image
});

export const reminders = pgTable("reminders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(), // installation, service, payment, filter_replacement
  title: text("title").notNull(),
  message: text("message").notNull(),
  scheduledDate: timestamp("scheduled_date").notNull(),
  status: text("status").notNull(), // pending, sent, read
  createdAt: timestamp("created_at").notNull(),
});

// New table for water usage tracking
export const waterUsage = pgTable("water_usage", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  date: timestamp("date").notNull(),
  litresUsed: text("litres_used").notNull(), // Daily water usage in litres (stored as text to handle decimal)
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

// New table for eco-impact statistics 
export const ecoImpact = pgTable("eco_impact", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  plasticBottlesSaved: integer("plastic_bottles_saved").notNull(), // 500ml bottles
  co2Reduced: text("co2_reduced").notNull(), // kg of CO2 (stored as text to handle decimal)
  waterSaved: text("water_saved").notNull(), // litres of water saved (stored as text to handle decimal)
  lastCalculatedAt: timestamp("last_calculated_at").notNull(),
});

// Admin tables
export const adminUsers = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").notNull().default("admin"), // admin, super_admin, support, technician
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const adminActivityLogs = pgTable("admin_activity_logs", {
  id: serial("id").primaryKey(),
  adminId: integer("admin_id").references(() => adminUsers.id),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(), // user, subscription, installation, etc.
  entityId: integer("entity_id"),
  details: jsonb("details"),
  ipAddress: text("ip_address"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  phone: true,
  address: true,
  coordinates: true,
  city: true,
  state: true,
  country: true,
  zipCode: true,
  referralCode: true,
});

export const insertReferralSchema = createInsertSchema(referrals);
export const insertRewardSchema = createInsertSchema(rewards);

export const insertSubscriptionSchema = createInsertSchema(subscriptions);
export const insertInstallationSchema = createInsertSchema(installations);
export const insertSupportTicketSchema = createInsertSchema(supportTickets);
export const insertReminderSchema = createInsertSchema(reminders);
export const insertWaterUsageSchema = createInsertSchema(waterUsage);
export const insertEcoImpactSchema = createInsertSchema(ecoImpact);

// Admin insert schemas
export const insertAdminUserSchema = createInsertSchema(adminUsers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastLogin: true
});
export const insertAdminActivityLogSchema = createInsertSchema(adminActivityLogs).omit({
  id: true,
  createdAt: true
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Referral = typeof referrals.$inferSelect;
export type Reward = typeof rewards.$inferSelect;
export type Subscription = typeof subscriptions.$inferSelect;
export type Installation = typeof installations.$inferSelect;
export type SupportTicket = typeof supportTickets.$inferSelect;
export type Reminder = typeof reminders.$inferSelect;
export type InsertReminder = z.infer<typeof insertReminderSchema>;
export type WaterUsage = typeof waterUsage.$inferSelect;
export type EcoImpact = typeof ecoImpact.$inferSelect;
export type InsertWaterUsage = z.infer<typeof insertWaterUsageSchema>;
export type InsertEcoImpact = z.infer<typeof insertEcoImpactSchema>;

// Admin types
export type AdminUser = typeof adminUsers.$inferSelect;
export type InsertAdminUser = z.infer<typeof insertAdminUserSchema>;
export type AdminActivityLog = typeof adminActivityLogs.$inferSelect;
export type InsertAdminActivityLog = z.infer<typeof insertAdminActivityLogSchema>;
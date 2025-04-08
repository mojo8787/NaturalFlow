import express, { type Express, type Request } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { 
  insertSubscriptionSchema, insertInstallationSchema, insertSupportTicketSchema, 
  insertReferralSchema, insertRewardSchema, insertReminderSchema, insertWaterUsageSchema, insertEcoImpactSchema,
  installations, supportTickets, reminders, waterUsage, ecoImpact
} from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from "fs";

// Import payment gateways
import Stripe from "stripe";
import zaincashRoutes from "./routes/zaincash";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY environment variable is required');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create uploads directory if it doesn't exist
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads
const storage2 = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage2,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);
  
  // Register Zain Cash routes
  app.use(zaincashRoutes);

  // User profile route
  app.patch("/api/user/profile", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const userId = req.user.id;
    
    try {
      // Validate request body
      const { username, phone, address } = req.body;
      
      if (!username || !phone) {
        return res.status(400).json({ message: "Username and phone are required" });
      }
      
      // Update user profile
      const updatedUser = await storage.updateUserProfile(userId, {
        username,
        phone,
        address: address || null,
      });
      
      // Update the session user
      req.login(updatedUser, (err) => {
        if (err) return res.status(500).json({ message: "Failed to update session" });
        res.json(updatedUser);
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // New referral routes
  app.get("/api/referral-code", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const user = await storage.getUser(req.user.id);
    res.json({ referralCode: user?.referralCode });
  });

  app.get("/api/referrals", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const referrals = await storage.getReferrals(req.user.id);
    res.json(referrals);
  });

  app.post("/api/referrals", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const { code } = req.body;

    // Find referrer by code
    const referrer = await storage.getUserByReferralCode(code);
    if (!referrer) {
      return res.status(404).json({ message: "Invalid referral code" });
    }

    // Can't refer yourself
    if (referrer.id === req.user.id) {
      return res.status(400).json({ message: "Cannot use your own referral code" });
    }

    // Create referral
    const referral = await storage.createReferral({
      referrerId: referrer.id,
      referredId: req.user.id,
      status: "completed",
      createdAt: new Date(),
    });

    // Create reward for referrer (25 JOD discount)
    const reward = await storage.createReward({
      userId: referrer.id,
      referralId: referral.id,
      discountAmount: 25,
      status: "active",
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      createdAt: new Date(),
    });

    res.status(201).json({ referral, reward });
  });

  app.get("/api/rewards", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const rewards = await storage.getRewards(req.user.id);
    res.json(rewards);
  });

  // Subscription routes
  app.get("/api/subscription", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const subscription = await storage.getSubscription(req.user.id);
    res.json(subscription || null);
  });

  app.post("/api/subscription", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      // Get the data from the request body
      const subscriptionData = {
        userId: req.user.id,
        status: req.body.status || "active",
        startDate: new Date(req.body.startDate) || new Date(),
        nextBillingDate: new Date(req.body.nextBillingDate) || (() => {
          const date = new Date();
          date.setMonth(date.getMonth() + 1);
          return date;
        })(),
        stripeCustomerId: req.body.stripeCustomerId || null,
        stripeSubscriptionId: req.body.stripeSubscriptionId || null
      };
      
      const subscription = await storage.createSubscription(subscriptionData);
      
      // Create reminders for monthly service
      try {
        // Next month service reminder
        const nextServiceDate = new Date();
        nextServiceDate.setMonth(nextServiceDate.getMonth() + 1);
        
        // Reminder 3 days before the service
        const reminderDate = new Date(nextServiceDate);
        reminderDate.setDate(reminderDate.getDate() - 3);
        
        await storage.createReminder({
          userId: req.user.id,
          type: "maintenance",
          title: "Monthly Service Reminder",
          message: `Your monthly water filtration system service is scheduled in 3 days. Please ensure access to your system.`,
          scheduledDate: reminderDate,
          status: "pending",
          createdAt: new Date()
        });
        
        // Also create a payment reminder (e.g., 5 days before the end of month)
        const paymentDate = new Date();
        paymentDate.setMonth(paymentDate.getMonth() + 1);
        paymentDate.setDate(paymentDate.getDate() - 5); // 5 days before next billing cycle
        
        await storage.createReminder({
          userId: req.user.id,
          type: "payment",
          title: "Monthly Subscription Payment",
          message: `Your monthly subscription payment of 25 JOD will be processed in 5 days. Please ensure your payment method is up to date.`,
          scheduledDate: paymentDate,
          status: "pending",
          createdAt: new Date()
        });
      } catch (reminderError) {
        console.error("Failed to create subscription reminders:", reminderError);
        // Continue even if reminder creation fails
      }
      
      res.status(201).json(subscription);
    } catch (error) {
      console.error("Error creating subscription:", error);
      res.status(400).json({ message: "Failed to create subscription", error: String(error) });
    }
  });

  // Installation routes
  app.get("/api/installation", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const installation = await storage.getInstallation(req.user.id);
    res.json(installation || null);
  });

  app.post("/api/installation", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      // Create a new data object with properly typed fields
      const data = {
        userId: req.user.id,
        status: req.body.status,
        scheduledDate: new Date(req.body.scheduledDate),
        notes: req.body.notes || null // Ensure notes is null not undefined
      } as const;
      
      const installation = await storage.createInstallation(data);
      
      // Create a reminder for the installation appointment
      try {
        // Create reminder for 1 day before the installation
        const reminderDate = new Date(req.body.scheduledDate);
        reminderDate.setDate(reminderDate.getDate() - 1); // 1 day before installation
        
        await storage.createReminder({
          userId: req.user.id,
          type: "installation",
          title: "Installation Appointment Reminder",
          message: `Your water filtration system installation is scheduled for tomorrow. Please ensure someone is available at your location.`,
          scheduledDate: reminderDate,
          status: "pending",
          createdAt: new Date()
        });
      } catch (reminderError) {
        console.error("Failed to create installation reminder:", reminderError);
        // Continue even if reminder creation fails
      }
      
      res.status(201).json(installation);
    } catch (error) {
      console.error("Error creating installation:", error);
      res.status(400).json({ message: "Failed to create installation", error: String(error) });
    }
  });

  // Support ticket routes
  app.get("/api/support-tickets", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const tickets = await storage.getSupportTickets(req.user.id);
    res.json(tickets);
  });

  // Serve uploaded files
  // Serve static files from uploads directory
  app.use('/uploads', (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    next();
  }, express.static(uploadDir as string));

  // Support ticket submission with optional image upload
  app.post("/api/support-tickets", upload.single('image'), async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      // Get the basic ticket information from the form
      const { title, description } = req.body;
      
      // Check if a file was uploaded
      const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
      
      // Create ticket with image URL if available
      const data = {
        title,
        description,
        userId: req.user.id,
        createdAt: new Date(),
        status: "open",
        imageUrl
      } as const;
      
      const ticket = await storage.createSupportTicket(data);
      res.status(201).json(ticket);
    } catch (error) {
      console.error("Error creating support ticket:", error);
      res.status(400).json({ message: "Failed to create support ticket", error: String(error) });
    }
  });

  // Reminders routes
  app.get("/api/reminders", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const userReminders = await storage.getReminders(req.user.id);
    res.json(userReminders);
  });

  app.post("/api/reminders", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      // Create new reminder
      const data = {
        userId: req.user.id,
        type: req.body.type,
        title: req.body.title,
        message: req.body.message,
        scheduledDate: new Date(req.body.scheduledDate),
        status: "pending",
        createdAt: new Date()
      } as const;
      
      const reminder = await storage.createReminder(data);
      res.status(201).json(reminder);
    } catch (error) {
      console.error("Error creating reminder:", error);
      res.status(400).json({ message: "Failed to create reminder", error: String(error) });
    }
  });

  app.patch("/api/reminders/:id/status", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      const { id } = req.params;
      const { status } = req.body;
      
      if (!id || !status || !["pending", "sent", "read"].includes(status)) {
        return res.status(400).json({ message: "Invalid reminder ID or status" });
      }
      
      const reminder = await storage.updateReminderStatus(parseInt(id), status);
      res.json(reminder);
    } catch (error) {
      console.error("Error updating reminder status:", error);
      res.status(500).json({ message: "Failed to update reminder status" });
    }
  });

  // Admin route to get all pending reminders (will be used by a cron job)
  app.get("/api/admin/reminders/pending", async (req, res) => {
    // In a production environment, you'd add admin-only authorization here
    try {
      const pendingReminders = await storage.getPendingReminders();
      res.json(pendingReminders);
    } catch (error) {
      console.error("Error fetching pending reminders:", error);
      res.status(500).json({ message: "Failed to fetch pending reminders" });
    }
  });

  // Stripe payment routes
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      // Fixed amount for monthly subscription (25 JOD)
      const amount = 2500; // amount in cents (25 JOD)
      
      // Create a PaymentIntent with the order amount and currency
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: "usd", // Using USD instead of JOD for testing
      });

      res.json({
        clientSecret: paymentIntent.client_secret,
      });
    } catch (error: any) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Create subscription endpoint
  app.post("/api/create-subscription", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      const user = req.user;
      
      // Create a customer
      const customer = await stripe.customers.create({
        email: user.email || `user${user.id}@example.com`, // Use actual email if available
        name: user.username
      });
      
      // Create a PaymentIntent instead of subscription for demo purposes
      const paymentIntent = await stripe.paymentIntents.create({
        amount: 2500, // 25 JOD in cents
        currency: "usd", // Using USD for testing
      });
      
      // Get existing subscription or create a new one for the user
      let userSubscription = await storage.getSubscription(user.id);
      
      if (userSubscription) {
        // Update existing subscription with Stripe IDs
        await storage.updateSubscription(userSubscription.id, {
          stripeCustomerId: customer.id,
          stripeSubscriptionId: `sub_demo_${Date.now()}`
        });
      } else {
        // Create a new subscription with Stripe IDs
        const today = new Date();
        const nextMonth = new Date(today);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        
        await storage.createSubscription({
          userId: user.id,
          status: "pending",
          startDate: today,
          nextBillingDate: nextMonth,
          stripeCustomerId: customer.id,
          stripeSubscriptionId: `sub_demo_${Date.now()}`
        });
      }
      
      res.json({
        subscriptionId: `sub_demo_${Date.now()}`,
        clientSecret: paymentIntent.client_secret,
      });
    } catch (error: any) {
      console.error("Error creating subscription:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Water Usage & Eco-Impact APIs
  
  // Get water usage for the authenticated user
  app.get("/api/water-usage", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      // Parse date range from query params if provided
      let startDate: Date | undefined;
      let endDate: Date | undefined;
      
      if (req.query.startDate) {
        startDate = new Date(req.query.startDate as string);
      }
      
      if (req.query.endDate) {
        endDate = new Date(req.query.endDate as string);
      }
      
      const waterUsage = await storage.getWaterUsage(req.user.id, startDate, endDate);
      res.json(waterUsage);
    } catch (error) {
      console.error("Error fetching water usage:", error);
      res.status(500).json({ message: "Failed to fetch water usage data" });
    }
  });
  
  // Record new water usage data
  app.post("/api/water-usage", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      const { litresUsed, date } = req.body;
      
      if (!litresUsed) {
        return res.status(400).json({ message: "Water usage amount is required" });
      }
      
      const waterUsageData = {
        userId: req.user.id,
        date: date ? new Date(date) : new Date(),
        litresUsed: litresUsed.toString(), // Convert to string for storage
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const waterUsage = await storage.recordWaterUsage(waterUsageData);
      
      // Recalculate eco impact stats whenever new water usage is recorded
      await storage.calculateEcoImpact(req.user.id);
      
      res.status(201).json(waterUsage);
    } catch (error) {
      console.error("Error recording water usage:", error);
      res.status(500).json({ message: "Failed to record water usage data" });
    }
  });
  
  // Get eco impact statistics
  app.get("/api/eco-impact", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      let ecoImpact = await storage.getEcoImpact(req.user.id);
      
      // If no eco impact data exists yet, calculate it
      if (!ecoImpact) {
        ecoImpact = await storage.calculateEcoImpact(req.user.id);
      }
      
      res.json(ecoImpact);
    } catch (error) {
      console.error("Error fetching eco impact data:", error);
      res.status(500).json({ message: "Failed to fetch eco impact data" });
    }
  });
  
  // Force recalculation of eco impact
  app.post("/api/eco-impact/calculate", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      const ecoImpact = await storage.calculateEcoImpact(req.user.id);
      res.json(ecoImpact);
    } catch (error) {
      console.error("Error calculating eco impact:", error);
      res.status(500).json({ message: "Failed to calculate eco impact" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
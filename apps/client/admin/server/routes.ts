import { Express, Request, Response, NextFunction } from 'express';
import { adminRepository } from './admin-repository';
import { verifyAdminToken, requireAdmin, requireSuperAdmin, setupAdminAuth } from './auth';
import { createServer } from 'http';
import { z } from 'zod';
import passport from 'passport';

// Types for admin request extension
declare global {
  namespace Express {
    interface Request {
      adminAction?: string;
      entityType?: string;
      entityId?: number;
      actionDetails?: Record<string, any>;
    }
  }
}

// Middleware to log admin activity
const logAdminActivity = async (req: Request, res: Response, next: NextFunction) => {
  const originalSend = res.send;
  
  res.send = function(body) {
    const adminId = (req.user as any)?.id;
    if (adminId && req.adminAction) {
      adminRepository.logAdminActivity({
        adminId,
        action: req.adminAction,
        entityType: req.entityType || 'unknown',
        entityId: req.entityId,
        details: req.actionDetails || {},
        ipAddress: req.ip
      });
    }
    return originalSend.call(this, body);
  };
  
  next();
};

export function registerAdminRoutes(app: Express) {
  // Set up authentication
  const { hashPassword, generateToken } = setupAdminAuth(app);
  
  // Login route
  app.post('/api/admin/login', (req, res, next) => {
    passport.authenticate('local', (err: any, admin: any, info: any) => {
      if (err) return next(err);
      if (!admin) return res.status(401).json({ message: info.message || 'Authentication failed' });
      
      req.login(admin, { session: true }, (loginErr) => {
        if (loginErr) return next(loginErr);
        
        // Generate JWT token
        const token = generateToken(admin);
        
        // Send token and admin info, excluding password
        const { password, ...adminInfo } = admin;
        return res.json({ 
          message: 'Authentication successful',
          token,
          admin: adminInfo
        });
      });
    })(req, res, next);
  });
  
  // Logout route
  app.post('/api/admin/logout', (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: 'Logout failed' });
      }
      res.json({ message: 'Logged out successfully' });
    });
  });
  
  // Apply global middleware for admin routes
  app.use('/api/admin', requireAdmin);
  app.use('/api/admin', logAdminActivity);
  
  // Dashboard statistics
  app.get('/api/admin/dashboard', async (req, res) => {
    try {
      req.adminAction = 'view_dashboard';
      const stats = await adminRepository.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      res.status(500).json({ message: 'Failed to fetch dashboard statistics' });
    }
  });
  
  // User management endpoints
  app.get('/api/admin/users', async (req, res) => {
    try {
      req.adminAction = 'view_all_users';
      const users = await adminRepository.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ message: 'Failed to fetch users' });
    }
  });
  
  app.get('/api/admin/users/:id', async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ message: 'Invalid ID parameter' });
      }
      
      req.entityType = 'user';
      req.entityId = userId;
      req.adminAction = 'view_user_details';
      
      const userDetails = await adminRepository.getUserWithDetails(userId);
      if (!userDetails.user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      res.json(userDetails);
    } catch (error) {
      console.error('Error fetching user details:', error);
      res.status(500).json({ message: 'Failed to fetch user details' });
    }
  });
  
  // Installation management endpoints
  app.get('/api/admin/installations/pending', async (req, res) => {
    try {
      req.adminAction = 'view_pending_installations';
      const installations = await adminRepository.getPendingInstallations();
      res.json(installations);
    } catch (error) {
      console.error('Error fetching pending installations:', error);
      res.status(500).json({ message: 'Failed to fetch pending installations' });
    }
  });
  
  app.patch('/api/admin/installations/:id', async (req, res) => {
    try {
      const schema = z.object({
        status: z.string(),
        technicianNotes: z.string().optional()
      });
      
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: 'Invalid input', errors: parsed.error });
      }
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid ID parameter' });
      }
      
      req.entityType = 'installation';
      req.entityId = id;
      req.adminAction = 'update_installation_status';
      req.actionDetails = { newStatus: req.body.status };
      
      const updated = await adminRepository.updateInstallationStatus(
        id, 
        req.body.status, 
        req.body.technicianNotes
      );
      
      res.json(updated);
    } catch (error) {
      console.error('Error updating installation:', error);
      res.status(500).json({ message: 'Failed to update installation' });
    }
  });
  
  // Support ticket management endpoints
  app.get('/api/admin/tickets/open', async (req, res) => {
    try {
      req.adminAction = 'view_open_tickets';
      const tickets = await adminRepository.getOpenSupportTickets();
      res.json(tickets);
    } catch (error) {
      console.error('Error fetching open tickets:', error);
      res.status(500).json({ message: 'Failed to fetch open tickets' });
    }
  });
  
  app.patch('/api/admin/tickets/:id', async (req, res) => {
    try {
      const schema = z.object({
        status: z.string()
      });
      
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: 'Invalid input', errors: parsed.error });
      }
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid ID parameter' });
      }
      
      req.entityType = 'support_ticket';
      req.entityId = id;
      req.adminAction = 'update_ticket_status';
      req.actionDetails = { newStatus: req.body.status };
      
      const updated = await adminRepository.updateSupportTicketStatus(id, req.body.status);
      res.json(updated);
    } catch (error) {
      console.error('Error updating support ticket:', error);
      res.status(500).json({ message: 'Failed to update support ticket' });
    }
  });
  
  // Admin user management (super admin only)
  app.post('/api/admin/admins', requireSuperAdmin, async (req, res) => {
    try {
      const schema = z.object({
        username: z.string(),
        email: z.string().email(),
        password: z.string().min(8),
        role: z.enum(['admin', 'super_admin', 'support', 'technician'])
      });
      
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: 'Invalid input', errors: parsed.error });
      }
      
      req.entityType = 'admin_user';
      req.adminAction = 'create_admin_user';
      req.actionDetails = { role: req.body.role };
      
      // Hash password before storing
      const hashedPassword = await hashPassword(req.body.password);
      
      const admin = await adminRepository.createAdminUser({
        ...req.body,
        password: hashedPassword
      });
      
      // Remove password from response
      const { password, ...adminWithoutPassword } = admin;
      res.status(201).json(adminWithoutPassword);
    } catch (error) {
      console.error('Error creating admin user:', error);
      res.status(500).json({ message: 'Failed to create admin user' });
    }
  });
  
  const httpServer = createServer(app);
  return httpServer;
}
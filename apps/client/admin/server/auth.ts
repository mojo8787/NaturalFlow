import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { Express, Request, Response, NextFunction } from 'express';
import session from 'express-session';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { adminRepository } from './admin-repository';
import { AdminUser } from '@shared/schema';

// Password handling
async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

async function comparePasswords(supplied: string, stored: string): Promise<boolean> {
  return bcrypt.compare(supplied, stored);
}

// JWT token creation
function generateToken(admin: AdminUser) {
  const payload = {
    id: admin.id,
    username: admin.username,
    role: admin.role
  };
  
  return jwt.sign(payload, process.env.ADMIN_JWT_SECRET || 'admin-secret-replace-in-production', {
    expiresIn: '1h' // Short lived token
  });
}

// Token verification middleware
export function verifyAdminToken(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET || 'admin-secret-replace-in-production');
    req.user = decoded as Express.User;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

// Admin authentication middleware
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  next();
};

// Middleware to require super admin role
export const requireSuperAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || (req.user as any).role !== 'super_admin') {
    return res.status(403).json({ message: 'Forbidden: Requires super admin privileges' });
  }
  next();
};

// Set up authentication
export function setupAdminAuth(app: Express) {
  // Configure express-session
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || 'session-secret-replace-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: parseInt(process.env.SESSION_EXPIRY || '3600000') // 1 hour by default
    }
  };
  
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());
  
  // Local strategy for username/password login
  passport.use(new LocalStrategy(async (username, password, done) => {
    try {
      const admin = await adminRepository.getAdminByUsername(username);
      
      if (!admin || !(await comparePasswords(password, admin.password))) {
        return done(null, false, { message: 'Invalid username or password' });
      }
      
      // Update last login time
      await adminRepository.updateLastLogin(admin.id);
      
      return done(null, admin);
    } catch (error) {
      return done(error);
    }
  }));
  
  // JWT strategy for token-based authentication
  passport.use(new JwtStrategy({
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.ADMIN_JWT_SECRET || 'admin-secret-replace-in-production'
  }, async (payload, done) => {
    try {
      const admin = await adminRepository.getAdminById(payload.id);
      
      if (!admin) {
        return done(null, false);
      }
      
      return done(null, admin);
    } catch (error) {
      return done(error);
    }
  }));
  
  // Serialization for session
  passport.serializeUser((admin: any, done) => done(null, admin.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const admin = await adminRepository.getAdminById(id);
      done(null, admin);
    } catch (error) {
      done(error);
    }
  });
  
  // Export the hash password function for use in routes
  return { hashPassword, generateToken };
}
import express from 'express';
import { json, urlencoded } from 'express';
import { registerAdminRoutes } from './routes';
import cors from 'cors';

// Create Express application
const app = express();

// Middleware
app.use(cors());
app.use(json());
app.use(urlencoded({ extended: true }));

// Security middleware
app.use((req, res, next) => {
  // Set security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Register admin routes
const server = registerAdminRoutes(app);

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'production' ? undefined : err.message
  });
});

// Start server
const PORT = process.env.ADMIN_PORT || 3001;
server.listen(PORT, () => {
  console.log(`Admin server running on port ${PORT}`);
});

// Handle server shutdown
process.on('SIGINT', () => {
  console.log('Shutting down admin server...');
  server.close(() => {
    console.log('Admin server shut down');
    process.exit(0);
  });
});
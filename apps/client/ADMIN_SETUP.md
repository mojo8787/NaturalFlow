# PureFlow Admin Dashboard

The admin dashboard provides a secure interface for administrators to manage the PureFlow water system platform. It includes user management, subscription oversight, installation scheduling, and support ticket handling.

## Features

- **User Management**: View and manage all user accounts
- **Subscription Management**: Monitor active and pending subscriptions
- **Installation Management**: Schedule and track installation appointments
- **Support System**: Handle customer support tickets
- **Admin Controls**: Manage admin access with role-based permissions
- **Activity Logging**: Track all administrative actions for security and auditing

## Technical Architecture

- **Backend**: Node.js with Express
- **Authentication**: JWT-based authentication with Passport.js
- **Database**: PostgreSQL database (shared with main application)
- **ORM**: Drizzle ORM for type-safe database interactions
- **Security**: Role-based access control, activity logging, secure password storage

## Getting Started

1. **Environment Setup**
   - Create a `.env` file in the admin directory with the following variables:
   ```
   # Admin Server Configuration
   ADMIN_PORT=3001
   NODE_ENV=development

   # Database Configuration
   DATABASE_URL=postgres://user:password@localhost:5432/pureflow

   # Security (Change these for production!)
   SESSION_SECRET=session-secret-change-this-in-production
   ADMIN_JWT_SECRET=admin-jwt-secret-change-this-in-production
   SESSION_EXPIRY=3600000  # 1 hour in milliseconds
   ```

2. **Database Setup**
   - Run the database setup script to create admin tables and default super admin:
   ```
   cd admin
   npm run setup-db
   ```
   - Default super admin credentials:
     - Username: superadmin
     - Password: Admin123!@#
   - **IMPORTANT**: Change the default password after first login!

3. **Starting the Server**
   - Development mode with hot reload:
   ```
   cd admin
   npm run dev
   ```
   - Production mode:
   ```
   cd admin
   npm run build
   npm start
   ```

## API Endpoints

| Endpoint | Method | Description | Required Role |
|----------|--------|-------------|--------------|
| `/api/admin/login` | POST | Authenticate admin user | None |
| `/api/admin/logout` | POST | Log out admin user | Any |
| `/api/admin/dashboard` | GET | Get dashboard statistics | Admin |
| `/api/admin/users` | GET | List all users | Admin |
| `/api/admin/users/:id` | GET | Get detailed user information | Admin |
| `/api/admin/installations/pending` | GET | List pending installations | Admin |
| `/api/admin/installations/:id` | PATCH | Update installation status | Admin |
| `/api/admin/tickets/open` | GET | List open support tickets | Admin |
| `/api/admin/tickets/:id` | PATCH | Update ticket status | Admin |
| `/api/admin/admins` | POST | Create new admin user | Super Admin |

## Security Considerations

- All passwords are hashed using bcrypt
- HTTPS should be enforced in production
- JWT tokens are short-lived (1 hour)
- Activity logging captures all admin actions
- Role-based access control restricts sensitive operations
- Secure HTTP headers are set automatically
- Session cookies use httpOnly and secure flags

## Admin User Roles

- **Super Admin**: Full system access, can create other admin users
- **Admin**: Standard administrative capabilities
- **Support**: Limited to customer support functions
- **Technician**: Installation management only
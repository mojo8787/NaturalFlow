# PureFlow Developer Documentation

This document provides technical details for developers working on the PureFlow application.

## Table of Contents

1. [API Documentation](#api-documentation)
2. [Database Schema Details](#database-schema-details)
3. [Frontend Component Guide](#frontend-component-guide)
4. [Authentication Implementation](#authentication-implementation)
5. [Stripe Integration Details](#stripe-integration-details)
6. [Internationalization Implementation](#internationalization-implementation)
7. [State Management](#state-management)
8. [Environment Configuration](#environment-configuration)
9. [Deployment Process](#deployment-process)
10. [Development Workflow](#development-workflow)

## API Documentation

### Authentication Endpoints

#### `POST /api/register`

Registers a new user in the system.

Request body:
```json
{
  "username": "john_doe",
  "password": "secure_password",
  "email": "john@example.com",
  "phone": "+1234567890",
  "address": "123 Main St, Anytown"
}
```

Response (201 Created):
```json
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "address": "123 Main St, Anytown",
  "referralCode": "abc123",
  "createdAt": "2025-04-07T12:00:00Z"
}
```

Error responses:
- 400 Bad Request: "Username already exists"

#### `POST /api/login`

Authenticates a user.

Request body:
```json
{
  "username": "john_doe",
  "password": "secure_password"
}
```

Response (200 OK):
```json
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "address": "123 Main St, Anytown",
  "referralCode": "abc123",
  "createdAt": "2025-04-07T12:00:00Z"
}
```

Error responses:
- 401 Unauthorized: Invalid credentials

#### `POST /api/logout`

Logs out the current user by destroying the session.

Response (200 OK): Empty response

#### `GET /api/user`

Gets the current authenticated user's information.

Response (200 OK):
```json
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "address": "123 Main St, Anytown",
  "referralCode": "abc123",
  "createdAt": "2025-04-07T12:00:00Z"
}
```

Error responses:
- 401 Unauthorized: Not authenticated

### Subscription Endpoints

#### `GET /api/subscription`

Gets the current user's subscription details.

Response (200 OK):
```json
{
  "id": 1,
  "userId": 1,
  "plan": "standard",
  "status": "active",
  "startDate": "2025-04-07T12:00:00Z",
  "endDate": "2026-04-07T12:00:00Z",
  "amount": 25,
  "currency": "JOD",
  "stripeCustomerId": "cus_123456",
  "stripeSubscriptionId": "sub_123456",
  "createdAt": "2025-04-07T12:00:00Z"
}
```

Error responses:
- 401 Unauthorized: Not authenticated
- 404 Not Found: No subscription found

#### `POST /api/subscription`

Creates a new subscription for the user.

Request body:
```json
{
  "plan": "standard",
  "amount": 25,
  "currency": "JOD"
}
```

Response (201 Created):
```json
{
  "id": 1,
  "userId": 1,
  "plan": "standard",
  "status": "active",
  "startDate": "2025-04-07T12:00:00Z",
  "endDate": "2026-04-07T12:00:00Z",
  "amount": 25,
  "currency": "JOD",
  "stripeCustomerId": "cus_123456",
  "stripeSubscriptionId": "sub_123456",
  "createdAt": "2025-04-07T12:00:00Z"
}
```

Error responses:
- 401 Unauthorized: Not authenticated
- 400 Bad Request: Invalid input

### Installation Endpoints

#### `GET /api/installation`

Gets the current user's installation details.

Response (200 OK):
```json
{
  "id": 1,
  "userId": 1,
  "status": "scheduled",
  "scheduledDate": "2025-04-15T14:00:00Z",
  "completedDate": null,
  "notes": "Please call before arrival",
  "createdAt": "2025-04-07T12:00:00Z"
}
```

Error responses:
- 401 Unauthorized: Not authenticated
- 404 Not Found: No installation found

#### `POST /api/installation`

Schedules a new installation.

Request body:
```json
{
  "scheduledDate": "2025-04-15T14:00:00Z",
  "notes": "Please call before arrival"
}
```

Response (201 Created):
```json
{
  "id": 1,
  "userId": 1,
  "status": "scheduled",
  "scheduledDate": "2025-04-15T14:00:00Z",
  "completedDate": null,
  "notes": "Please call before arrival",
  "createdAt": "2025-04-07T12:00:00Z"
}
```

Error responses:
- 401 Unauthorized: Not authenticated
- 400 Bad Request: Invalid input

### Support Endpoints

#### `GET /api/support-tickets`

Gets the current user's support tickets.

Response (200 OK):
```json
[
  {
    "id": 1,
    "userId": 1,
    "title": "Water filter issue",
    "description": "My water filter is not working correctly",
    "status": "open",
    "priority": "high",
    "createdAt": "2025-04-07T12:00:00Z"
  }
]
```

Error responses:
- 401 Unauthorized: Not authenticated

#### `POST /api/support-tickets`

Creates a new support ticket.

Request body:
```json
{
  "title": "Water filter issue",
  "description": "My water filter is not working correctly",
  "priority": "high"
}
```

Response (201 Created):
```json
{
  "id": 1,
  "userId": 1,
  "title": "Water filter issue",
  "description": "My water filter is not working correctly",
  "status": "open",
  "priority": "high",
  "createdAt": "2025-04-07T12:00:00Z"
}
```

Error responses:
- 401 Unauthorized: Not authenticated
- 400 Bad Request: Invalid input

### Payment Endpoints

#### `POST /api/create-payment-intent`

Creates a Stripe payment intent for one-time payments.

Request body:
```json
{
  "amount": 25,
  "currency": "usd"
}
```

Response (200 OK):
```json
{
  "clientSecret": "pi_123_secret_456"
}
```

Error responses:
- 401 Unauthorized: Not authenticated
- 500 Internal Server Error: Error creating payment intent

#### `POST /api/get-or-create-subscription`

Creates or retrieves a Stripe subscription.

Response (200 OK):
```json
{
  "subscriptionId": "sub_123456",
  "clientSecret": "pi_123_secret_456"
}
```

Error responses:
- 401 Unauthorized: Not authenticated
- 400 Bad Request: Error creating subscription

## Database Schema Details

### Relationships

The database schema includes the following relationships:

1. User to Subscriptions: One-to-One
   - A user can have one active subscription

2. User to Installations: One-to-Many
   - A user can have multiple installations (e.g., for different properties)

3. User to Support Tickets: One-to-Many
   - A user can create multiple support tickets

4. User to Referrals (as referrer): One-to-Many
   - A user can refer multiple people

5. User to Referrals (as referred): One-to-One
   - A user can only be referred once

6. User to Rewards: One-to-Many
   - A user can earn multiple rewards

7. User to Reminders: One-to-Many
   - A user can have multiple reminders

### Schema Implementation

The schema is implemented using Drizzle ORM. Here's an example of the users table implementation:

```typescript
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  referralCode: text("referral_code").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

## Frontend Component Guide

### Key Components

#### AuthForm

The AuthForm component handles both login and registration through a shared interface.

```tsx
<AuthForm
  onSubmit={handleSubmit}
  isLogin={isLogin}
  toggleForm={() => setIsLogin(!isLogin)}
  isLoading={isLoading}
/>
```

#### DashboardNav

The DashboardNav component provides navigation for authenticated users.

```tsx
<DashboardNav className="hidden md:block" />
<MobileNav /> {/* Mobile navigation */}
```

#### HeroCarousel

The HeroCarousel component displays promotional content on the dashboard.

```tsx
<HeroCarousel 
  ads={adItems} 
  autoplay={true} 
  interval={5000} 
/>
```

#### SubscriptionCard

The SubscriptionCard component displays subscription details and actions.

```tsx
<SubscriptionCard 
  subscription={subscription} 
  onManage={handleManageSubscription} 
/>
```

## Authentication Implementation

### Session-Based Authentication

The application uses Passport.js with a local strategy for session-based authentication.

Password hashing is done using the scrypt algorithm:

```typescript
async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}
```

### React Auth Hook

The frontend uses a custom `useAuth` hook to manage authentication state:

```typescript
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
```

The hook provides the following interfaces:

```typescript
type AuthContextType = {
  user: SelectUser | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<SelectUser, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<SelectUser, Error, InsertUser>;
};
```

## Stripe Integration Details

### Frontend Integration

The Stripe Elements UI is integrated into the checkout page:

```tsx
const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin,
      },
    });
    
    // Handle error or success
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <button>Submit</button>
    </form>
  );
};
```

### Backend Integration

The server creates payment intents using the Stripe API:

```typescript
app.post("/api/create-payment-intent", async (req, res) => {
  try {
    const { amount } = req.body;
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: "usd",
    });
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Error creating payment intent: " + error.message });
  }
});
```

## Internationalization Implementation

### Translation System

The application uses a custom translation system with a context provider:

```typescript
type LanguageContextType = {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: TranslationKey, params?: Record<string, string>) => string;
  dir: 'ltr' | 'rtl';
};
```

Translations are stored in a structured object:

```typescript
export const translations = {
  en: {
    "common.welcome": "Welcome",
    "auth.login": "Login",
    // ...
  },
  ar: {
    "common.welcome": "أهلا بك",
    "auth.login": "تسجيل الدخول",
    // ...
  }
};
```

### Language Switching

Language can be switched using the `setLanguage` function from the language context:

```tsx
const { language, setLanguage } = useLanguage();

<Select
  value={language}
  onValueChange={(value) => setLanguage(value as LanguageCode)}
>
  <SelectItem value="en">English</SelectItem>
  <SelectItem value="ar">العربية</SelectItem>
</Select>
```

## State Management

### React Query

The application uses React Query for server state management:

```typescript
const { data: subscription, isLoading } = useQuery({
  queryKey: ['/api/subscription'],
  queryFn: getQueryFn({ on401: "throw" }),
});
```

### Form State

Form state is managed using React Hook Form with Zod validation:

```typescript
const form = useForm<ProfileUpdateData>({
  resolver: zodResolver(profileUpdateSchema),
  defaultValues: {
    username: user?.username || "",
    phone: user?.phone || "",
    address: user?.address || "",
  },
});
```

## Environment Configuration

### Frontend Environment Variables

Frontend environment variables are accessed using Vite's import.meta.env:

```typescript
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
```

### Backend Environment Variables

Backend environment variables are accessed using process.env:

```typescript
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});
```

## Deployment Process

### Building the Frontend

The frontend is built using Vite:

```bash
npm run build
```

This creates optimized static files in the dist directory.

### Starting the Production Server

The production server is started using:

```bash
npm start
```

This runs the server in production mode, serving both the API and the static frontend files.

## Development Workflow

### Starting the Development Server

The development server is started using:

```bash
npm run dev
```

This starts both the Express backend and the Vite development server.

### Database Migrations

Database schema changes are pushed using:

```bash
npm run db:push
```

This uses Drizzle Kit to push schema changes to the database.

---

*This documentation is intended for developers working on the PureFlow application. For user documentation, please refer to the README.md file.*
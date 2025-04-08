# PureFlow API Reference

This document provides a comprehensive reference for all API endpoints available in the PureFlow application.

## Base URL

All API endpoints are relative to the base URL of your deployment.

Example: `https://your-pureflow-instance.com/api`

## Authentication

Most endpoints require authentication. After login, the server will set a session cookie that must be included in subsequent requests.

### Authentication Endpoints

#### Register a New User

```
POST /api/register
```

Creates a new user account.

**Request Body:**

```json
{
  "username": "string",
  "password": "string",
  "email": "string" (optional),
  "phone": "string" (optional),
  "address": "string" (optional),
  "referralCode": "string" (optional)
}
```

**Response:** (201 Created)

```json
{
  "id": "number",
  "username": "string",
  "email": "string" (or null),
  "phone": "string" (or null),
  "address": "string" (or null),
  "referralCode": "string",
  "createdAt": "timestamp"
}
```

**Error Responses:**
- 400 Bad Request: Username already exists
- 400 Bad Request: Invalid input data

#### Login

```
POST /api/login
```

Authenticates a user and creates a session.

**Request Body:**

```json
{
  "username": "string",
  "password": "string"
}
```

**Response:** (200 OK)

```json
{
  "id": "number",
  "username": "string",
  "email": "string" (or null),
  "phone": "string" (or null),
  "address": "string" (or null),
  "referralCode": "string",
  "createdAt": "timestamp"
}
```

**Error Responses:**
- 401 Unauthorized: Invalid credentials

#### Logout

```
POST /api/logout
```

Logs out the current user by destroying the session.

**Response:** (200 OK)

```json
{
  "message": "Logged out successfully"
}
```

#### Get Current User

```
GET /api/user
```

Returns the currently authenticated user's information.

**Response:** (200 OK)

```json
{
  "id": "number",
  "username": "string",
  "email": "string" (or null),
  "phone": "string" (or null),
  "address": "string" (or null),
  "referralCode": "string",
  "createdAt": "timestamp"
}
```

**Error Responses:**
- 401 Unauthorized: Not authenticated

#### Update User Profile

```
PATCH /api/user
```

Updates the current user's profile information.

**Request Body:**

```json
{
  "username": "string" (optional),
  "email": "string" (optional),
  "phone": "string" (optional),
  "address": "string" (optional)
}
```

**Response:** (200 OK)

```json
{
  "id": "number",
  "username": "string",
  "email": "string" (or null),
  "phone": "string" (or null),
  "address": "string" (or null),
  "referralCode": "string",
  "createdAt": "timestamp"
}
```

**Error Responses:**
- 401 Unauthorized: Not authenticated
- 400 Bad Request: Invalid input data

### Subscription Endpoints

#### Get Current Subscription

```
GET /api/subscription
```

Retrieves the current user's subscription information.

**Response:** (200 OK)

```json
{
  "id": "number",
  "userId": "number",
  "plan": "string",
  "status": "string",
  "startDate": "timestamp",
  "endDate": "timestamp",
  "amount": "number",
  "currency": "string",
  "stripeCustomerId": "string" (or null),
  "stripeSubscriptionId": "string" (or null),
  "createdAt": "timestamp"
}
```

**Response:** (404 Not Found)

```json
{
  "message": "No subscription found"
}
```

**Error Responses:**
- 401 Unauthorized: Not authenticated

#### Create Subscription

```
POST /api/subscription
```

Creates a new subscription for the current user.

**Request Body:**

```json
{
  "plan": "string",
  "amount": "number",
  "currency": "string"
}
```

**Response:** (201 Created)

```json
{
  "id": "number",
  "userId": "number",
  "plan": "string",
  "status": "string",
  "startDate": "timestamp",
  "endDate": "timestamp",
  "amount": "number",
  "currency": "string",
  "stripeCustomerId": "string" (or null),
  "stripeSubscriptionId": "string" (or null),
  "createdAt": "timestamp"
}
```

**Error Responses:**
- 401 Unauthorized: Not authenticated
- 400 Bad Request: Invalid input data

#### Update Subscription

```
PATCH /api/subscription/:id
```

Updates an existing subscription.

**URL Parameters:**
- `id`: Subscription ID

**Request Body:**

```json
{
  "status": "string" (optional),
  "endDate": "timestamp" (optional)
}
```

**Response:** (200 OK)

```json
{
  "id": "number",
  "userId": "number",
  "plan": "string",
  "status": "string",
  "startDate": "timestamp",
  "endDate": "timestamp",
  "amount": "number",
  "currency": "string",
  "stripeCustomerId": "string" (or null),
  "stripeSubscriptionId": "string" (or null),
  "createdAt": "timestamp"
}
```

**Error Responses:**
- 401 Unauthorized: Not authenticated
- 404 Not Found: Subscription not found
- 403 Forbidden: Not authorized to update this subscription

### Installation Endpoints

#### Get Current Installation

```
GET /api/installation
```

Retrieves the current user's installation information.

**Response:** (200 OK)

```json
{
  "id": "number",
  "userId": "number",
  "status": "string",
  "scheduledDate": "timestamp",
  "completedDate": "timestamp" (or null),
  "notes": "string" (or null),
  "createdAt": "timestamp"
}
```

**Response:** (404 Not Found)

```json
{
  "message": "No installation found"
}
```

**Error Responses:**
- 401 Unauthorized: Not authenticated

#### Create Installation

```
POST /api/installation
```

Schedules a new installation for the current user.

**Request Body:**

```json
{
  "scheduledDate": "timestamp",
  "notes": "string" (optional)
}
```

**Response:** (201 Created)

```json
{
  "id": "number",
  "userId": "number",
  "status": "scheduled",
  "scheduledDate": "timestamp",
  "completedDate": null,
  "notes": "string" (or null),
  "createdAt": "timestamp"
}
```

**Error Responses:**
- 401 Unauthorized: Not authenticated
- 400 Bad Request: Invalid input data

#### Update Installation

```
PATCH /api/installation/:id
```

Updates an existing installation.

**URL Parameters:**
- `id`: Installation ID

**Request Body:**

```json
{
  "status": "string" (optional),
  "scheduledDate": "timestamp" (optional),
  "completedDate": "timestamp" (optional),
  "notes": "string" (optional)
}
```

**Response:** (200 OK)

```json
{
  "id": "number",
  "userId": "number",
  "status": "string",
  "scheduledDate": "timestamp",
  "completedDate": "timestamp" (or null),
  "notes": "string" (or null),
  "createdAt": "timestamp"
}
```

**Error Responses:**
- 401 Unauthorized: Not authenticated
- 404 Not Found: Installation not found
- 403 Forbidden: Not authorized to update this installation

### Support Ticket Endpoints

#### Get Support Tickets

```
GET /api/support-tickets
```

Retrieves all support tickets for the current user.

**Response:** (200 OK)

```json
[
  {
    "id": "number",
    "userId": "number",
    "title": "string",
    "description": "string",
    "status": "string",
    "priority": "string",
    "createdAt": "timestamp"
  }
]
```

**Error Responses:**
- 401 Unauthorized: Not authenticated

#### Create Support Ticket

```
POST /api/support-tickets
```

Creates a new support ticket for the current user.

**Request Body:**

```json
{
  "title": "string",
  "description": "string",
  "priority": "string"
}
```

**Response:** (201 Created)

```json
{
  "id": "number",
  "userId": "number",
  "title": "string",
  "description": "string",
  "status": "open",
  "priority": "string",
  "createdAt": "timestamp"
}
```

**Error Responses:**
- 401 Unauthorized: Not authenticated
- 400 Bad Request: Invalid input data

#### Update Support Ticket

```
PATCH /api/support-tickets/:id
```

Updates an existing support ticket.

**URL Parameters:**
- `id`: Support ticket ID

**Request Body:**

```json
{
  "status": "string" (optional),
  "priority": "string" (optional),
  "description": "string" (optional)
}
```

**Response:** (200 OK)

```json
{
  "id": "number",
  "userId": "number",
  "title": "string",
  "description": "string",
  "status": "string",
  "priority": "string",
  "createdAt": "timestamp"
}
```

**Error Responses:**
- 401 Unauthorized: Not authenticated
- 404 Not Found: Support ticket not found
- 403 Forbidden: Not authorized to update this ticket

### Referral Endpoints

#### Get Referral Code

```
GET /api/referral-code
```

Retrieves the current user's referral code.

**Response:** (200 OK)

```json
{
  "referralCode": "string"
}
```

**Error Responses:**
- 401 Unauthorized: Not authenticated

#### Get Referrals

```
GET /api/referrals
```

Retrieves all referrals made by the current user.

**Response:** (200 OK)

```json
[
  {
    "id": "number",
    "referrerId": "number",
    "referredId": "number",
    "status": "string",
    "createdAt": "timestamp",
    "referredUser": {
      "username": "string"
    }
  }
]
```

**Error Responses:**
- 401 Unauthorized: Not authenticated

#### Create Referral

```
POST /api/referrals
```

Records a new referral when a user signs up using a referral code.

**Request Body:**

```json
{
  "referralCode": "string"
}
```

**Response:** (201 Created)

```json
{
  "id": "number",
  "referrerId": "number",
  "referredId": "number",
  "status": "pending",
  "createdAt": "timestamp"
}
```

**Error Responses:**
- 401 Unauthorized: Not authenticated
- 400 Bad Request: Invalid referral code
- 400 Bad Request: User already referred

### Reward Endpoints

#### Get Rewards

```
GET /api/rewards
```

Retrieves all rewards for the current user.

**Response:** (200 OK)

```json
[
  {
    "id": "number",
    "userId": "number",
    "type": "string",
    "amount": "number",
    "status": "string",
    "createdAt": "timestamp"
  }
]
```

**Error Responses:**
- 401 Unauthorized: Not authenticated

#### Create Reward

```
POST /api/rewards
```

Creates a new reward (admin only).

**Request Body:**

```json
{
  "userId": "number",
  "type": "string",
  "amount": "number"
}
```

**Response:** (201 Created)

```json
{
  "id": "number",
  "userId": "number",
  "type": "string",
  "amount": "number",
  "status": "pending",
  "createdAt": "timestamp"
}
```

**Error Responses:**
- 401 Unauthorized: Not authenticated
- 403 Forbidden: Not authorized
- 400 Bad Request: Invalid input data

#### Update Reward

```
PATCH /api/rewards/:id
```

Updates the status of a reward (admin only).

**URL Parameters:**
- `id`: Reward ID

**Request Body:**

```json
{
  "status": "string"
}
```

**Response:** (200 OK)

```json
{
  "id": "number",
  "userId": "number",
  "type": "string",
  "amount": "number",
  "status": "string",
  "createdAt": "timestamp"
}
```

**Error Responses:**
- 401 Unauthorized: Not authenticated
- 403 Forbidden: Not authorized
- 404 Not Found: Reward not found

### Reminder Endpoints

#### Get Reminders

```
GET /api/reminders
```

Retrieves all reminders for the current user.

**Response:** (200 OK)

```json
[
  {
    "id": "number",
    "userId": "number",
    "type": "string",
    "title": "string",
    "message": "string",
    "scheduledDate": "timestamp",
    "status": "string",
    "createdAt": "timestamp"
  }
]
```

**Error Responses:**
- 401 Unauthorized: Not authenticated

#### Create Reminder

```
POST /api/reminders
```

Creates a new reminder for a user (admin only).

**Request Body:**

```json
{
  "userId": "number",
  "type": "string",
  "title": "string",
  "message": "string",
  "scheduledDate": "timestamp"
}
```

**Response:** (201 Created)

```json
{
  "id": "number",
  "userId": "number",
  "type": "string",
  "title": "string",
  "message": "string",
  "scheduledDate": "timestamp",
  "status": "pending",
  "createdAt": "timestamp"
}
```

**Error Responses:**
- 401 Unauthorized: Not authenticated
- 403 Forbidden: Not authorized
- 400 Bad Request: Invalid input data

#### Update Reminder Status

```
PATCH /api/reminders/:id
```

Updates the status of a reminder.

**URL Parameters:**
- `id`: Reminder ID

**Request Body:**

```json
{
  "status": "string"
}
```

**Response:** (200 OK)

```json
{
  "id": "number",
  "userId": "number",
  "type": "string",
  "title": "string",
  "message": "string",
  "scheduledDate": "timestamp",
  "status": "string",
  "createdAt": "timestamp"
}
```

**Error Responses:**
- 401 Unauthorized: Not authenticated
- 404 Not Found: Reminder not found
- 403 Forbidden: Not authorized to update this reminder

### Payment Endpoints

#### Create Payment Intent

```
POST /api/create-payment-intent
```

Creates a Stripe payment intent for one-time payments.

**Request Body:**

```json
{
  "amount": "number",
  "currency": "string"
}
```

**Response:** (200 OK)

```json
{
  "clientSecret": "string"
}
```

**Error Responses:**
- 401 Unauthorized: Not authenticated
- 500 Internal Server Error: Error creating payment intent

#### Create or Get Subscription

```
POST /api/get-or-create-subscription
```

Creates or retrieves a Stripe subscription.

**Response:** (200 OK)

```json
{
  "subscriptionId": "string",
  "clientSecret": "string"
}
```

**Error Responses:**
- 401 Unauthorized: Not authenticated
- 400 Bad Request: Error creating subscription

## Error Responses

All API endpoints may return the following error responses:

### 400 Bad Request

Returned when the request is malformed or invalid.

```json
{
  "message": "Error message describing the issue"
}
```

### 401 Unauthorized

Returned when the user is not authenticated but the endpoint requires authentication.

```json
{
  "message": "Not authenticated"
}
```

### 403 Forbidden

Returned when the user is authenticated but does not have permission to access the resource.

```json
{
  "message": "Not authorized to access this resource"
}
```

### 404 Not Found

Returned when the requested resource does not exist.

```json
{
  "message": "Resource not found"
}
```

### 500 Internal Server Error

Returned when an unexpected error occurs on the server.

```json
{
  "message": "An unexpected error occurred"
}
```

## Status Codes

The API uses the following status codes:

- `200 OK`: The request was successful
- `201 Created`: The resource was successfully created
- `400 Bad Request`: The request was malformed or invalid
- `401 Unauthorized`: Authentication is required
- `403 Forbidden`: The authenticated user doesn't have permission
- `404 Not Found`: The requested resource was not found
- `500 Internal Server Error`: An unexpected error occurred on the server

## Data Types

### User

```json
{
  "id": "number",
  "username": "string",
  "password": "string" (not returned in responses),
  "email": "string" (optional),
  "phone": "string" (optional),
  "address": "string" (optional),
  "referralCode": "string",
  "createdAt": "timestamp"
}
```

### Subscription

```json
{
  "id": "number",
  "userId": "number",
  "plan": "string",
  "status": "string" (enum: "active", "cancelled", "expired"),
  "startDate": "timestamp",
  "endDate": "timestamp",
  "amount": "number",
  "currency": "string",
  "stripeCustomerId": "string" (optional),
  "stripeSubscriptionId": "string" (optional),
  "createdAt": "timestamp"
}
```

### Installation

```json
{
  "id": "number",
  "userId": "number",
  "status": "string" (enum: "scheduled", "completed", "cancelled"),
  "scheduledDate": "timestamp",
  "completedDate": "timestamp" (optional),
  "notes": "string" (optional),
  "createdAt": "timestamp"
}
```

### Support Ticket

```json
{
  "id": "number",
  "userId": "number",
  "title": "string",
  "description": "string",
  "status": "string" (enum: "open", "in_progress", "resolved", "closed"),
  "priority": "string" (enum: "low", "medium", "high", "urgent"),
  "createdAt": "timestamp"
}
```

### Referral

```json
{
  "id": "number",
  "referrerId": "number",
  "referredId": "number",
  "status": "string" (enum: "pending", "completed", "expired"),
  "createdAt": "timestamp"
}
```

### Reward

```json
{
  "id": "number",
  "userId": "number",
  "type": "string" (enum: "discount", "free_month", "cash"),
  "amount": "number",
  "status": "string" (enum: "pending", "claimed", "expired"),
  "createdAt": "timestamp"
}
```

### Reminder

```json
{
  "id": "number",
  "userId": "number",
  "type": "string" (enum: "maintenance", "filter_replacement", "payment"),
  "title": "string",
  "message": "string",
  "scheduledDate": "timestamp",
  "status": "string" (enum: "pending", "sent", "completed"),
  "createdAt": "timestamp"
}
```

---

## API Usage Examples

### User Registration

```javascript
// Example using fetch API
async function registerUser(userData) {
  const response = await fetch('/api/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });
  
  if (!response.ok) {
    throw new Error(`Registration failed: ${response.statusText}`);
  }
  
  return await response.json();
}

// Usage
const newUser = {
  username: 'johndoe',
  password: 'securepassword',
  email: 'john@example.com',
  phone: '+1234567890'
};

registerUser(newUser)
  .then(user => console.log('User registered:', user))
  .catch(error => console.error('Error:', error));
```

### Creating a Subscription

```javascript
// Example using fetch API
async function createSubscription(subscriptionData) {
  const response = await fetch('/api/subscription', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Important for sending cookies
    body: JSON.stringify(subscriptionData),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to create subscription: ${response.statusText}`);
  }
  
  return await response.json();
}

// Usage
const subscription = {
  plan: 'standard',
  amount: 25,
  currency: 'JOD'
};

createSubscription(subscription)
  .then(result => console.log('Subscription created:', result))
  .catch(error => console.error('Error:', error));
```

### Creating a Payment Intent

```javascript
// Example using fetch API
async function createPaymentIntent(amount, currency) {
  const response = await fetch('/api/create-payment-intent', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Important for sending cookies
    body: JSON.stringify({ amount, currency }),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to create payment intent: ${response.statusText}`);
  }
  
  return await response.json();
}

// Usage
createPaymentIntent(25, 'usd')
  .then(result => {
    // Use the client secret with Stripe.js
    console.log('Payment intent created:', result.clientSecret);
  })
  .catch(error => console.error('Error:', error));
```

---

*This API documentation is intended for developers integrating with the PureFlow system. The API is subject to change as the application evolves.*
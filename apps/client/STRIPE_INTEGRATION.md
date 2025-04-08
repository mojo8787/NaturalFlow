# Stripe Payment Integration Guide

This document provides detailed instructions for setting up and using the Stripe payment integration in the PureFlow application.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Setting Up Stripe](#setting-up-stripe)
3. [Environment Configuration](#environment-configuration)
4. [Testing Payments](#testing-payments)
5. [Going Live](#going-live)
6. [Troubleshooting](#troubleshooting)

## Prerequisites

Before integrating Stripe payments, you'll need:

1. A Stripe account (sign up at [stripe.com](https://stripe.com))
2. Access to the PureFlow application codebase
3. Administrative access to the deployment environment

## Setting Up Stripe

### 1. Create a Stripe Account

1. Go to [stripe.com](https://stripe.com) and create an account
2. Complete the verification process to activate your account

### 2. Locate Your API Keys

1. Log in to the Stripe Dashboard
2. Navigate to Developers > API keys
3. You'll see two keys:
   - **Publishable key** (starts with `pk_`): This is used on the frontend
   - **Secret key** (starts with `sk_`): This is used on the backend and must be kept secret

### 3. Create a Product and Price (for Subscriptions)

If you're using subscriptions:

1. Go to Products > Add Product in the Stripe Dashboard
2. Create a product for your water filtration system subscription:
   - **Name**: Water Filtration System
   - **Description**: Monthly subscription for RO water filtration system
3. Add pricing:
   - **Price**: 25.00
   - **Currency**: JOD (or USD for testing)
   - **Billing period**: Monthly
   - **Recurring**: Yes
4. Save the product
5. Note the **Price ID** (starts with `price_`) - you'll need this for subscription payments

## Environment Configuration

Add the following environment variables to your application:

```
# Stripe API Keys
STRIPE_SECRET_KEY=sk_test_your_secret_key
VITE_STRIPE_PUBLIC_KEY=pk_test_your_public_key

# For subscriptions
STRIPE_PRICE_ID=price_your_price_id
```

### Setting Environment Variables

#### Development Environment

Add these variables to your `.env` file:

```
STRIPE_SECRET_KEY=sk_test_...
VITE_STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_PRICE_ID=price_...
```

#### Production Environment

Add the environment variables through your deployment platform's settings.

> **Important**: Never commit your Stripe secret key to version control. Always use environment variables or a secure vault service.

## Testing Payments

### Test Cards

Stripe provides test card numbers that you can use during development:

| Card Number | Brand | Description |
|-------------|-------|-------------|
| 4242 4242 4242 4242 | Visa | Successful payment |
| 4000 0000 0000 3220 | Visa | 3D Secure required |
| 4000 0000 0000 9995 | Visa | Payment declined |

For all test cards:
- Any future expiration date (MM/YY format)
- Any 3-digit CVC
- Any postal code

### Testing One-Time Payments

1. Navigate to the checkout page in your application
2. Enter a test card number
3. Submit the payment form
4. Verify that the payment is processed successfully

### Testing Subscriptions

1. Navigate to the subscription page in your application
2. Enter a test card number
3. Submit the subscription form
4. Verify that the subscription is created successfully
5. Check the Stripe Dashboard to confirm the subscription is active

## Going Live

When you're ready to accept real payments:

1. Complete your Stripe account setup (if not already done)
2. Replace test API keys with live keys:
   - Update `STRIPE_SECRET_KEY` to start with `sk_live_`
   - Update `VITE_STRIPE_PUBLIC_KEY` to start with `pk_live_`
3. Update the product and price IDs if needed
4. Test the entire payment flow with a real card (make a small test payment)
5. Refund the test payment

## Troubleshooting

### Common Issues

#### Payment Intent Creation Fails

**Symptoms**: Error creating payment intent on the backend

**Possible solutions**:
1. Verify your Stripe secret key is correct and active
2. Check that the amount is valid (positive number)
3. Ensure the currency is supported by Stripe
4. Look for error messages in the Stripe Dashboard

#### Stripe Elements Not Loading

**Symptoms**: Payment form doesn't appear on the checkout page

**Possible solutions**:
1. Check that your publishable key is correct
2. Verify that the Stripe.js script is loaded correctly
3. Check browser console for errors

#### Payment Succeeds But Subscription Not Created

**Symptoms**: Payment goes through in Stripe but subscription record not created in your database

**Possible solutions**:
1. Verify that your backend correctly processes the Stripe webhook event
2. Check database connection and error logs
3. Make sure your webhook endpoint is correctly configured in the Stripe Dashboard

### Stripe Error Codes

Here are some common Stripe error codes and their meanings:

| Error Code | Description |
|------------|-------------|
| `card_declined` | The card was declined |
| `incorrect_cvc` | The CVC number is incorrect |
| `expired_card` | The card has expired |
| `processing_error` | An error occurred while processing the card |
| `rate_limit` | Too many requests made to the API too quickly |

### Getting Support

If you encounter issues:

1. Check the [Stripe API Documentation](https://stripe.com/docs/api)
2. Review the [Stripe API Errors](https://stripe.com/docs/error-codes)
3. Contact Stripe support: [support.stripe.com](https://support.stripe.com)

---

## Code Examples

### Frontend Example (React)

```tsx
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { useState } from 'react';

export function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js hasn't loaded yet
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/subscription-success`,
        },
      });

      // This point will only be reached if there is an immediate error when
      // confirming the payment. Otherwise, your customer will be redirected to
      // your return_url.
      if (error) {
        setErrorMessage(error.message || 'An unexpected error occurred.');
      }
    } catch (e) {
      setErrorMessage('An unexpected error occurred.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <button disabled={!stripe || isLoading} className="mt-4 w-full">
        {isLoading ? 'Processing...' : 'Pay Now'}
      </button>
      {errorMessage && <div className="text-red-500 mt-2">{errorMessage}</div>}
    </form>
  );
}
```

### Backend Example (Node.js/Express)

```typescript
import Stripe from 'stripe';
import express from 'express';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

// Create Payment Intent for one-time payments
router.post('/create-payment-intent', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).send({ error: 'Not authenticated' });
  }

  try {
    const { amount, currency = 'usd' } = req.body;
    
    // Validate amount
    if (!amount || amount <= 0) {
      return res.status(400).send({ error: 'Invalid amount' });
    }

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata: {
        userId: req.user.id.toString(),
      },
    });

    // Send publishable key and PaymentIntent client_secret to client
    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error: any) {
    console.error('Error creating payment intent:', error);
    res.status(500).send({ error: error.message });
  }
});

// Create or retrieve subscription
router.post('/get-or-create-subscription', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).send({ error: 'Not authenticated' });
  }

  try {
    const user = req.user;

    // If user already has a subscription, retrieve it
    if (user.stripeSubscriptionId) {
      const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);

      res.send({
        subscriptionId: subscription.id,
        clientSecret: subscription.latest_invoice?.payment_intent?.client_secret || null,
      });
      return;
    }

    // Create a new customer if needed
    let customerId = user.stripeCustomerId;
    
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email || undefined,
        name: user.username,
        metadata: {
          userId: user.id.toString(),
        },
      });
      customerId = customer.id;
      
      // Update user record with customer ID
      await storage.updateUserStripeInfo(user.id, { stripeCustomerId: customerId });
    }

    // Create the subscription
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: process.env.STRIPE_PRICE_ID }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
    });

    // Update user record with subscription ID
    await storage.updateUserStripeInfo(user.id, { 
      stripeSubscriptionId: subscription.id 
    });

    res.send({
      subscriptionId: subscription.id,
      clientSecret: subscription.latest_invoice?.payment_intent?.client_secret || null,
    });
  } catch (error: any) {
    console.error('Error creating subscription:', error);
    res.status(500).send({ error: error.message });
  }
});

export default router;
```

---

*This guide is intended for developers implementing Stripe payment processing in the PureFlow application. The information in this guide may change as Stripe updates its API.*
# Zain Cash Integration Guide

This document outlines the steps and requirements for integrating the Zain Cash payment gateway into the PureFlow application.

## Overview

Zain Cash is a mobile payment gateway service available in Jordan, providing customers with a secure and convenient way to make payments using their mobile phones. Integrating Zain Cash allows PureFlow to offer a local payment option that is widely used in Jordan.

## Prerequisites

Before implementing Zain Cash integration, you will need to:

1. Register as a merchant with Zain Cash Jordan
2. Obtain the necessary API credentials:
   - Merchant ID
   - Secret Key
   - MSISDN (Mobile Station International Subscriber Directory Number)
   - API Endpoints (production and test environments)

## Implementation Status

The current implementation includes:

- A placeholder Zain Cash service module in `server/services/zaincash.ts`
- API route handlers in `server/routes/zaincash.ts`

These components provide the structure for future integration but require official Zain Cash API documentation and credentials to be fully implemented.

## Required Environment Variables

The following environment variables need to be set for Zain Cash integration:

```
ZAINCASH_MERCHANT_ID=your_merchant_id
ZAINCASH_SECRET_KEY=your_secret_key
ZAINCASH_MSISDN=your_msisdn
ZAINCASH_API_URL=https://api.zaincash.jo/transaction  # Example URL, use the actual endpoint provided by Zain Cash
```

## Integration Flow

The Zain Cash payment flow typically works as follows:

1. **Initiate Payment**:
   - The application sends a request to Zain Cash with transaction details
   - Zain Cash responds with a transaction ID and a payment URL
   - The user is redirected to the payment URL to complete the payment

2. **Payment Verification**:
   - After payment completion, Zain Cash will send a callback to the specified URL
   - The application should verify the payment status with Zain Cash
   - The application updates the payment status in the database

3. **Transaction Completion**:
   - Once verified, the application should update the user's subscription or order status
   - Send confirmation to the user

## API Endpoints

The application exposes the following endpoints for Zain Cash integration:

- `POST /api/zaincash/initiate-payment`: Initiates a new payment transaction
- `GET /api/zaincash/verify-payment/:transactionId`: Verifies a payment transaction status
- `POST /api/zaincash/callback`: Callback endpoint for Zain Cash to notify of payment status

## Testing

Before moving to production:

1. Test the integration using Zain Cash's test environment
2. Verify successful payment flow
3. Verify error handling and failed payment scenarios
4. Test the callback functionality

## Security Considerations

- Always validate and verify signatures on requests and responses
- Store the Secret Key securely and never expose it to the client side
- Implement proper error handling and logging for troubleshooting
- Ensure secure HTTPS communication with the Zain Cash API
- Validate all incoming callback requests before processing

## Future Development

To complete the Zain Cash integration:

1. Obtain official API documentation and credentials from Zain Cash
2. Update the service implementation with the actual API specifications
3. Implement proper signature generation and verification
4. Add proper database storage for payment transactions
5. Update the UI to offer Zain Cash as a payment option
6. Implement comprehensive error handling and user notifications

## Resources

- Zain Cash Jordan Website: https://www.zaincash.jo/
- Merchant Registration: https://www.zaincash.jo/merchant-registration
- API Documentation: To be obtained from Zain Cash after merchant registration

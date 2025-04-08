# Environment Configuration

The admin dashboard requires the following environment variables to be set:

```env
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

## Installation

1. Create a `.env` file in the `admin` directory
2. Copy the contents above into the file
3. Update the values as needed, especially the database connection string and security keys

## Security Notes

- Never commit your actual `.env` file to version control
- Use strong, unique values for the secret keys in production
- Always use HTTPS in production environments
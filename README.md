# NaturalFlow Monorepo

This monorepo contains both the client application and admin dashboard for NaturalFlow.

## Project Structure

```
NaturalFlow/
├── apps/
│   ├── client/          # Main user application
│   └── admin/           # Admin dashboard
├── packages/
│   └── shared/          # Shared utilities and components
├── supabase/            # Supabase configuration and migrations
└── docs/               # Documentation
```

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
- Copy `.env.example` to `.env.local` in both `apps/client` and `apps/admin`
- Update the variables with your Supabase credentials

3. Start development servers:

For client application:
```bash
npm run dev:client
```

For admin dashboard:
```bash
npm run dev:admin
```

## Documentation

Check the `docs` directory for detailed documentation:
- [Supabase Migration Guide](docs/SUPABASE_MIGRATION.md)

## Features

### Client Application
- User authentication
- Water usage tracking
- Subscription management
- Installation scheduling
- Support ticket system
- Referral program

### Admin Dashboard
- User management
- Installation tracking
- Support ticket management
- Analytics dashboard
- System configuration 
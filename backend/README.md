# Backend - Unified Audience Query Management System

Express.js backend with TypeScript, Prisma, BullMQ, and OpenAI integration.

## Architecture

- **Controllers**: Handle HTTP requests/responses
- **Services**: Business logic layer
- **Repositories**: Data access layer (Prisma)
- **Queues**: Background job processing (BullMQ)
- **Integrations**: Channel integrations (email, social, chat)

## Setup

1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env` and configure
3. Generate Prisma client: `npm run prisma:generate`
4. Run migrations: `npm run prisma:migrate`
5. Start dev server: `npm run dev`

## Environment Variables

- `PORT`: Server port (default: 4000)
- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string
- `OPENAI_API_KEY`: OpenAI API key (optional, uses mock if not provided)
- `JWT_SECRET`: JWT secret for authentication

## API Documentation

Swagger UI available at `/api/docs` when server is running.

## Queue Workers

Three BullMQ workers process background jobs:
1. **Classification**: AI-powered query classification
2. **Priority Scoring**: Automatic priority detection
3. **Routing**: Query routing to teams

## Database

Prisma ORM with PostgreSQL. Run migrations with:
```bash
npm run prisma:migrate
```

View database with Prisma Studio:
```bash
npm run prisma:studio
```


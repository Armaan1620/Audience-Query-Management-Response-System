# Unified Audience Query Management & Response System

A full-stack application for centralizing, categorizing, and managing audience queries from multiple channels with AI-powered auto-tagging and priority detection.

## Features

- **Unified Inbox**: Centralized view of all audience queries from email, social media, and chat
- **AI-Powered Auto-Tagging**: Automatic classification, sentiment analysis, and urgency detection
- **Priority Detection & Escalation**: Automatic priority scoring and routing to appropriate teams
- **Assignment & Status Tracking**: Full workflow management with assignment and status tracking
- **Query History & Activity**: Complete audit trail of all query activities
- **Analytics Dashboard**: Charts and metrics for response times and query types
- **Mock Channel Integrations**: Simulated integrations for email, social, and chat channels

## Tech Stack

### Backend
- **Runtime**: Node.js + Express
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Queue**: Redis + BullMQ
- **AI**: OpenAI API (with mock fallback)
- **Validation**: Zod
- **Documentation**: Swagger/OpenAPI
- **Logging**: Pino

### Frontend
- **Framework**: React + TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **State Management**: React Query (TanStack Query)
- **Routing**: React Router
- **HTTP Client**: Axios

## Project Structure

```
.
├── backend/
│   ├── src/
│   │   ├── config/          # Configuration files
│   │   ├── controllers/     # Request handlers
│   │   ├── services/        # Business logic
│   │   ├── repositories/    # Data access layer
│   │   ├── queues/          # BullMQ workers
│   │   ├── integrations/    # Channel integrations
│   │   ├── utils/           # Utilities
│   │   ├── models/          # TypeScript interfaces
│   │   ├── routes/          # Express routes
│   │   ├── middlewares/     # Express middlewares
│   │   ├── validators/      # Zod schemas
│   │   └── types/           # TypeScript types
│   ├── prisma/
│   │   └── schema.prisma    # Database schema
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/      # Reusable React components
    │   ├── modules/         # Feature modules
    │   ├── pages/           # Page components
    │   ├── hooks/           # Custom React hooks
    │   ├── context/         # React context
    │   ├── services/        # API services
    │   ├── utils/           # Utilities
    │   └── types/           # TypeScript types
    └── package.json
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- Redis 6+
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
PORT=4000
NODE_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5432/audience_db
REDIS_URL=redis://localhost:6379
OPENAI_API_KEY=sk-your-key-here  # Optional, uses mock if not provided
JWT_SECRET=your-secret-key
```

4. Generate Prisma client:
```bash
npm run prisma:generate
```

5. Run database migrations:
```bash
npm run prisma:migrate
```

6. Start the development server:
```bash
npm run dev
```

The backend API will be available at `http://localhost:4000`
API documentation will be available at `http://localhost:4000/api/docs`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (optional):
```env
VITE_API_URL=http://localhost:4000/api
```

4. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Architecture

### Backend Architecture

The backend follows a layered architecture:

1. **Controllers**: Handle HTTP requests and responses
2. **Services**: Contain business logic
3. **Repositories**: Handle database operations
4. **Queues**: Process background jobs (classification, priority scoring, routing)

### Frontend Architecture

The frontend follows a modular component architecture:

1. **Components**: Reusable UI components (Table, Card, Badge, Tag, etc.)
2. **Pages**: Full page components (Login, Inbox, Analytics, etc.)
3. **Hooks**: Custom React hooks for data fetching
4. **Services**: API client and service layer

## Key Features Implementation

### AI Classification

The system uses OpenAI API (or a mock implementation) to classify queries:
- **Category**: question, request, complaint, feedback
- **Sentiment**: positive, neutral, negative
- **Urgency**: low, medium, high, critical
- **Confidence**: 0-1 score

### Queue Processing

Three BullMQ queues handle background processing:
1. **Classification Queue**: Classifies queries using AI
2. **Priority Queue**: Scores query priority and updates status
3. **Routing Queue**: Routes queries to appropriate teams

### Database Schema

The Prisma schema includes:
- **User**: System users (agents, managers, admins)
- **Team**: Teams for organizing users
- **Query**: Audience queries with metadata
- **QueryActivity**: Audit trail of query activities

## API Endpoints

### Queries
- `GET /api/queries` - List all queries
- `GET /api/queries/:id` - Get query by ID
- `POST /api/queries` - Create a new query

## Development

### Running Tests
```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

### Building for Production
```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
npm run build
npm run preview
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Ensure all tests pass
4. Submit a pull request

## License

ISC


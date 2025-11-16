# Frontend - Unified Audience Query Management System

React + TypeScript frontend with Vite, TailwindCSS, and React Query.

## Architecture

- **Components**: Reusable UI components
- **Pages**: Full page components
- **Hooks**: Custom React hooks
- **Services**: API client layer
- **Types**: TypeScript type definitions

## Setup

1. Install dependencies: `npm install`
2. Create `.env` file (optional):
   ```
   VITE_API_URL=http://localhost:4000/api
   ```
3. Start dev server: `npm run dev`

## Components

### Reusable Components
- **Table**: Data table component
- **Card**: Card container component
- **Badge**: Status badge component
- **Tag**: Tag component for categories
- **Modal**: Modal dialog component
- **Loader**: Loading spinner component
- **Sidebar**: Navigation sidebar
- **Topbar**: Top navigation bar

### Pages
- **Login**: Authentication page
- **Inbox**: Query inbox with table view
- **QueryDetails**: Detailed query view
- **Analytics**: Analytics dashboard
- **Settings**: Settings page

## Styling

TailwindCSS for styling. Configuration in `tailwind.config.js`.

## State Management

React Query (TanStack Query) for server state management.

## API Integration

Axios client configured in `src/services/api.ts`. API responses follow the format:
```typescript
{
  success: boolean;
  data: T;
  message?: string;
}
```

## Development

- Dev server: `npm run dev`
- Build: `npm run build`
- Preview: `npm run preview`
- Lint: `npm run lint`



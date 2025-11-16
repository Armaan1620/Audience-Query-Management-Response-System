# Auto-Assignment Utility

This document describes the auto-assignment utility system that automatically assigns incoming queries to the appropriate teams based on query content, tags, AI insights, and channel.

## Overview

The auto-assignment system automatically routes queries to teams when they are created. It analyzes:
- **Message content** - Keywords and phrases
- **Tags** - Pre-assigned or AI-generated tags
- **AI Insights** - Category, sentiment, urgency from AI classification
- **Channel** - Email, social, chat, community

## How It Works

### Automatic Assignment

When a query is created, it automatically goes through the assignment pipeline:

1. **Query Creation** → `queryService.createQuery()`
2. **Classification Queue** → AI analyzes the message
3. **Priority Queue** → Priority is calculated
4. **Routing Queue** → Team assignment happens here

The routing queue worker calls `autoAssignmentService.processQuery()` which:
- Detects priority based on keywords and AI insights
- Determines the appropriate team using `teamAssignmentService`
- Assigns to an available user within that team
- Updates query status
- Logs all activities

### Team Assignment Logic

Teams are assigned based on this priority:

1. **Tag-based matching** - If query has tags like "billing", "bug", "account", etc.
2. **AI category matching** - If AI classified the query with a category
3. **Channel-based fallback** - Default team based on channel (email/chat → Support, social → Social, etc.)

### Team Mappings

| Tag/Keyword | Team |
|------------|------|
| billing, payment, invoice, refund, subscription, charge | Billing |
| technical, bug, error, issue, problem, broken, not_working | Technical |
| account, login, password, access, security, verification | Account |
| sales, purchase, upgrade, plan, feature, product | Sales |
| complaint, feedback, question, request, help, assistance | Support |
| email, chat | Support (default) |
| social | Social |
| community | Community |

## Usage

### Command Line Interface

The assignment utility can be used from the command line:

```bash
# Assign a single query
npm run assign:single <queryId>

# Assign all unassigned queries
npm run assign:all

# Show assignment statistics
npm run assign:stats

# Re-assign a query (even if already assigned)
npm run assign:reassign <queryId>

# Show help
npm run assign:help
```

### API Endpoints

#### Assign Single Query
```http
POST /api/assignment/assign/:queryId
```

**Response:**
```json
{
  "success": true,
  "data": {
    "queryId": "abc123",
    "priority": "high",
    "status": "in_progress",
    "assignment": {
      "teamId": "team-123",
      "teamName": "Billing",
      "userId": "user-456",
      "userName": "Agent One",
      "reason": "Matched by tag: billing"
    }
  }
}
```

#### Assign All Unassigned Queries
```http
POST /api/assignment/assign-all
```

**Response:**
```json
{
  "success": true,
  "data": {
    "processed": 50,
    "assigned": 45,
    "skipped": 3,
    "errors": 2,
    "results": [...]
  }
}
```

#### Get Assignment Statistics
```http
GET /api/assignment/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 100,
    "assigned": 85,
    "unassigned": 15,
    "byTeam": {
      "Support": 30,
      "Billing": 20,
      "Technical": 15,
      "Account": 10,
      "Sales": 10
    }
  }
}
```

#### Re-assign Query
```http
POST /api/assignment/reassign/:queryId
```

#### Assign by Filter
```http
POST /api/assignment/assign-by-filter
Content-Type: application/json

{
  "status": "new",
  "priority": "high",
  "channel": "email",
  "unassignedOnly": true
}
```

## Manual Assignment

### For Existing Queries

If you have existing queries that weren't assigned automatically, you can assign them:

```bash
# Assign all unassigned queries
npm run assign:all

# Or use the API
curl -X POST http://localhost:4000/api/assignment/assign-all
```

### For a Specific Query

```bash
# Assign a specific query
npm run assign:single <queryId>

# Or use the API
curl -X POST http://localhost:4000/api/assignment/assign/abc123
```

## Customization

### Adding New Team Mappings

Edit `backend/src/services/teamAssignmentService.ts`:

```typescript
const TAG_TO_TEAM_MAPPING: Record<string, string> = {
  // Add your custom mappings here
  'custom-tag': 'CustomTeam',
  // ...
};
```

### Modifying Priority Detection

Edit `backend/src/services/priorityDetectionService.ts` to adjust how priorities are detected.

### Changing Status Workflow

Edit `backend/src/services/statusManagementService.ts` to modify status transitions.

## Troubleshooting

### Queries Not Being Assigned

1. **Check if teams exist:**
   ```bash
   npm run seed:teams
   ```

2. **Check assignment stats:**
   ```bash
   npm run assign:stats
   ```

3. **Manually assign unassigned queries:**
   ```bash
   npm run assign:all
   ```

4. **Check logs** for assignment errors

### Assignment to Wrong Team

1. Check the query's tags and message content
2. Review the team mapping logic in `teamAssignmentService.ts`
3. Check AI insights if available
4. Use `reassign` to re-process the query

## Files

- `backend/src/services/autoAssignmentService.ts` - Main orchestrator
- `backend/src/services/teamAssignmentService.ts` - Team assignment logic
- `backend/src/services/priorityDetectionService.ts` - Priority detection
- `backend/src/services/statusManagementService.ts` - Status management
- `backend/src/services/assignmentUtility.ts` - Utility functions
- `backend/src/controllers/assignmentController.ts` - API controllers
- `backend/src/scripts/assignmentUtility.ts` - CLI utility
- `backend/src/queues/queueManager.ts` - Queue workers

## Examples

### Example 1: Assign All Unassigned Queries

```bash
npm run assign:all
```

Output:
```
🔄 Assigning all unassigned queries...

✅ Batch assignment complete!
   Total processed: 25
   Successfully assigned: 23
   Skipped: 1
   Errors: 1
```

### Example 2: Check Assignment Statistics

```bash
npm run assign:stats
```

Output:
```
📊 Assignment Statistics

Total Queries: 100
Assigned: 85
Unassigned: 15

By Team:
   Support: 30 (30.0%)
   Billing: 20 (20.0%)
   Technical: 15 (15.0%)
   Account: 10 (10.0%)
   Sales: 10 (10.0%)
   Unassigned: 15 (15.0%)
```

### Example 3: Assign a Specific Query

```bash
npm run assign:single abc-123-def-456
```

Output:
```
🔍 Assigning query: abc-123-def-456

✅ Assignment successful!
   Query ID: abc-123-def-456
   Team: Billing
   User: Agent Two
   Priority: high
   Status: in_progress
   Reason: Matched by tag: billing
```


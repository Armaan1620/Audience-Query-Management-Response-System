# Auto-Assignment System Documentation

## Overview

The Auto-Assignment System automatically processes incoming queries, assigns them to appropriate teams, detects priority, manages status transitions, and logs all activities. This system is production-ready, modular, and fully integrated with the existing query management infrastructure.

## Features

✅ **Automatic Team Assignment** - Routes queries to correct teams based on tags, AI insights, and channel  
✅ **Priority Detection** - Multi-source priority detection from message content, tags, and AI insights  
✅ **Status Management** - Automatic status transitions based on priority and assignment  
✅ **Activity Logging** - Complete audit trail of all actions and decisions  
✅ **Modular Architecture** - Clean separation of concerns, easy to extend  
✅ **Production Ready** - Error handling, logging, and fallback mechanisms  

## System Architecture

```
┌─────────────────┐
│  Query Created  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Classification  │ → AI Insights + Tags
│     Queue       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Priority Queue  │ → Priority Detection
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Routing Queue  │ → Auto-Assignment Service
└────────┬────────┘
         │
         ├─→ Team Assignment Service
         ├─→ Priority Detection Service
         ├─→ Status Management Service
         └─→ Activity Logging
```

## File Structure

```
backend/src/
├── services/
│   ├── autoAssignmentService.ts      # Main orchestrator
│   ├── teamAssignmentService.ts      # Team assignment logic
│   ├── priorityDetectionService.ts   # Priority detection
│   ├── statusManagementService.ts    # Status transitions
│   └── README.md                     # Service documentation
├── repositories/
│   └── teamRepository.ts             # Team data access
├── queues/
│   └── queueManager.ts               # Queue workers (updated)
└── utils/
    └── assignmentUtils.ts            # Utility functions
```

## Core Components

### 1. Auto-Assignment Service (`autoAssignmentService.ts`)

Main orchestrator that coordinates all assignment logic.

**Key Functions:**
- `processQuery(queryId)` - Processes a query through the full assignment pipeline
- `applyUpdates()` - Applies priority, status, and assignment updates
- `logActivity()` - Logs all activities to the audit trail

**Usage:**
```typescript
import { autoAssignmentService } from './services/autoAssignmentService';

const result = await autoAssignmentService.processQuery(queryId);
// Returns: { queryId, priority, status, assignment, statusTransition }
```

### 2. Team Assignment Service (`teamAssignmentService.ts`)

Handles intelligent team assignment based on multiple factors.

**Assignment Logic:**
1. **Tag Matching** - Maps tags to teams (billing → Billing Team)
2. **AI Category** - Uses AI-detected category for team selection
3. **Channel Default** - Falls back to channel-based assignment
4. **User Assignment** - Assigns to available user in selected team

**Tag-to-Team Mapping:**
- `billing`, `payment`, `invoice` → Billing Team
- `technical`, `bug`, `error` → Technical Team
- `complaint`, `question`, `request` → Support Team
- `account`, `login`, `password` → Account Team
- `sales`, `purchase`, `upgrade` → Sales Team

### 3. Priority Detection Service (`priorityDetectionService.ts`)

Multi-source priority detection with confidence scoring.

**Detection Sources:**
- **Message Content** - Keywords like "urgent", "asap", "critical"
- **AI Insights** - Sentiment, category, urgency from AI
- **Tags** - Priority indicators in tags

**Priority Levels:**
- `urgent` - Critical issues (immediate attention)
- `high` - Important issues (prompt response)
- `medium` - Standard queries (default)
- `low` - Non-urgent feedback

### 4. Status Management Service (`statusManagementService.ts`)

Manages status transitions and workflow rules.

**Status Workflow:**
```
new → in_progress → resolved → closed
  ↓         ↓
escalated ←┘
```

**Automatic Transitions:**
- `urgent` priority → `escalated`
- `high` priority + `new` → `escalated`
- Query assigned → `in_progress` (if was `new`)

### 5. Team Repository (`teamRepository.ts`)

Database access layer for teams and users.

**Functions:**
- `findAll()` - Get all teams
- `findById(id)` - Get team by ID
- `findByName(name)` - Get team by name
- `findAvailableUsers(teamId)` - Get available users in team

## Integration

### Queue Integration

The system is integrated into the existing queue system:

```typescript
// In queueManager.ts
new Worker('routing', async (job) => {
  const { queryId } = job.data;
  const result = await autoAssignmentService.processQuery(queryId);
  // Auto-assignment complete
});
```

### Automatic Processing

When a query is created:
1. Classification queue generates AI insights and tags
2. Priority queue detects priority
3. Routing queue triggers auto-assignment
4. All activities are logged

## Configuration

### Required Teams

Ensure these teams exist in your database:
- `support` (default fallback)
- `billing`
- `technical`
- `account`
- `sales`
- `social`
- `community`

### Required User Roles

Users must have roles:
- `agent` - Can be assigned queries
- `manager` - Can be assigned queries
- `admin` - System administrators

## Customization

### Customizing Team Assignment

Edit `teamAssignmentService.ts`:

```typescript
const TAG_TO_TEAM_MAPPING: Record<string, string> = {
  'your-tag': 'your-team',
  // Add more mappings
};
```

### Customizing Priority Detection

Edit `priorityDetectionService.ts`:

```typescript
const URGENCY_KEYWORDS: Record<string, Priority> = {
  'your-keyword': 'urgent',
  // Add more keywords
};
```

### Customizing Status Workflow

Edit `statusManagementService.ts`:

```typescript
const STATUS_WORKFLOW: Record<QueryStatus, QueryStatus[]> = {
  new: ['in_progress', 'escalated'],
  // Customize transitions
};
```

## Activity Logging

All actions are logged with:
- **Action Type**: `created`, `assigned`, `status_changed`, `priority_updated`, `team_assigned`, `user_assigned`
- **Actor**: User ID (if manual) or null (if automatic)
- **Metadata**: Team, user, reason, priority, etc.
- **Timestamp**: Automatic

**Example Log Entry:**
```json
{
  "queryId": "abc123",
  "action": "team_assigned",
  "metadata": {
    "teamId": "team-1",
    "teamName": "Billing Team",
    "reason": "Matched by tag: billing",
    "auto": true
  },
  "createdAt": "2024-01-01T00:00:00Z"
}
```

## Error Handling

The system gracefully handles:
- ✅ Missing teams (falls back to support team)
- ✅ No available users (assigns to team only)
- ✅ Invalid queries (logs error and continues)
- ✅ Database failures (uses in-memory fallback)

## Monitoring

Check logs for:
- Assignment decisions and reasons
- Priority detection results
- Status transitions
- Errors and warnings

## Testing

The system includes test files:
- `autoAssignmentService.test.ts` - Unit tests for auto-assignment

Run tests:
```bash
npm test
```

## Example Flow

1. **Query Created**: "I have a billing question about my invoice"
2. **Classification**: AI detects category: "question", sentiment: "neutral"
3. **Tagging**: Tags generated: `["billing", "question", "sentiment:neutral"]`
4. **Priority Detection**: Priority: `medium` (no urgency keywords)
5. **Team Assignment**: Assigned to "Billing Team" (matched by tag: billing)
6. **User Assignment**: Assigned to available agent in Billing Team
7. **Status Update**: Status: `in_progress` (query assigned)
8. **Activity Logged**: All actions logged with metadata

## Production Considerations

- ✅ All operations are async and non-blocking
- ✅ Queue-based processing for scalability
- ✅ Comprehensive error handling
- ✅ Detailed logging for debugging
- ✅ Fallback mechanisms for reliability
- ✅ Modular design for easy maintenance

## Next Steps

1. **Create Teams**: Ensure required teams exist in database
2. **Create Users**: Add users with appropriate roles to teams
3. **Test**: Create test queries and verify assignment
4. **Monitor**: Check logs to ensure proper assignment
5. **Customize**: Adjust mappings and rules as needed

## Support

For issues or questions:
- Check logs in `backend/logs/`
- Review service documentation in `backend/src/services/README.md`
- Verify team and user setup in database


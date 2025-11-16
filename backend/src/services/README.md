# Auto-Assignment System

This directory contains the auto-assignment system that automatically processes incoming queries, assigns them to appropriate teams, detects priority, manages status transitions, and logs all activities.

## Architecture

The auto-assignment system consists of several modular services:

### Core Services

1. **`autoAssignmentService.ts`** - Main orchestrator that coordinates all assignment logic
2. **`teamAssignmentService.ts`** - Handles team assignment based on tags, AI insights, and channel
3. **`priorityDetectionService.ts`** - Detects query priority and urgency from multiple sources
4. **`statusManagementService.ts`** - Manages status transitions and workflow rules

### Supporting Repositories

- **`teamRepository.ts`** - Database access for teams and users

## How It Works

### 1. Query Creation Flow

When a new query is created:

1. Query is saved to database with initial status `new`
2. Classification queue processes the message and generates AI insights + tags
3. Priority queue detects priority from message, tags, and AI insights
4. Routing queue triggers auto-assignment:
   - Determines appropriate team based on tags/AI insights
   - Assigns to available user in that team
   - Updates priority if needed
   - Transitions status based on priority and assignment
   - Logs all activities

### 2. Team Assignment Logic

Teams are assigned based on:

- **Tag Matching**: Tags like `billing`, `technical`, `account` map to specific teams
- **AI Category**: AI-detected category (complaint, question, etc.) influences team selection
- **Channel**: Default team assignment based on channel (email → support, social → social)
- **Fallback**: Defaults to "support" team if no match found

**Tag-to-Team Mapping:**
- `billing`, `payment`, `invoice`, `refund` → Billing Team
- `technical`, `bug`, `error`, `issue` → Technical Team
- `complaint`, `feedback`, `question`, `request` → Support Team
- `account`, `login`, `password`, `security` → Account Team
- `sales`, `purchase`, `upgrade`, `plan` → Sales Team

### 3. Priority Detection

Priority is detected from multiple sources:

- **Message Content**: Keywords like "urgent", "asap", "critical" → higher priority
- **AI Insights**: Sentiment (negative → high), category (complaint → high), urgency
- **Tags**: Tags containing "urgent", "critical", "complaint" → higher priority

**Priority Levels:**
- `urgent` - Critical issues requiring immediate attention
- `high` - Important issues that need prompt response
- `medium` - Standard queries (default)
- `low` - Non-urgent feedback or general inquiries

### 4. Status Management

Status transitions follow a workflow:

```
new → in_progress → resolved → closed
  ↓         ↓
escalated ←┘
```

**Automatic Status Transitions:**
- `urgent` priority → `escalated`
- `high` priority + `new` status → `escalated`
- Query assigned to team/user → `in_progress` (if was `new`)

### 5. Activity Logging

All actions are logged with:
- Action type (created, assigned, status_changed, priority_updated)
- Actor (user ID if manual, null if automatic)
- Metadata (team, user, reason, etc.)
- Timestamp

## Usage

### Automatic Processing

Auto-assignment runs automatically when queries are created via the queue system. No manual intervention needed.

### Manual Trigger

```typescript
import { autoAssignmentService } from './services/autoAssignmentService';

const result = await autoAssignmentService.processQuery(queryId);
console.log(result);
// {
//   queryId: '...',
//   priority: 'high',
//   status: 'escalated',
//   assignment: { teamId: '...', teamName: '...', reason: '...' },
//   statusTransition: { from: 'new', to: 'escalated', reason: '...' }
// }
```

### Customizing Team Assignment

Edit `teamAssignmentService.ts` to modify:
- `TAG_TO_TEAM_MAPPING` - Map tags to team names
- `CHANNEL_TO_TEAM_MAPPING` - Map channels to default teams
- `assignToAvailableUser()` - Change user selection logic

### Customizing Priority Detection

Edit `priorityDetectionService.ts` to modify:
- `URGENCY_KEYWORDS` - Add/remove urgency keywords
- `SENTIMENT_PRIORITY_MAP` - Adjust sentiment-to-priority mapping
- `CATEGORY_PRIORITY_MAP` - Adjust category-to-priority mapping

### Customizing Status Workflow

Edit `statusManagementService.ts` to modify:
- `STATUS_WORKFLOW` - Define allowed status transitions
- `PRIORITY_TO_STATUS_MAP` - Map priorities to initial statuses
- `getStatusTransition()` - Customize automatic status transitions

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

## Testing

Run tests with:

```bash
npm test
```

## Monitoring

All activities are logged. Check logs for:
- Assignment decisions and reasons
- Priority detection results
- Status transitions
- Errors and warnings

## Error Handling

The system gracefully handles:
- Missing teams (falls back to support team)
- No available users (assigns to team only)
- Invalid queries (logs error and continues)
- Database failures (uses in-memory fallback)


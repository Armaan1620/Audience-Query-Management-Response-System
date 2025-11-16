import { teamRepository } from '../repositories/teamRepository';
import { logger } from '../utils/logger';

export interface QueryTag {
  name: string;
  confidence: number;
}

export interface AssignmentResult {
  teamId?: string | undefined;
  teamName?: string | undefined;
  userId?: string | undefined;
  userName?: string | undefined;
  reason: string;
}

const TAG_TO_TEAM_MAPPING: Record<string, string> = {
  billing: 'Billing Team',
  payment: 'Billing Team',
  invoice: 'Billing Team',
  refund: 'Billing Team',
  subscription: 'Billing Team',
  charge: 'Billing Team',
  technical: 'Technical Team',
  bug: 'Technical Team',
  error: 'Technical Team',
  issue: 'Technical Team',
  problem: 'Technical Team',
  broken: 'Technical Team',
  not_working: 'Technical Team',
  complaint: 'Support Team',
  feedback: 'Support Team',
  question: 'Support Team',
  request: 'Support Team',
  help: 'Support Team',
  assistance: 'Support Team',
  account: 'Support Team',
  login: 'Support Team',
  password: 'Support Team',
  access: 'Support Team',
  security: 'Support Team',
  verification: 'Support Team',
  sales: 'Product Team',
  purchase: 'Product Team',
  upgrade: 'Product Team',
  plan: 'Product Team',
  feature: 'Product Team',
  product: 'Product Team',
  operations: 'Operations Team',
  process: 'Operations Team',
  workflow: 'Operations Team',
  escalated: 'Escalations Team',
  urgent: 'Escalations Team',
  critical: 'Escalations Team',
  priority: 'Escalations Team',
};

const CHANNEL_TO_TEAM_MAPPING: Record<string, string> = {
  email: 'Support Team',
  social: 'Support Team',
  chat: 'Support Team',
  community: 'Support Team',
};

function normalizeTagName(tag: string): string {
  return tag
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .replace(/sentiment:/g, '')
    .replace(/urgency:/g, '');
}

function extractTagsFromQuery(tags: unknown): QueryTag[] {
  if (!tags) return [];

  if (Array.isArray(tags)) {
    return tags
      .filter((tag): tag is QueryTag => {
        return (
          typeof tag === 'object' &&
          tag !== null &&
          'name' in tag &&
          typeof tag.name === 'string'
        );
      })
      .map((tag) => ({
        name: tag.name,
        confidence: typeof tag.confidence === 'number' ? tag.confidence : 0.5,
      }));
  }

  return [];
}

function findTeamByTag(tags: QueryTag[]): string | null {
  for (const tag of tags) {
    const normalized = normalizeTagName(tag.name);
    const teamName = TAG_TO_TEAM_MAPPING[normalized];

    if (teamName && tag.confidence >= 0.3) {
      logger.debug({ tag: tag.name, normalized, teamName }, 'Found team match by tag');
      return teamName;
    }
  }

  return null;
}

async function findTeamByName(teamName: string) {
  const team = await teamRepository.findByName(teamName);
  if (team) {
    return team;
  }

  const allTeams = await teamRepository.findAll();
  const normalizedName = teamName.toLowerCase();

  return (
    allTeams.find((t) => t.name.toLowerCase() === normalizedName) ||
    allTeams.find((t) => t.name.toLowerCase().includes(normalizedName)) ||
    null
  );
}

async function assignToAvailableUser(teamId: string): Promise<{ userId?: string; userName?: string }> {
  const users = await teamRepository.findAvailableUsers(teamId);

  if (users.length === 0) {
    logger.warn({ teamId }, 'No available users found in team');
    return {};
  }

  const availableUser = users.find((u) => u.role === 'agent') || users[0];

  if (!availableUser) {
    return {};
  }

  return {
    userId: availableUser.id,
    userName: availableUser.name,
  };
}

async function ensureTeamExists(teamName: string): Promise<{ id: string; name: string } | null> {
  // First try to find existing team
  let team = await findTeamByName(teamName);
  if (team) {
    return team;
  }

  // Try case-insensitive search
  const allTeams = await teamRepository.findAll();
  const foundTeam = allTeams.find((t) => t.name.toLowerCase() === teamName.toLowerCase());
  if (foundTeam) {
    return foundTeam;
  }

    // Team doesn't exist, create it
    logger.info({ teamName }, 'Team not found, creating new team');
    try {
      const teamDescriptions: Record<string, string> = {
        'Support Team': 'General customer support team',
        'Billing Team': 'Billing and payment inquiries',
        'Technical Team': 'Technical support and bug reports',
        'Operations Team': 'Operations and process management',
        'Product Team': 'Product inquiries and feature requests',
        'Escalations Team': 'Escalated issues and complex problems',
      };

      // Use the team name as-is if it matches a known team, otherwise format it
      let finalTeamName = teamName;
      if (!teamDescriptions[teamName]) {
        // If it doesn't match exactly, try to format it
        const lowerName = teamName.toLowerCase();
        if (lowerName.includes('support')) {
          finalTeamName = 'Support Team';
        } else if (lowerName.includes('billing')) {
          finalTeamName = 'Billing Team';
        } else if (lowerName.includes('technical')) {
          finalTeamName = 'Technical Team';
        } else if (lowerName.includes('operations')) {
          finalTeamName = 'Operations Team';
        } else if (lowerName.includes('product')) {
          finalTeamName = 'Product Team';
        } else if (lowerName.includes('escalat')) {
          finalTeamName = 'Escalations Team';
        } else {
          // Default: capitalize and add "Team"
          finalTeamName = teamName.charAt(0).toUpperCase() + teamName.slice(1).toLowerCase() + ' Team';
        }
      }
      
      const newTeam = await teamRepository.create({
        name: finalTeamName,
        description: teamDescriptions[finalTeamName] || `${finalTeamName} team`,
      });
      
      logger.info({ teamId: newTeam.id, teamName: newTeam.name }, 'Created new team');
      return newTeam;
    } catch (createError) {
      logger.error({ error: createError, teamName }, 'Failed to create team');
      return null;
    }
}

export const teamAssignmentService = {
  async assignTeam(
    tags: unknown,
    channel: string,
    message: string,
    aiInsights?: unknown
  ): Promise<AssignmentResult> {
    const queryTags = extractTagsFromQuery(tags);
    const lowerMessage = message.toLowerCase();

    logger.debug({ queryTags, channel }, 'Determining team assignment');

    let teamName: string | null = null;
    let reason = '';

    const tagBasedTeam = findTeamByTag(queryTags);
    if (tagBasedTeam) {
      teamName = tagBasedTeam;
      reason = `Matched by tag: ${queryTags.find((t) => normalizeTagName(t.name) in TAG_TO_TEAM_MAPPING)?.name}`;
    } else if (aiInsights && typeof aiInsights === 'object' && aiInsights !== null) {
      const insights = aiInsights as Record<string, unknown>;
      const category = insights.category as string | undefined;

      if (category) {
        const normalizedCategory = normalizeTagName(category);
        teamName = TAG_TO_TEAM_MAPPING[normalizedCategory] || null;
        if (teamName) {
          reason = `Matched by AI category: ${category}`;
        }
      }
    }

    if (!teamName) {
      teamName = CHANNEL_TO_TEAM_MAPPING[channel] || 'Support Team';
      reason = `Default assignment by channel: ${channel}`;
    }

    // Ensure team exists (create if it doesn't)
    const team = await ensureTeamExists(teamName);
    if (!team) {
      logger.error({ teamName }, 'Failed to find or create team');
      return {
        reason: `Failed to find or create team: ${teamName}`,
      };
    }

    const userAssignment = await assignToAvailableUser(team.id);

    return {
      teamId: team.id,
      teamName: team.name,
      userId: userAssignment.userId,
      userName: userAssignment.userName,
      reason,
    };
  },
};


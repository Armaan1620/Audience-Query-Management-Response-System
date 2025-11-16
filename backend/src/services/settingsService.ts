import { prisma } from '../config/prisma';
import { logger } from '../utils/logger';

export interface TeamSettings {
  teams: Array<{
    name: string;
    role: string;
    active: boolean;
    workingHours?: {
      start: string;
      end: string;
      timezone: string;
    };
  }>;
  escalationTeams: string[];
  escalationRules: Array<{
    condition: string;
    targetTeam: string;
  }>;
}

export interface RoutingSettings {
  tagToTeam: Record<string, string>;
  keywordToTeam: Record<string, string>;
  channelRules: Record<string, string>;
  fallbackTeam: string;
}

export interface PrioritySettings {
  urgencyKeywords: string[];
  sentimentThreshold: number;
  priorityLevels: Array<{
    level: string;
    slaMinutes: number;
  }>;
  autoEscalationRules: Array<{
    priority: string;
    timeoutMinutes: number;
    targetTeam: string;
  }>;
}

export interface AutoTaggingSettings {
  tagDefinitions: Array<{
    name: string;
    keywords: string[];
    confidence: number;
  }>;
  autoTagRules: Array<{
    condition: string;
    tags: string[];
  }>;
  customTags: string[];
}

export interface AssignmentSettings {
  assignmentMode: 'round-robin' | 'load-based' | 'team-queue';
  autoAssign: boolean;
  assignmentRetries: number;
  reassignmentRules: Array<{
    statusChange: string;
    action: string;
  }>;
}

export interface StatusWorkflowSettings {
  allowedStatuses: string[];
  transitionRules: Array<{
    from: string;
    to: string;
    condition?: string;
  }>;
  timeouts: Array<{
    status: string;
    timeoutMinutes: number;
    nextStatus: string;
  }>;
  slaViolationRules: Array<{
    priority: string;
    violationAction: string;
  }>;
}

export interface ChannelSettings {
  channels: Array<{
    name: string;
    type: string;
    active: boolean;
    apiKey?: string;
    oauthToken?: string;
    syncFrequency: number;
    priority: number;
  }>;
  duplicateHandling: 'ignore' | 'merge' | 'separate';
}

export interface NotificationSettings {
  priorityNotifications: Array<{
    priority: string;
    channels: string[];
  }>;
  escalationNotifications: {
    email: boolean;
    sms: boolean;
    slack: boolean;
  };
  slaBreakNotifications: {
    notifyTeamLeads: boolean;
    channels: string[];
  };
  dailyDigest: {
    enabled: boolean;
    time: string;
    recipients: string[];
  };
}

export interface AnalyticsSettings {
  metrics: string[];
  exportFrequency: 'daily' | 'weekly' | 'monthly';
  dashboardCustomization: Record<string, unknown>;
  dataRetentionDays: number;
}

export interface AdminSettings {
  teamMembers: Array<{
    email: string;
    name: string;
    role: 'admin' | 'lead' | 'agent';
    teamId?: string;
  }>;
  rolePermissions: Record<string, string[]>;
  auditLogsEnabled: boolean;
  apiKeys: Array<{
    name: string;
    key: string;
    expiresAt?: string;
  }>;
  integrationTokens: Array<{
    service: string;
    token: string;
  }>;
}

export interface AllSettings {
  teams: TeamSettings;
  routing: RoutingSettings;
  priority: PrioritySettings;
  autoTagging: AutoTaggingSettings;
  assignment: AssignmentSettings;
  statusWorkflow: StatusWorkflowSettings;
  channels: ChannelSettings;
  notifications: NotificationSettings;
  analytics: AnalyticsSettings;
  admin: AdminSettings;
}

const DEFAULT_SETTINGS: AllSettings = {
  teams: {
    teams: [
      { name: 'Support Team', role: 'Support', active: true },
      { name: 'Billing Team', role: 'Billing', active: true },
      { name: 'Technical Team', role: 'Technical', active: true },
      { name: 'Operations Team', role: 'Operations', active: true },
      { name: 'Product Team', role: 'Product', active: true },
      { name: 'Escalations Team', role: 'Escalations', active: true },
    ],
    escalationTeams: ['Escalations Team'],
    escalationRules: [],
  },
  routing: {
    tagToTeam: {
      billing: 'Billing Team',
      payment: 'Billing Team',
      technical: 'Technical Team',
      bug: 'Technical Team',
      support: 'Support Team',
      product: 'Product Team',
      operations: 'Operations Team',
      escalated: 'Escalations Team',
    },
    keywordToTeam: {},
    channelRules: {
      email: 'Support Team',
      social: 'Support Team',
      chat: 'Support Team',
      community: 'Support Team',
    },
    fallbackTeam: 'Support Team',
  },
  priority: {
    urgencyKeywords: ['urgent', 'critical', 'asap', 'emergency'],
    sentimentThreshold: 0.7,
    priorityLevels: [
      { level: 'P1', slaMinutes: 60 },
      { level: 'P2', slaMinutes: 240 },
      { level: 'P3', slaMinutes: 1440 },
    ],
    autoEscalationRules: [],
  },
  autoTagging: {
    tagDefinitions: [],
    autoTagRules: [],
    customTags: [],
  },
  assignment: {
    assignmentMode: 'round-robin',
    autoAssign: true,
    assignmentRetries: 3,
    reassignmentRules: [],
  },
  statusWorkflow: {
    allowedStatuses: ['new', 'in_progress', 'escalated', 'resolved', 'closed'],
    transitionRules: [],
    timeouts: [],
    slaViolationRules: [],
  },
  channels: {
    channels: [],
    duplicateHandling: 'ignore',
  },
  notifications: {
    priorityNotifications: [],
    escalationNotifications: {
      email: true,
      sms: false,
      slack: false,
    },
    slaBreakNotifications: {
      notifyTeamLeads: true,
      channels: ['email'],
    },
    dailyDigest: {
      enabled: false,
      time: '09:00',
      recipients: [],
    },
  },
  analytics: {
    metrics: ['avg_response_time', 'resolution_rate', 'tag_distribution', 'team_performance'],
    exportFrequency: 'weekly',
    dashboardCustomization: {},
    dataRetentionDays: 365,
  },
  admin: {
    teamMembers: [],
    rolePermissions: {
      admin: ['all'],
      lead: ['view', 'assign', 'update'],
      agent: ['view', 'update'],
    },
    auditLogsEnabled: true,
    apiKeys: [],
    integrationTokens: [],
  },
};

let useInMemorySettings = false;
const memorySettings: Record<string, any> = {};

function switchToInMemory(err: unknown) {
  if (!useInMemorySettings) {
    useInMemorySettings = true;
    logger.warn({ err }, 'Prisma database unavailable, switching to in-memory settings store');
  }
}

export const settingsService = {
  async getSettings(category?: string): Promise<Partial<AllSettings> | AllSettings> {
    if (useInMemorySettings) {
      if (category) {
        return { [category]: memorySettings[category] || DEFAULT_SETTINGS[category as keyof AllSettings] } as Partial<AllSettings>;
      }
      const result: Partial<AllSettings> = {};
      for (const categoryKey of Object.keys(DEFAULT_SETTINGS) as Array<keyof AllSettings>) {
        result[categoryKey] = memorySettings[categoryKey] || DEFAULT_SETTINGS[categoryKey];
      }
      return result as AllSettings;
    }

    try {
      if (category) {
        const setting = await prisma.settings.findUnique({
          where: { category },
        });
        if (setting) {
          return { [category]: setting.data } as Partial<AllSettings>;
        }
        return { [category]: DEFAULT_SETTINGS[category as keyof AllSettings] } as Partial<AllSettings>;
      }

      // Get all settings
      const allSettings = await prisma.settings.findMany();
      const result: Partial<AllSettings> = {};

      for (const categoryKey of Object.keys(DEFAULT_SETTINGS) as Array<keyof AllSettings>) {
        const setting = allSettings.find((s) => s.category === categoryKey);
        result[categoryKey] = (setting?.data as any) || DEFAULT_SETTINGS[categoryKey];
      }

      return result as AllSettings;
    } catch (err) {
      switchToInMemory(err);
      if (category) {
        return { [category]: memorySettings[category] || DEFAULT_SETTINGS[category as keyof AllSettings] } as Partial<AllSettings>;
      }
      const result: Partial<AllSettings> = {};
      for (const categoryKey of Object.keys(DEFAULT_SETTINGS) as Array<keyof AllSettings>) {
        result[categoryKey] = memorySettings[categoryKey] || DEFAULT_SETTINGS[categoryKey];
      }
      return result as AllSettings;
    }
  },

  async updateSettings(category: keyof AllSettings, data: any, updatedBy?: string): Promise<void> {
    if (useInMemorySettings) {
      memorySettings[category] = data;
      logger.info({ category }, 'Settings updated (in-memory)');
      return;
    }

    try {
      await prisma.settings.upsert({
        where: { category },
        update: {
          data,
          updatedBy,
        },
        create: {
          category,
          data,
          updatedBy,
        },
      });
      logger.info({ category }, 'Settings updated');
    } catch (err) {
      switchToInMemory(err);
      memorySettings[category] = data;
      logger.info({ category }, 'Settings updated (in-memory fallback)');
    }
  },

  async resetSettings(category?: keyof AllSettings): Promise<void> {
    if (useInMemorySettings) {
      if (category) {
        delete memorySettings[category];
      } else {
        Object.keys(memorySettings).forEach((key) => delete memorySettings[key]);
      }
      logger.info({ category }, 'Settings reset (in-memory)');
      return;
    }

    try {
      if (category) {
        await prisma.settings.delete({
          where: { category },
        });
        delete memorySettings[category];
      } else {
        await prisma.settings.deleteMany({});
        Object.keys(memorySettings).forEach((key) => delete memorySettings[key]);
      }
      logger.info({ category }, 'Settings reset');
    } catch (err) {
      switchToInMemory(err);
      if (category) {
        delete memorySettings[category];
      } else {
        Object.keys(memorySettings).forEach((key) => delete memorySettings[key]);
      }
      logger.info({ category }, 'Settings reset (in-memory fallback)');
    }
  },
};


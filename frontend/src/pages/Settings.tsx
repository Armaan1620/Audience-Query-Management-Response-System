import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { Card } from '../components/Card';
import { Loader } from '../components/Loader';
import { Badge } from '../components/Badge';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

type SettingsCategory = 
  | 'teams' 
  | 'routing' 
  | 'priority' 
  | 'autoTagging' 
  | 'assignment' 
  | 'statusWorkflow' 
  | 'channels' 
  | 'notifications' 
  | 'analytics' 
  | 'admin';

const SETTINGS_TABS: Array<{ id: SettingsCategory; label: string; icon: string }> = [
  { id: 'teams', label: 'Team Settings', icon: '👥' },
  { id: 'routing', label: 'Routing Settings', icon: '🔄' },
  { id: 'priority', label: 'Priority/Urgency', icon: '⚡' },
  { id: 'autoTagging', label: 'Auto-Tagging', icon: '🏷️' },
  { id: 'assignment', label: 'Assignment', icon: '📋' },
  { id: 'statusWorkflow', label: 'Status Workflow', icon: '📊' },
  { id: 'channels', label: 'Channels', icon: '📱' },
  { id: 'notifications', label: 'Notifications', icon: '🔔' },
  { id: 'analytics', label: 'Analytics', icon: '📈' },
  { id: 'admin', label: 'Admin', icon: '⚙️' },
];

export const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState<SettingsCategory>('teams');
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<any>>('/settings');
      return res.data.data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ category, data }: { category: string; data: any }) => {
      const res = await api.put('/settings', { category, data });
      return res.data;
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      // Show success message
      const successMsg = data?.message || 'Settings saved successfully!';
      alert(`✅ ${successMsg}`);
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.message || error.message || 'Unknown error';
      alert(`❌ Error saving settings: ${errorMsg}`);
      console.error('Settings save error:', error);
    },
  });

  const handleSave = (category: SettingsCategory, data: any) => {
    updateMutation.mutate({ category, data });
  };

  if (isLoading) return <Loader />;

  // Get default settings if not loaded
  const defaultSettings: any = {
    teams: { teams: [], escalationTeams: [], escalationRules: [] },
    routing: { tagToTeam: {}, keywordToTeam: {}, channelRules: {}, fallbackTeam: 'Support Team' },
    priority: { urgencyKeywords: [], sentimentThreshold: 0.7, priorityLevels: [], autoEscalationRules: [] },
    autoTagging: { tagDefinitions: [], autoTagRules: [], customTags: [] },
    assignment: { assignmentMode: 'round-robin', autoAssign: true, assignmentRetries: 3, reassignmentRules: [] },
    statusWorkflow: { allowedStatuses: ['new', 'in_progress', 'escalated', 'resolved', 'closed'], transitionRules: [], timeouts: [], slaViolationRules: [] },
    channels: { channels: [], duplicateHandling: 'ignore' },
    notifications: { priorityNotifications: [], escalationNotifications: { email: true, sms: false, slack: false }, slaBreakNotifications: { notifyTeamLeads: true, channels: [] }, dailyDigest: { enabled: false, time: '09:00', recipients: [] } },
    analytics: { metrics: ['avg_response_time', 'resolution_rate', 'tag_distribution', 'team_performance'], exportFrequency: 'weekly', dashboardCustomization: {}, dataRetentionDays: 365 },
    admin: { teamMembers: [], rolePermissions: { admin: ['all'], lead: ['view', 'assign', 'update'], agent: ['view', 'update'] }, auditLogsEnabled: true, apiKeys: [], integrationTokens: [] },
  };

  const currentSettings = settings?.[activeTab] || defaultSettings[activeTab] || {};

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="mb-8 animate-slide-down">
        <h2 className="text-3xl font-bold gradient-text">Settings</h2>
        <p className="text-slate-500 mt-1">Configure your query management system</p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar Navigation */}
        <div className="w-64 flex-shrink-0">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-4 shadow-soft">
            <nav className="space-y-2">
              {SETTINGS_TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-glow scale-105'
                      : 'text-slate-700 hover:bg-slate-100 hover:scale-105'
                  }`}
                >
                  <span className="text-xl">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Settings Content */}
        <div className="flex-1">
          {activeTab === 'teams' && <TeamSettings settings={currentSettings} onSave={(data) => handleSave('teams', data)} isSaving={updateMutation.isPending} />}
          {activeTab === 'routing' && <RoutingSettings settings={currentSettings} onSave={(data) => handleSave('routing', data)} isSaving={updateMutation.isPending} />}
          {activeTab === 'priority' && <PrioritySettings settings={currentSettings} onSave={(data) => handleSave('priority', data)} isSaving={updateMutation.isPending} />}
          {activeTab === 'autoTagging' && <AutoTaggingSettings settings={currentSettings} onSave={(data) => handleSave('autoTagging', data)} isSaving={updateMutation.isPending} />}
          {activeTab === 'assignment' && <AssignmentSettings settings={currentSettings} onSave={(data) => handleSave('assignment', data)} isSaving={updateMutation.isPending} />}
          {activeTab === 'statusWorkflow' && <StatusWorkflowSettings settings={currentSettings} onSave={(data) => handleSave('statusWorkflow', data)} isSaving={updateMutation.isPending} />}
          {activeTab === 'channels' && <ChannelSettings settings={currentSettings} onSave={(data) => handleSave('channels', data)} isSaving={updateMutation.isPending} />}
          {activeTab === 'notifications' && <NotificationSettings settings={currentSettings} onSave={(data) => handleSave('notifications', data)} isSaving={updateMutation.isPending} />}
          {activeTab === 'analytics' && <AnalyticsSettings settings={currentSettings} onSave={(data) => handleSave('analytics', data)} isSaving={updateMutation.isPending} />}
          {activeTab === 'admin' && <AdminSettings settings={currentSettings} onSave={(data) => handleSave('admin', data)} isSaving={updateMutation.isPending} />}
        </div>
      </div>
    </div>
  );
};

// Team Settings Component
const TeamSettings = ({ settings, onSave, isSaving }: { settings: any; onSave: (data: any) => void; isSaving?: boolean }) => {
  const [formData, setFormData] = useState({
    teams: [],
    escalationTeams: [],
    escalationRules: [],
  });

  useEffect(() => {
    if (settings && Object.keys(settings).length > 0) {
      setFormData({
        teams: settings.teams || [],
        escalationTeams: settings.escalationTeams || [],
        escalationRules: settings.escalationRules || [],
      });
    }
  }, [settings]);

  return (
    <Card title="Team Settings" description="Manage team names, roles, availability, and escalation rules">
      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Teams</h3>
            <button
              onClick={() => {
                setFormData({
                  ...formData,
                  teams: [...(formData.teams || []), { name: '', role: 'Support', active: true }],
                });
              }}
              className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 text-sm"
            >
              + Add Team
            </button>
          </div>
          <div className="space-y-3">
            {formData.teams?.map((team: any, idx: number) => (
              <div key={idx} className="p-4 border border-slate-200 rounded-xl">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Team Name</label>
                    <input
                      type="text"
                      value={team.name || ''}
                      onChange={(e) => {
                        const newTeams = [...formData.teams];
                        newTeams[idx].name = e.target.value;
                        setFormData({ ...formData, teams: newTeams });
                      }}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Role</label>
                    <select
                      value={team.role || ''}
                      onChange={(e) => {
                        const newTeams = [...formData.teams];
                        newTeams[idx].role = e.target.value;
                        setFormData({ ...formData, teams: newTeams });
                      }}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    >
                      <option>Support</option>
                      <option>Billing</option>
                      <option>Technical</option>
                      <option>Operations</option>
                      <option>Product</option>
                      <option>Escalations</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={team.active !== false}
                      onChange={(e) => {
                        const newTeams = [...formData.teams];
                        newTeams[idx].active = e.target.checked;
                        setFormData({ ...formData, teams: newTeams });
                      }}
                      className="w-4 h-4"
                    />
                    <label className="text-sm">Active</label>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Escalation Teams</h3>
          <div className="space-y-2">
            {formData.escalationTeams?.map((team: string, idx: number) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  value={team}
                  onChange={(e) => {
                    const newTeams = [...formData.escalationTeams];
                    newTeams[idx] = e.target.value;
                    setFormData({ ...formData, escalationTeams: newTeams });
                  }}
                  className="flex-1 px-3 py-2 border border-slate-200 rounded-lg"
                />
                <button
                  onClick={() => {
                    setFormData({
                      ...formData,
                      escalationTeams: formData.escalationTeams.filter((_: any, i: number) => i !== idx),
                    });
                  }}
                  className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              onClick={() => {
                setFormData({
                  ...formData,
                  escalationTeams: [...(formData.escalationTeams || []), ''],
                });
              }}
              className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
            >
              + Add Escalation Team
            </button>
          </div>
        </div>

        <button
          onClick={() => onSave(formData)}
          disabled={isSaving}
          className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? 'Saving...' : 'Save Team Settings'}
        </button>
      </div>
    </Card>
  );
};

// Routing Settings Component
const RoutingSettings = ({ settings, onSave, isSaving }: { settings: any; onSave: (data: any) => void; isSaving?: boolean }) => {
  const [formData, setFormData] = useState({
    tagToTeam: {},
    keywordToTeam: {},
    channelRules: {},
    fallbackTeam: 'Support Team',
  });
  const [newTag, setNewTag] = useState({ tag: '', team: '' });
  const [newKeyword, setNewKeyword] = useState({ keyword: '', team: '' });
  const [newChannel, setNewChannel] = useState({ channel: '', team: '' });

  useEffect(() => {
    if (settings && Object.keys(settings).length > 0) {
      setFormData({
        tagToTeam: settings.tagToTeam || {},
        keywordToTeam: settings.keywordToTeam || {},
        channelRules: settings.channelRules || {},
        fallbackTeam: settings.fallbackTeam || 'Support Team',
      });
    }
  }, [settings]);

  return (
    <Card title="Routing Settings" description="Configure how queries are routed to teams">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Tag → Team Mapping</h3>
          <div className="space-y-2 mb-4">
            {Object.entries(formData.tagToTeam || {}).map(([tag, team]: [string, any]) => (
              <div key={tag} className="flex gap-2">
                <input type="text" value={tag} readOnly className="flex-1 px-3 py-2 border border-slate-200 rounded-lg bg-slate-50" />
                <span className="self-center">→</span>
                <input
                  type="text"
                  value={team}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      tagToTeam: { ...formData.tagToTeam, [tag]: e.target.value },
                    });
                  }}
                  className="flex-1 px-3 py-2 border border-slate-200 rounded-lg"
                />
                <button
                  onClick={() => {
                    const newTagToTeam = { ...formData.tagToTeam };
                    delete newTagToTeam[tag];
                    setFormData({ ...formData, tagToTeam: newTagToTeam });
                  }}
                  className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
                >
                  Remove
                </button>
              </div>
            ))}
            {Object.keys(formData.tagToTeam || {}).length === 0 && (
              <p className="text-sm text-slate-500 text-center py-2">No tag mappings. Add one below.</p>
            )}
          </div>
          <div className="flex gap-2 p-4 bg-slate-50 rounded-lg">
            <input
              type="text"
              placeholder="Tag name"
              value={newTag.tag}
              onChange={(e) => setNewTag({ ...newTag, tag: e.target.value })}
              className="flex-1 px-3 py-2 border border-slate-200 rounded-lg"
            />
            <input
              type="text"
              placeholder="Team name"
              value={newTag.team}
              onChange={(e) => setNewTag({ ...newTag, team: e.target.value })}
              className="flex-1 px-3 py-2 border border-slate-200 rounded-lg"
            />
            <button
              onClick={() => {
                if (newTag.tag && newTag.team) {
                  setFormData({
                    ...formData,
                    tagToTeam: { ...formData.tagToTeam, [newTag.tag]: newTag.team },
                  });
                  setNewTag({ tag: '', team: '' });
                }
              }}
              className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
            >
              Add
            </button>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Channel Rules</h3>
          <div className="space-y-2 mb-4">
            {Object.entries(formData.channelRules || {}).map(([channel, team]: [string, any]) => (
              <div key={channel} className="flex gap-2">
                <input type="text" value={channel} readOnly className="flex-1 px-3 py-2 border border-slate-200 rounded-lg bg-slate-50" />
                <span className="self-center">→</span>
                <input
                  type="text"
                  value={team}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      channelRules: { ...formData.channelRules, [channel]: e.target.value },
                    });
                  }}
                  className="flex-1 px-3 py-2 border border-slate-200 rounded-lg"
                />
                <button
                  onClick={() => {
                    const newChannelRules = { ...formData.channelRules };
                    delete newChannelRules[channel];
                    setFormData({ ...formData, channelRules: newChannelRules });
                  }}
                  className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
                >
                  Remove
                </button>
              </div>
            ))}
            {Object.keys(formData.channelRules || {}).length === 0 && (
              <p className="text-sm text-slate-500 text-center py-2">No channel rules. Add one below.</p>
            )}
          </div>
          <div className="flex gap-2 p-4 bg-slate-50 rounded-lg">
            <input
              type="text"
              placeholder="Channel (email, chat, etc.)"
              value={newChannel.channel}
              onChange={(e) => setNewChannel({ ...newChannel, channel: e.target.value })}
              className="flex-1 px-3 py-2 border border-slate-200 rounded-lg"
            />
            <input
              type="text"
              placeholder="Team name"
              value={newChannel.team}
              onChange={(e) => setNewChannel({ ...newChannel, team: e.target.value })}
              className="flex-1 px-3 py-2 border border-slate-200 rounded-lg"
            />
            <button
              onClick={() => {
                if (newChannel.channel && newChannel.team) {
                  setFormData({
                    ...formData,
                    channelRules: { ...formData.channelRules, [newChannel.channel]: newChannel.team },
                  });
                  setNewChannel({ channel: '', team: '' });
                }
              }}
              className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
            >
              Add
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Fallback Team</label>
          <input
            type="text"
            value={formData.fallbackTeam || ''}
            onChange={(e) => setFormData({ ...formData, fallbackTeam: e.target.value })}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg"
          />
        </div>

        <button
          onClick={() => onSave(formData)}
          disabled={isSaving}
          className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? 'Saving...' : 'Save Routing Settings'}
        </button>
      </div>
    </Card>
  );
};

// Priority Settings Component
const PrioritySettings = ({ settings, onSave, isSaving }: { settings: any; onSave: (data: any) => void; isSaving?: boolean }) => {
  const [formData, setFormData] = useState({
    urgencyKeywords: [],
    sentimentThreshold: 0.7,
    priorityLevels: [],
    autoEscalationRules: [],
  });

  useEffect(() => {
    if (settings && Object.keys(settings).length > 0) {
      setFormData({
        urgencyKeywords: settings.urgencyKeywords || [],
        sentimentThreshold: settings.sentimentThreshold ?? 0.7,
        priorityLevels: settings.priorityLevels || [],
        autoEscalationRules: settings.autoEscalationRules || [],
      });
    }
  }, [settings]);

  return (
    <Card title="Priority & Urgency Settings" description="Configure priority levels, SLA rules, and auto-escalation">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Urgency Keywords</h3>
          <textarea
            value={(formData.urgencyKeywords || []).join(', ')}
            onChange={(e) => {
              setFormData({
                ...formData,
                urgencyKeywords: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
              });
            }}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            placeholder="urgent, critical, asap, emergency"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Sentiment Threshold (0-1)</label>
          <input
            type="number"
            step="0.1"
            min="0"
            max="1"
            value={formData.sentimentThreshold || 0.7}
            onChange={(e) => setFormData({ ...formData, sentimentThreshold: parseFloat(e.target.value) })}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Priority Levels & SLA</h3>
            <button
              onClick={() => {
                setFormData({
                  ...formData,
                  priorityLevels: [...(formData.priorityLevels || []), { level: 'P1', slaMinutes: 60 }],
                });
              }}
              className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 text-sm"
            >
              + Add Level
            </button>
          </div>
          <div className="space-y-3">
            {formData.priorityLevels?.map((level: any, idx: number) => (
              <div key={idx} className="p-4 border border-slate-200 rounded-xl">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Level</label>
                    <input
                      type="text"
                      value={level.level || ''}
                      onChange={(e) => {
                        const newLevels = [...formData.priorityLevels];
                        newLevels[idx].level = e.target.value;
                        setFormData({ ...formData, priorityLevels: newLevels });
                      }}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                      placeholder="P1, P2, P3"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">SLA (minutes)</label>
                    <input
                      type="number"
                      value={level.slaMinutes || ''}
                      onChange={(e) => {
                        const newLevels = [...formData.priorityLevels];
                        newLevels[idx].slaMinutes = parseInt(e.target.value);
                        setFormData({ ...formData, priorityLevels: newLevels });
                      }}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    />
                  </div>
                </div>
                <button
                  onClick={() => {
                    setFormData({
                      ...formData,
                      priorityLevels: formData.priorityLevels.filter((_: any, i: number) => i !== idx),
                    });
                  }}
                  className="mt-2 px-3 py-1 text-xs bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  Remove
                </button>
              </div>
            ))}
            {(!formData.priorityLevels || formData.priorityLevels.length === 0) && (
              <p className="text-sm text-slate-500 text-center py-4">No priority levels configured. Click "Add Level" to get started.</p>
            )}
          </div>
        </div>

        <button
          onClick={() => onSave(formData)}
          disabled={isSaving}
          className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? 'Saving...' : 'Save Priority Settings'}
        </button>
      </div>
    </Card>
  );
};

// Auto-Tagging Settings Component
const AutoTaggingSettings = ({ settings, onSave, isSaving }: { settings: any; onSave: (data: any) => void; isSaving?: boolean }) => {
  const [formData, setFormData] = useState({
    tagDefinitions: [],
    autoTagRules: [],
    customTags: [],
  });

  useEffect(() => {
    if (settings && Object.keys(settings).length > 0) {
      setFormData({
        tagDefinitions: settings.tagDefinitions || [],
        autoTagRules: settings.autoTagRules || [],
        customTags: settings.customTags || [],
      });
    }
  }, [settings]);

  return (
    <Card title="Auto-Tagging Settings" description="Configure automatic tagging rules and tag definitions">
      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Tag Definitions</h3>
              <p className="text-sm text-slate-600">Define tags with keywords and confidence levels</p>
            </div>
            <button
              onClick={() => {
                setFormData({
                  ...formData,
                  tagDefinitions: [...(formData.tagDefinitions || []), { name: '', keywords: [], confidence: 0.8 }],
                });
              }}
              className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 text-sm"
            >
              + Add Tag
            </button>
          </div>
          <div className="space-y-3">
            {formData.tagDefinitions?.map((tag: any, idx: number) => (
              <div key={idx} className="p-4 border border-slate-200 rounded-xl">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Tag Name</label>
                    <input
                      type="text"
                      value={tag.name || ''}
                      onChange={(e) => {
                        const newTags = [...formData.tagDefinitions];
                        newTags[idx].name = e.target.value;
                        setFormData({ ...formData, tagDefinitions: newTags });
                      }}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Keywords (comma-separated)</label>
                    <input
                      type="text"
                      value={(tag.keywords || []).join(', ')}
                      onChange={(e) => {
                        const newTags = [...formData.tagDefinitions];
                        newTags[idx].keywords = e.target.value.split(',').map((s: string) => s.trim());
                        setFormData({ ...formData, tagDefinitions: newTags });
                      }}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Confidence (0-1)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="1"
                      value={tag.confidence || 0.8}
                      onChange={(e) => {
                        const newTags = [...formData.tagDefinitions];
                        newTags[idx].confidence = parseFloat(e.target.value);
                        setFormData({ ...formData, tagDefinitions: newTags });
                      }}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    />
                  </div>
                </div>
                <button
                  onClick={() => {
                    setFormData({
                      ...formData,
                      tagDefinitions: formData.tagDefinitions.filter((_: any, i: number) => i !== idx),
                    });
                  }}
                  className="mt-2 px-3 py-1 text-xs bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  Remove
                </button>
              </div>
            ))}
            {(!formData.tagDefinitions || formData.tagDefinitions.length === 0) && (
              <p className="text-sm text-slate-500 text-center py-4">No tag definitions. Click "Add Tag" to get started.</p>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Custom Tags</h3>
          <textarea
            value={(formData.customTags || []).join(', ')}
            onChange={(e) => {
              setFormData({
                ...formData,
                customTags: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
              });
            }}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            placeholder="tag1, tag2, tag3"
          />
        </div>

        <button
          onClick={() => onSave(formData)}
          disabled={isSaving}
          className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? 'Saving...' : 'Save Auto-Tagging Settings'}
        </button>
      </div>
    </Card>
  );
};

// Assignment Settings Component
const AssignmentSettings = ({ settings, onSave, isSaving }: { settings: any; onSave: (data: any) => void; isSaving?: boolean }) => {
  const [formData, setFormData] = useState({
    assignmentMode: 'round-robin',
    autoAssign: true,
    assignmentRetries: 3,
    reassignmentRules: [],
  });

  useEffect(() => {
    if (settings && Object.keys(settings).length > 0) {
      setFormData({
        assignmentMode: settings.assignmentMode || 'round-robin',
        autoAssign: settings.autoAssign !== false,
        assignmentRetries: settings.assignmentRetries ?? 3,
        reassignmentRules: settings.reassignmentRules || [],
      });
    }
  }, [settings]);

  return (
    <Card title="Assignment Settings" description="Configure how queries are assigned to agents">
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-1">Assignment Mode</label>
          <select
            value={formData.assignmentMode || 'round-robin'}
            onChange={(e) => setFormData({ ...formData, assignmentMode: e.target.value })}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg"
          >
            <option value="round-robin">Round-Robin</option>
            <option value="load-based">Load-Based</option>
            <option value="team-queue">Team Queue</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.autoAssign !== false}
            onChange={(e) => setFormData({ ...formData, autoAssign: e.target.checked })}
            className="w-4 h-4"
          />
          <label className="text-sm font-medium">Auto-Assign Queries</label>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Assignment Retries</label>
          <input
            type="number"
            min="0"
            max="10"
            value={formData.assignmentRetries || 3}
            onChange={(e) => setFormData({ ...formData, assignmentRetries: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg"
          />
        </div>

        <button
          onClick={() => onSave(formData)}
          disabled={isSaving}
          className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? 'Saving...' : 'Save Assignment Settings'}
        </button>
      </div>
    </Card>
  );
};

// Status Workflow Settings Component
const StatusWorkflowSettings = ({ settings, onSave, isSaving }: { settings: any; onSave: (data: any) => void; isSaving?: boolean }) => {
  const [formData, setFormData] = useState({
    allowedStatuses: ['new', 'in_progress', 'escalated', 'resolved', 'closed'],
    transitionRules: [],
    timeouts: [],
    slaViolationRules: [],
  });

  useEffect(() => {
    if (settings && Object.keys(settings).length > 0) {
      setFormData({
        allowedStatuses: settings.allowedStatuses || ['new', 'in_progress', 'escalated', 'resolved', 'closed'],
        transitionRules: settings.transitionRules || [],
        timeouts: settings.timeouts || [],
        slaViolationRules: settings.slaViolationRules || [],
      });
    }
  }, [settings]);

  return (
    <Card title="Status Workflow Settings" description="Configure status transitions and timeouts">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Allowed Statuses</h3>
          <textarea
            value={(formData.allowedStatuses || []).join(', ')}
            onChange={(e) => {
              setFormData({
                ...formData,
                allowedStatuses: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
              });
            }}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            placeholder="new, in_progress, escalated, resolved, closed"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Status Timeouts</h3>
              <p className="text-sm text-slate-600">Auto-move queries after timeout</p>
            </div>
            <button
              onClick={() => {
                setFormData({
                  ...formData,
                  timeouts: [...(formData.timeouts || []), { status: '', timeoutMinutes: 60, nextStatus: '' }],
                });
              }}
              className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 text-sm"
            >
              + Add Timeout
            </button>
          </div>
          <div className="space-y-3">
            {formData.timeouts?.map((timeout: any, idx: number) => (
              <div key={idx} className="p-4 border border-slate-200 rounded-xl">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">From Status</label>
                    <input
                      type="text"
                      value={timeout.status || ''}
                      onChange={(e) => {
                        const newTimeouts = [...formData.timeouts];
                        newTimeouts[idx].status = e.target.value;
                        setFormData({ ...formData, timeouts: newTimeouts });
                      }}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Timeout (minutes)</label>
                    <input
                      type="number"
                      value={timeout.timeoutMinutes || ''}
                      onChange={(e) => {
                        const newTimeouts = [...formData.timeouts];
                        newTimeouts[idx].timeoutMinutes = parseInt(e.target.value);
                        setFormData({ ...formData, timeouts: newTimeouts });
                      }}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Next Status</label>
                    <input
                      type="text"
                      value={timeout.nextStatus || ''}
                      onChange={(e) => {
                        const newTimeouts = [...formData.timeouts];
                        newTimeouts[idx].nextStatus = e.target.value;
                        setFormData({ ...formData, timeouts: newTimeouts });
                      }}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    />
                  </div>
                </div>
                <button
                  onClick={() => {
                    setFormData({
                      ...formData,
                      timeouts: formData.timeouts.filter((_: any, i: number) => i !== idx),
                    });
                  }}
                  className="mt-2 px-3 py-1 text-xs bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  Remove
                </button>
              </div>
            ))}
            {(!formData.timeouts || formData.timeouts.length === 0) && (
              <p className="text-sm text-slate-500 text-center py-4">No timeouts configured. Click "Add Timeout" to get started.</p>
            )}
          </div>
        </div>

        <button
          onClick={() => onSave(formData)}
          disabled={isSaving}
          className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? 'Saving...' : 'Save Status Workflow Settings'}
        </button>
      </div>
    </Card>
  );
};

// Channel Settings Component
const ChannelSettings = ({ settings, onSave, isSaving }: { settings: any; onSave: (data: any) => void; isSaving?: boolean }) => {
  const [formData, setFormData] = useState({
    channels: [],
    duplicateHandling: 'ignore',
  });

  useEffect(() => {
    if (settings && Object.keys(settings).length > 0) {
      setFormData({
        channels: settings.channels || [],
        duplicateHandling: settings.duplicateHandling || 'ignore',
      });
    }
  }, [settings]);

  return (
    <Card title="Channel Settings" description="Manage connected channels and sync settings">
      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Connected Channels</h3>
            <button
              onClick={() => {
                setFormData({
                  ...formData,
                  channels: [...(formData.channels || []), { name: '', type: 'email', active: true, syncFrequency: 60, priority: 1 }],
                });
              }}
              className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 text-sm"
            >
              + Add Channel
            </button>
          </div>
          <div className="space-y-3">
            {formData.channels?.map((channel: any, idx: number) => (
              <div key={idx} className="p-4 border border-slate-200 rounded-xl">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Channel Name</label>
                    <input
                      type="text"
                      value={channel.name || ''}
                      onChange={(e) => {
                        const newChannels = [...formData.channels];
                        newChannels[idx].name = e.target.value;
                        setFormData({ ...formData, channels: newChannels });
                      }}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Type</label>
                    <select
                      value={channel.type || ''}
                      onChange={(e) => {
                        const newChannels = [...formData.channels];
                        newChannels[idx].type = e.target.value;
                        setFormData({ ...formData, channels: newChannels });
                      }}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    >
                      <option>email</option>
                      <option>whatsapp</option>
                      <option>instagram</option>
                      <option>chat</option>
                      <option>community</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={channel.active !== false}
                      onChange={(e) => {
                        const newChannels = [...formData.channels];
                        newChannels[idx].active = e.target.checked;
                        setFormData({ ...formData, channels: newChannels });
                      }}
                      className="w-4 h-4"
                    />
                    <label className="text-sm">Active</label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Sync Frequency (seconds)</label>
                    <input
                      type="number"
                      value={channel.syncFrequency || 60}
                      onChange={(e) => {
                        const newChannels = [...formData.channels];
                        newChannels[idx].syncFrequency = parseInt(e.target.value);
                        setFormData({ ...formData, channels: newChannels });
                      }}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    />
                  </div>
                </div>
                <button
                  onClick={() => {
                    setFormData({
                      ...formData,
                      channels: formData.channels.filter((_: any, i: number) => i !== idx),
                    });
                  }}
                  className="mt-2 px-3 py-1 text-xs bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  Remove
                </button>
              </div>
            ))}
            {(!formData.channels || formData.channels.length === 0) && (
              <p className="text-sm text-slate-500 text-center py-4">No channels configured. Click "Add Channel" to get started.</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Duplicate Handling</label>
          <select
            value={formData.duplicateHandling || 'ignore'}
            onChange={(e) => setFormData({ ...formData, duplicateHandling: e.target.value })}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg"
          >
            <option value="ignore">Ignore</option>
            <option value="merge">Merge</option>
            <option value="separate">Separate</option>
          </select>
        </div>

        <button
          onClick={() => onSave(formData)}
          disabled={isSaving}
          className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? 'Saving...' : 'Save Channel Settings'}
        </button>
      </div>
    </Card>
  );
};

// Notification Settings Component
const NotificationSettings = ({ settings, onSave, isSaving }: { settings: any; onSave: (data: any) => void; isSaving?: boolean }) => {
  const [formData, setFormData] = useState({
    priorityNotifications: [],
    escalationNotifications: { email: true, sms: false, slack: false },
    slaBreakNotifications: { notifyTeamLeads: true, channels: [] },
    dailyDigest: { enabled: false, time: '09:00', recipients: [] },
  });

  useEffect(() => {
    if (settings && Object.keys(settings).length > 0) {
      setFormData({
        priorityNotifications: settings.priorityNotifications || [],
        escalationNotifications: settings.escalationNotifications || { email: true, sms: false, slack: false },
        slaBreakNotifications: settings.slaBreakNotifications || { notifyTeamLeads: true, channels: [] },
        dailyDigest: settings.dailyDigest || { enabled: false, time: '09:00', recipients: [] },
      });
    }
  }, [settings]);

  return (
    <Card title="Notification Settings" description="Configure notifications for escalations and SLA breaks">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Escalation Notifications</h3>
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.escalationNotifications?.email || false}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    escalationNotifications: {
                      ...formData.escalationNotifications,
                      email: e.target.checked,
                    },
                  });
                }}
                className="w-4 h-4"
              />
              <span>Email</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.escalationNotifications?.sms || false}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    escalationNotifications: {
                      ...formData.escalationNotifications,
                      sms: e.target.checked,
                    },
                  });
                }}
                className="w-4 h-4"
              />
              <span>SMS</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.escalationNotifications?.slack || false}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    escalationNotifications: {
                      ...formData.escalationNotifications,
                      slack: e.target.checked,
                    },
                  });
                }}
                className="w-4 h-4"
              />
              <span>Slack</span>
            </label>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">SLA Break Notifications</h3>
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.slaBreakNotifications?.notifyTeamLeads || false}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    slaBreakNotifications: {
                      ...formData.slaBreakNotifications,
                      notifyTeamLeads: e.target.checked,
                    },
                  });
                }}
                className="w-4 h-4"
              />
              <span>Notify Team Leads</span>
            </label>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Daily Digest</h3>
          <div className="space-y-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.dailyDigest?.enabled || false}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    dailyDigest: {
                      ...formData.dailyDigest,
                      enabled: e.target.checked,
                    },
                  });
                }}
                className="w-4 h-4"
              />
              <span>Enable Daily Digest</span>
            </label>
            {formData.dailyDigest?.enabled && (
              <div>
                <label className="block text-sm font-medium mb-1">Send Time</label>
                <input
                  type="time"
                  value={formData.dailyDigest?.time || '09:00'}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      dailyDigest: {
                        ...formData.dailyDigest,
                        time: e.target.value,
                      },
                    });
                  }}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>
            )}
          </div>
        </div>

        <button
          onClick={() => onSave(formData)}
          disabled={isSaving}
          className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? 'Saving...' : 'Save Notification Settings'}
        </button>
      </div>
    </Card>
  );
};

// Analytics Settings Component
const AnalyticsSettings = ({ settings, onSave, isSaving }: { settings: any; onSave: (data: any) => void; isSaving?: boolean }) => {
  const [formData, setFormData] = useState({
    metrics: ['avg_response_time', 'resolution_rate', 'tag_distribution', 'team_performance'],
    exportFrequency: 'weekly',
    dataRetentionDays: 365,
  });

  useEffect(() => {
    if (settings && Object.keys(settings).length > 0) {
      setFormData({
        metrics: settings.metrics || ['avg_response_time', 'resolution_rate', 'tag_distribution', 'team_performance'],
        exportFrequency: settings.exportFrequency || 'weekly',
        dataRetentionDays: settings.dataRetentionDays ?? 365,
      });
    }
  }, [settings]);

  return (
    <Card title="Analytics & Reporting Settings" description="Configure metrics tracking and data retention">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Metrics to Track</h3>
          <div className="space-y-2">
            {['avg_response_time', 'resolution_rate', 'tag_distribution', 'team_performance', 'sla_compliance', 'channel_performance'].map((metric) => (
              <label key={metric} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={(formData.metrics || []).includes(metric)}
                  onChange={(e) => {
                    const metrics = formData.metrics || [];
                    if (e.target.checked) {
                      setFormData({ ...formData, metrics: [...metrics, metric] });
                    } else {
                      setFormData({ ...formData, metrics: metrics.filter((m: string) => m !== metric) });
                    }
                  }}
                  className="w-4 h-4"
                />
                <span className="capitalize">{metric.replace(/_/g, ' ')}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Export Frequency</label>
          <select
            value={formData.exportFrequency || 'weekly'}
            onChange={(e) => setFormData({ ...formData, exportFrequency: e.target.value })}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Data Retention (days)</label>
          <input
            type="number"
            min="30"
            max="3650"
            value={formData.dataRetentionDays || 365}
            onChange={(e) => setFormData({ ...formData, dataRetentionDays: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg"
          />
        </div>

        <button
          onClick={() => onSave(formData)}
          disabled={isSaving}
          className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? 'Saving...' : 'Save Analytics Settings'}
        </button>
      </div>
    </Card>
  );
};

// Admin Settings Component
const AdminSettings = ({ settings, onSave, isSaving }: { settings: any; onSave: (data: any) => void; isSaving?: boolean }) => {
  const [formData, setFormData] = useState({
    teamMembers: [],
    rolePermissions: {
      admin: ['all'],
      lead: ['view', 'assign', 'update'],
      agent: ['view', 'update'],
    },
    auditLogsEnabled: true,
    apiKeys: [],
    integrationTokens: [],
  });

  useEffect(() => {
    if (settings && Object.keys(settings).length > 0) {
      setFormData({
        teamMembers: settings.teamMembers || [],
        rolePermissions: settings.rolePermissions || {
          admin: ['all'],
          lead: ['view', 'assign', 'update'],
          agent: ['view', 'update'],
        },
        auditLogsEnabled: settings.auditLogsEnabled !== false,
        apiKeys: settings.apiKeys || [],
        integrationTokens: settings.integrationTokens || [],
      });
    }
  }, [settings]);

  return (
    <Card title="Admin Settings" description="Manage team members, permissions, and API keys">
      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Team Members</h3>
            <button
              onClick={() => {
                setFormData({
                  ...formData,
                  teamMembers: [...(formData.teamMembers || []), { email: '', name: '', role: 'agent' }],
                });
              }}
              className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 text-sm"
            >
              + Add Member
            </button>
          </div>
          <div className="space-y-3">
            {formData.teamMembers?.map((member: any, idx: number) => (
              <div key={idx} className="p-4 border border-slate-200 rounded-xl">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input
                      type="email"
                      value={member.email || ''}
                      onChange={(e) => {
                        const newMembers = [...formData.teamMembers];
                        newMembers[idx].email = e.target.value;
                        setFormData({ ...formData, teamMembers: newMembers });
                      }}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Name</label>
                    <input
                      type="text"
                      value={member.name || ''}
                      onChange={(e) => {
                        const newMembers = [...formData.teamMembers];
                        newMembers[idx].name = e.target.value;
                        setFormData({ ...formData, teamMembers: newMembers });
                      }}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Role</label>
                    <select
                      value={member.role || 'agent'}
                      onChange={(e) => {
                        const newMembers = [...formData.teamMembers];
                        newMembers[idx].role = e.target.value;
                        setFormData({ ...formData, teamMembers: newMembers });
                      }}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    >
                      <option value="admin">Admin</option>
                      <option value="lead">Lead</option>
                      <option value="agent">Agent</option>
                    </select>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setFormData({
                      ...formData,
                      teamMembers: formData.teamMembers.filter((_: any, i: number) => i !== idx),
                    });
                  }}
                  className="mt-2 px-3 py-1 text-xs bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  Remove
                </button>
              </div>
            ))}
            {(!formData.teamMembers || formData.teamMembers.length === 0) && (
              <p className="text-sm text-slate-500 text-center py-4">No team members configured. Click "Add Member" to get started.</p>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Role Permissions</h3>
          <div className="space-y-4">
            {Object.entries(formData.rolePermissions || {}).map(([role, permissions]: [string, any]) => (
              <div key={role} className="p-4 border border-slate-200 rounded-xl">
                <h4 className="font-semibold mb-2 capitalize">{role}</h4>
                <textarea
                  value={Array.isArray(permissions) ? permissions.join(', ') : permissions}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      rolePermissions: {
                        ...formData.rolePermissions,
                        [role]: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                      },
                    });
                  }}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.auditLogsEnabled !== false}
              onChange={(e) => setFormData({ ...formData, auditLogsEnabled: e.target.checked })}
              className="w-4 h-4"
            />
            <span className="text-sm font-medium">Enable Audit Logs</span>
          </label>
        </div>

        <button
          onClick={() => onSave(formData)}
          disabled={isSaving}
          className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? 'Saving...' : 'Save Admin Settings'}
        </button>
      </div>
    </Card>
  );
};

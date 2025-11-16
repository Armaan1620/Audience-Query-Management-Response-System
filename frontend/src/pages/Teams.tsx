import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { Loader } from '../components/Loader';
import { Badge } from '../components/Badge';
import { Tag } from '../components/Tag';
import { Table } from '../components/Table';
import { Card } from '../components/Card';
import { useNavigate } from 'react-router-dom';
import { Query } from '../types/query';
import { useState } from 'react';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface TeamWithQueries {
  id: string;
  name: string;
  description?: string | null;
  queries: Query[];
  queryCount: number;
  queriesByStatus: Record<string, number>;
  queriesByPriority: Record<string, number>;
}

export const TeamsPage = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [expandedTeams, setExpandedTeams] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<string | null>(null);

  const { data: teamsData, isLoading } = useQuery({
    queryKey: ['teams', 'queries'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<TeamWithQueries[]>>('/teams/queries');
      return res.data.data;
    },
    refetchInterval: 30000,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await api.patch(`/queries/${id}/status`, { status });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      queryClient.invalidateQueries({ queryKey: ['queries'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });

  const handleQuickAction = (id: string, status: string, e: React.MouseEvent) => {
    e.stopPropagation();
    updateStatusMutation.mutate({ id, status });
  };

  const toggleTeam = (teamId: string) => {
    const newExpanded = new Set(expandedTeams);
    if (newExpanded.has(teamId)) {
      newExpanded.delete(teamId);
    } else {
      newExpanded.add(teamId);
    }
    setExpandedTeams(newExpanded);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
      new: 'info',
      in_progress: 'warning',
      escalated: 'danger',
      resolved: 'success',
      closed: 'success',
    };
    return colors[status] || 'info';
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
      low: 'info',
      medium: 'warning',
      high: 'danger',
      urgent: 'danger',
    };
    return colors[priority] || 'info';
  };

  if (isLoading) {
    return <Loader />;
  }

  if (!teamsData || teamsData.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-8 animate-slide-down">
          <div>
            <h2 className="text-3xl font-bold gradient-text">Teams Dashboard</h2>
            <p className="text-slate-500 mt-1">Manage queries by team</p>
          </div>
        </div>
        <Card title="No Teams Found" description="No teams or queries available yet.">
          <p className="text-slate-600">Generate some queries and assign them to teams to get started.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8 animate-slide-down">
        <div>
          <h2 className="text-3xl font-bold gradient-text">Teams Dashboard</h2>
          <p className="text-slate-500 mt-1">Manage queries organized by team</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6 animate-fade-in">
        <select
          value={statusFilter || ''}
          onChange={(e) => setStatusFilter(e.target.value || null)}
          className="px-4 py-2 rounded-xl border border-slate-200 bg-white/90 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Statuses</option>
          <option value="new">New</option>
          <option value="in_progress">In Progress</option>
          <option value="escalated">Escalated</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
        <select
          value={priorityFilter || ''}
          onChange={(e) => setPriorityFilter(e.target.value || null)}
          className="px-4 py-2 rounded-xl border border-slate-200 bg-white/90 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
        {(statusFilter || priorityFilter) && (
          <button
            onClick={() => {
              setStatusFilter(null);
              setPriorityFilter(null);
            }}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Teams */}
      <div className="space-y-6">
        {teamsData.map((team, teamIndex) => {
          // Filter queries based on status and priority
          let filteredQueries = team.queries;
          if (statusFilter) {
            filteredQueries = filteredQueries.filter((q) => q.status === statusFilter);
          }
          if (priorityFilter) {
            filteredQueries = filteredQueries.filter((q) => q.priority === priorityFilter);
          }

          const isExpanded = expandedTeams.has(team.id);
          const isUnassigned = team.id === 'unassigned';

          return (
            <div
              key={team.id}
              className="animate-fade-in"
              style={{ animationDelay: `${teamIndex * 0.1}s` }}
            >
              <Card
                title={
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">
                        {isUnassigned ? '📋' : '👥'}
                      </span>
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">{team.name}</h3>
                        {team.description && (
                          <p className="text-sm text-slate-500 mt-1">{team.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-2xl font-bold gradient-text">{team.queryCount}</div>
                        <div className="text-xs text-slate-500">Total Queries</div>
                      </div>
                      <button
                        onClick={() => toggleTeam(team.id)}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:shadow-glow transition-all duration-300"
                      >
                        {isExpanded ? '▼ Collapse' : '▶ Expand'}
                      </button>
                    </div>
                  </div>
                }
                description={
                  <div className="flex gap-4 mt-4">
                    <div>
                      <div className="text-xs text-slate-500 mb-1">By Status</div>
                      <div className="flex gap-2 flex-wrap">
                        {Object.entries(team.queriesByStatus).map(([status, count]) => (
                          <Badge key={status} tone={getStatusColor(status)}>
                            {status}: {count}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-1">By Priority</div>
                      <div className="flex gap-2 flex-wrap">
                        {Object.entries(team.queriesByPriority).map(([priority, count]) => (
                          <Badge key={priority} tone={getPriorityColor(priority)}>
                            {priority}: {count}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                }
              >
                {isExpanded && (
                  <div className="mt-6 animate-slide-down">
                    {filteredQueries.length === 0 ? (
                      <div className="text-center py-8 text-slate-500">
                        {statusFilter || priorityFilter
                          ? 'No queries match the selected filters'
                          : 'No queries assigned to this team'}
                      </div>
                    ) : (
                      <Table
                        columns={[
                          { key: 'subject', label: 'Subject' },
                          { key: 'channel', label: 'Channel' },
                          { key: 'priority', label: 'Priority' },
                          { key: 'status', label: 'Status' },
                          { key: 'assignee', label: 'Assignee' },
                          { key: 'actions', label: 'Actions' },
                        ]}
                        data={filteredQueries.map((query) => ({
                          id: query.id,
                          subject: (
                            <div
                              className="cursor-pointer hover:text-indigo-600 transition-colors"
                              onClick={() => navigate(`/queries/${query.id}`)}
                            >
                              {query.subject}
                            </div>
                          ),
                          channel: <Tag color="info">{query.channel}</Tag>,
                          priority: (
                            <Badge tone={getPriorityColor(query.priority)}>
                              {query.priority}
                            </Badge>
                          ),
                          status: (
                            <Badge tone={getStatusColor(query.status)}>
                              {query.status}
                            </Badge>
                          ),
                          assignee: query.assignee ? (
                            <span className="text-slate-700">{query.assignee.name}</span>
                          ) : (
                            <span className="text-slate-400">Unassigned</span>
                          ),
                          actions: (
                            <div className="flex gap-2">
                              {query.status !== 'resolved' && query.status !== 'closed' && (
                                <>
                                  {query.status === 'new' && (
                                    <button
                                      onClick={(e) => handleQuickAction(query.id, 'in_progress', e)}
                                      className="px-3 py-1 text-xs rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                                    >
                                      Start
                                    </button>
                                  )}
                                  <button
                                    onClick={(e) => handleQuickAction(query.id, 'resolved', e)}
                                    className="px-3 py-1 text-xs rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors"
                                  >
                                    Resolve
                                  </button>
                                </>
                              )}
                              {query.status === 'resolved' && (
                                <button
                                  onClick={(e) => handleQuickAction(query.id, 'closed', e)}
                                  className="px-3 py-1 text-xs rounded-lg bg-slate-500 text-white hover:bg-slate-600 transition-colors"
                                >
                                  Close
                                </button>
                              )}
                            </div>
                          ),
                        }))}
                      />
                    )}
                  </div>
                )}
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
};


import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '../components/Card';
import { api } from '../services/api';
import { Loader } from '../components/Loader';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface AnalyticsSummary {
  totalQueries: number;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  byChannel: Record<string, number>;
  byTeam: Record<string, number>;
  last30DaysCount: number;
  averageResolutionHours: number;
}

export const AnalyticsPage = () => {
  const queryClient = useQueryClient();
  const [resetConfirm, setResetConfirm] = useState(false);
  const navigate = useNavigate();

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<AnalyticsSummary>>('/analytics/summary');
      return res.data.data;
    },
    refetchInterval: 30000,
  });

  const resetMutation = useMutation({
    mutationFn: async () => {
      const res = await api.delete('/admin/reset');
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      queryClient.invalidateQueries({ queryKey: ['queries'] });
      setResetConfirm(false);
      alert('All data has been reset!');
    },
    onError: (error: any) => {
      alert(`Error resetting data: ${error.response?.data?.message || error.message}`);
    },
  });

  const assignAllMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/assignment/assign-all');
      return res.data;
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      queryClient.invalidateQueries({ queryKey: ['queries'] });
      const result = data.data;
      
      if (result.assigned === 0 && result.processed > 0) {
        alert(
          `⚠️ No queries were assigned!\n\n` +
          `Processed: ${result.processed}\n` +
          `Assigned: ${result.assigned}\n` +
          `Skipped: ${result.skipped}\n` +
          `Errors: ${result.errors}\n\n` +
          `This usually means teams don't exist. Teams are being seeded automatically. Please try again.`
        );
      } else {
        alert(
          `✅ Assignment complete!\n\n` +
          `Processed: ${result.processed}\n` +
          `Assigned: ${result.assigned}\n` +
          `Skipped: ${result.skipped}\n` +
          `Errors: ${result.errors}`
        );
      }
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
      alert(`❌ Error assigning queries:\n\n${errorMessage}`);
      console.error('Assignment error:', error);
    },
  });

  const handleAssignAll = () => {
    console.log('Assign All button clicked - automatically assigning queries');
    assignAllMutation.mutate();
  };

  const handleReset = () => {
    if (resetConfirm) {
      if (window.confirm('Are you absolutely sure? This will delete ALL queries, teams, and users. This action cannot be undone!')) {
        resetMutation.mutate();
      } else {
        setResetConfirm(false);
      }
    } else {
      setResetConfirm(true);
    }
  };

  if (isLoading) return <Loader />;

  const resolutionRate =
    analytics && analytics.totalQueries > 0
      ? Math.round(
          ((analytics.byStatus.resolved || 0) + (analytics.byStatus.closed || 0)) /
            analytics.totalQueries *
            100
        )
      : 0;

  const avgResponseTime = analytics
    ? analytics.averageResolutionHours > 0
      ? analytics.averageResolutionHours < 1
        ? `${Math.round(analytics.averageResolutionHours * 60)}m`
        : `${analytics.averageResolutionHours.toFixed(1)}h`
      : 'N/A'
    : 'N/A';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8 animate-slide-down">
        <div>
          <h2 className="text-3xl font-bold gradient-text">Analytics Dashboard</h2>
          <p className="text-slate-500 mt-1">Real-time insights and metrics</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleAssignAll}
            disabled={assignAllMutation.isPending}
            className="group relative px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-medium shadow-medium hover:shadow-glow hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 transition-all duration-300 overflow-hidden"
            title="Assign all unassigned queries to teams"
          >
            <span className="relative z-10 flex items-center gap-2">
              {assignAllMutation.isPending ? '⏳' : '✨'}
              <span>{assignAllMutation.isPending ? 'Assigning...' : 'Assign All'}</span>
            </span>
            <span className="absolute inset-0 bg-gradient-to-r from-teal-600 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
          <button
            onClick={handleReset}
            disabled={resetMutation.isPending}
            className={`group relative px-5 py-2.5 rounded-xl font-medium shadow-medium hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 transition-all duration-300 overflow-hidden ${
              resetConfirm
                ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white hover:shadow-glow'
                : 'bg-gradient-to-r from-slate-200 to-slate-300 text-slate-700 hover:from-slate-300 hover:to-slate-400'
            }`}
          >
            <span className="relative z-10 flex items-center gap-2">
              {resetMutation.isPending ? '⏳' : resetConfirm ? '⚠️' : '🗑️'}
              <span>
                {resetMutation.isPending
                  ? 'Resetting...'
                  : resetConfirm
                    ? 'Confirm Reset'
                    : 'Reset'}
              </span>
            </span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card title="Total Queries" description="All time" className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-baseline gap-2">
            <p className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {analytics?.totalQueries || 0}
            </p>
            <span className="text-sm text-slate-500">queries</span>
          </div>
        </Card>
        <Card title="Avg Response Time" description="Last 30 days" className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-baseline gap-2">
            <p className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              {avgResponseTime}
            </p>
          </div>
        </Card>
        <Card title="Resolution Rate" description="This month" className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-baseline gap-2">
            <p className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
              {resolutionRate}%
            </p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card title="Queries by Status">
          <div className="space-y-2">
            {analytics?.byStatus &&
              Object.entries(analytics.byStatus).map(([status, count]) => (
                <button
                  key={status}
                  onClick={() => navigate(`/inbox?filterBy=status&value=${status}`)}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-200 cursor-pointer text-left group hover:scale-[1.02] hover:shadow-sm"
                >
                  <span className="capitalize text-slate-600 group-hover:text-indigo-700 font-medium transition-colors">
                    {status.replace('_', ' ')}
                  </span>
                  <span className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {count as number}
                  </span>
                </button>
              ))}
          </div>
        </Card>

        <Card title="Queries by Priority">
          <div className="space-y-2">
            {analytics?.byPriority &&
              Object.entries(analytics.byPriority).map(([priority, count]) => (
                <button
                  key={priority}
                  onClick={() => navigate(`/inbox?filterBy=priority&value=${priority}`)}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-200 cursor-pointer text-left group hover:scale-[1.02] hover:shadow-sm"
                >
                  <span className="capitalize text-slate-600 group-hover:text-indigo-700 font-medium transition-colors">
                    {priority}
                  </span>
                  <span className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {count as number}
                  </span>
                </button>
              ))}
          </div>
        </Card>

        <Card title="Queries by Channel">
          <div className="space-y-2">
            {analytics?.byChannel &&
              Object.entries(analytics.byChannel).map(([channel, count]) => (
                <button
                  key={channel}
                  onClick={() => navigate(`/inbox?filterBy=channel&value=${channel}`)}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-200 cursor-pointer text-left group hover:scale-[1.02] hover:shadow-sm"
                >
                  <span className="capitalize text-slate-600 group-hover:text-indigo-700 font-medium transition-colors">
                    {channel}
                  </span>
                  <span className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {count as number}
                  </span>
                </button>
              ))}
          </div>
        </Card>

        <Card title="Queries by Team">
          <div className="space-y-2">
            {analytics?.byTeam &&
              Object.entries(analytics.byTeam)
                .sort(([, a], [, b]) => (b as number) - (a as number))
                .map(([team, count]) => (
                  <button
                    key={team}
                    onClick={() => navigate(`/inbox?filterBy=team&value=${team}`)}
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-200 cursor-pointer text-left group hover:scale-[1.02] hover:shadow-sm"
                  >
                    <span className="text-slate-600 group-hover:text-indigo-700 font-medium transition-colors">
                      {team}
                    </span>
                    <span className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {count as number}
                    </span>
                  </button>
                ))}
          </div>
        </Card>
      </div>

      <Card title="Recent Activity">
        <div className="text-slate-500">
          <p>Last 30 days: {analytics?.last30DaysCount || 0} queries</p>
          <p className="mt-2 text-sm">
            Data refreshes automatically every 30 seconds
          </p>
        </div>
      </Card>
    </div>
  );
};

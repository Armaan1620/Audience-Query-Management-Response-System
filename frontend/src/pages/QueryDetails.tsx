import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { Query } from '../types/query';
import { Card } from '../components/Card';
import { Tag } from '../components/Tag';
import { Badge } from '../components/Badge';
import { Loader } from '../components/Loader';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const QueryDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: query, isLoading } = useQuery({
    queryKey: ['query', id],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Query>>(`/queries/${id}`);
      return res.data.data;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      const res = await api.patch(`/queries/${id}/status`, { status });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['query', id] });
      queryClient.invalidateQueries({ queryKey: ['queries'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });

  const handleAction = (status: string, label: string) => {
    if (window.confirm(`Mark this query as ${label}?`)) {
      updateStatusMutation.mutate(status);
    }
  };

  if (isLoading) return <Loader />;
  if (!query) return <div>Query not found</div>;

  const canFulfill = query.status !== 'resolved' && query.status !== 'closed';
  const canClose = query.status !== 'closed';
  const canReopen = query.status === 'closed' || query.status === 'resolved';

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between animate-slide-down">
        <div>
          <button
            onClick={() => navigate('/inbox')}
            className="text-indigo-600 hover:text-indigo-700 font-medium mb-3 flex items-center gap-2 hover:gap-3 transition-all duration-200"
          >
            <span>←</span>
            <span>Back to Inbox</span>
          </button>
          <h2 className="text-3xl font-bold gradient-text">{query.subject}</h2>
        </div>
        <div className="flex gap-3 flex-wrap">
          {canFulfill && (
            <button
              onClick={() => handleAction('resolved', 'fulfilled')}
              disabled={updateStatusMutation.isPending}
              className="group relative px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-medium shadow-medium hover:shadow-glow hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 transition-all duration-300 overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                <span>✓</span>
                <span>Fulfilled</span>
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-teal-600 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
          )}
          {query.status === 'new' && (
            <button
              onClick={() => handleAction('in_progress', 'in progress')}
              disabled={updateStatusMutation.isPending}
              className="group relative px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium shadow-medium hover:shadow-glow hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 transition-all duration-300 overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                <span>▶</span>
                <span>Start Working</span>
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
          )}
          {canClose && (
            <button
              onClick={() => handleAction('closed', 'closed')}
              disabled={updateStatusMutation.isPending}
              className="px-5 py-2.5 bg-gradient-to-r from-slate-500 to-slate-600 text-white rounded-xl font-medium shadow-medium hover:shadow-md hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 transition-all duration-300"
            >
              ✕ Close
            </button>
          )}
          {canReopen && (
            <button
              onClick={() => handleAction('new', 'new')}
              disabled={updateStatusMutation.isPending}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-medium shadow-medium hover:shadow-md hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 transition-all duration-300"
            >
              ⟳ Reopen
            </button>
          )}
          {(query.status === 'new' || query.status === 'in_progress') && (
            <button
              onClick={() => handleAction('escalated', 'escalated')}
              disabled={updateStatusMutation.isPending}
              className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl font-medium shadow-medium hover:shadow-glow hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 transition-all duration-300"
            >
              ▲ Escalate
            </button>
          )}
        </div>
      </div>

      <Card title="Details">
        <div className="space-y-4">
          <div>
            <span className="text-sm font-medium text-slate-500">Status:</span>
            <Badge label={query.status} className="ml-2" />
          </div>
          <div>
            <span className="text-sm font-medium text-slate-500">Priority:</span>
            <Badge
              label={query.priority}
              tone={query.priority === 'urgent' ? 'danger' : 'default'}
              className="ml-2"
            />
          </div>
          <div>
            <span className="text-sm font-medium text-slate-500">Channel:</span>
            <Badge label={query.channel} className="ml-2" />
          </div>
          {query.customerName && (
            <div>
              <span className="text-sm font-medium text-slate-500">Customer:</span>
              <p className="font-medium">{query.customerName}</p>
            </div>
          )}
          {query.customerEmail && (
            <div>
              <span className="text-sm font-medium text-slate-500">Email:</span>
              <p className="font-medium">{query.customerEmail}</p>
            </div>
          )}
          {query.assignee && (
            <div>
              <span className="text-sm font-medium text-slate-500">Assigned to:</span>
              <p className="font-medium">{query.assignee.name}</p>
            </div>
          )}
          {query.team && (
            <div>
              <span className="text-sm font-medium text-slate-500">Team:</span>
              <p className="font-medium">{query.team.name}</p>
            </div>
          )}
          <div>
            <span className="text-sm font-medium text-slate-500">Tags:</span>
            <div className="mt-1 flex gap-2">
              {Array.isArray(query.tags)
                ? query.tags.map((tag: any, idx: number) => (
                    <Tag key={idx} label={typeof tag === 'object' ? tag.name : String(tag)} />
                  ))
                : null}
            </div>
          </div>
          <div>
            <span className="text-sm font-medium text-slate-500">Created:</span>
            <p className="font-medium">{new Date(query.createdAt).toLocaleString()}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-slate-500">Last Updated:</span>
            <p className="font-medium">{new Date(query.updatedAt).toLocaleString()}</p>
          </div>
        </div>
      </Card>

      <Card title="Message">
        <p className="text-slate-700 whitespace-pre-wrap">{query.message}</p>
      </Card>

      {query.aiInsights && (
        <Card title="AI Insights">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-slate-500">Category:</span>
              <p className="font-medium">{query.aiInsights.category}</p>
            </div>
            <div>
              <span className="text-sm text-slate-500">Sentiment:</span>
              <p className="font-medium">{query.aiInsights.sentiment}</p>
            </div>
            <div>
              <span className="text-sm text-slate-500">Urgency:</span>
              <p className="font-medium">{query.aiInsights.urgency}</p>
            </div>
            <div>
              <span className="text-sm text-slate-500">Confidence:</span>
              <p className="font-medium">{(query.aiInsights.confidence * 100).toFixed(0)}%</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

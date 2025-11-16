import { useQueries } from '../hooks/useQueries';
import { Table } from '../components/Table';
import { Tag } from '../components/Tag';
import { Badge } from '../components/Badge';
import { Loader } from '../components/Loader';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { Query } from '../types/query';
import { useMemo } from 'react';

export const InboxPage = () => {
  const { data: queries, isLoading } = useQueries();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  
  const filterBy = searchParams.get('filterBy');
  const filterValue = searchParams.get('value');

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await api.patch(`/queries/${id}/status`, { status });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['queries'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });

  const generateMutation = useMutation({
    mutationFn: async (count: number) => {
      const res = await api.post('/admin/import', { count });
      return res.data;
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      queryClient.invalidateQueries({ queryKey: ['queries'] });
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      alert(`Generated ${data.data.imported} dummy queries!`);
    },
    onError: (error: any) => {
      alert(`Error generating queries: ${error.response?.data?.message || error.message}`);
    },
  });

  const handleGenerate = () => {
    const count = prompt('How many dummy queries to generate?', '100');
    if (count && !isNaN(Number(count))) {
      generateMutation.mutate(Number(count));
    }
  };

  const handleQuickAction = (id: string, status: string, e: React.MouseEvent) => {
    e.stopPropagation();
    updateStatusMutation.mutate({ id, status });
  };

  // Filter and sort queries based on URL parameters
  const filteredAndSortedQueries = useMemo(() => {
    if (!queries) return [];

    let filtered = [...queries];

    // Apply filter if specified
    if (filterBy && filterValue) {
      filtered = filtered.filter((q: Query) => {
        if (filterBy === 'status') {
          return q.status === filterValue;
        } else if (filterBy === 'priority') {
          return q.priority === filterValue;
        } else if (filterBy === 'channel') {
          return q.channel === filterValue;
        } else if (filterBy === 'team') {
          return q.team?.name === filterValue;
        }
        return true;
      });
    }

    // Sort by the filtered field (most relevant first)
    if (filterBy && filterValue) {
      filtered.sort((a: Query, b: Query) => {
        // Sort by creation date (newest first) for the filtered results
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    } else {
      // Default sort: newest first
      filtered.sort((a: Query, b: Query) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    }

    return filtered;
  }, [queries, filterBy, filterValue]);

  const getFilterLabel = () => {
    if (!filterBy || !filterValue) return null;
    const label = filterValue.replace('_', ' ');
    const filterType = 
      filterBy === 'status' ? 'Status' : 
      filterBy === 'priority' ? 'Priority' : 
      filterBy === 'channel' ? 'Channel' :
      filterBy === 'team' ? 'Team' : 
      filterBy;
    return `${filterType}: ${label}`;
  };

  const clearFilter = () => {
    navigate('/inbox');
  };

  if (isLoading) return <Loader />;

  const headers = ['Subject', 'Channel', 'Priority', 'Status', 'Tags', 'Created', 'Actions'];
  const rows =
    filteredAndSortedQueries?.map((q) => {
      const tags = Array.isArray(q.tags) ? q.tags : [];
      return [
        <button
          key={q.id}
          onClick={() => navigate(`/queries/${q.id}`)}
          className="text-left font-medium text-indigo-600 hover:text-indigo-700 hover:underline transition-colors"
        >
          {q.subject}
        </button>,
        <Badge key={`${q.id}-channel`} label={q.channel} />,
        <Badge
          key={`${q.id}-priority`}
          label={q.priority}
          tone={q.priority === 'urgent' ? 'danger' : 'default'}
        />,
        <Badge key={`${q.id}-status`} label={q.status} />,
        <div key={`${q.id}-tags`} className="flex gap-1">
          {tags.map((tag: any, idx: number) => (
            <Tag key={idx} label={typeof tag === 'object' ? tag.name : String(tag)} />
          ))}
        </div>,
        new Date(q.createdAt).toLocaleDateString(),
        <div key={`${q.id}-actions`} className="flex gap-2">
          {q.status !== 'resolved' && q.status !== 'closed' && (
            <button
              onClick={(e) => handleQuickAction(q.id, 'resolved', e)}
              className="px-3 py-1.5 text-xs font-medium bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:from-emerald-600 hover:to-teal-700 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105 disabled:opacity-50"
              title="Mark as Fulfilled"
              disabled={updateStatusMutation.isPending}
            >
              ✓ Fulfilled
            </button>
          )}
          {q.status === 'new' && (
            <button
              onClick={(e) => handleQuickAction(q.id, 'in_progress', e)}
              className="px-3 py-1.5 text-xs font-medium bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105 disabled:opacity-50"
              title="Start Working"
              disabled={updateStatusMutation.isPending}
            >
              ▶ Start
            </button>
          )}
        </div>,
      ];
    }) || [];

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex items-center justify-between animate-slide-down">
        <div>
          <h2 className="text-3xl font-bold gradient-text">Inbox</h2>
          <p className="text-slate-500 mt-1">Manage and respond to queries</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleGenerate}
            disabled={generateMutation.isPending}
            className="group relative px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium shadow-medium hover:shadow-glow hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 transition-all duration-300 overflow-hidden"
            title="Generate dummy queries"
          >
            <span className="relative z-10 flex items-center gap-2">
              {generateMutation.isPending ? '⏳' : '➕'}
              <span>{generateMutation.isPending ? 'Generating...' : 'Generate Queries'}</span>
            </span>
            <span className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
          {filterBy && filterValue && (
            <div className="flex items-center gap-3 animate-slide-down" style={{ animationDelay: '0.1s' }}>
              <span className="text-sm text-slate-600 bg-white/80 px-4 py-2 rounded-xl border border-slate-200">
                Filtered by: <span className="font-semibold capitalize text-indigo-600">{getFilterLabel()}</span>
              </span>
              <button
                onClick={clearFilter}
                className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-slate-200 to-slate-300 text-slate-700 rounded-xl hover:from-slate-300 hover:to-slate-400 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105"
              >
                ✕ Clear
              </button>
            </div>
          )}
        </div>
      </div>
      {filteredAndSortedQueries.length === 0 ? (
        <div className="text-center py-16 animate-fade-in">
          <div className="text-6xl mb-4">📭</div>
          <p className="text-xl font-semibold text-slate-700 mb-2">No queries found</p>
          {filterBy && filterValue && (
            <p className="text-sm text-slate-500">
              No queries match the filter: <span className="font-medium text-indigo-600">{getFilterLabel()}</span>
            </p>
          )}
        </div>
      ) : (
        <Table headers={headers} rows={rows} />
      )}
    </div>
  );
};

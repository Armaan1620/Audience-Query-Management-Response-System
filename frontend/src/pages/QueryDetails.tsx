import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
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
  const { data: query, isLoading } = useQuery({
    queryKey: ['query', id],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Query>>(`/queries/${id}`);
      return res.data.data;
    },
  });

  if (isLoading) return <Loader />;
  if (!query) return <div>Query not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{query.subject}</h2>
        <Badge label={query.status} />
      </div>
      <Card title="Details">
        <div className="space-y-4">
          <div>
            <span className="text-sm font-medium text-slate-500">Channel:</span>
            <Badge label={query.channel} className="ml-2" />
          </div>
          <div>
            <span className="text-sm font-medium text-slate-500">Priority:</span>
            <Badge label={query.priority} tone={query.priority === 'urgent' ? 'danger' : 'default'} className="ml-2" />
          </div>
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
        </div>
      </Card>
      <Card title="Message">
        <p className="text-slate-700">{query.message}</p>
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


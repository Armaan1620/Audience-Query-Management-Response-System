import { useQueries } from '../hooks/useQueries';
import { Table } from '../components/Table';
import { Tag } from '../components/Tag';
import { Badge } from '../components/Badge';
import { Loader } from '../components/Loader';
import { useNavigate } from 'react-router-dom';

export const InboxPage = () => {
  const { data: queries, isLoading } = useQueries();
  const navigate = useNavigate();

  if (isLoading) return <Loader />;

  const headers = ['Subject', 'Channel', 'Priority', 'Status', 'Tags', 'Created'];
  const rows =
    queries?.map((q) => {
      const tags = Array.isArray(q.tags) ? q.tags : [];
      return [
        <button key={q.id} onClick={() => navigate(`/queries/${q.id}`)} className="text-left text-blue-600 hover:underline">
          {q.subject}
        </button>,
        <Badge key={`${q.id}-channel`} label={q.channel} />,
        <Badge key={`${q.id}-priority`} label={q.priority} tone={q.priority === 'urgent' ? 'danger' : 'default'} />,
        <Badge key={`${q.id}-status`} label={q.status} />,
        <div key={`${q.id}-tags`} className="flex gap-1">
          {tags.map((tag: any, idx: number) => (
            <Tag key={idx} label={typeof tag === 'object' ? tag.name : String(tag)} />
          ))}
        </div>,
        new Date(q.createdAt).toLocaleDateString(),
      ];
    }) || [];

  return (
    <div>
      <h2 className="mb-4 text-2xl font-bold">Inbox</h2>
      <Table headers={headers} rows={rows} />
    </div>
  );
};


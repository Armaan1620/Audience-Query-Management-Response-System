import { Card } from '../components/Card';

export const AnalyticsPage = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card title="Total Queries" description="All time">
        <p className="text-3xl font-bold">1,234</p>
      </Card>
      <Card title="Avg Response Time" description="Last 30 days">
        <p className="text-3xl font-bold">2.4h</p>
      </Card>
      <Card title="Resolution Rate" description="This month">
        <p className="text-3xl font-bold">87%</p>
      </Card>
    </div>
    <Card title="Query Types">
      <div className="h-64 flex items-center justify-center text-slate-400">
        Chart placeholder
      </div>
    </Card>
  </div>
);


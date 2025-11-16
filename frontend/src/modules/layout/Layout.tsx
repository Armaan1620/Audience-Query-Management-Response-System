import { Outlet } from 'react-router-dom';
import { Sidebar } from '../../components/Sidebar';
import { Topbar } from '../../components/Topbar';

export const Layout = () => (
  <div className="flex min-h-screen">
    <Sidebar />
    <div className="flex flex-1 flex-col bg-gradient-to-br from-slate-50 via-indigo-50/20 to-purple-50/10">
      <Topbar />
      <main className="flex-1 p-6 lg:p-8 animate-fade-in">
        <Outlet />
      </main>
    </div>
  </div>
);

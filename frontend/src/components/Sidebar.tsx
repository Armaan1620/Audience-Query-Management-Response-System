import { NavLink } from 'react-router-dom';

const navItems = [
  { path: '/inbox', label: 'Inbox' },
  { path: '/analytics', label: 'Analytics' },
  { path: '/settings', label: 'Settings' },
];

export const Sidebar = () => (
  <aside className="w-64 bg-slate-900 text-white min-h-screen p-6 space-y-6">
    <div>
      <h1 className="text-xl font-bold">Unified Inbox</h1>
      <p className="text-sm text-slate-400">Audience Ops</p>
    </div>
    <nav className="space-y-2">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            `block rounded-lg px-4 py-2 font-medium ${isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  </aside>
);

import { NavLink } from 'react-router-dom';

const navItems = [
  { path: '/inbox', label: 'Inbox', icon: '📥' },
  { path: '/teams', label: 'Teams', icon: '👥' },
  { path: '/analytics', label: 'Analytics', icon: '📊' },
  { path: '/settings', label: 'Settings', icon: '⚙️' },
];

export const Sidebar = () => (
  <aside className="w-64 bg-gradient-to-b from-indigo-900 via-purple-900 to-indigo-900 text-white min-h-screen p-6 space-y-8 shadow-large relative overflow-hidden">
    {/* Animated background gradient */}
    <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 via-purple-600/20 to-pink-600/20 animate-pulse-slow" />
    <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
    <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl" />
    
    <div className="relative z-10">
      <div className="mb-8 animate-slide-down">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-transparent">
          Unified Inbox
        </h1>
        <p className="text-sm text-indigo-200/80 mt-1">Audience Operations</p>
      </div>
      
      <nav className="space-y-2 relative z-10">
        {navItems.map((item, index) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-xl px-4 py-3 font-medium transition-all duration-300 animate-slide-up ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-glow scale-105'
                  : 'text-indigo-100 hover:bg-white/10 hover:text-white hover:scale-105'
              }`
            }
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <span className="text-xl">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  </aside>
);

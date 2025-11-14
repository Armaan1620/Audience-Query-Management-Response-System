export const Topbar = () => (
  <header className="flex items-center justify-between bg-white px-6 py-4 shadow-sm">
    <div>
      <h2 className="text-lg font-semibold">Inbox</h2>
      <p className="text-sm text-slate-500">Monitor, prioritize, and respond</p>
    </div>
    <div className="flex items-center gap-4">
      <input className="rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="Search queries" />
      <button className="rounded-lg bg-blue-600 px-4 py-2 text-white text-sm hover:bg-blue-700">New Query</button>
    </div>
  </header>
);

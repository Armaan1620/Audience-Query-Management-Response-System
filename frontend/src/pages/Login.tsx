export const LoginPage = () => (
  <div className="flex min-h-screen items-center justify-center bg-slate-100">
    <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
      <h1 className="mb-6 text-2xl font-bold">Unified Inbox</h1>
      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
          <input type="email" className="w-full rounded-lg border border-slate-200 px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
          <input type="password" className="w-full rounded-lg border border-slate-200 px-3 py-2" />
        </div>
        <button type="submit" className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700">
          Sign In
        </button>
      </form>
    </div>
  </div>
);


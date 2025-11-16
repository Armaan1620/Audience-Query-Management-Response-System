export const Loader = () => (
  <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
    <div className="relative">
      <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600" />
      <div className="absolute inset-0 animate-spin rounded-full h-16 w-16 border-4 border-transparent border-r-purple-600 animate-reverse" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
    </div>
    <p className="mt-4 text-sm text-slate-500 font-medium">Loading...</p>
  </div>
);

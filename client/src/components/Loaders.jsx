export function Spinner({ className = 'h-4 w-4' }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" opacity=".25" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

// Full-screen loader (used while the app checks who is logged in)
export function PageLoader() {
  return (
    <div className="grid min-h-screen place-items-center" role="status" aria-label="Loading">
      <div className="flex flex-col items-center gap-4">
        <span className="grid h-12 w-12 animate-pulse place-items-center rounded-card bg-brand text-lg font-semibold text-white">I</span>
        <Spinner className="h-5 w-5 text-brand" />
      </div>
    </div>
  );
}

// Placeholder rows shown inside a card while a list loads
export function TableSkeleton({ rows = 5 }) {
  return (
    <div className="divide-y divide-line" role="status" aria-label="Loading">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-6 px-6 py-5">
          <div className="h-4 w-1/4 animate-pulse rounded bg-soft" />
          <div className="h-4 w-1/5 animate-pulse rounded bg-soft" />
          <div className="hidden h-4 w-1/6 animate-pulse rounded bg-soft sm:block" />
          <div className="ml-auto h-4 w-16 animate-pulse rounded bg-soft" />
        </div>
      ))}
    </div>
  );
}

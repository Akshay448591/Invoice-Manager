import { Spinner } from "./Loaders";

// A titled white card that groups related fields on a form page
export function Section({ title, hint, children }) {
  return (
    <section className="card p-6 sm:p-8">
      <h2 className="text-lg font-semibold">{title}</h2>
      {hint && <p className="mt-1.5 text-sm text-slate2">{hint}</p>}
      <div className="mt-6">{children}</div>
    </section>
  );
}

export function FormSkeleton() {
  return (
    <div className="mx-auto max-w-3xl space-y-6" role="status" aria-label="Loading">
      <div className="h-10 w-1/3 animate-pulse rounded bg-soft" />
      <div className="card h-80 animate-pulse bg-soft/60" />
    </div>
  );
}

// Full-page form shell: back link, title, Cancel / Save at top and bottom, optional side summary.
export default function FormPage({ title, subtitle, backLabel = "Back", onCancel, onSubmit, busy, submitLabel = "Save", error, aside, children }) {
  const actions = (
    <div className="flex items-center gap-3">
      <button type="button" className="btn-ghost" onClick={onCancel} disabled={busy}>Cancel</button>
      <button className="btn-primary" disabled={busy}>
        {busy && <Spinner />}
        {busy ? "Saving…" : submitLabel}
      </button>
    </div>
  );

  return (
    <form onSubmit={onSubmit} className={`anim-fade-up mx-auto space-y-8 ${aside ? "max-w-6xl" : "max-w-3xl"}`}>
      <div>
        <button type="button" onClick={onCancel} className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate2 transition hover:text-ink">
          <span aria-hidden="true">←</span>
          {backLabel}
        </button>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold">{title}</h1>
            {subtitle && <p className="mt-2 text-sm text-slate2">{subtitle}</p>}
          </div>
          {actions}
        </div>
      </div>

      {error && <p role="alert" className="anim-pop rounded-xl bg-rose2/10 px-4 py-3 text-sm text-rose2">{error}</p>}

      <div className={aside ? "grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]" : ""}>
        <div className="space-y-6">{children}</div>
        {aside}
      </div>

      <div className="flex justify-end border-t border-line pt-6">{actions}</div>
    </form>
  );
}

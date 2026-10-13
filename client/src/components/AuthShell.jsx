// Shared layout for the login and register screens
export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[5fr_6fr]">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-brand p-12 text-white lg:flex">
        <div className="relative z-10 flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/20 text-lg font-semibold">I</span>
          <span className="text-lg font-semibold">Invoice Manager</span>
        </div>
        <div className="relative z-10 space-y-5">
          <h2 className="text-4xl font-semibold leading-tight">Send invoices.<br />Get paid sooner.</h2>
          <p className="max-w-sm leading-relaxed text-white/75">
            Quotes, invoices, payments and projects in one calm workspace, with a portal your clients will actually use.
          </p>
        </div>
        <p className="relative z-10 text-sm text-white/60">Built for freelancers and small studios.</p>
        <span className="absolute -right-24 top-20 h-80 w-80 rounded-full bg-white/10" />
        <span className="absolute -bottom-24 left-10 h-64 w-64 rounded-full bg-white/10" />
      </aside>
      <main className="grid place-items-center p-6 sm:p-10">
        <div className="anim-fade-up w-full max-w-sm">
          <h1 className="text-3xl font-semibold">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-slate2">{subtitle}</p>}
          <div className="mt-8">{children}</div>
          {footer && <p className="mt-6 text-sm text-slate2">{footer}</p>}
        </div>
      </main>
    </div>
  );
}

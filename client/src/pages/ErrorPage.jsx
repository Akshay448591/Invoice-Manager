import Icon from '../components/Icon';

// Plain <a> and window.location are used on purpose: this page can render outside the router.
export default function ErrorPage({ error }) {
  return (
    <div className="grid min-h-screen place-items-center p-6">
      <div className="anim-pop card w-full max-w-md p-10 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-rose2/10 text-rose2">
          <Icon name="alert" className="h-7 w-7" />
        </span>
        <h1 className="mt-6 text-2xl font-semibold">Something went wrong</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate2">
          The page hit an unexpected problem. Reloading usually fixes it. If it keeps happening, let us know what you were doing.
        </p>
        {error?.message && (
          <p className="mt-5 break-words rounded-xl bg-mist px-4 py-3 text-left text-xs text-slate2">{error.message}</p>
        )}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button className="btn-primary" onClick={() => window.location.reload()}>Reload page</button>
          <a className="btn-ghost" href="/">Go to home</a>
        </div>
      </div>
    </div>
  );
}

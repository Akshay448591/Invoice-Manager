export default function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-3xl font-semibold">{title}</h1>
        {subtitle && <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate2">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

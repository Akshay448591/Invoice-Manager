import Icon from "./Icon";

// Getting-started checklist. The first step is the one to do now.
export default function EmptyState({ title, body, steps = [], action }) {
  return (
    <div className="anim-fade-up px-6 py-16 text-center">
      <div className="mx-auto max-w-sm">
        <h2 className="text-lg font-semibold">{title}</h2>
        {body && <p className="mt-2 text-sm leading-relaxed text-slate2">{body}</p>}
        {steps.length > 0 && (
          <ul className="mx-auto mt-7 space-y-3.5 text-left">
            {steps.map((s, i) => (
              <li key={s} className={`flex items-center gap-3 text-sm ${i === 0 ? "font-medium text-ink" : "text-slate2"}`}>
                <Icon name={i === 0 ? "circleCheck" : "circle"} className={`h-5 w-5 shrink-0 ${i === 0 ? "text-brand" : "text-slate2/40"}`} />
                {s}
              </li>
            ))}
          </ul>
        )}
        {action && <div className="mt-8">{action}</div>}
      </div>
    </div>
  );
}

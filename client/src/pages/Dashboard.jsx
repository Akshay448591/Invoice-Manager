import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import EmptyState from "../components/EmptyState";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import { fmtDate, money } from "../utils/format";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const monthKey = (y, m) => `${y}-${m}`;

function Stat({ label, value, note, tone, delay, children }) {
  return (
    <div className="card anim-fade-up p-6" style={{ animationDelay: `${delay}ms` }}>
      <p className="text-sm text-slate2">{label}</p>
      <p className={`mt-2 text-3xl font-semibold ${tone === "danger" ? "text-rose2" : ""}`}>{value}</p>
      <div className="mt-4 flex h-6 items-end justify-between gap-4">
        <p className="text-xs text-slate2">{note}</p>
        {children}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const toast = useToast();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  const load = () => {
    setError("");
    setData(null);
    Promise.all([api.get("/invoices"), api.get("/payments")])
      .then(([inv, pay]) => setData({ invoices: inv.data.items, payments: pay.data.items }))
      .catch((err) => {
        const msg = err.response?.data?.message || "Could not load your dashboard";
        setError(msg);
        toast.error(msg);
      });
  };

  useEffect(load, []);

  const s = useMemo(() => {
    if (!data) return null;
    const { invoices, payments } = data;
    const open = invoices.filter((i) => ["sent", "partial"].includes(i.status));
    const overdue = invoices.filter((i) => i.displayStatus === "overdue");
    const now = new Date();
    const months = Array.from({ length: 6 }, (_, k) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - k), 1);
      return { key: monthKey(d.getFullYear(), d.getMonth()), label: MONTHS[d.getMonth()], amount: 0 };
    });
    payments.forEach((p) => {
      const d = new Date(p.date);
      const m = months.find((x) => x.key === monthKey(d.getUTCFullYear(), d.getUTCMonth()));
      if (m) m.amount += p.amount || 0;
    });
    return {
      outstanding: open.reduce((t, i) => t + (i.balance || 0), 0),
      openCount: open.length,
      overdue: overdue.reduce((t, i) => t + (i.balance || 0), 0),
      overdueCount: overdue.length,
      drafts: invoices.filter((i) => i.status === "draft").length,
      months,
      paidThisMonth: months[5].amount,
      recent: [...invoices].sort((a, b) => new Date(b.issueDate) - new Date(a.issueDate)).slice(0, 5),
      empty: invoices.length === 0,
    };
  }, [data]);

  const max = s ? Math.max(...s.months.map((m) => m.amount), 1) : 1;

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <PageHeader
        title={`Welcome back, ${user.name?.split(" ")[0] || "there"}`}
        subtitle="Here is where your money stands today."
        action={<Link to="/invoices" className="btn-primary">Go to invoices</Link>}
      />

      {error ? (
        <div className="card">
          <EmptyState
            title="We couldn't load your dashboard"
            body={error}
            action={<button className="btn-primary" onClick={load}>Try again</button>}
          />
        </div>
      ) : !s ? (
        <div className="space-y-8" role="status" aria-label="Loading">
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {[0, 1, 2, 3].map((i) => <div key={i} className="card h-36 animate-pulse bg-soft/60" />)}
          </div>
          <div className="card h-72 animate-pulse bg-soft/60" />
        </div>
      ) : s.empty ? (
        <div className="card">
          <EmptyState
            title="Your dashboard is waiting for its first invoice"
            body="Numbers and charts will appear here as soon as you start billing."
            steps={["Add a client", "Create an invoice", "Record a payment"]}
            action={<Link to="/clients" className="btn-primary">Add your first client</Link>}
          />
        </div>
      ) : (
        <>
          <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <Stat label="Outstanding" value={money(s.outstanding)} note={`${s.openCount} invoices`} delay={0} />
            <Stat label="Paid this month" value={money(s.paidThisMonth)} note="from payments" delay={60}>
              <div className="flex h-6 items-end gap-1" aria-hidden="true">
                {s.months.slice(2).map((m, i) => (
                  <span
                    key={m.label}
                    className="anim-grow w-2 rounded-t bg-brand"
                    style={{ height: `${Math.max((m.amount / max) * 100, 12)}%`, opacity: 0.35 + i * 0.22, animationDelay: `${300 + i * 80}ms` }}
                  />
                ))}
              </div>
            </Stat>
            <Stat label="Overdue" value={money(s.overdue)} note={`${s.overdueCount} invoices`} tone={s.overdueCount ? "danger" : ""} delay={120} />
            <Stat label="Drafts" value={s.drafts} note="not sent yet" delay={180} />
          </section>

          <section className="card p-6 sm:p-8">
            <h2 className="text-lg font-semibold">Revenue, last 6 months</h2>
            <div className="mt-8 flex h-52 items-end gap-3 sm:gap-6">
              {s.months.map((m, i) => (
                <div key={m.label} className="group relative flex h-full flex-1 flex-col items-center justify-end gap-3">
                  <span className="pointer-events-none absolute -top-1 rounded-sm bg-ink px-2 py-1 text-xs text-white opacity-0 transition group-hover:opacity-100">
                    {money(m.amount)}
                  </span>
                  <div
                    className="anim-grow w-full max-w-14 rounded-t-lg bg-brand/80 transition group-hover:bg-brand"
                    style={{ height: `${Math.max((m.amount / max) * 85, 3)}%`, animationDelay: `${i * 70}ms` }}
                  />
                  <span className="text-xs text-slate2">{m.label}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="card overflow-hidden">
            <div className="flex items-center justify-between p-6">
              <h2 className="text-lg font-semibold">Recent invoices</h2>
              <Link to="/invoices" className="link text-sm">View all</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs uppercase tracking-wide text-slate2">
                  <tr>
                    {["Invoice", "Client", "Amount", "Due", "Status"].map((h) => (
                      <th key={h} className="px-6 py-4 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {s.recent.map((inv) => (
                    <tr key={inv._id} className="border-t border-line transition hover:bg-canvas">
                      <td className="px-6 py-4 font-medium">{inv.number}</td>
                      <td className="px-6 py-4">{inv.client?.name || "—"}</td>
                      <td className="whitespace-nowrap px-6 py-4">{money(inv.total)}</td>
                      <td className="whitespace-nowrap px-6 py-4">{fmtDate(inv.dueDate)}</td>
                      <td className="px-6 py-4"><StatusBadge value={inv.displayStatus || inv.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

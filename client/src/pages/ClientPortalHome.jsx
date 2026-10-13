import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import PreviewModal from "../components/PreviewModal";
import StatusBadge from "../components/StatusBadge";
import EmptyState from "../components/EmptyState";
import Icon from "../components/Icon";
import { Spinner, TableSkeleton } from "../components/Loaders";
import { fmtDate, money } from "../utils/format";

export default function ClientPortalHome() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [tab, setTab] = useState("invoices");
  const [invoices, setInvoices] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [previewing, setPreviewing] = useState(null); // { type, doc }
  const [responding, setResponding] = useState(""); // "<quoteId>:<action>"

  const load = async () => {
    try {
      const [inv, quo] = await Promise.all([api.get("/portal/invoices"), api.get("/portal/quotes")]);
      setInvoices(inv.data.items);
      setQuotes(quo.data.items);
      setLoadError("");
    } catch (err) {
      const msg = err.response?.data?.message || "Could not load your documents";
      setLoadError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleLogout = async () => {
    await logout();
    toast.info("You have been logged out");
    navigate("/login");
  };

  const respond = async (quote, action) => {
    setResponding(`${quote._id}:${action}`);
    try {
      await api.post(`/portal/quotes/${quote._id}/respond`, { action });
      toast.success(action === "accept" ? "Quote accepted. Thank you!" : "Quote declined");
      setPreviewing(null);
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not send your answer");
    } finally {
      setResponding("");
    }
  };

  const outstanding = invoices
    .filter((i) => ["sent", "partial"].includes(i.status))
    .reduce((sum, i) => sum + (i.balance || 0), 0);
  const overdueCount = invoices.filter((i) => i.displayStatus === "overdue").length;
  const openQuotes = quotes.filter((q) => q.status === "sent").length;

  const tabClass = (name) =>
    `border-b-2 px-1 pb-3 text-sm font-medium transition ${
      tab === name ? "border-brand text-ink" : "border-transparent text-slate2 hover:text-ink"
    }`;
  const respondBtn = (q, action, label, cls) => (
    <button className={cls} disabled={Boolean(responding)} onClick={() => respond(q, action)}>
      {responding === `${q._id}:${action}` && <Spinner />}
      {label}
    </button>
  );

  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between bg-brand px-6 py-4 text-white sm:px-10">
        <span className="flex items-center gap-3 font-semibold">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/20">I</span>
          Client Portal
        </span>
        <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-white/80 transition hover:text-white">
          <Icon name="logout" className="h-4 w-4" />
          Log out
        </button>
      </header>

      <main className="mx-auto max-w-5xl space-y-8 p-5 pb-16 sm:p-10">
        <div className="anim-fade-up">
          <h1 className="text-3xl font-semibold">Hello, {user.name?.split(" ")[0]}</h1>
          <p className="mt-2 text-sm leading-relaxed text-slate2">
            Signed in as {user.email}. Preview and download your invoices and quotes here.
          </p>
        </div>

        <section className="grid gap-5 sm:grid-cols-3">
          {[
            ["Amount due", money(outstanding), ""],
            ["Overdue invoices", overdueCount, overdueCount ? "text-rose2" : ""],
            ["Quotes waiting for you", openQuotes, ""],
          ].map(([label, value, cls], i) => (
            <div key={label} className="card anim-fade-up p-6" style={{ animationDelay: `${i * 60}ms` }}>
              <p className="text-sm text-slate2">{label}</p>
              <p className={`mt-2 text-3xl font-semibold ${cls}`}>{loading ? "—" : value}</p>
            </div>
          ))}
        </section>

        <div>
          <div className="flex gap-8 border-b border-line">
            <button className={tabClass("invoices")} onClick={() => setTab("invoices")}>Invoices ({invoices.length})</button>
            <button className={tabClass("quotes")} onClick={() => setTab("quotes")}>Quotes ({quotes.length})</button>
          </div>

          <div className="card mt-6 overflow-hidden">
            {loading ? (
              <TableSkeleton />
            ) : loadError ? (
              <EmptyState
                title="We couldn't load your documents"
                body={loadError}
                action={<button className="btn-primary" onClick={() => { setLoading(true); load(); }}>Try again</button>}
              />
            ) : tab === "invoices" ? (
              invoices.length === 0 ? (
                <EmptyState title="No invoices yet" body="They will show up here once they are sent to you." />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="text-xs uppercase tracking-wide text-slate2">
                      <tr>
                        {["Invoice", "Issued", "Due", "Total", "Balance", "Status", ""].map((h) => (
                          <th key={h} className="px-6 py-4 font-medium">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.map((inv) => (
                        <tr key={inv._id} className="border-t border-line transition hover:bg-canvas">
                          <td className="px-6 py-4 font-medium">{inv.number}</td>
                          <td className="whitespace-nowrap px-6 py-4">{fmtDate(inv.issueDate)}</td>
                          <td className="whitespace-nowrap px-6 py-4">{fmtDate(inv.dueDate)}</td>
                          <td className="whitespace-nowrap px-6 py-4">{money(inv.total)}</td>
                          <td className="whitespace-nowrap px-6 py-4">{money(inv.balance)}</td>
                          <td className="px-6 py-4"><StatusBadge value={inv.displayStatus} /></td>
                          <td className="whitespace-nowrap px-6 py-4 text-right">
                            <button className="link mr-5" onClick={() => setPreviewing({ type: "invoice", doc: inv })}>Preview</button>
                            <a className="link" href={`/api/portal/invoices/${inv._id}/pdf?download=1`}>Download</a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            ) : quotes.length === 0 ? (
              <EmptyState title="No quotes yet" body="They will show up here once they are sent to you." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-xs uppercase tracking-wide text-slate2">
                    <tr>
                      {["Quote", "Issued", "Valid until", "Total", "Status", ""].map((h) => (
                        <th key={h} className="px-6 py-4 font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {quotes.map((q) => (
                      <tr key={q._id} className="border-t border-line transition hover:bg-canvas">
                        <td className="px-6 py-4 font-medium">{q.number}</td>
                        <td className="whitespace-nowrap px-6 py-4">{fmtDate(q.issueDate)}</td>
                        <td className="whitespace-nowrap px-6 py-4">{fmtDate(q.validUntil)}</td>
                        <td className="whitespace-nowrap px-6 py-4">{money(q.total)}</td>
                        <td className="px-6 py-4"><StatusBadge value={q.status} /></td>
                        <td className="whitespace-nowrap px-6 py-4 text-right">
                          <button className="link mr-5" onClick={() => setPreviewing({ type: "quote", doc: q })}>Preview</button>
                          <a className="link mr-5" href={`/api/portal/quotes/${q._id}/pdf?download=1`}>Download</a>
                          {q.status === "sent" && (
                            <>
                              <button className="link mr-5" disabled={Boolean(responding)} onClick={() => respond(q, "accept")}>Accept</button>
                              <button className="font-medium text-rose2 hover:underline" disabled={Boolean(responding)} onClick={() => respond(q, "decline")}>Decline</button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      {previewing && (
        <PreviewModal
          type={previewing.type}
          doc={previewing.doc}
          business={previewing.doc.owner}
          pdfUrl={`/api/portal/${previewing.type}s/${previewing.doc._id}/pdf`}
          onClose={() => setPreviewing(null)}
          footer={
            previewing.type === "quote" && previewing.doc.status === "sent" ? (
              <>
                {respondBtn(previewing.doc, "decline", "Decline quote", "btn-danger")}
                {respondBtn(previewing.doc, "accept", "Accept quote", "btn-primary")}
              </>
            ) : null
          }
        />
      )}
    </div>
  );
}

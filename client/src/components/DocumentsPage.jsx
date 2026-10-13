import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import DocumentEditor from "./DocumentEditor";
import DocumentPaper from "./DocumentPaper";
import ConfirmDialog from "./ConfirmDialog";
import EmptyState from "./EmptyState";
import PageHeader from "./PageHeader";
import { FormSkeleton } from "./FormPage";
import StatusBadge from "./StatusBadge";
import Icon from "./Icon";
import { Spinner } from "./Loaders";
import { fmtDate, money } from "../utils/format";

const statusOf = (type, d) => (type === "invoice" ? d.displayStatus || d.status : d.status);

// One split-view screen for both invoices and quotes: list on the left, live preview on the right.
const CONFIG = {
  invoice: {
    title: "Invoices",
    subtitle: "Create, send and track invoices. Sent invoices appear in the client portal.",
    singular: "invoice",
    endpoint: "/invoices",
    dateKey: "dueDate",
    dateLabel: "Due",
    steps: ["Add a client", "Create an invoice", "Send it and record the payment"],
    canEdit: (d) => !["paid", "cancelled"].includes(d.status),
    filters: [
      ["all", "All", () => true],
      ["unpaid", "Unpaid", (d) => ["sent", "partial", "overdue"].includes(d.displayStatus || d.status)],
      ["draft", "Drafts", (d) => d.status === "draft"],
      ["paid", "Paid", (d) => d.status === "paid"],
    ],
  },
  quote: {
    title: "Quotes",
    subtitle: "Send estimates. When a client accepts, convert the quote into an invoice.",
    singular: "quote",
    endpoint: "/quotes",
    dateKey: "validUntil",
    dateLabel: "Valid until",
    steps: ["Add a client", "Create a quote", "Convert it once accepted"],
    canEdit: (d) => ["draft", "sent"].includes(d.status),
    filters: [
      ["all", "All", () => true],
      ["draft", "Drafts", (d) => d.status === "draft"],
      ["sent", "Sent", (d) => d.status === "sent"],
      ["accepted", "Accepted", (d) => d.status === "accepted"],
    ],
  },
};

export default function DocumentsPage({ type }) {
  const cfg = CONFIG[type];
  const Cap = cfg.singular[0].toUpperCase() + cfg.singular.slice(1);
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const { pathname } = useLocation();
  // /invoices = list, /invoices/new = form, /invoices/<id> = edit form
  const rest = pathname.slice(cfg.endpoint.length).replace(/^\//, "");
  const formMode = rest === "new" ? "new" : rest ? "edit" : null;
  const editDoc = formMode === "edit" ? items.find((d) => d._id === rest) : null;
  const goBack = () => navigate(cfg.endpoint);
  const [deleting, setDeleting] = useState(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [busy, setBusy] = useState(""); // name of the action running

  const load = async () => {
    try {
      const res = await api.get(cfg.endpoint);
      setItems(res.data.items);
      setLoadError("");
    } catch (err) {
      const msg = err.response?.data?.message || `Could not load ${cfg.title.toLowerCase()}`;
      setLoadError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [type]);

  const activeFilter = cfg.filters.find((f) => f[0] === filter) || cfg.filters[0];
  const q = query.trim().toLowerCase();
  const visible = items.filter(
    (d) =>
      activeFilter[2](d) &&
      (!q || d.number?.toLowerCase().includes(q) || d.client?.name?.toLowerCase().includes(q)),
  );
  const selected = items.find((d) => d._id === selectedId) || visible[0] || null;

  // Runs an action endpoint (send, cancel, convert) then refreshes the list
  const run = async (action, doneMessage) => {
    setBusy(action);
    try {
      await api.post(`${cfg.endpoint}/${selected._id}/${action}`);
      toast.success(doneMessage);
      if (action === "convert") return navigate("/invoices");
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setBusy("");
    }
  };

  const handleDelete = async () => {
    setDeleteBusy(true);
    try {
      await api.delete(`${cfg.endpoint}/${deleting._id}`);
      toast.success(`${Cap} deleted`);
      setSelectedId(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not delete");
    }
    setDeleteBusy(false);
    setDeleting(null);
    load();
  };

  const newButton = (
    <button className="btn-primary shrink-0" onClick={() => navigate(`${cfg.endpoint}/new`)}>
      <Icon name="plus" className="h-4 w-4" />
      New {cfg.singular}
    </button>
  );

  const actionBtn = (name, label, cls, message) => (
    <button className={cls} disabled={Boolean(busy)} onClick={() => run(name, message)}>
      {busy === name && <Spinner />}
      {label}
    </button>
  );

  if (formMode) {
    if (loading) return <FormSkeleton />;
    if (formMode === "edit" && !editDoc) {
      return (
        <div className="card mx-auto max-w-3xl">
          <EmptyState
            title={`We couldn't find that ${cfg.singular}`}
            body="It may have been deleted."
            action={<button className="btn-primary" onClick={goBack}>Back to {cfg.title.toLowerCase()}</button>}
          />
        </div>
      );
    }
    return (
      <DocumentEditor
        key={editDoc?._id || "new"}
        type={type}
        doc={editDoc}
        onCancel={goBack}
        onSaved={() => {
          toast.success(`${Cap} saved`);
          goBack();
          load();
        }}
      />
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <PageHeader title={cfg.title} subtitle={cfg.subtitle} action={newButton} />

      {loading ? (
        <div className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)]" role="status" aria-label="Loading">
          <div className="card space-y-5 p-5">
            {[0, 1, 2, 3, 4].map((i) => <div key={i} className="h-14 animate-pulse rounded-xl bg-soft" />)}
          </div>
          <div className="card h-96 animate-pulse bg-soft/60" />
        </div>
      ) : loadError ? (
        <div className="card">
          <EmptyState
            title={`We couldn't load your ${cfg.title.toLowerCase()}`}
            body={loadError}
            action={<button className="btn-primary" onClick={() => { setLoading(true); load(); }}>Try again</button>}
          />
        </div>
      ) : items.length === 0 ? (
        <div className="card">
          <EmptyState
            title={`No ${cfg.title.toLowerCase()} yet`}
            body={`Add a client first, then create your first ${cfg.singular}.`}
            steps={cfg.steps}
            action={newButton}
          />
        </div>
      ) : (
        <div className="grid items-start gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
          {/* List */}
          <section className="card flex max-h-[28rem] flex-col lg:max-h-[calc(100vh-14rem)]" aria-label={cfg.title}>
            <div className="space-y-4 border-b border-line p-4">
              <div className="relative">
                <Icon name="search" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate2" />
                <input
                  className="input pl-10"
                  placeholder="Search number or client"
                  aria-label="Search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {cfg.filters.map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setFilter(key)}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
                      filter === key ? "bg-soft text-brand" : "text-slate2 hover:bg-mist"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1 space-y-1 overflow-y-auto p-2">
              {visible.length === 0 && <p className="px-3 py-8 text-center text-sm text-slate2">Nothing matches.</p>}
              {visible.map((d, i) => {
                const active = selected?._id === d._id;
                return (
                  <button
                    key={d._id}
                    onClick={() => setSelectedId(d._id)}
                    aria-current={active}
                    className={`anim-fade-up block w-full rounded-xl border px-3.5 py-3.5 text-left transition ${
                      active ? "border-brand bg-soft" : "border-transparent hover:bg-canvas"
                    }`}
                    style={{ animationDelay: `${Math.min(i, 8) * 35}ms` }}
                  >
                    <span className="flex items-center justify-between gap-3 text-sm font-semibold">
                      <span>{d.number}</span>
                      <span>{money(d.total)}</span>
                    </span>
                    <span className="mt-1.5 flex items-center justify-between gap-3 text-xs text-slate2">
                      <span className="truncate">{d.client?.name || "—"}</span>
                      <StatusBadge value={statusOf(type, d)} />
                    </span>
                    <span className="mt-1 block text-xs text-slate2">
                      {cfg.dateLabel} {fmtDate(d[cfg.dateKey])}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Preview */}
          <section className="min-w-0 space-y-4" aria-label="Preview">
            {selected ? (
              <>
                <div className="flex flex-wrap items-center gap-3">
                  {selected.status === "draft" &&
                    actionBtn("send", `Send ${cfg.singular}`, "btn-primary", `${Cap} sent. The client can see it in their portal.`)}
                  {type === "quote" && selected.status === "accepted" &&
                    actionBtn("convert", "Convert to invoice", "btn-primary", "Quote converted to an invoice")}
                  {type === "invoice" && ["sent", "partial"].includes(selected.status) && !selected.amountPaid &&
                    actionBtn("cancel", "Cancel invoice", "btn-ghost", "Invoice cancelled")}
                  {cfg.canEdit(selected) && (
                    <button className="btn-ghost" onClick={() => navigate(`${cfg.endpoint}/${selected._id}`)}>Edit</button>
                  )}
                  <a className="btn-ghost" href={`/api${cfg.endpoint}/${selected._id}/pdf?download=1`}>Download PDF</a>
                  <a className="btn-ghost" href={`/api${cfg.endpoint}/${selected._id}/pdf`} target="_blank" rel="noreferrer">Open PDF</a>
                  <button className="ml-auto font-medium text-rose2 hover:underline" onClick={() => setDeleting(selected)}>Delete</button>
                </div>
                <div key={selected._id} className="anim-fade-up">
                  <DocumentPaper type={type} doc={selected} business={user} />
                </div>
              </>
            ) : (
              <div className="card p-10 text-center text-sm text-slate2">Select a {cfg.singular} to preview it.</div>
            )}
          </section>
        </div>
      )}

      {deleting && (
        <ConfirmDialog
          title={`Delete ${deleting.number}?`}
          body={
            type === "invoice" && deleting.status !== "draft"
              ? "The client will no longer see this invoice. If you only want to stop collecting on it, cancel it instead."
              : "This can't be undone."
          }
          confirmLabel={`Delete ${cfg.singular}`}
          cancelLabel="Keep it"
          busy={deleteBusy}
          onConfirm={handleDelete}
          onCancel={() => setDeleting(null)}
        />
      )}
    </div>
  );
}

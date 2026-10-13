import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api";
import { useToast } from "../context/ToastContext";
import ResourceForm from "./ResourceForm";
import { FormSkeleton } from "./FormPage";
import ConfirmDialog from "./ConfirmDialog";
import EmptyState from "./EmptyState";
import PageHeader from "./PageHeader";
import Icon from "./Icon";
import { TableSkeleton } from "./Loaders";

// Checklist shown on an empty page, keyed by endpoint. The first step is highlighted.
const STEPS = {
  "/projects": ["Add a client first", "Create a project for them", "Add tasks to the project"],
  "/tasks": ["Create a project", "Add the first task", "Mark tasks as done"],
  "/products": ["Add what you sell", "Pick it on an invoice", "Get paid"],
  "/expenses": ["Log your first expense", "Pick a category", "Review your spending"],
  "/payments": ["Send an invoice", "Receive the money", "Record the payment here"],
};

// A full CRUD screen (table + add/edit modal + delete confirm) driven by config.
// Props: title, subtitle, singular, endpoint, columns, fields, emptyText, nameOf, deleteNote
export default function ResourcePage({
  title,
  subtitle,
  singular,
  endpoint,
  columns,
  fields,
  emptyText,
  nameOf = (i) => i.name || i.title,
  deleteNote = "This can't be undone.",
}) {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const navigate = useNavigate();
  const { pathname } = useLocation();
  // /products = list, /products/new = add form, /products/<id> = edit form
  const rest = pathname.slice(endpoint.length).replace(/^\//, "");
  const formMode = rest === "new" ? "new" : rest ? "edit" : null;
  const editItem = formMode === "edit" ? items.find((i) => i._id === rest) : null;
  const goBack = () => navigate(endpoint);
  const [deleting, setDeleting] = useState(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const load = async () => {
    try {
      const res = await api.get(endpoint);
      setItems(res.data.items);
      setLoadError("");
    } catch (err) {
      const msg = err.response?.data?.message || `Could not load ${title.toLowerCase()}`;
      setLoadError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [endpoint]);

  const handleSave = async (form) => {
    const isEdit = Boolean(editItem);
    if (isEdit) await api.put(`${endpoint}/${editItem._id}`, form);
    else await api.post(endpoint, form);
    goBack();
    toast.success(`${singular[0].toUpperCase()}${singular.slice(1)} ${isEdit ? "updated" : "added"}`);
    load();
  };

  const handleDelete = async () => {
    setDeleteBusy(true);
    try {
      await api.delete(`${endpoint}/${deleting._id}`);
      toast.success(`${singular[0].toUpperCase()}${singular.slice(1)} deleted`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not delete");
    }
    setDeleteBusy(false);
    setDeleting(null);
    load();
  };

  const addButton = (
    <button className="btn-primary shrink-0" onClick={() => navigate(`${endpoint}/new`)}>
      <Icon name="plus" className="h-4 w-4" />
      Add {singular}
    </button>
  );

  if (formMode) {
    if (loading) return <FormSkeleton />;
    if (formMode === "edit" && !editItem) {
      return (
        <div className="card mx-auto max-w-3xl">
          <EmptyState
            title={`We couldn't find that ${singular}`}
            body="It may have been deleted."
            action={<button className="btn-primary" onClick={goBack}>Back to {title.toLowerCase()}</button>}
          />
        </div>
      );
    }
    return (
      <ResourceForm
        key={editItem?._id || "new"}
        title={editItem ? `Edit ${singular}` : `Add ${singular}`}
        fields={fields}
        item={editItem || {}}
        onSave={handleSave}
        onCancel={goBack}
      />
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <PageHeader title={title} subtitle={subtitle} action={addButton} />

      <div className="card overflow-hidden">
        {loading ? (
          <TableSkeleton />
        ) : loadError ? (
          <EmptyState
            title="We couldn't load this page"
            body={loadError}
            action={<button className="btn-primary" onClick={() => { setLoading(true); load(); }}>Try again</button>}
          />
        ) : items.length === 0 ? (
          <EmptyState
            title={`No ${title.toLowerCase()} yet`}
            body={emptyText}
            steps={STEPS[endpoint] || [`Add your first ${singular}`]}
            action={addButton}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-slate2">
                <tr>
                  {columns.map((c) => (
                    <th key={c.key} className="px-6 py-4 font-medium">{c.label}</th>
                  ))}
                  <th />
                </tr>
              </thead>
              <tbody>
                {items.map((item, r) => (
                  <tr
                    key={item._id}
                    className="anim-fade-up border-t border-line transition hover:bg-canvas"
                    style={{ animationDelay: `${Math.min(r, 8) * 40}ms` }}
                  >
                    {columns.map((c, i) => (
                      <td key={c.key} className={`px-6 py-4 ${i === 0 ? "font-medium" : ""}`}>
                        {c.render ? c.render(item) : (item[c.key] ?? "—")}
                      </td>
                    ))}
                    <td className="whitespace-nowrap px-6 py-4 text-right">
                      <button className="link mr-5" onClick={() => navigate(`${endpoint}/${item._id}`)}>Edit</button>
                      <button className="font-medium text-rose2 hover:underline" onClick={() => setDeleting(item)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {deleting && (
        <ConfirmDialog
          title={`Delete ${nameOf(deleting)}?`}
          body={deleteNote}
          confirmLabel={`Delete ${singular}`}
          busy={deleteBusy}
          onConfirm={handleDelete}
          onCancel={() => setDeleting(null)}
        />
      )}
    </div>
  );
}

import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api";
import { useToast } from "../context/ToastContext";
import ClientForm from "../components/ClientForm";
import { FormSkeleton } from "../components/FormPage";
import ConfirmDialog from "../components/ConfirmDialog";
import EmptyState from "../components/EmptyState";
import PageHeader from "../components/PageHeader";
import Icon from "../components/Icon";
import { TableSkeleton } from "../components/Loaders";

// Full CRUD for clients: list, add, edit, delete.
export default function Clients() {
  const toast = useToast();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const navigate = useNavigate();
  const { pathname } = useLocation();
  // /clients = list, /clients/new = add form, /clients/<id> = edit form
  const rest = pathname.slice("/clients".length).replace(/^\//, "");
  const formMode = rest === "new" ? "new" : rest ? "edit" : null;
  const editClient = formMode === "edit" ? clients.find((c) => c._id === rest) : null;
  const goBack = () => navigate("/clients");
  const [deleting, setDeleting] = useState(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const load = async () => {
    try {
      const res = await api.get("/clients");
      setClients(res.data.clients);
      setLoadError("");
    } catch (err) {
      const msg = err.response?.data?.message || "Could not load clients";
      setLoadError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSave = async (form) => {
    const isEdit = Boolean(editClient);
    if (isEdit) await api.put(`/clients/${editClient._id}`, form);
    else await api.post("/clients", form);
    goBack();
    toast.success(isEdit ? "Client updated" : "Client added. They can now log in to the portal.");
    load();
  };

  const handleDelete = async () => {
    setDeleteBusy(true);
    try {
      await api.delete(`/clients/${deleting._id}`);
      toast.success("Client deleted");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not delete client");
    }
    setDeleteBusy(false);
    setDeleting(null);
    load();
  };

  const addButton = (
    <button className="btn-primary shrink-0" onClick={() => navigate("/clients/new")}>
      <Icon name="plus" className="h-4 w-4" />
      Add client
    </button>
  );

  if (formMode) {
    if (loading) return <FormSkeleton />;
    if (formMode === "edit" && !editClient) {
      return (
        <div className="card mx-auto max-w-3xl">
          <EmptyState
            title="We couldn't find that client"
            body="They may have been deleted."
            action={<button className="btn-primary" onClick={goBack}>Back to clients</button>}
          />
        </div>
      );
    }
    return <ClientForm key={editClient?._id || "new"} client={editClient || {}} onSave={handleSave} onCancel={goBack} />;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <PageHeader title="Clients" subtitle="Each client gets their own login to the client portal." action={addButton} />

      <div className="card overflow-hidden">
        {loading ? (
          <TableSkeleton />
        ) : loadError ? (
          <EmptyState
            title="We couldn't load your clients"
            body={loadError}
            action={<button className="btn-primary" onClick={() => { setLoading(true); load(); }}>Try again</button>}
          />
        ) : clients.length === 0 ? (
          <EmptyState
            title="No clients yet"
            body="Add your first client to give them portal access."
            steps={["Add a client", "Create an invoice for them", "Record the payment"]}
            action={addButton}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-slate2">
                <tr>
                  {["Name", "Company", "Email", "Phone", ""].map((h) => (
                    <th key={h} className="px-6 py-4 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {clients.map((c, i) => (
                  <tr
                    key={c._id}
                    className="anim-fade-up border-t border-line transition hover:bg-canvas"
                    style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3 font-medium">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-soft text-sm font-semibold text-brand">
                          {c.name?.[0]?.toUpperCase() || "?"}
                        </span>
                        {c.name}
                      </div>
                    </td>
                    <td className="px-6 py-4">{c.company || "—"}</td>
                    <td className="px-6 py-4">{c.email}</td>
                    <td className="px-6 py-4">{c.phone || "—"}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-right">
                      <button className="link mr-5" onClick={() => navigate(`/clients/${c._id}`)}>Edit</button>
                      <button className="font-medium text-rose2 hover:underline" onClick={() => setDeleting(c)}>Delete</button>
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
          title={`Delete ${deleting.name}?`}
          body="They will lose access to the client portal. This can't be undone."
          confirmLabel="Delete client"
          busy={deleteBusy}
          onConfirm={handleDelete}
          onCancel={() => setDeleting(null)}
        />
      )}
    </div>
  );
}

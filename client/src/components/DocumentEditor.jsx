import { useEffect, useState } from "react";
import api from "../api";
import FormPage, { Section } from "./FormPage";
import Icon from "./Icon";
import { inDaysISO, money, todayISO } from "../utils/format";

const emptyItem = () => ({ product: "", description: "", quantity: 1, unitPrice: "", taxRate: 0 });
const day = (d) => String(d).slice(0, 10); // "2026-10-03T00:00:00.000Z" -> "2026-10-03"

// Full-page create / edit form for invoices and quotes (they share almost everything).
//   type: 'invoice' | 'quote'     doc: existing document, or null for a new one
export default function DocumentEditor({ type, doc, onSaved, onCancel }) {
  const isInvoice = type === "invoice";
  const endpoint = isInvoice ? "/invoices" : "/quotes";
  const dateKey = isInvoice ? "dueDate" : "validUntil";

  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(() => ({
    client: doc?.client?._id || "",
    project: doc?.project?._id || "",
    issueDate: doc ? day(doc.issueDate) : todayISO(),
    [dateKey]: doc ? day(doc[dateKey]) : inDaysISO(14),
    notes: doc?.notes || "",
  }));
  const [items, setItems] = useState(() =>
    doc?.items?.length
      ? doc.items.map((i) => ({
          product: i.product || "",
          description: i.description,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          taxRate: i.taxRate || 0,
        }))
      : [emptyItem()],
  );
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    Promise.all([api.get("/clients"), api.get("/projects"), api.get("/products")])
      .then(([c, p, pr]) => {
        setClients(c.data.clients);
        setProjects(p.data.items);
        setProducts(pr.data.items.filter((x) => x.isActive));
      })
      .catch(() => setError("Could not load clients, projects or products"));
  }, []);

  const setField = (e) => {
    const { name, value } = e.target;
    // changing the client clears the project (a project belongs to one client)
    setForm((f) => ({ ...f, [name]: value, ...(name === "client" ? { project: "" } : {}) }));
  };

  const setItem = (index, patch) =>
    setItems((list) => list.map((it, i) => (i === index ? { ...it, ...patch } : it)));
  const addItem = () => setItems((list) => [...list, emptyItem()]);
  const removeItem = (index) =>
    setItems((list) => (list.length > 1 ? list.filter((_, i) => i !== index) : list));

  // Picking a product copies its name, price and tax onto the line (you can still edit them)
  const pickProduct = (index, id) => {
    const p = products.find((x) => x._id === id);
    setItem(
      index,
      p
        ? { product: p._id, description: p.name, unitPrice: p.unitPrice, taxRate: p.taxRate ?? 0 }
        : { product: "" },
    );
  };

  // Preview only. The server recalculates totals when saving.
  const totals = items.reduce(
    (t, it) => {
      const net = (Number(it.quantity) || 0) * (Number(it.unitPrice) || 0);
      t.subtotal += net;
      t.tax += (net * (Number(it.taxRate) || 0)) / 100;
      return t;
    },
    { subtotal: 0, tax: 0 },
  );

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const payload = { ...form, items };
      if (doc) await api.put(`${endpoint}/${doc._id}`, payload);
      else await api.post(endpoint, payload);
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || "Could not save");
      setBusy(false);
    }
  };

  const clientProjects = projects.filter((p) => p.client?._id === form.client);
  const label = "mb-2 block text-sm font-medium";
  const small = "mb-1.5 block text-xs font-medium text-slate2";
  const name = isInvoice ? "invoice" : "quote";

  const summary = (
    <aside className="card space-y-5 p-6 lg:sticky lg:top-8">
      <h2 className="text-lg font-semibold">Summary</h2>
      <dl className="space-y-3 text-sm">
        <div className="flex justify-between">
          <dt className="text-slate2">Subtotal</dt>
          <dd>{money(totals.subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate2">Tax</dt>
          <dd>{money(totals.tax)}</dd>
        </div>
        <div className="flex justify-between border-t border-line pt-4 text-lg font-semibold">
          <dt>Total</dt>
          <dd>{money(totals.subtotal + totals.tax)}</dd>
        </div>
      </dl>
      <p className="text-xs leading-relaxed text-slate2">Totals are recalculated on the server when you save.</p>
    </aside>
  );

  return (
    <FormPage
      title={doc ? `Edit ${doc.number}` : `New ${name}`}
      backLabel={`Back to ${name}s`}
      onCancel={onCancel}
      onSubmit={onSubmit}
      busy={busy}
      error={error}
      submitLabel={doc ? "Save changes" : `Save ${name}`}
      aside={summary}
    >
      <Section title="Details">
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label className={label} htmlFor="client">Client</label>
            <select id="client" name="client" required className="input" value={form.client} onChange={setField}>
              <option value="" disabled>Select a client…</option>
              {clients.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                  {c.company ? ` (${c.company})` : ""}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={label} htmlFor="project">Project (optional)</label>
            <select id="project" name="project" className="input" value={form.project} onChange={setField} disabled={!form.client}>
              <option value="">No project</option>
              {clientProjects.map((p) => (
                <option key={p._id} value={p._id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={label} htmlFor="issueDate">Issue date</label>
            <input id="issueDate" name="issueDate" type="date" required className="input" value={form.issueDate} onChange={setField} />
          </div>
          <div>
            <label className={label} htmlFor={dateKey}>{isInvoice ? "Due date" : "Valid until"}</label>
            <input id={dateKey} name={dateKey} type="date" required className="input" value={form[dateKey]} onChange={setField} />
          </div>
        </div>
      </Section>

      <Section title="Line items">
        <div className="space-y-4">
          {items.map((it, i) => (
            <div key={i} className="anim-fade-up space-y-4 rounded-2xl border border-line bg-canvas p-4 sm:p-5">
              <select
                aria-label="Pick a product or service"
                className="input"
                value={it.product}
                onChange={(e) => pickProduct(i, e.target.value)}
              >
                <option value="">Custom item (or pick a product / service)…</option>
                {products.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} — {money(p.unitPrice)} / {p.unit}
                  </option>
                ))}
              </select>
              <div className="grid gap-4 sm:grid-cols-12">
                <div className="sm:col-span-5">
                  <label className={small}>Description</label>
                  <input required className="input" value={it.description} onChange={(e) => setItem(i, { description: e.target.value })} />
                </div>
                <div className="sm:col-span-2">
                  <label className={small}>Qty</label>
                  <input required type="number" min="0.01" step="any" className="input" value={it.quantity} onChange={(e) => setItem(i, { quantity: e.target.value })} />
                </div>
                <div className="sm:col-span-2">
                  <label className={small}>Price (₹)</label>
                  <input required type="number" min="0" step="any" className="input" value={it.unitPrice} onChange={(e) => setItem(i, { unitPrice: e.target.value })} />
                </div>
                <div className="sm:col-span-2">
                  <label className={small}>Tax %</label>
                  <input type="number" min="0" max="100" step="any" className="input" value={it.taxRate} onChange={(e) => setItem(i, { taxRate: e.target.value })} />
                </div>
                <div className="flex items-end sm:col-span-1">
                  <button
                    type="button"
                    className="w-full py-2.5 text-sm font-medium text-rose2 hover:underline disabled:opacity-40"
                    disabled={items.length === 1}
                    onClick={() => removeItem(i)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <button type="button" className="btn-ghost mt-5" onClick={addItem}>
          <Icon name="plus" className="h-4 w-4" />
          Add line item
        </button>
      </Section>

      <Section title="Notes" hint={`Shown on the ${name}.`}>
        <textarea
          id="notes"
          name="notes"
          rows={4}
          className="input"
          value={form.notes}
          onChange={setField}
          placeholder={isInvoice ? "Bank details, payment terms…" : "Scope, terms…"}
        />
      </Section>
    </FormPage>
  );
}

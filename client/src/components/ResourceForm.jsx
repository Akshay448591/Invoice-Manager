import { useEffect, useState } from "react";
import api from "../api";
import FormPage, { Section } from "./FormPage";

// Full-page add/edit form built from a list of field definitions:
// { name, label, type, required, default, options, optionsFrom, placeholder }
// type: text | number | date | textarea | select | checkbox
// optionsFrom: { endpoint, listKey = 'items', labelKey = 'name', label?(o), filter?(o, item) }
// lockOnEdit: true disables the field when editing an existing record

const initialValue = (field, item) => {
  let v = item[field.name];
  if (v && typeof v === "object" && v._id) v = v._id; // populated reference -> id
  if (field.type === "date" && v) v = String(v).slice(0, 10);
  if (field.type === "checkbox") return v ?? field.default ?? false;
  return v ?? field.default ?? "";
};

const normalize = (o) => (typeof o === "string" ? { value: o, label: o } : o);

export default function ResourceForm({ title, fields, item, onSave, onCancel }) {
  const [form, setForm] = useState(() =>
    Object.fromEntries(fields.map((f) => [f.name, initialValue(f, item)])),
  );
  const [options, setOptions] = useState({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // Load options for selects that point at another endpoint (e.g. projects -> clients)
  useEffect(() => {
    fields
      .filter((f) => f.optionsFrom)
      .forEach((f) => {
        const { endpoint, listKey = "items", labelKey = "name", label, filter } = f.optionsFrom;
        api
          .get(endpoint)
          .then((res) =>
            setOptions((prev) => ({
              ...prev,
              [f.name]: res.data[listKey]
                .filter((o) => !filter || filter(o, item))
                .map((o) => ({ value: o._id, label: label ? label(o) : o[labelKey] })),
            })),
          )
          .catch(() => setError("Could not load options for " + f.label));
      });
  }, [fields]);

  const onChange = (e) => {
    const { name, type, value, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await onSave(form);
    } catch (err) {
      setError(err.response?.data?.message || "Could not save");
      setBusy(false);
    }
  };

  const renderField = (f) => {
    const common = { id: f.name, name: f.name, required: f.required, onChange };

    if (f.type === "textarea") {
      return <textarea {...common} rows={4} className="input" value={form[f.name]} placeholder={f.placeholder} />;
    }
    if (f.type === "select") {
      const opts = (f.optionsFrom ? options[f.name] || [] : f.options || []).map(normalize);
      return (
        <select {...common} className="input" value={form[f.name]} disabled={f.lockOnEdit && Boolean(item._id)}>
          <option value="" disabled={f.required}>
            {f.optionsFrom && !options[f.name] ? "Loading…" : "Select…"}
          </option>
          {opts.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      );
    }
    if (f.type === "checkbox") {
      return (
        <label className="flex items-center gap-3 text-sm">
          <input type="checkbox" name={f.name} checked={form[f.name]} onChange={onChange} className="h-4 w-4 accent-brand" />
          {f.checkboxLabel || f.label}
        </label>
      );
    }
    return (
      <input
        {...common}
        type={f.type || "text"}
        className="input"
        value={form[f.name]}
        placeholder={f.placeholder}
        {...(f.type === "number" ? { min: 0, step: "any" } : {})}
      />
    );
  };

  return (
    <FormPage title={title} backLabel="Back to list" onCancel={onCancel} onSubmit={onSubmit} busy={busy} error={error}>
      <Section title="Details">
        <div className="grid gap-6 sm:grid-cols-2">
          {fields.map((f) => (
            <div key={f.name} className={f.type === "textarea" || f.type === "checkbox" ? "sm:col-span-2" : ""}>
              {f.type !== "checkbox" && (
                <label className="mb-2 block text-sm font-medium" htmlFor={f.name}>{f.label}</label>
              )}
              {renderField(f)}
            </div>
          ))}
        </div>
      </Section>
    </FormPage>
  );
}

import { useState } from "react";
import FormPage, { Section } from "./FormPage";

// Full-page form for both "Add client" and "Edit client".
// On add, the business user sets the client's login email + password.
export default function ClientForm({ client, onSave, onCancel }) {
  const isEdit = Boolean(client._id);
  const [form, setForm] = useState({
    name: client.name || "",
    email: client.email || "",
    password: "",
    company: client.company || "",
    phone: client.phone || "",
    address: client.address || "",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await onSave(form);
    } catch (err) {
      setError(err.response?.data?.message || "Could not save client");
      setBusy(false);
    }
  };

  const field = (name, label, type = "text", required = false) => (
    <div>
      <label className="mb-2 block text-sm font-medium" htmlFor={name}>{label}</label>
      <input id={name} name={name} type={type} required={required} className="input" value={form[name]} onChange={onChange} />
    </div>
  );

  return (
    <FormPage
      title={isEdit ? "Edit client" : "Add client"}
      backLabel="Back to clients"
      onCancel={onCancel}
      onSubmit={onSubmit}
      busy={busy}
      error={error}
      submitLabel={isEdit ? "Save changes" : "Add client"}
    >
      <Section title="Client details">
        <div className="grid gap-6 sm:grid-cols-2">
          {field("name", "Name", "text", true)}
          {field("company", "Company")}
          {field("phone", "Phone")}
          {field("address", "Address")}
        </div>
      </Section>
      <Section title="Portal login" hint="Your client uses this to sign in and see their invoices and quotes.">
        <div className="grid gap-6 sm:grid-cols-2">
          {field("email", "Login email", "email", true)}
          {field("password", isEdit ? "New password (leave blank to keep current)" : "Password for client login", "password", !isEdit)}
        </div>
      </Section>
    </FormPage>
  );
}

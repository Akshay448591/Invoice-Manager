import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth, homeFor } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import AuthShell from "../components/AuthShell";
import { PageLoader, Spinner } from "../components/Loaders";

// Sign-up is for business users only. Clients are added by a business user.
export default function Register() {
  const { user, loading, register } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState({ name: "", businessName: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (loading) return <PageLoader />;
  if (user) return <Navigate to={homeFor(user.role)} replace />;

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const u = await register(form);
      toast.success("Account created. Let's add your first client.");
      navigate(homeFor(u.role));
    } catch (err) {
      setError(err.response?.data?.message || "Could not create account. Try again.");
      setBusy(false);
    }
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Set up your business in under a minute."
      footer={<>Already have an account? <Link to="/login" className="link">Log in</Link></>}
    >
      <form onSubmit={onSubmit} className="space-y-5">
        {error && <p className="anim-pop rounded-xl bg-rose2/10 px-4 py-3 text-sm text-rose2" role="alert">{error}</p>}
        {[
          ["name", "Your name", "text"],
          ["businessName", "Business name", "text"],
          ["email", "Email", "email"],
          ["password", "Password (6+ characters)", "password"],
        ].map(([name, label, type]) => (
          <div key={name}>
            <label className="mb-2 block text-sm font-medium" htmlFor={name}>{label}</label>
            <input id={name} name={name} type={type} required={name !== "businessName"} className="input" value={form[name]} onChange={onChange} />
          </div>
        ))}
        <button disabled={busy} className="btn-primary w-full py-3">
          {busy && <Spinner />}
          {busy ? "Creating…" : "Create account"}
        </button>
      </form>
    </AuthShell>
  );
}

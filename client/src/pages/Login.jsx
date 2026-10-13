import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth, homeFor } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import AuthShell from "../components/AuthShell";
import { PageLoader, Spinner } from "../components/Loaders";

export default function Login() {
  const { user, loading, login } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState({ email: "", password: "" });
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
      const u = await login(form.email, form.password);
      toast.success(`Welcome back, ${u.name?.split(" ")[0] || "there"}`);
      navigate(homeFor(u.role));
    } catch (err) {
      setError(err.response?.data?.message || "Could not log in. Try again.");
      setBusy(false);
    }
  };

  return (
    <AuthShell
      title="Log in"
      subtitle="Business users and clients use the same form."
      footer={<>Running a business? <Link to="/register" className="link">Create an account</Link></>}
    >
      <form onSubmit={onSubmit} className="space-y-5">
        {error && <p className="anim-pop rounded-xl bg-rose2/10 px-4 py-3 text-sm text-rose2" role="alert">{error}</p>}
        <div>
          <label className="mb-2 block text-sm font-medium" htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required autoComplete="email" className="input" value={form.email} onChange={onChange} />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium" htmlFor="password">Password</label>
          <input id="password" name="password" type="password" required autoComplete="current-password" className="input" value={form.password} onChange={onChange} />
        </div>
        <button disabled={busy} className="btn-primary w-full py-3">
          {busy && <Spinner />}
          {busy ? "Logging in…" : "Log in"}
        </button>
      </form>
    </AuthShell>
  );
}

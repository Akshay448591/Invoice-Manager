import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth, homeFor } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import BusinessLayout from "./components/BusinessLayout";
import { PageLoader } from "./components/Loaders";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import Products from "./pages/Products";
import Projects from "./pages/Projects";
import Tasks from "./pages/Tasks";
import Expenses from "./pages/Expenses";
import Payments from "./pages/Payments";
import DocumentsPage from "./components/DocumentsPage";
import ClientPortalHome from "./pages/ClientPortalHome";
import NotFound from "./pages/NotFound";

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  return <Navigate to={user ? homeFor(user.role) : "/login"} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Business users */}
      <Route
        element={
          <ProtectedRoute role="business">
            <BusinessLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/clients/*" element={<Clients />} />
        <Route path="/products/*" element={<Products />} />
        <Route path="/projects/*" element={<Projects />} />
        <Route path="/tasks/*" element={<Tasks />} />
        <Route path="/expenses/*" element={<Expenses />} />
        <Route path="/payments/*" element={<Payments />} />
        {/* key makes React reset the page when switching between invoices and quotes */}
        <Route path="/quotes/*" element={<DocumentsPage key="quote" type="quote" />} />
        <Route path="/invoices/*" element={<DocumentsPage key="invoice" type="invoice" />} />
      </Route>

      {/* Clients */}
      <Route
        path="/portal"
        element={
          <ProtectedRoute role="client">
            <ClientPortalHome />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

import { Navigate } from 'react-router-dom';
import { useAuth, homeFor } from '../context/AuthContext';
import { PageLoader } from './Loaders';

// <ProtectedRoute role="business"> ... </ProtectedRoute>
export default function ProtectedRoute({ role, children }) {
  const { user, loading } = useAuth();

  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to={homeFor(user.role)} replace />;

  return children;
}

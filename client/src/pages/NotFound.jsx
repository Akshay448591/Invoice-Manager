import { Link } from 'react-router-dom';
import { useAuth, homeFor } from '../context/AuthContext';

export default function NotFound() {
  const { user } = useAuth();
  return (
    <div className="grid min-h-screen place-items-center p-6">
      <div className="anim-fade-up max-w-md text-center">
        <p className="text-7xl font-bold tracking-tight text-brand">404</p>
        <h1 className="mt-6 text-2xl font-semibold">This page doesn't exist</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate2">
          The link may be broken, or the page may have moved. Head back and pick up where you left off.
        </p>
        <Link to={user ? homeFor(user.role) : '/login'} className="btn-primary mt-8">
          {user ? 'Back to your workspace' : 'Go to log in'}
        </Link>
      </div>
    </div>
  );
}

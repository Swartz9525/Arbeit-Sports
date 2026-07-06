import { ReactNode } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  adminOnly?: boolean;
}

export default function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: '/login' });
    } else if (adminOnly && user?.role !== 'admin') {
      navigate({ to: '/' });
    }
  }, [isAuthenticated, user, adminOnly, navigate]);

  if (!isAuthenticated || (adminOnly && user?.role !== 'admin')) {
    return (
      <div className="flex flex-col items-center justify-center py-40 space-y-4">
        <h2 className="text-3xl font-black text-red-500 uppercase">ACCESS DENIED</h2>
        <p className="text-zinc-400 text-sm">Verifying authorization parameters...</p>
      </div>
    );
  }

  return <>{children}</>;
}

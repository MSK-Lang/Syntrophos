import { type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth.js';
import { SyntrophosLoading } from '@/components/ui/SyntrophosLoading.js';

export function ProtectedRoute({ children }: { children?: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#040201' }}>
        <SyntrophosLoading variant="workspace" label="VERIFYING SESSION" />
      </div>
    );
  }

  if (!user) {
    // Redirect unauthenticated visitors to sign in, remembering the attempted location
    return <Navigate to="/sign-in" state={{ from: location }} replace />;
  }

  return children ? <>{children}</> : null;
}


import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'user' | 'admin';
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { isLoggedIn, user } = useAuthStore();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  if (!hydrated) {
    return null;
  }

  if (!isLoggedIn || !user) {
    return <Navigate to="/login" replace />;
  }
  if (requiredRole) {
    if (requiredRole === 'admin' && user.role !== 'admin') {
      return <Navigate to="/user/home" replace />;
    }
    if (requiredRole === 'user' && user.role !== 'user' && user.role !== 'admin') {
      return <Navigate to="/login" replace />;
    }
  }
  return <>{children}</>;
};

export default ProtectedRoute;
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'user' | 'admin';
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { hasHydrated, isLoggedIn, token, user } = useAuthStore();

  // Wait for zustand/persist to rehydrate auth state to avoid redirect races on refresh.
  if (!hasHydrated) return null;

  if (!isLoggedIn || !token || !user) {
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

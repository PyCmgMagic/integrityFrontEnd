import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store';

interface PublicRouteProps {
  children: React.ReactNode;
}

/**
 * Route wrapper for pages like `/login`:
 * if already authenticated, redirect to the appropriate home page.
 */
const PublicRoute = ({ children }: PublicRouteProps) => {
  const { hasHydrated, isLoggedIn, token, user } = useAuthStore();

  if (!hasHydrated) return null;

  if (isLoggedIn && token && user) {
    const targetPath = user.role === 'admin' ? '/admin/home' : '/user/home';
    return <Navigate to={targetPath} replace />;
  }

  return <>{children}</>;
};

export default PublicRoute;


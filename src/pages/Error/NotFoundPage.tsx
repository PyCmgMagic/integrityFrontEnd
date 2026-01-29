import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store';
import FriendlyErrorPage from './FriendlyErrorPage';

function getHomePath() {
  const { hasHydrated, isLoggedIn, token, user } = useAuthStore.getState();
  if (!hasHydrated) return '/login';
  if (!isLoggedIn || !token || !user) return '/login';
  return user.role === 'admin' ? '/admin/home' : '/user/home';
}

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <FriendlyErrorPage
      status="404"
      title="找不到页面"
      subtitle="你访问的地址不存在，可能链接过期或输入有误。"
      onReload={() => window.location.reload()}
      onBack={() => navigate(-1)}
      onHome={() => navigate(getHomePath(), { replace: true })}
    />
  );
}

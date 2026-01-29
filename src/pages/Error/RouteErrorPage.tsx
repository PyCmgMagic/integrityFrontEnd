import { useEffect, useMemo } from 'react';
import { isRouteErrorResponse, useNavigate, useRouteError } from 'react-router-dom';
import { useAuthStore } from '../../store';
import FriendlyErrorPage from './FriendlyErrorPage';

function getHomePath() {
  const { hasHydrated, isLoggedIn, token, user } = useAuthStore.getState();
  if (!hasHydrated) return '/login';
  if (!isLoggedIn || !token || !user) return '/login';
  return user.role === 'admin' ? '/admin/home' : '/user/home';
}

function classifyErrorMessage(message: string | undefined) {
  const m = (message || '').toLowerCase();
  const isChunkLoad =
    m.includes('importing a module script failed') ||
    m.includes('failed to fetch dynamically imported module') ||
    m.includes('chunkloaderror') ||
    m.includes('loading chunk') ||
    m.includes('import()') ||
    m.includes('networkerror');

  if (isChunkLoad) {
    return {
      isChunkLoad,
      title: '页面资源加载失败',
      subtitle: '可能是网络波动或版本更新导致缓存不一致。建议刷新页面重试。',
    };
  }

  return {
    isChunkLoad,
    title: '页面出了点问题',
    subtitle: '别担心，试试刷新或返回继续使用。',
  };
}

export default function RouteErrorPage() {
  const error = useRouteError();
  const navigate = useNavigate();

  const { status, errorMessage, errorStack } = useMemo(() => {
    if (isRouteErrorResponse(error)) {
      const msg =
        typeof error.data === 'string'
          ? error.data
          : error.statusText || `HTTP ${error.status}`;
      return {
        status: (String(error.status) as '404' | '403' | '500') || 'error',
        errorMessage: msg,
        errorStack: undefined,
      };
    }

    if (error instanceof Error) {
      return { status: 'error' as const, errorMessage: error.message, errorStack: error.stack };
    }

    return { status: 'error' as const, errorMessage: String(error), errorStack: undefined };
  }, [error]);

  const { title, subtitle, isChunkLoad } = classifyErrorMessage(errorMessage);

  useEffect(() => {
    const key = '__integrity_chunk_reload__';
    if (!isChunkLoad) {
      try {
        sessionStorage.removeItem(key);
      } catch {
        // ignore
      }
      return;
    }

    // On chunk/module script load errors, a single hard refresh often resolves stale-cache issues.
    try {
      if (!sessionStorage.getItem(key)) {
        sessionStorage.setItem(key, '1');
        window.location.reload();
      }
    } catch {
      // ignore
    }
  }, [isChunkLoad]);

  return (
    <FriendlyErrorPage
      status={status}
      title={title}
      subtitle={subtitle}
      errorMessage={errorMessage}
      errorStack={errorStack}
      onReload={() => window.location.reload()}
      onBack={() => navigate(-1)}
      onHome={() => navigate(getHomePath(), { replace: true })}
    />
  );
}

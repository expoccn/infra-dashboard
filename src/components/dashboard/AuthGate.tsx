import { useEffect, type ReactNode } from 'react';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import { LoaderCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const LOGIN_PATH = '/login';
const PASSWORD_PATH = '/alterar-senha';
const ADMIN_USERS_PATH = '/usuarios';

export function AuthGate({ children }: { children: ReactNode }) {
  const { status, user } = useAuth();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const navigate = useNavigate();

  useEffect(() => {
    if (status === 'checking') return;

    if (status === 'unauthenticated' && pathname !== LOGIN_PATH) {
      void navigate({ to: LOGIN_PATH, replace: true });
      return;
    }

    if (status === 'authenticated' && user?.must_change_password && pathname !== PASSWORD_PATH) {
      void navigate({ to: PASSWORD_PATH, replace: true });
      return;
    }

    if (status === 'authenticated' && !user?.must_change_password && pathname === LOGIN_PATH) {
      void navigate({ to: '/', replace: true });
      return;
    }

    if (status === 'authenticated' && !user?.must_change_password && pathname.startsWith(ADMIN_USERS_PATH) && user?.role !== 'ADMIN') {
      void navigate({ to: '/', replace: true });
    }
  }, [navigate, pathname, status, user?.must_change_password, user?.role]);

  const allowed =
    status === 'unauthenticated'
      ? pathname === LOGIN_PATH
      : status === 'authenticated'
        ? user?.must_change_password
          ? pathname === PASSWORD_PATH
          : pathname !== LOGIN_PATH && (!pathname.startsWith(ADMIN_USERS_PATH) || user?.role === 'ADMIN')
        : false;

  if (!allowed) {
    const authScreen = pathname === LOGIN_PATH || pathname === PASSWORD_PATH;
    return (
      <div
        className={
          authScreen
            ? 'flex min-h-screen items-center justify-center bg-[#070708] text-white'
            : 'flex min-h-screen items-center justify-center bg-background text-foreground'
        }
      >
        <div className={authScreen ? 'flex items-center gap-3 text-sm text-white/65' : 'flex items-center gap-3 text-sm text-muted-foreground'}>
          <LoaderCircle className={authScreen ? 'h-5 w-5 animate-spin text-[#e30613]' : 'h-5 w-5 animate-spin text-primary'} />
          Verificando acesso...
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

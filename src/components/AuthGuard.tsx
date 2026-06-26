'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useStore } from '@/store/useStore';

const PUBLIC_ROUTES = ['/login', '/register', '/verify-email', '/reset-password', '/forgot-password'];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const auth = useStore((s) => s.auth);
  const checkAuth = useStore((s) => s.checkAuth);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    checkAuth().finally(() => setChecked(true));
  }, [checkAuth]);

  useEffect(() => {
    if (!checked) return;
    if (!auth.isLoggedIn && !PUBLIC_ROUTES.includes(pathname) && !pathname.startsWith('/api')) {
      router.push('/login');
    }
  }, [checked, auth.isLoggedIn, pathname, router]);

  if (!checked) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  if (!auth.isLoggedIn && !PUBLIC_ROUTES.includes(pathname)) {
    return null;
  }

  return <>{children}</>;
}

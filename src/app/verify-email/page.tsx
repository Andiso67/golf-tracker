'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { useTranslation } from '@/i18n/useTranslation';

export default function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; email?: string }>;
}) {
  const router = useRouter();
  const { t } = useTranslation();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verify = async () => {
      try {
        const params = await searchParams;
        const token = params.token;
        const email = params.email;

        if (!token || !email) {
          setStatus('error');
          setMessage(t('auth.invalidToken'));
          return;
        }

        const res = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, token }),
        });

        if (res.ok) {
          setStatus('success');
          setMessage(t('auth.emailVerified'));
        } else {
          setStatus('error');
          setMessage(t('auth.invalidToken'));
        }
      } catch {
        setStatus('error');
        setMessage(t('auth.invalidToken'));
      }
    };

    verify();
  }, [searchParams, t]);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-ft-bg px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm text-center"
      >
        {status === 'loading' && (
          <div className="space-y-4">
            <Loader2 size={48} className="mx-auto animate-spin text-ft-green-bright" />
            <p className="text-sm text-ft-muted">{t('auth.verifyEmail')}...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4">
            <CheckCircle2 size={48} className="mx-auto text-ft-green-bright" />
            <h2 className="text-xl font-bold text-ft-text">{message}</h2>
            <button
              onClick={() => router.push('/')}
              className="rounded-xl bg-ft-green px-6 py-2.5 text-sm font-semibold text-white hover:bg-ft-green/90"
            >
              {t('home.appTitle')}
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <XCircle size={48} className="mx-auto text-ft-rose" />
            <h2 className="text-xl font-bold text-ft-text">{message}</h2>
            <button
              onClick={() => router.push('/login')}
              className="rounded-xl bg-ft-card px-6 py-2.5 text-sm font-semibold text-white hover:bg-ft-card/80"
            >
              {t('auth.backToLogin')}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

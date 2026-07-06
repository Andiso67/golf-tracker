'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from '@/i18n/useTranslation';

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || t('auth.registerError'));
        setLoading(false);
        return;
      }

      if (data.resetUrl && process.env.NODE_ENV === 'development') {
        console.log('[PASSWORD RESET] Link:', data.resetUrl);
      }
      setSent(true);
    } catch {
      setError('Network error');
    }
    setLoading(false);
  };

  if (sent) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-ft-bg px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm text-center"
        >
          <CheckCircle2 size={48} className="mx-auto mb-4 text-ft-green-bright" />
          <h2 className="mb-2 text-xl font-bold text-ft-text">
            {t('auth.checkEmail')}
          </h2>
          <p className="mb-6 text-sm text-ft-muted">{t('auth.emailSent')}</p>
          <Link
            href="/login"
            className="text-sm font-medium text-ft-green-bright hover:text-ft-green-bright"
          >
            {t('auth.backToLogin')}
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-ft-bg px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <Link
          href="/login"
          className="mb-6 flex items-center gap-1 text-sm text-ft-muted hover:text-ft-text"
        >
          <ArrowLeft size={16} />
          {t('auth.backToLogin')}
        </Link>

        <h1 className="mb-2 text-2xl font-bold text-ft-text">
          {t('auth.resetPassword')}
        </h1>
        <p className="mb-6 text-sm text-ft-muted">{t('auth.forgotPassword')}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="rounded-lg bg-ft-rose/10 px-3 py-2 text-xs font-medium text-ft-rose">
              {error}
            </p>
          )}

          <div>
            <label className="mb-1 block text-xs font-medium text-ft-muted">
              {t('auth.email')}
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ft-muted" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('auth.emailPlaceholder')}
                required
                className="w-full rounded-xl border border-ft-border bg-ft-surface py-3 pl-11 pr-4 text-sm outline-none focus:border-ft-green"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-ft-green py-3 text-sm font-semibold text-white hover:bg-ft-green/90 disabled:opacity-50"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {t('auth.sendResetLink')}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

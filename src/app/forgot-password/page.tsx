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

      if (data.resetUrl) {
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
      <div className="flex min-h-dvh items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm text-center"
        >
          <CheckCircle2 size={48} className="mx-auto mb-4 text-emerald-500" />
          <h2 className="mb-2 text-xl font-bold text-zinc-900 dark:text-zinc-100">
            {t('auth.checkEmail')}
          </h2>
          <p className="mb-6 text-sm text-zinc-500">{t('auth.emailSent')}</p>
          <Link
            href="/login"
            className="text-sm font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
          >
            {t('auth.backToLogin')}
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <Link
          href="/login"
          className="mb-6 flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700"
        >
          <ArrowLeft size={16} />
          {t('auth.backToLogin')}
        </Link>

        <h1 className="mb-2 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          {t('auth.resetPassword')}
        </h1>
        <p className="mb-6 text-sm text-zinc-500">{t('auth.forgotPassword')}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-medium text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
              {error}
            </p>
          )}

          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500">
              {t('auth.email')}
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('auth.emailPlaceholder')}
                required
                className="w-full rounded-xl border border-zinc-200 bg-white py-3 pl-11 pr-4 text-sm outline-none focus:border-emerald-400 dark:border-zinc-700 dark:bg-zinc-900"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {t('auth.sendResetLink')}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

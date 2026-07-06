'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Lock, Loader2, CheckCircle2 } from 'lucide-react';
import { useTranslation } from '@/i18n/useTranslation';

export default function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; email?: string }>;
}) {
  const router = useRouter();
  const { t } = useTranslation();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const params = await searchParams;
      const token = params.token;
      const email = params.email;

      if (!token || !email) {
        setError(t('auth.invalidToken'));
        setLoading(false);
        return;
      }

      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token, password }),
      });

      if (res.ok) {
        setSuccess(true);
      } else {
        const data = await res.json();
        setError(data.error || t('auth.invalidToken'));
      }
    } catch {
      setError('Network error');
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-ft-bg px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm text-center"
        >
          <CheckCircle2 size={48} className="mx-auto mb-4 text-ft-green-bright" />
          <h2 className="mb-2 text-xl font-bold text-ft-text">
            {t('auth.passwordChanged')}
          </h2>
          <button
            onClick={() => router.push('/login')}
            className="rounded-xl bg-ft-green px-6 py-2.5 text-sm font-semibold text-white hover:bg-ft-green/90"
          >
            {t('auth.login')}
          </button>
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
        <h1 className="mb-6 text-2xl font-bold text-ft-text">
          {t('auth.resetPassword')}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="rounded-lg bg-ft-rose/10 px-3 py-2 text-xs font-medium text-ft-rose">
              {error}
            </p>
          )}

          <div>
            <label className="mb-1 block text-xs font-medium text-ft-muted">
              {t('auth.newPassword')}
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ft-muted" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('auth.passwordPlaceholder')}
                required
                minLength={6}
                className="w-full rounded-xl border border-ft-border bg-ft-surface py-3 pl-11 pr-4 text-sm outline-none focus:border-ft-green"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-ft-muted">
              {t('auth.confirmPassword')}
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ft-muted" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t('auth.confirmPassword')}
                required
                minLength={6}
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
            {t('auth.savePassword')}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

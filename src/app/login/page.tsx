'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Flag, Mail, Lock, UserPlus, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useTranslation } from '@/i18n/useTranslation';

type Mode = 'login' | 'register';

export default function LoginPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const login = useStore((s) => s.login);
  const register = useStore((s) => s.register);
  const auth = useStore((s) => s.auth);

  const [mode, setMode] = useState<Mode>('login');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName1, setLastName1] = useState('');
  const [lastName2, setLastName2] = useState('');

  if (auth.isLoggedIn) {
    router.push('/');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'register') {
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setError('Password must be at least 6 characters');
          setLoading(false);
          return;
        }
        const result = await register({ firstName, lastName1, lastName2, email, password });
        if (!result.success) {
          setError(result.error || t('auth.registerError'));
          setLoading(false);
          return;
        }
      } else {
        const result = await login(email, password);
        if (!result.success) {
          setError(result.error || t('auth.loginError'));
          setLoading(false);
          return;
        }
      }
      router.push('/');
    } catch {
      setError('Network error');
    }
    setLoading(false);
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setError('');
  };

  return (
    <div className="flex min-h-dvh items-center justify-center bg-zinc-50 px-4 pb-[env(safe-area-inset-bottom,0px)] pt-[env(safe-area-inset-top,0px)] dark:bg-zinc-950">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/50">
            <Flag size={28} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Golf Tracker
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            {mode === 'login' ? t('auth.login') : t('auth.register')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-medium text-rose-600 dark:bg-rose-950/50 dark:text-rose-400"
            >
              {error}
            </motion.p>
          )}

          {mode === 'register' && (
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-500">
                  {t('auth.firstName')}
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder={t('auth.firstNamePlaceholder')}
                  required
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-400 dark:border-zinc-700 dark:bg-zinc-900"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-zinc-500">
                    {t('auth.lastName1')}
                  </label>
                  <input
                    type="text"
                    value={lastName1}
                    onChange={(e) => setLastName1(e.target.value)}
                    placeholder={t('auth.lastName1Placeholder')}
                    className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-400 dark:border-zinc-700 dark:bg-zinc-900"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-zinc-500">
                    {t('auth.lastName2')}
                  </label>
                  <input
                    type="text"
                    value={lastName2}
                    onChange={(e) => setLastName2(e.target.value)}
                    placeholder={t('auth.lastName2Placeholder')}
                    className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-400 dark:border-zinc-700 dark:bg-zinc-900"
                  />
                </div>
              </div>
            </div>
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

          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500">
              {t('auth.password')}
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('auth.passwordPlaceholder')}
                required
                minLength={6}
                className="w-full rounded-xl border border-zinc-200 bg-white py-3 pl-11 pr-11 text-sm outline-none focus:border-emerald-400 dark:border-zinc-700 dark:bg-zinc-900"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-500">
                {t('auth.confirmPassword')}
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t('auth.confirmPassword')}
                  required
                  minLength={6}
                  className="w-full rounded-xl border border-zinc-200 bg-white py-3 pl-11 pr-4 text-sm outline-none focus:border-emerald-400 dark:border-zinc-700 dark:bg-zinc-900"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white transition-all hover:bg-emerald-700 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <>{mode === 'login' ? <Lock size={16} /> : <UserPlus size={16} />}</>
            )}
            {mode === 'login' ? t('auth.login') : t('auth.register')}
          </button>
        </form>

        <div className="mt-6 space-y-3 text-center text-sm">
          <p className="text-zinc-500">
            {mode === 'login' ? t('auth.noAccount') : t('auth.hasAccount')}{' '}
            <button
              onClick={switchMode}
              className="font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
            >
              {mode === 'login' ? t('auth.createOne') : t('auth.logInHere')}
            </button>
          </p>
          {mode === 'login' && (
            <Link
              href="/forgot-password"
              className="block text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
            >
              {t('auth.forgotPassword')}
            </Link>
          )}
        </div>
      </motion.div>
    </div>
  );
}

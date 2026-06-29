'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, User, Languages, Mail, ShieldCheck, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import BottomNav from '@/components/BottomNav';
import { useStore } from '@/store/useStore';
import { useTranslation } from '@/i18n/useTranslation';

export default function ProfilePage() {
  const player = useStore((s) => s.player);
  const setPlayer = useStore((s) => s.setPlayer);
  const storeLanguage = useStore((s) => s.language);
  const setLanguage = useStore((s) => s.setLanguage);
  const userEmail = useStore((s) => s.userEmail);
  const userEmailVerified = useStore((s) => s.userEmailVerified);
  const { t } = useTranslation();

  const [firstName, setFirstName] = useState('');
  const [lastName1, setLastName1] = useState('');
  const [lastName2, setLastName2] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (player) {
      setFirstName(player.firstName || '');
      setLastName1(player.lastName1 || '');
      setLastName2(player.lastName2 || '');
    }
  }, [player?.id]);

  const handleSave = async () => {
    const updated = {
      id: player?.id || Date.now().toString(),
      firstName: firstName.trim() || 'Golfer',
      lastName1: lastName1.trim(),
      lastName2: lastName2.trim(),
      handicap: player?.handicap || 0,
      homeCourse: player?.homeCourse || '',
      licenseNumber: player?.licenseNumber || '',
    };
    setPlayer(updated);

    if (player?.id) {
      try {
        await fetch(`/api/auth/users/${player.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firstName: updated.firstName,
            lastName1: updated.lastName1,
            lastName2: updated.lastName2,
          }),
        })
      } catch {}
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <>
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col px-4 pt-[calc(env(safe-area-inset-top,0px)+1.5rem)]">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Link href="/" className="mb-3 inline-flex items-center gap-1 text-sm text-zinc-400">
            <ArrowLeft size={16} />
            Back
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">
            {t('profile.title')}
          </h1>
          <p className="text-sm text-zinc-500">{t('profile.subtitle')}</p>
        </motion.div>

        <div className="mb-6 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/50">
            <User size={36} className="text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-500">
              {t('profile.firstName')}
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder={t('profile.firstNamePlaceholder')}
              className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-lg placeholder-zinc-300 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100 dark:border-zinc-700 dark:bg-zinc-900 dark:placeholder-zinc-600"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-500">
              {t('profile.lastName1')}
            </label>
            <input
              type="text"
              value={lastName1}
              onChange={(e) => setLastName1(e.target.value)}
              placeholder={t('profile.lastName1Placeholder')}
              className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-lg placeholder-zinc-300 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100 dark:border-zinc-700 dark:bg-zinc-900 dark:placeholder-zinc-600"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-500">
              {t('profile.lastName2')}
            </label>
            <input
              type="text"
              value={lastName2}
              onChange={(e) => setLastName2(e.target.value)}
              placeholder={t('profile.lastName2Placeholder')}
              className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-lg placeholder-zinc-300 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100 dark:border-zinc-700 dark:bg-zinc-900 dark:placeholder-zinc-600"
            />
          </div>

          {userEmail && (
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail size={16} className="text-zinc-400" />
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">
                    {userEmail}
                  </span>
                </div>
                {userEmailVerified ? (
                  <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                    <ShieldCheck size={14} />
                    {t('auth.emailVerified')}
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs font-medium text-amber-600">
                    <ShieldAlert size={14} />
                    {t('auth.emailNotVerified')}
                  </span>
                )}
              </div>
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-500">
              {t('profile.language')}
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setLanguage('en')}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-base font-bold transition-all active:scale-95 ${
                  storeLanguage === 'en'
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'border border-zinc-200 bg-white text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900'
                }`}
              >
                <Languages size={18} />
                English
              </button>
              <button
                onClick={() => setLanguage('es')}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-base font-bold transition-all active:scale-95 ${
                  storeLanguage === 'es'
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'border border-zinc-200 bg-white text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900'
                }`}
              >
                <Languages size={18} />
                Español
              </button>
            </div>
          </div>

          <button
            onClick={handleSave}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-4 text-lg font-bold text-white shadow-sm transition-all active:scale-[0.98]"
          >
            <Save size={20} />
            {saved ? t('profile.saved') : t('profile.save')}
          </button>
        </div>
      </div>
      <BottomNav />
    </>
  );
}

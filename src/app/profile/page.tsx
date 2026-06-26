'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, User, Languages } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import { useStore } from '@/store/useStore';
import { useTranslation } from '@/i18n/useTranslation';

export default function ProfilePage() {
  const player = useStore((s) => s.player);
  const setPlayer = useStore((s) => s.setPlayer);
  const storeLanguage = useStore((s) => s.language);
  const setLanguage = useStore((s) => s.setLanguage);
  const { t } = useTranslation();

  const [name, setName] = useState(player?.name || '');
  const [handicap, setHandicap] = useState(player?.handicap?.toString() || '');
  const [homeCourse, setHomeCourse] = useState(player?.homeCourse || '');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setPlayer({
      id: player?.id || Date.now().toString(),
      name: name.trim() || 'Golfer',
      handicap: parseFloat(handicap) || 0,
      homeCourse: homeCourse.trim() || 'Local Course',
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <>
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col px-4 pt-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
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
              {t('profile.name')}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('profile.namePlaceholder')}
              className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-lg placeholder-zinc-300 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100 dark:border-zinc-700 dark:bg-zinc-900 dark:placeholder-zinc-600"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-500">
              {t('profile.handicap')}
            </label>
            <input
              type="number"
              value={handicap}
              onChange={(e) => setHandicap(e.target.value)}
              placeholder="0.0"
              step="0.1"
              className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-lg placeholder-zinc-300 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100 dark:border-zinc-700 dark:bg-zinc-900 dark:placeholder-zinc-600"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-500">
              {t('profile.homeCourse')}
            </label>
            <input
              type="text"
              value={homeCourse}
              onChange={(e) => setHomeCourse(e.target.value)}
              placeholder={t('profile.coursePlaceholder')}
              className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-lg placeholder-zinc-300 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100 dark:border-zinc-700 dark:bg-zinc-900 dark:placeholder-zinc-600"
            />
          </div>

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

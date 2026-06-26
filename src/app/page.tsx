'use client';

import { Suspense } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Plus, BarChart3, Flag } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import ErrorBoundary from '@/components/ErrorBoundary';
import { useStore } from '@/store/useStore';
import { useTranslation } from '@/i18n/useTranslation';

function HomeContent() {
  const player = useStore((s) => s.player);
  const rounds = useStore((s) => s.rounds);
  const activeRoundId = useStore((s) => s.activeRoundId);
  const getRoundStats = useStore((s) => s.getRoundStats);
  const { t } = useTranslation();

  const activeRound = rounds.find(
    (r) => r.id === activeRoundId && !r.completed
  );
  const completedRounds = rounds.filter((r) => r.completed);
  const recentRounds = completedRounds.slice(-5).reverse();

  const latestStats = activeRoundId ? getRoundStats(activeRoundId) : null;

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col px-4 pt-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold tracking-tight">
          {player
            ? t('home.greeting', { name: player.name })
            : t('home.appTitle')}
        </h1>
        <p className="text-sm text-zinc-500">
          {player
            ? t('home.playerInfo', {
                handicap: player.handicap,
                course: player.homeCourse,
              })
            : t('home.tagline')}
        </p>
      </motion.div>

      {activeRound && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-4 overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:border-emerald-900 dark:from-emerald-950/50 dark:to-emerald-900/30"
        >
          <Link href={`/round/${activeRound.id}`} className="block p-4">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-3 w-3 rounded-full bg-emerald-500" />
                <span className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
                  {t('home.roundInProgress')}
                </span>
              </div>
            </div>
            <p className="text-lg font-bold">{activeRound.courseName}</p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {t('home.holesPlayed', {
                played: activeRound.holes.filter((h) => h.score > 0).length,
                total: activeRound.totalHoles,
              })}
              {latestStats && (
                <span className="ml-2">
                  · {latestStats.scoreToPar > 0 ? '+' : ''}
                  {latestStats.scoreToPar}
                </span>
              )}
            </p>
          </Link>
        </motion.div>
      )}

      <div className="mb-6 grid grid-cols-2 gap-3">
        <Link
          href="/new-round"
          className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition-all active:scale-[0.97] dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/50">
            <Plus
              size={24}
              className="text-emerald-600 dark:text-emerald-400"
            />
          </div>
          <span className="text-sm font-bold">{t('home.newRound')}</span>
        </Link>
        <Link
          href="/dashboard"
          className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition-all active:scale-[0.97] dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50">
            <BarChart3
              size={24}
              className="text-blue-600 dark:text-blue-400"
            />
          </div>
          <span className="text-sm font-bold">{t('home.dashboard')}</span>
        </Link>
      </div>

      <div className="mb-4">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-400">
          {t('home.recentRounds')}
        </h2>
        {recentRounds.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-zinc-200 py-8 text-center dark:border-zinc-800">
            <Flag size={32} className="text-zinc-300 dark:text-zinc-600" />
            <p className="text-sm text-zinc-400">{t('home.noRounds')}</p>
            <Link
              href="/new-round"
              className="text-sm font-medium text-emerald-600 dark:text-emerald-400"
            >
              {t('home.startFirstRound')}
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {recentRounds.map((round) => {
              const stats = getRoundStats(round.id);
              return (
                <Link
                  key={round.id}
                  href={`/round/${round.id}`}
                  className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-3 transition-all active:scale-[0.98] dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <div>
                    <p className="text-sm font-bold">{round.courseName}</p>
                    <p className="text-xs text-zinc-400">
                      {new Date(round.date).toLocaleDateString()} ·{' '}
                      {round.totalHoles} {t('home.holes')}
                    </p>
                  </div>
                  {stats && (
                    <div className="text-right">
                      <p
                        className={`text-lg font-bold ${
                          stats.scoreToPar <= 0
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {stats.scoreToPar > 0 ? '+' : ''}
                        {stats.scoreToPar}
                      </p>
                      <p className="text-xs text-zinc-400">
                        {stats.totalScore}
                      </p>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <ErrorBoundary
      fallback={
        <div className="mx-auto flex max-w-lg flex-1 flex-col items-center justify-center p-8 text-center">
          <p className="text-zinc-500">Something went wrong loading the app</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 text-sm font-medium text-emerald-600"
          >
            Reload page
          </button>
        </div>
      }
    >
      <Suspense
        fallback={
          <div className="mx-auto flex max-w-lg flex-1 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
          </div>
        }
      >
        <HomeContent />
      </Suspense>
      <BottomNav />
    </ErrorBoundary>
  );
}

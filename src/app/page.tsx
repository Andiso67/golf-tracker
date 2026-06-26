'use client';

import { Suspense, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, BarChart3, Flag, LogOut, Trash2 } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import ErrorBoundary from '@/components/ErrorBoundary';
import { useStore } from '@/store/useStore';
import { useTranslation } from '@/i18n/useTranslation';
import { isTeamMode, playerFullName } from '@/types';
import { mediumTap, heavyTap } from '@/lib/haptics';
import { useRfegHandicapSync } from '@/hooks/useRfegHandicapSync';

function HomeContent() {
  const player = useStore((s) => s.player);
  const rounds = useStore((s) => s.rounds);
  const activeRoundId = useStore((s) => s.activeRoundId);
  const getRoundStats = useStore((s) => s.getRoundStats);
  const logout = useStore((s) => s.logout);
  const auth = useStore((s) => s.auth);
  const deleteRound = useStore((s) => s.deleteRound);
  const { t } = useTranslation();
  const router = useRouter();
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const syncStatus = useRfegHandicapSync(player);

  const activeRound = rounds.find(
    (r) => r.id === activeRoundId && !r.completed
  );
  const completedRounds = rounds.filter((r) => r.completed);
  const recentRounds = completedRounds.slice(-5).reverse();

  const latestStats = activeRoundId ? getRoundStats(activeRoundId) : null;
  const latestPlayerStats = latestStats?.playerStats?.[0];

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col px-4 pt-[calc(env(safe-area-inset-top,0px)+1.5rem)]">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex items-start justify-between"
      >
        <div className="flex items-center gap-3">
          <img src="/icons/icon.svg" alt="18Stats" className="h-10 w-10" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
            {player
              ? t('home.greeting', { name: playerFullName(player) })
              : t('home.appTitle')}
          </h1>
          <p className="text-sm text-zinc-500">
            {t('home.tagline')}
            </p>
          </div>
          {auth.isLoggedIn && (
            <button
              onClick={async () => {
                await logout();
                router.push('/login');
              }}
              className="flex items-center gap-1 rounded-lg border border-zinc-200 px-2.5 py-1.5 text-xs font-medium text-zinc-500 transition-colors hover:bg-rose-50 hover:text-rose-600 dark:border-zinc-700 dark:hover:bg-rose-950/30"
              title={t('auth.logout')}
            >
              <LogOut size={14} />
              {t('auth.logout')}
            </button>
          )}
        </div>
      </motion.div>

      {syncStatus === 'checking' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mb-3 overflow-hidden"
        >
          <div className="flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-700 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-300">
            <div className="h-3 w-3 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
            {t('home.handicapChecking')}
          </div>
        </motion.div>
      )}

      {syncStatus === 'updated' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-3 overflow-hidden"
        >
          <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300">
            {t('home.handicapUpdated', { handicap: player?.handicap ?? '' })}
          </div>
        </motion.div>
      )}

      {syncStatus === 'error' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mb-3 overflow-hidden"
        >
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
            {t('home.handicapSyncError')}
          </div>
        </motion.div>
      )}

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
              <span className="rounded-full bg-emerald-200 px-2 py-0.5 text-[10px] font-medium text-emerald-800 dark:bg-emerald-800 dark:text-emerald-200">
                {activeRound.players.length > 1
                  ? `${activeRound.players.length} ${t('home.players')}`
                  : activeRound.players[0]?.playerName}
              </span>
            </div>
            <p className="text-lg font-bold">{activeRound.courseName}</p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {t('home.holesPlayed', {
                played: activeRound.players[0]?.holes.filter((h) => h.score > 0).length || 0,
                total: activeRound.totalHoles,
              })}
              {latestPlayerStats && (
                <span className="ml-2">
                  {activeRound.gameMode === 'stableford'
                    ? `${latestPlayerStats.stablefordTotal} pts`
                    : `${latestPlayerStats.scoreToPar > 0 ? '+' : ''}${latestPlayerStats.scoreToPar}`
                  }
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
              const ps = stats?.playerStats?.[0];
              const isDeleting = deleteConfirmId === round.id;
              return (
                <div
                  key={round.id}
                  className="flex items-center gap-2"
                >
                  <Link
                    href={`/round/${round.id}`}
                    className="flex flex-1 items-center justify-between rounded-xl border border-zinc-200 bg-white p-3 transition-all active:scale-[0.98] dark:border-zinc-800 dark:bg-zinc-900"
                  >
                    <div>
                      <p className="text-sm font-bold">{round.courseName}</p>
                      <p className="text-xs text-zinc-400">
                        {new Date(round.date).toLocaleDateString()} ·{' '}
                        {round.totalHoles} {t('home.holes')}
                        {round.gameMode === 'stableford' && (
                          <span className="ml-1 rounded bg-emerald-100 px-1 py-0.5 text-[9px] font-medium text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
                            S
                          </span>
                        )}
                      </p>
                    </div>
                    {ps && (
                      <div className="text-right">
                        {round.gameMode === 'stableford' ? (
                          <>
                            <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                              {ps.stablefordTotal}
                            </p>
                            <p className="text-xs text-zinc-400">
                              {t('scorecard.points')} · {ps.totalScore} {t('scorecard.score')}
                            </p>
                          </>
                        ) : (
                          <>
                            <p
                              className={`text-lg font-bold ${
                                ps.scoreToPar <= 0
                                  ? 'text-emerald-600 dark:text-emerald-400'
                                  : 'text-rose-600 dark:text-rose-400'
                              }`}
                            >
                              {ps.scoreToPar > 0 ? '+' : ''}
                              {ps.scoreToPar}
                            </p>
                            <p className="text-xs text-zinc-400">
                              {ps.totalScore}
                            </p>
                          </>
                        )}
                      </div>
                    )}
                  </Link>
                  <motion.button
                    onClick={() => {
                      if (isDeleting) {
                        heavyTap()
                        deleteRound(round.id)
                        setDeleteConfirmId(null)
                      } else {
                        mediumTap()
                        setDeleteConfirmId(round.id)
                      }
                    }}
                    onBlur={() => setDeleteConfirmId(null)}
                    animate={isDeleting ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 0.3 }}
                    className={`flex shrink-0 items-center justify-center rounded-xl p-3 transition-all ${
                      isDeleting
                        ? 'bg-rose-500 text-white shadow-sm'
                        : 'text-zinc-300 hover:text-rose-400 dark:text-zinc-600'
                    }`}
                    title={isDeleting ? t('round.confirmDelete') : t('round.delete')}
                  >
                    {isDeleting ? (
                      <span className="whitespace-nowrap text-xs font-bold">{t('round.confirmDelete')}</span>
                    ) : (
                      <Trash2 size={18} />
                    )}
                  </motion.button>
                </div>
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

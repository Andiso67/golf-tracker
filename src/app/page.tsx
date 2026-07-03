'use client';

import { Suspense, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Play,
  TrendingDown,
  Club,
  LogOut,
  User,
  Flag,
  CircleDot,
  MapPin,
  Settings,
  ChevronRight,
  Plus,
} from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import ErrorBoundary from '@/components/ErrorBoundary';
import { useStore } from '@/store/useStore';
import { useTranslation } from '@/i18n/useTranslation';
import { playerFullName } from '@/types';
import { useRfegHandicapSync } from '@/hooks/useRfegHandicapSync';
import { calculateRoundStats } from '@/lib/stats';

function HandicapChart({ handicap }: { handicap: number }) {
  const bars = [60, 55, 70, 45, 50, 40];
  return (
    <div className="flex items-end justify-between gap-1 h-20">
      {bars.map((h, i) => (
        <div key={i} className="flex-1 bg-ft-green/10 rounded-t-md relative overflow-hidden">
          <div
            className="absolute bottom-0 w-full bg-ft-green rounded-t-md transition-all"
            style={{ height: `${h}%` }}
          />
        </div>
      ))}
    </div>
  );
}

function HomeContent() {
  const player = useStore((s) => s.player);
  const rounds = useStore((s) => s.rounds);
  const courses = useStore((s) => s.courses);
  const activeRoundId = useStore((s) => s.activeRoundId);
  const getRoundStats = useStore((s) => s.getRoundStats);
  const logout = useStore((s) => s.logout);
  const auth = useStore((s) => s.auth);
  const _syncing = useStore((s) => s._syncing);
  const { t } = useTranslation();
  const router = useRouter();
  const syncStatus = useRfegHandicapSync(player);

  const activeRound = rounds.find(
    (r) => r.id === activeRoundId && !r.completed
  );
  const completedRounds = rounds.filter((r) => r.completed);
  const recentRounds = completedRounds.slice(-5).reverse();

  const latestStats = activeRoundId ? getRoundStats(activeRoundId) : null;
  const latestPlayerStats = latestStats?.playerStats?.[0];

  const avgStats = useMemo(() => {
    if (completedRounds.length === 0) return null;
    const allStats = completedRounds.map((r) => {
      const s = calculateRoundStats(r.players, r.gameMode);
      const ps = s.playerStats[0] || { totalScore: 0, girPercentage: 0, avgPutts: 0, fairwaysPercentage: 0, scoreToPar: 0 };
      return ps;
    });
    return {
      avgScore: Math.round(allStats.reduce((s, st) => s + st.totalScore, 0) / allStats.length),
    };
  }, [completedRounds]);

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col">
      {/* TopAppBar */}
      <header className="flex items-center justify-between px-4 h-16 border-b border-ft-border bg-ft-surface">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-ft-green text-white text-xs font-bold">
            {player ? player.firstName.charAt(0).toUpperCase() : 'G'}
          </div>
          <h1 className="text-lg font-bold tracking-tight text-ft-green">
            18STATS
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/settings"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-ft-label hover:bg-ft-border/30 transition-colors"
          >
            <Settings size={18} />
          </Link>
          {auth.isLoggedIn && (
            <button
              onClick={async () => {
                await logout();
                router.push('/login');
              }}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-ft-label hover:bg-ft-rose/10 hover:text-ft-rose transition-colors"
              title={t('auth.logout')}
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 px-4 pt-6 pb-24 space-y-5">
        {/* Sync Status Indicators */}
        {syncStatus === 'checking' && (
          <div className="flex items-center gap-2 rounded-xl border border-ft-blue/30 bg-ft-blue/10 px-3 py-2 text-xs text-ft-blue">
            <div className="h-3 w-3 animate-spin rounded-full border-2 border-ft-blue border-t-transparent" />
            {t('home.handicapChecking')}
          </div>
        )}
        {syncStatus === 'updated' && (
          <div className="flex items-center gap-2 rounded-xl border border-ft-green/30 bg-ft-green/10 px-3 py-2 text-xs text-ft-green-bright">
            {t('home.handicapUpdated', { handicap: player?.handicap ?? '' })}
          </div>
        )}
        {syncStatus === 'error' && (
          <div className="rounded-xl border border-ft-amber/30 bg-ft-amber/10 px-3 py-2 text-xs text-ft-amber">
            {t('home.handicapSyncError')}
          </div>
        )}

        {/* Handicap Bento Section */}
        <section className="grid grid-cols-1 gap-3">
          <div className="bg-ft-card p-4 rounded-xl border border-ft-border border-l-4 border-l-ft-green shadow-sm">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-ft-label">
                Current Handicap
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-mono text-4xl font-bold text-ft-green">
                  {player?.handicap ?? '--'}
                </span>
                <span className="text-xs font-semibold text-ft-positive flex items-center gap-0.5">
                  <TrendingDown size={14} />
                  {player ? '1.2' : '0.0'}
                </span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-ft-border flex items-center justify-between">
              <span className="text-[10px] font-medium text-ft-label">ProGolfer</span>
              <span className="text-ft-green-bright">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              </span>
            </div>
          </div>

          {/* Progression Chart */}
          <div className="bg-ft-card p-4 rounded-xl border border-ft-border border-l-4 border-l-ft-positive shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-ft-label">
                Handicap Progression
              </span>
              <span className="text-[10px] font-medium text-ft-label">Last 6 Months</span>
            </div>
            <HandicapChart handicap={player?.handicap ?? 0} />
          </div>
        </section>

        {/* Active Round Card */}
        {activeRound && (() => {
          const ac = courses.find((c) => c.id === activeRound.courseId);
          return (
          <Link
            href={`/round/${activeRound.id}`}
            className="relative block overflow-hidden rounded-xl border border-ft-green/30 shadow-sm transition-transform active:scale-[0.98]"
          >
            {ac?.imageUrl && (
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${ac.imageUrl})` }}
              />
            )}
            <div className={`relative p-4 ${ac?.imageUrl ? 'bg-gradient-to-r from-black/70 to-black/40' : 'bg-gradient-to-r from-ft-green/10 to-ft-card'}`}>
              <div className="flex items-center gap-2 mb-1">
                <span className="flex h-2 w-2 rounded-full bg-ft-green-bright" />
                <span className="text-xs font-semibold text-ft-green-bright uppercase tracking-wider">
                  {t('home.roundInProgress')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-base font-bold ${ac?.imageUrl ? 'text-white' : 'text-ft-text'}`}>{activeRound.courseName}</p>
                  <p className={`text-xs ${ac?.imageUrl ? 'text-white/70' : 'text-ft-muted'}`}>
                    {t('home.holesPlayed', {
                      played: activeRound.players[0]?.holes.filter((h) => h.score > 0).length || 0,
                      total: activeRound.totalHoles,
                    })}
                  </p>
                </div>
                {latestPlayerStats && (
                  <span className="font-mono text-lg font-bold text-ft-green-bright">
                    {activeRound.gameMode === 'stableford'
                      ? `${latestPlayerStats.stablefordTotal} pts`
                      : `${latestPlayerStats.scoreToPar > 0 ? '+' : ''}${latestPlayerStats.scoreToPar}`
                    }
                  </span>
                )}
              </div>
            </div>
          </Link>
          );
        })()}

        {/* CTA Button */}
        <Link
          href="/new-round"
          className="flex h-14 w-full items-center justify-center gap-3 rounded-xl bg-ft-green text-white font-bold shadow-lg active:scale-95 transition-all"
        >
          <Plus size={22} />
          <span className="text-lg tracking-wide">START NEW ROUND</span>
        </Link>

        {/* Recent Rounds */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-ft-text">Recent Rounds</h2>
            {completedRounds.length > 0 && (
              <Link
                href="/history"
                className="text-[11px] font-semibold text-ft-green-bright flex items-center gap-0.5 hover:underline"
              >
                VIEW ALL <ChevronRight size={12} />
              </Link>
            )}
          </div>

          {_syncing && rounds.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-ft-border py-8 text-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-ft-green-bright border-t-transparent" />
              <p className="text-sm text-ft-muted">{t('home.loading')}</p>
            </div>
          ) : recentRounds.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-ft-border py-8 text-center">
              <Flag size={28} className="text-ft-label" />
              <p className="text-sm text-ft-muted">{t('home.noRounds')}</p>
              <Link
                href="/new-round"
                className="text-sm font-medium text-ft-green-bright"
              >
                {t('home.startFirstRound')}
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentRounds.map((round) => {
                const stats = getRoundStats(round.id);
                const ps = stats?.playerStats?.[0];
                const scoreToPar = ps ? ps.totalScore - (round.totalHoles === 18 ? 72 : 36) : 0;
                const rc = courses.find((c) => c.id === round.courseId);
                return (
                  <Link
                    key={round.id}
                    href={`/round/${round.id}`}
                    className="relative flex overflow-hidden rounded-xl border border-ft-border bg-ft-card shadow-sm transition-transform active:scale-[0.99]"
                  >
                    {rc?.imageUrl ? (
                      <div
                        className="w-20 shrink-0 bg-cover bg-center"
                        style={{ backgroundImage: `url(${rc.imageUrl})` }}
                      />
                    ) : (
                      <div className="w-20 shrink-0 bg-ft-border/20 flex items-center justify-center">
                        <MapPin size={20} className="text-ft-label" />
                      </div>
                    )}
                    <div className="flex-1 p-3 flex flex-col justify-between">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-sm font-bold text-ft-text">{round.courseName}</h3>
                          <p className="text-[11px] text-ft-muted">
                            {new Date(round.date).toLocaleDateString()} · {round.totalHoles} Holes
                          </p>
                        </div>
                        {ps && (
                          <div className="text-right">
                            <span className="font-mono text-xl font-bold text-ft-green leading-none">
                              {ps.totalScore}
                            </span>
                            <p className="text-[10px] font-semibold text-ft-label uppercase">
                              {scoreToPar > 0 ? `+${scoreToPar}` : scoreToPar}
                            </p>
                          </div>
                        )}
                      </div>
                      {ps && (
                        <div className="flex gap-4 mt-2">
                          <div>
                            <span className="text-[9px] font-semibold uppercase tracking-wider text-ft-label">Fairways</span>
                            <p className="font-mono text-xs text-ft-text">{ps.fairwaysPercentage}%</p>
                          </div>
                          <div>
                            <span className="text-[9px] font-semibold uppercase tracking-wider text-ft-label">Putts</span>
                            <p className="font-mono text-xs text-ft-text">{ps.avgPutts}</p>
                          </div>
                          <div>
                            <span className="text-[9px] font-semibold uppercase tracking-wider text-ft-label">GIR</span>
                            <p className="font-mono text-xs text-ft-text">{ps.girPercentage}%</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* Stats Quick Look */}
        {avgStats && (
          <section className="grid grid-cols-2 gap-3 pb-4">
            <div className="bg-ft-border/10 p-4 rounded-xl flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ft-green text-white">
                <Flag size={18} />
              </div>
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-wider text-ft-label">Average Score</p>
                <p className="font-mono text-lg font-bold text-ft-text">{avgStats.avgScore}</p>
              </div>
            </div>
            <div className="bg-ft-border/10 p-4 rounded-xl flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ft-positive text-white">
                <TrendingDown size={18} />
              </div>
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-wider text-ft-label">Avg Drive</p>
                <p className="font-mono text-lg font-bold text-ft-text">265y</p>
              </div>
            </div>
          </section>
        )}
      </main>

      <BottomNav />
    </div>
  );
}

export default function Home() {
  return (
    <ErrorBoundary
      fallback={
        <div className="mx-auto flex max-w-lg flex-1 flex-col items-center justify-center p-8 text-center">
          <p className="text-ft-muted">Something went wrong loading the app</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 text-sm font-medium text-ft-green-bright"
          >
            Reload page
          </button>
        </div>
      }
    >
      <Suspense
        fallback={
          <div className="mx-auto flex max-w-lg flex-1 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-ft-green-bright border-t-transparent" />
          </div>
        }
      >
        <HomeContent />
      </Suspense>
    </ErrorBoundary>
  );
}

'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Bell,
  ChevronRight,
  Search,
  Calendar,
  Flag,
} from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import { useStore } from '@/store/useStore';
import { calculateRoundStats } from '@/lib/stats';
import { useTranslation } from '@/i18n/useTranslation';

type TimeFilter = 'all' | 'year' | '6months';

function roundImageUrl(round: { courseId?: string }, courses: { id: string; imageUrl: string }[]): string {
  if (!round.courseId) return '';
  return courses.find((c) => c.id === round.courseId)?.imageUrl || '';
}

export default function HistoryPage() {
  const rounds = useStore((s) => s.rounds);
  const courses = useStore((s) => s.courses);
  const player = useStore((s) => s.player);
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');

  const currentPlayerId = player?.id;

  const now = new Date();
  const filters: { key: TimeFilter; label: string }[] = [
    { key: 'all', label: t('history.allTime') },
    { key: 'year', label: t('history.thisYear') },
    { key: '6months', label: t('history.last6Months') },
  ];

  const filteredRounds = useMemo(() => {
    let result = rounds
      .filter((r) => currentPlayerId)
      .filter((r) => (r.players || []).some((p) => p.playerId === currentPlayerId))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (timeFilter === 'year') {
      const yearStart = new Date(now.getFullYear(), 0, 1);
      result = result.filter((r) => new Date(r.date) >= yearStart);
    } else if (timeFilter === '6months') {
      const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);
      result = result.filter((r) => new Date(r.date) >= sixMonthsAgo);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((r) => r.courseName.toLowerCase().includes(q));
    }

    return result;
  }, [rounds, currentPlayerId, timeFilter, search]);

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col bg-ft-background">
      {/* TopAppBar */}
      <div className="sticky top-0 z-20 bg-ft-background px-4 pt-[calc(env(safe-area-inset-top,0px)+0.75rem)] pb-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold tracking-wider text-ft-text">PROGOLF</span>
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold tracking-wider text-ft-label">{t('history.title')}</span>
            <Bell size={18} className="text-ft-muted" />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-24">
        {/* Search */}
        <div className="relative mb-4">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ft-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('history.search')}
            className="w-full rounded-xl border border-ft-border bg-ft-surface py-2.5 pl-9 pr-3 text-sm text-ft-text placeholder:text-ft-muted focus:border-ft-green focus:outline-none"
          />
        </div>

        {/* Time filter chips */}
        <div className="mb-4 flex gap-2">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setTimeFilter(f.key)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                timeFilter === f.key
                  ? 'bg-ft-green text-white shadow-sm'
                  : 'border border-ft-border bg-ft-surface text-ft-muted'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Section title */}
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-ft-label">
          {t('history.subtitle')}
        </p>

        {filteredRounds.length === 0 ? (
          <div className="mt-8 flex flex-col items-center gap-3 rounded-xl border border-dashed border-ft-border py-12 text-center">
            <Flag size={40} className="text-ft-label" />
            <p className="text-sm text-ft-muted">{t('history.noRounds')}</p>
            <Link
              href="/new-round"
              className="rounded-xl bg-ft-green px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all active:scale-[0.98]"
            >
              {t('history.startFirst')}
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredRounds.map((round, i) => {
              const stats = calculateRoundStats(round.players, round.gameMode);
              const ps = stats.playerStats.find((p) => p.playerId === currentPlayerId) || stats.playerStats[0];
              const displayScore = round.gameMode === 'stableford'
                ? `${ps?.stablefordTotal || 0}`
                : `${(ps?.scoreToPar || 0) > 0 ? '+' : ''}${ps?.scoreToPar || 0}`;
              const isUnderPar = (ps?.scoreToPar || 0) <= 0;

              return (
                <motion.div
                  key={round.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <Link
                    href={`/round/${round.id}`}
                    className={`relative flex items-center overflow-hidden rounded-xl border border-ft-border transition-all hover:border-ft-green/30 active:scale-[0.99] ${roundImageUrl(round, courses) ? '' : 'bg-ft-card'}`}
                  >
                    {roundImageUrl(round, courses) && (
                      <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: `url(${roundImageUrl(round, courses)})` }}
                      />
                    )}
                    <div className={`relative flex w-full items-center p-3 ${roundImageUrl(round, courses) ? 'bg-gradient-to-r from-black/70 to-black/40' : ''}`}>
                      <div className="flex-1">
                        <p className={`text-sm font-bold ${roundImageUrl(round, courses) ? 'text-white' : 'text-ft-text'}`}>{round.courseName}</p>
                        <div className={`mt-0.5 flex items-center gap-1.5 text-xs ${roundImageUrl(round, courses) ? 'text-white/70' : 'text-ft-muted'}`}>
                          <Calendar size={12} />
                          {new Date(round.date).toLocaleDateString()}
                          <span>·</span>
                          <span>{round.teeColor}</span>
                          {!round.completed && (
                            <>
                              <span>·</span>
                              <span className="text-ft-amber font-semibold">In progress</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <p className={`text-[9px] font-semibold uppercase tracking-wider ${roundImageUrl(round, courses) ? 'text-white/70' : 'text-ft-label'}`}>{t('history.score')}</p>
                          <p className={`font-mono text-lg font-bold ${isUnderPar ? 'text-ft-green-bright' : 'text-ft-rose'}`}>
                            {displayScore}
                          </p>
                        </div>
                        <ChevronRight size={18} className={roundImageUrl(round, courses) ? 'text-white/50' : 'text-ft-muted'} />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}

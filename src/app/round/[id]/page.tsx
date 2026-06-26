'use client';

import { Suspense, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Flag,
} from 'lucide-react';
import Link from 'next/link';
import { useStore } from '@/store/useStore';
import HoleInput from '@/components/HoleInput';
import ScorecardTable from '@/components/ScorecardTable';
import StatSummary from '@/components/StatSummary';
import BottomNav from '@/components/BottomNav';
import ErrorBoundary from '@/components/ErrorBoundary';
import { useTranslation } from '@/i18n/useTranslation';
import { HoleData } from '@/types';

function RoundContent({ roundId }: { roundId: string }) {
  const router = useRouter();
  const round = useStore((s) => s.rounds.find((r) => r.id === roundId));
  const updateHole = useStore((s) => s.updateHole);
  const completeRound = useStore((s) => s.completeRound);
  const getRoundStats = useStore((s) => s.getRoundStats);
  const { t } = useTranslation();

  const [activeHoleIndex, setActiveHoleIndex] = useState(() => {
    if (!round) return 0;
    const firstUnplayed = round.holes.findIndex((h) => h.score === 0);
    return firstUnplayed >= 0 ? firstUnplayed : round.holes.length - 1;
  });
  const [showStats, setShowStats] = useState(true);

  if (!round) {
    return (
      <div className="mx-auto flex max-w-lg flex-1 flex-col items-center justify-center p-4">
        <p className="text-zinc-500">{t('round.notFound')}</p>
        <Link href="/" className="mt-2 text-emerald-600">
          {t('round.goHome')}
        </Link>
      </div>
    );
  }

  const currentHole = round.holes[activeHoleIndex];
  const stats = getRoundStats(roundId);
  const playedHoles = round.holes.filter((h) => h.score > 0).length;
  const allPlayed = playedHoles === round.totalHoles;

  const handleSaveHole = (data: Record<string, unknown>) => {
    updateHole(roundId, currentHole.number, data as Partial<HoleData>);
    fetch(`/api/rounds/${roundId}/hole/${currentHole.number}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).catch(() => {});
    if (activeHoleIndex < round.holes.length - 1) {
      setActiveHoleIndex(activeHoleIndex + 1);
    }
  };

  const handleComplete = () => {
    completeRound(roundId);
    fetch(`/api/rounds/${roundId}/complete`, { method: 'POST' }).catch(() => {});
    router.push('/');
  };

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col px-4 pt-6">
      <div className="mb-4 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-zinc-400"
        >
          <ArrowLeft size={16} />
          {t('round.exit')}
        </Link>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium dark:bg-zinc-800">
            {playedHoles}/{round.totalHoles}
          </span>
          {stats && (
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                stats.scoreToPar <= 0
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300'
                  : 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300'
              }`}
            >
              {stats.scoreToPar > 0 ? '+' : ''}
              {stats.scoreToPar}
            </span>
          )}
        </div>
      </div>

      <div className="mb-3">
        <h1 className="text-lg font-bold">{round.courseName}</h1>
        <p className="text-xs text-zinc-400">
          {round.teeColor} · {new Date(round.date).toLocaleDateString()}
        </p>
      </div>

      <ScorecardTable holes={round.holes} compact />

      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flag size={16} className="text-emerald-500" />
          <span className="text-sm font-medium">
            {t('round.holeLabel', {
              number: currentHole.number,
              par: currentHole.par,
            })}
          </span>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() =>
              setActiveHoleIndex(Math.max(0, activeHoleIndex - 1))
            }
            disabled={activeHoleIndex === 0}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500 disabled:opacity-30 dark:bg-zinc-800"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() =>
              setActiveHoleIndex(
                Math.min(round.holes.length - 1, activeHoleIndex + 1)
              )
            }
            disabled={activeHoleIndex === round.holes.length - 1}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500 disabled:opacity-30 dark:bg-zinc-800"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentHole.number}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="mt-1"
        >
          <HoleInput hole={currentHole} onSave={handleSaveHole} />
        </motion.div>
      </AnimatePresence>

      <button
        onClick={() => setShowStats(!showStats)}
        className="mt-3 text-sm font-medium text-emerald-600 dark:text-emerald-400"
      >
        {showStats ? t('round.hideStats') : t('round.showStats')}
      </button>

      <AnimatePresence>
        {showStats && stats && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-2 overflow-hidden"
          >
            <StatSummary stats={stats} />
          </motion.div>
        )}
      </AnimatePresence>

      {allPlayed && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4"
        >
          <button
            onClick={handleComplete}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-4 text-lg font-bold text-white shadow-sm transition-all active:scale-[0.98]"
          >
            <CheckCircle2 size={22} />
            {t('round.completeRound')}
          </button>
        </motion.div>
      )}
    </div>
  );
}

export default function RoundPage() {
  const params = useParams<{ id: string }>();
  return (
    <>
      <ErrorBoundary
        fallback={
          <div className="mx-auto flex max-w-lg flex-1 flex-col items-center justify-center p-8 text-center">
            <p className="text-zinc-500">Round not found</p>
            <Link
              href="/"
              className="mt-2 text-sm font-medium text-emerald-600"
            >
              Go home
            </Link>
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
          <RoundContent roundId={params.id} />
        </Suspense>
      </ErrorBoundary>
      <BottomNav />
    </>
  );
}

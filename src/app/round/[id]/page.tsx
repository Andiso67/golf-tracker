'use client';

import { Suspense, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Flag,
  Users,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';
import { useStore } from '@/store/useStore';
import HoleInput from '@/components/HoleInput';
import ScorecardTable from '@/components/ScorecardTable';
import StatSummary from '@/components/StatSummary';
import BottomNav from '@/components/BottomNav';
import ErrorBoundary from '@/components/ErrorBoundary';
import { useTranslation } from '@/i18n/useTranslation';
import { HoleData, isTeamMode } from '@/types';
import { heavyTap, mediumTap } from '@/lib/haptics';

const MODE_KEYS: Record<string, string> = {
  'stroke-play': 'round.strokePlay',
  'medal-play': 'round.medalPlay',
  stableford: 'round.stableford',
  'max-score': 'round.maxScore',
  'match-play': 'round.matchPlay',
  foursome: 'round.foursome',
  fourball: 'round.fourball',
  greensome: 'round.greensome',
  'greensome-chapman': 'round.chapman',
  scramble: 'round.scramble',
  shamble: 'round.shamble',
  copacanada: 'round.copaCanada',
  skins: 'round.skins',
};

function RoundContent({ roundId }: { roundId: string }) {
  const router = useRouter();
  const round = useStore((s) => s.rounds.find((r) => r.id === roundId));
  const updateHole = useStore((s) => s.updateHole);
  const completeRound = useStore((s) => s.completeRound);
  const updateRoundDate = useStore((s) => s.updateRoundDate);
  const updateRoundCourse = useStore((s) => s.updateRoundCourse);
  const deleteRound = useStore((s) => s.deleteRound);
  const getRoundStats = useStore((s) => s.getRoundStats);
  const { t } = useTranslation();

  const [activePlayerIndex, setActivePlayerIndex] = useState(0);
  const [activeHoleIndex, setActiveHoleIndex] = useState(() => {
    if (!round) return 0;
    const holes = round.players[0]?.holes || [];
    const firstUnplayed = holes.findIndex((h) => h.score === 0);
    return firstUnplayed >= 0 ? firstUnplayed : holes.length - 1;
  });
  const [showStats, setShowStats] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [editingDate, setEditingDate] = useState(false);
  const [dateInput, setDateInput] = useState('');
  const [editingCourse, setEditingCourse] = useState(false);
  const [courseInput, setCourseInput] = useState('');

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

  const currentPlayer = round.players[activePlayerIndex];
  const currentHole = currentPlayer?.holes[activeHoleIndex];
  const stats = getRoundStats(roundId);
  const primaryPlayerStats = stats?.playerStats?.[activePlayerIndex];
  const playedHoles = currentPlayer?.holes.filter((h) => h.score > 0).length || 0;
  const allPlayed = playedHoles === round.totalHoles;
  const modeKey = MODE_KEYS[round.gameMode] || 'round.strokePlay';
  const teamMode = isTeamMode(round.gameMode);

  const handleSaveHole = (data: Record<string, unknown>) => {
    if (!currentHole) return;
    updateHole(roundId, currentHole.number, data as Partial<HoleData>, activePlayerIndex);
    if (!teamMode) {
      fetch(`/api/rounds/${roundId}/hole/${currentHole.number}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).catch(() => {});
    }
    if (activePlayerIndex < round.players.length - 1) {
      setActivePlayerIndex(activePlayerIndex + 1);
    } else {
      if (activeHoleIndex < (currentPlayer?.holes.length || 1) - 1) {
        setActiveHoleIndex(activeHoleIndex + 1);
      }
      setActivePlayerIndex(0);
    }
  };

  const handleComplete = () => {
    heavyTap();
    completeRound(roundId);
    fetch(`/api/rounds/${roundId}/complete`, { method: 'POST' }).catch(() => {});
    router.push('/');
  };

  const handleDelete = () => {
    heavyTap();
    deleteRound(roundId);
    router.push('/');
  };

  const handleDateClick = () => {
    const d = round.date || new Date().toISOString();
    setDateInput(d.slice(0, 10));
    setEditingDate(true);
  };

  const handleDateSave = () => {
    if (dateInput) {
      updateRoundDate(roundId, new Date(dateInput + 'T12:00:00').toISOString());
    }
    setEditingDate(false);
  };

  const handleDateKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleDateSave();
    if (e.key === 'Escape') setEditingDate(false);
  };

  const handleCourseClick = () => {
    setCourseInput(round.courseName);
    setEditingCourse(true);
  };

  const handleCourseSave = () => {
    if (courseInput.trim()) {
      updateRoundCourse(roundId, courseInput.trim());
    }
    setEditingCourse(false);
  };

  const handleCourseKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleCourseSave();
    if (e.key === 'Escape') setEditingCourse(false);
  };

  const displayScore = primaryPlayerStats
    ? round.gameMode === 'stableford'
      ? `${primaryPlayerStats.stablefordTotal}`
      : `${primaryPlayerStats.scoreToPar > 0 ? '+' : ''}${primaryPlayerStats.scoreToPar}`
    : '';

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col px-4 pt-[calc(env(safe-area-inset-top,0px)+1.5rem)]">
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
          {primaryPlayerStats && (
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                primaryPlayerStats.scoreToPar <= 0
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300'
                  : 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300'
              }`}
            >
              {displayScore}
            </span>
          )}
        </div>
      </div>

      <div className="mb-3">
        {editingCourse ? (
          <div className="mb-1 flex items-center gap-1">
            <input
              type="text"
              value={courseInput}
              onChange={(e) => setCourseInput(e.target.value)}
              onKeyDown={handleCourseKeyDown}
              className="flex-1 rounded-lg border border-zinc-300 bg-white px-2 py-1 text-lg font-bold text-zinc-900 focus:border-emerald-400 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
              autoFocus
            />
            <button
              onClick={handleCourseSave}
              className="rounded-lg bg-emerald-500 px-3 py-1 text-xs font-bold text-white"
            >
              OK
            </button>
          </div>
        ) : (
          <button
            onClick={handleCourseClick}
            className="mb-1 text-lg font-bold hover:text-emerald-600"
          >
            {round.courseName}
          </button>
        )}
        <div className="flex items-center gap-1.5 text-xs text-zinc-400">
          <span>{round.teeColor}</span>
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
            {t(modeKey)}
          </span>
          <span className="opacity-50">·</span>
          {editingDate ? (
            <div className="flex items-center gap-1">
              <input
                type="date"
                value={dateInput}
                onChange={(e) => setDateInput(e.target.value)}
                onKeyDown={handleDateKeyDown}
                className="rounded border border-zinc-300 bg-white px-1.5 py-0.5 text-[11px] text-zinc-700 focus:border-emerald-400 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                autoFocus
              />
              <button
                onClick={handleDateSave}
                className="rounded bg-emerald-500 px-1.5 py-0.5 text-[10px] font-bold text-white"
              >
                OK
              </button>
            </div>
          ) : (
            <button
              onClick={handleDateClick}
              className="inline-flex items-center gap-1 hover:text-emerald-600"
            >
              <Calendar size={12} />
              {new Date(round.date || new Date()).toLocaleDateString()}
            </button>
          )}
        </div>
      </div>

      {round.players.length > 1 && (
        <div className="mb-3 flex items-center gap-2 overflow-x-auto">
          <Users size={14} className="shrink-0 text-zinc-400" />
          {round.players.map((p, i) => (
            <button
              key={p.playerId}
              onClick={() => setActivePlayerIndex(i)}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                i === activePlayerIndex
                  ? 'bg-emerald-500 text-white'
                  : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
              }`}
            >
              {p.playerName}
            </button>
          ))}
        </div>
      )}

      <ScorecardTable
        holes={currentPlayer?.holes || []}
        compact
        gameMode={round.gameMode}
      />

      {currentHole && (
        <>
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flag size={16} className="text-emerald-500" />
              <span className="text-sm font-medium">
                {t('round.holeLabel', {
                  number: currentHole.number,
                  par: currentHole.par,
                })}
              </span>
              {round.players.length > 1 && (
                <span className="text-xs text-zinc-400">
                  · {currentPlayer?.playerName}
                </span>
              )}
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
                    Math.min((currentPlayer?.holes.length || 1) - 1, activeHoleIndex + 1)
                  )
                }
                disabled={activeHoleIndex === (currentPlayer?.holes.length || 1) - 1}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500 disabled:opacity-30 dark:bg-zinc-800"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={`${currentPlayer?.playerId}-${currentHole.number}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="mt-1"
            >
              <HoleInput hole={currentHole} onSave={handleSaveHole} />
            </motion.div>
          </AnimatePresence>
        </>
      )}

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
            <StatSummary stats={stats} gameMode={round.gameMode} activePlayerIndex={activePlayerIndex} />
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

      <div className="mt-3">
        {deleteConfirm ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDeleteConfirm(false)}
              className="flex-1 rounded-xl border border-zinc-200 py-3 text-sm font-medium text-zinc-600 transition-all active:scale-[0.98] dark:border-zinc-700 dark:text-zinc-400"
            >
              {t('players.cancel')}
            </button>
            <button
              onClick={handleDelete}
              className="flex-1 rounded-xl bg-rose-500 py-3 text-sm font-bold text-white shadow-sm transition-all active:scale-[0.98]"
            >
              {t('round.confirmDelete')}
            </button>
          </div>
        ) : (
          <button
            onClick={() => { mediumTap(); setDeleteConfirm(true) }}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 py-3 text-sm font-medium text-rose-500 transition-all active:scale-[0.98] dark:border-rose-900"
          >
            <Trash2 size={18} />
            {t('round.delete')}
          </button>
        )}
      </div>
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

'use client';

import { Suspense, useState, useCallback, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Bell,
  CheckCircle2,
  Minus,
  Plus,
  Users,
  Trash2,
  TrendingUp,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useStore } from '@/store/useStore';
import ScorecardTable from '@/components/ScorecardTable';
import StatSummary from '@/components/StatSummary';
import BottomNav from '@/components/BottomNav';
import ErrorBoundary from '@/components/ErrorBoundary';
import { useTranslation } from '@/i18n/useTranslation';
import { HoleData, isTeamMode } from '@/types';
import { heavyTap, mediumTap } from '@/lib/haptics';

type FairwayOption = 'Left' | 'Center' | 'Right' | 'Miss' | null;

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
  const [saved, setSaved] = useState(false);

  if (!round) {
    return (
      <div className="mx-auto flex max-w-lg flex-1 flex-col items-center justify-center p-4">
        <p className="text-ft-muted">{t('round.notFound')}</p>
        <Link href="/" className="mt-2 text-ft-green-bright">
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

  const displayScore = primaryPlayerStats
    ? round.gameMode === 'stableford'
      ? `${primaryPlayerStats.stablefordTotal}`
      : `${primaryPlayerStats.scoreToPar > 0 ? '+' : ''}${primaryPlayerStats.scoreToPar}`
    : '';

  const [strokes, setStrokes] = useState(0);
  const [putts, setPutts] = useState(0);
  const [fairwayOption, setFairwayOption] = useState<FairwayOption>(null);

  const handleHoleChange = useCallback((hole: HoleData) => {
    setStrokes(hole.score > 0 ? hole.score : hole.par);
    setPutts(hole.putts || 0);
    if (hole.fairwayHit === 'Yes') setFairwayOption('Center');
    else if (hole.fairwayHit === 'Left' || hole.fairwayHit === 'Right') setFairwayOption(hole.fairwayHit);
    else if (hole.fairwayHit === 'No') setFairwayOption('Miss');
    else setFairwayOption(null);
  }, []);

  useEffect(() => {
    if (currentHole) {
      handleHoleChange(currentHole);
    }
  }, [currentHole?.number, currentPlayer?.playerId]);

  const handleSaveHole = () => {
    if (!currentHole) return;
    const mappedFairway: HoleData['fairwayHit'] =
      fairwayOption === 'Center' ? 'Yes' : fairwayOption === 'Left' ? 'Left' : fairwayOption === 'Right' ? 'Right' : fairwayOption === 'Miss' ? 'No' : null;
    const data: Partial<HoleData> = {
      score: strokes,
      putts,
      fairwayHit: mappedFairway,
      gir: strokes > 0 && strokes <= currentHole.par && putts <= 2,
    };
    updateHole(roundId, currentHole.number, data, activePlayerIndex);
    if (!teamMode) {
      fetch(`/api/rounds/${roundId}/hole/${currentHole.number}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).catch(() => {});
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const handleSaveAndNext = () => {
    handleSaveHole();
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

  const prevHole = () => {
    if (activeHoleIndex > 0) setActiveHoleIndex(activeHoleIndex - 1);
  };

  const nextHole = () => {
    if (activeHoleIndex < (currentPlayer?.holes.length || 1) - 1) setActiveHoleIndex(activeHoleIndex + 1);
  };

  const scoreColor =
    primaryPlayerStats && primaryPlayerStats.scoreToPar <= 0
      ? 'text-ft-green-bright'
      : 'text-ft-rose';

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col bg-ft-background">
      {/* TopAppBar */}
      <div className="sticky top-0 z-20 bg-ft-background px-4 pt-[calc(env(safe-area-inset-top,0px)+0.75rem)] pb-2">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-sm font-bold tracking-wider text-ft-text">PROGOLF</span>
            <span className="hidden text-[10px] uppercase tracking-wider text-ft-label sm:inline">{t('scorecard.activeScorecard')}</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold tracking-wider text-ft-label">
              {t('scorecard.holeTitle', { number: currentHole?.number || 1 })}
            </span>
            {displayScore && (
              <span className={`font-mono text-base font-bold ${scoreColor}`}>
                {displayScore}
              </span>
            )}
            <Bell size={18} className="text-ft-muted" />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-24">
        {/* Course info row */}
        <div className="mb-2 flex items-center gap-1.5 text-[11px] text-ft-muted">
          {editingCourse ? (
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={courseInput}
                onChange={(e) => setCourseInput(e.target.value)}
                onKeyDown={handleCourseKeyDown}
                className="w-24 rounded border border-ft-border bg-ft-surface px-1.5 py-0.5 text-[11px] text-ft-text focus:border-ft-green focus:outline-none"
                autoFocus
              />
              <button onClick={handleCourseSave} className="rounded bg-ft-green px-1.5 py-0.5 text-[10px] font-bold text-white">OK</button>
            </div>
          ) : (
            <button onClick={handleCourseClick} className="font-medium text-ft-text hover:text-ft-green-bright">
              {round.courseName}
            </button>
          )}
          <span>·</span>
          <span>{round.teeColor}</span>
          <span>·</span>
          <span className="rounded border border-ft-border bg-ft-surface px-1.5 py-0.5 text-[10px] font-medium text-ft-label">
            {t(modeKey)}
          </span>
          <span>·</span>
          {editingDate ? (
            <div className="flex items-center gap-1">
              <input
                type="date"
                value={dateInput}
                onChange={(e) => setDateInput(e.target.value)}
                onKeyDown={handleDateKeyDown}
                className="w-24 rounded border border-ft-border bg-ft-surface px-1.5 py-0.5 text-[11px] text-ft-text focus:border-ft-green focus:outline-none"
                autoFocus
              />
              <button onClick={handleDateSave} className="rounded bg-ft-green px-1.5 py-0.5 text-[10px] font-bold text-white">OK</button>
            </div>
          ) : (
            <button onClick={handleDateClick} className="hover:text-ft-green-bright">
              {new Date(round.date || new Date()).toLocaleDateString()}
            </button>
          )}
        </div>

        {/* Multi-player tabs */}
        {round.players.length > 1 && (
          <div className="mb-3 flex items-center gap-2 overflow-x-auto">
            <Users size={14} className="shrink-0 text-ft-label" />
            {round.players.map((p, i) => (
              <button
                key={p.playerId}
                onClick={() => setActivePlayerIndex(i)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                  i === activePlayerIndex
                    ? 'bg-ft-green text-white'
                    : 'border border-ft-border bg-ft-surface text-ft-muted'
                }`}
              >
                {p.playerName}
              </button>
            ))}
          </div>
        )}

        {/* ScorecardTable */}
        <ScorecardTable
          holes={currentPlayer?.holes || []}
          compact
          gameMode={round.gameMode}
        />

        {/* Hole detail */}
        {currentHole && (
          <>
            <div className="mt-4 rounded-xl border border-ft-border bg-ft-card p-4">
              <p className="mb-3 text-sm font-semibold text-ft-text">
                {t('scorecard.holeContext', { course: round.courseName, number: currentHole.number })}
              </p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-ft-label">PAR</span>
                  <span className="font-mono text-2xl font-bold text-ft-text">{currentHole.par}</span>
                </div>
                {currentHole.handicap != null && (
                  <div className="flex items-center gap-1.5">
                    <TrendingUp size={16} className="text-ft-muted" />
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-ft-label">
                      {t('scorecard.hcp', { index: currentHole.handicap })}
                    </span>
                  </div>
                )}
                <div className="ml-auto">
                  <span className="rounded-md border border-ft-border bg-ft-surface px-2 py-0.5 text-[10px] font-medium text-ft-label">
                    {playedHoles}/{round.totalHoles} {t('home.holes')}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-3 rounded-xl border border-ft-border bg-ft-card p-4">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-ft-label">
                {t('scorecard.strokes')}
              </p>
              <div className="flex items-center justify-center gap-6">
                {round.completed ? (
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-ft-border bg-ft-surface text-ft-text opacity-50"><Minus size={22} /></span>
                ) : (
                  <button onClick={() => setStrokes(Math.max(1, strokes - 1))} className="flex h-12 w-12 items-center justify-center rounded-xl border border-ft-border bg-ft-surface text-ft-text transition-all active:scale-90"><Minus size={22} /></button>
                )}
                <span className="font-mono min-w-[3ch] text-center text-4xl font-bold text-ft-text">{strokes}</span>
                {round.completed ? (
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-ft-border bg-ft-surface text-ft-text opacity-50"><Plus size={22} /></span>
                ) : (
                  <button onClick={() => setStrokes(strokes + 1)} className="flex h-12 w-12 items-center justify-center rounded-xl border border-ft-border bg-ft-surface text-ft-text transition-all active:scale-90"><Plus size={22} /></button>
                )}
              </div>
            </div>

            <div className="mt-3 rounded-xl border border-ft-border bg-ft-card p-4">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-ft-label">{t('scorecard.putts')}</p>
              <div className="flex items-center justify-center gap-6">
                {round.completed ? (
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-ft-border bg-ft-surface text-ft-text opacity-50"><Minus size={22} /></span>
                ) : (
                  <button onClick={() => setPutts(Math.max(0, putts - 1))} className="flex h-12 w-12 items-center justify-center rounded-xl border border-ft-border bg-ft-surface text-ft-text transition-all active:scale-90"><Minus size={22} /></button>
                )}
                <span className="font-mono min-w-[3ch] text-center text-4xl font-bold text-ft-text">{putts}</span>
                {round.completed ? (
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-ft-border bg-ft-surface text-ft-text opacity-50"><Plus size={22} /></span>
                ) : (
                  <button onClick={() => setPutts(putts + 1)} className="flex h-12 w-12 items-center justify-center rounded-xl border border-ft-border bg-ft-surface text-ft-text transition-all active:scale-90"><Plus size={22} /></button>
                )}
              </div>
            </div>

            <div className="mt-3 rounded-xl border border-ft-border bg-ft-card p-4">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-ft-label">{t('scorecard.fairwayAccuracy')}</p>
              <div className="grid grid-cols-4 gap-2">
                {(['Left', 'Center', 'Right'] as const).map((opt) => {
                  const isActive = fairwayOption === opt;
                  return round.completed ? (
                    <div key={opt} className={`flex flex-col items-center gap-1.5 rounded-xl py-3 text-xs font-semibold ${isActive ? (opt === 'Center' ? 'bg-ft-green text-white shadow-sm' : 'bg-ft-amber text-white shadow-sm') : 'border border-ft-border bg-ft-surface text-ft-muted'}`}>
                      {opt === 'Left' && <ArrowLeft size={20} />}
                      {opt === 'Center' && <TrendingUp size={20} />}
                      {opt === 'Right' && <ArrowLeft size={20} className="rotate-180" />}
                      {t(`scorecard.${opt.toLowerCase()}`)}
                    </div>
                  ) : (
                    <button key={opt} onClick={() => setFairwayOption(isActive ? null : opt)} className={`flex flex-col items-center gap-1.5 rounded-xl py-3 text-xs font-semibold transition-all active:scale-95 ${isActive ? (opt === 'Center' ? 'bg-ft-green text-white shadow-sm' : 'bg-ft-amber text-white shadow-sm') : 'border border-ft-border bg-ft-surface text-ft-muted'}`}>
                      {opt === 'Left' && <ArrowLeft size={20} />}
                      {opt === 'Center' && <TrendingUp size={20} />}
                      {opt === 'Right' && <ArrowLeft size={20} className="rotate-180" />}
                      {t(`scorecard.${opt.toLowerCase()}`)}
                    </button>
                  );
                })}
                {round.completed ? (
                  <div className={`flex flex-col items-center gap-1.5 rounded-xl py-3 text-xs font-semibold ${fairwayOption === 'Miss' ? 'border border-ft-rose/50 bg-ft-rose/10 text-ft-rose' : 'border border-ft-border bg-ft-surface text-ft-muted'}`}>
                    <X size={20} />
                    {t('scorecard.miss')}
                  </div>
                ) : (
                  <button onClick={() => setFairwayOption(fairwayOption === 'Miss' ? null : 'Miss')} className={`flex flex-col items-center gap-1.5 rounded-xl py-3 text-xs font-semibold transition-all active:scale-95 ${fairwayOption === 'Miss' ? 'border border-ft-rose/50 bg-ft-rose/10 text-ft-rose' : 'border border-ft-border bg-ft-surface text-ft-muted'}`}>
                    <X size={20} />
                    {t('scorecard.miss')}
                  </button>
                )}
              </div>
            </div>

            {!round.completed && (
              <AnimatePresence>
                {saved && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-2 flex items-center justify-center gap-1 text-xs font-medium text-ft-green-bright">
                    <CheckCircle2 size={14} />
                    Saved
                  </motion.div>
                )}
              </AnimatePresence>
            )}

            <div className="mt-4 grid grid-cols-2 gap-3">
              <button onClick={() => { if (!round.completed) handleSaveHole(); if (activeHoleIndex > 0) prevHole(); }} disabled={activeHoleIndex === 0} className="flex items-center justify-center gap-2 rounded-lg border border-ft-border bg-ft-surface py-3.5 text-xs font-bold text-ft-text transition-all active:scale-[0.98] disabled:opacity-30">
                <ArrowLeft size={16} />
                {t('scorecard.prevHole')}
              </button>
              <button onClick={() => { if (round.completed) { if (activeHoleIndex < (currentPlayer?.holes.length || 1) - 1) nextHole(); } else { if (activeHoleIndex < (currentPlayer?.holes.length || 1) - 1 || activePlayerIndex < round.players.length - 1) { handleSaveAndNext(); } else { handleSaveHole(); } } }} disabled={activeHoleIndex === (currentPlayer?.holes.length || 1) - 1} className="flex items-center justify-center gap-2 rounded-lg bg-ft-green py-3.5 text-xs font-bold text-white shadow-sm transition-all active:scale-[0.98] disabled:opacity-50">
                {t('scorecard.nextHole')}
                <ArrowLeft size={16} className="rotate-180" />
              </button>
            </div>
          </>
        )}

        {/* Stats toggle */}
        <button
          onClick={() => setShowStats(!showStats)}
          className="mt-4 text-sm font-medium text-ft-green-bright"
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

        {/* Complete Round */}
        {allPlayed && !round.completed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4"
          >
            <button
              onClick={handleComplete}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-ft-green py-4 text-lg font-bold text-white shadow-sm transition-all active:scale-[0.98]"
            >
              <CheckCircle2 size={22} />
              {t('round.completeRound')}
            </button>
          </motion.div>
        )}
        {round.completed && (
          <div className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-ft-green/10 py-3 text-sm font-semibold text-ft-green-bright">
            <CheckCircle2 size={18} />
            Round completed
          </div>
        )}

        {/* Delete */}
        <div className="mt-3 mb-6">
          {deleteConfirm ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setDeleteConfirm(false)}
                className="flex-1 rounded-lg border border-ft-border py-3 text-sm font-medium text-ft-muted transition-all active:scale-[0.98]"
              >
                {t('players.cancel')}
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 rounded-lg bg-ft-rose py-3 text-sm font-bold text-white shadow-sm transition-all active:scale-[0.98]"
              >
                {t('round.confirmDelete')}
              </button>
            </div>
          ) : (
            <button
              onClick={() => { mediumTap(); setDeleteConfirm(true) }}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-ft-rose/30 py-3 text-sm font-medium text-ft-rose transition-all active:scale-[0.98]"
            >
              <Trash2 size={18} />
              {t('round.delete')}
            </button>
          )}
        </div>
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
            <p className="text-ft-muted">Round not found</p>
            <Link
              href="/"
              className="mt-2 text-sm font-medium text-ft-green-bright"
            >
              Go home
            </Link>
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
          <RoundContent roundId={params.id} />
        </Suspense>
      </ErrorBoundary>
      <BottomNav />
    </>
  );
}

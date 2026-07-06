'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check,
  Minus,
  Plus,
  Crosshair,
  GripHorizontal,
  ArrowLeft,
  ArrowRight,
  Target,
  X,
} from 'lucide-react';
import { HoleData } from '@/types';
import { useTranslation } from '@/i18n/useTranslation';
import { mediumTap } from '@/lib/haptics';

interface HoleInputProps {
  hole: HoleData;
  onSave: (data: Partial<HoleData>) => void;
}

type FairwayOption = 'Fairway' | 'Left' | 'Right';

export default function HoleInput({ hole, onSave }: HoleInputProps) {
  const { t } = useTranslation();

  const [score, setScore] = useState(hole.score > 0 ? hole.score : hole.par);
  const [fairwayHit, setFairwayHit] = useState<FairwayOption | null>(() => {
    if (hole.fairwayHit === 'Yes') return 'Fairway';
    if (hole.fairwayHit === 'Left' || hole.fairwayHit === 'Right') return hole.fairwayHit;
    return null;
  });
  const [gir, setGir] = useState<boolean | null>(hole.gir);
  const [putts, setPutts] = useState(hole.putts || 0);
  const [puttDistance, setPuttDistance] = useState<HoleData['puttDistance']>(hole.puttDistance);
  const [penalties, setPenalties] = useState(hole.penalties || 0);
  const [sandSave, setSandSave] = useState<number>(hole.sandSave ?? 0);
  const [approach, setApproach] = useState<number>(hole.approach ?? 0);
  const [distance, setDistance] = useState<number | null>(hole.drivingDistance);
  const [showDistance, setShowDistance] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (score > 0) {
      setGir(score === hole.par && putts <= 2);
    } else {
      setGir(null);
    }
  }, [score, putts, hole.par]);

  const handleFairwayTap = useCallback(
    (value: FairwayOption) => {
      if (fairwayHit === value) {
        setFairwayHit(null);
      } else {
        setFairwayHit(value);
      }
    },
    [fairwayHit]
  );

  const handleSave = () => {
    mediumTap();
    const mappedFairway: HoleData['fairwayHit'] = fairwayHit === 'Fairway' ? 'Yes' : fairwayHit;
    onSave({
      score,
      fairwayHit: mappedFairway,
      gir,
      putts,
      puttDistance,
      penalties,
      sandSave,
      approach,
      drivingDistance: distance,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const canSave = score > 0;

  return (
    <div className="space-y-5 rounded-xl border border-ft-border bg-ft-card p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-ft-label">
            {t('holeInput.hole', { number: hole.number })}
          </p>
          <p className="text-sm text-ft-muted">
            {t('holeInput.par', { par: hole.par })}
            {hole.handicap != null && (
              <span className="ml-2 rounded-md border border-ft-border bg-ft-surface px-1.5 py-0.5 text-[10px] font-medium text-ft-label">
                HCP {hole.handicap}
              </span>
            )}
          </p>
        </div>
        <AnimatePresence>
          {saved && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="flex items-center gap-1 rounded-full bg-ft-green/20 px-3 py-1 text-sm font-medium text-ft-green-bright"
            >
              <Check size={16} />
              {t('holeInput.saved')}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div>
        <label className="mb-2 block text-[11px] font-medium uppercase tracking-wider text-ft-label">
          {t('holeInput.score')}
        </label>
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => setScore(Math.max(0, score - 1))}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-ft-border bg-ft-surface text-ft-text transition-all active:scale-90 hover:border-ft-green/50"
          >
            <Minus size={22} />
          </button>
          <span className="font-mono min-w-[3ch] text-center text-4xl font-bold text-ft-text">
            {score || '-'}
          </span>
          <button
            onClick={() => setScore(score + 1)}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-ft-border bg-ft-surface text-ft-text transition-all active:scale-90 hover:border-ft-green/50"
          >
            <Plus size={22} />
          </button>
        </div>
      </div>

      <div>
        <label className="mb-2 block text-[11px] font-medium uppercase tracking-wider text-ft-label">
          {t('holeInput.putts')}
        </label>
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => setPutts(Math.max(0, putts - 1))}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-ft-border bg-ft-surface text-ft-text transition-all active:scale-90 hover:border-ft-green/50"
          >
            <Minus size={18} />
          </button>
          <span className="font-mono min-w-[2ch] text-center text-2xl font-bold text-ft-text">
            {putts}
          </span>
          <button
            onClick={() => setPutts(putts + 1)}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-ft-border bg-ft-surface text-ft-text transition-all active:scale-90 hover:border-ft-green/50"
          >
            <Plus size={18} />
          </button>
        </div>
      </div>

      <div>
        <label className="mb-2 block text-[11px] font-medium uppercase tracking-wider text-ft-label">
          {t('holeInput.fairwayHit')}
        </label>
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={() => handleFairwayTap('Left')}
            className={`flex flex-col items-center gap-1.5 rounded-xl py-3 text-xs font-medium transition-all active:scale-95 ${
              fairwayHit === 'Left'
                ? 'bg-ft-amber text-white shadow-sm'
                : 'border border-ft-border bg-ft-surface text-ft-muted'
            }`}
          >
            <ArrowLeft size={20} className={fairwayHit === 'Left' ? 'text-white' : 'text-ft-amber'} />
            {t('holeInput.left')}
          </button>
          <button
            onClick={() => handleFairwayTap('Fairway')}
            className={`flex flex-col items-center gap-1.5 rounded-xl py-3 text-xs font-medium transition-all active:scale-95 ${
              fairwayHit === 'Fairway'
                ? 'bg-ft-green text-white shadow-sm'
                : 'border border-ft-border bg-ft-surface text-ft-muted'
            }`}
          >
            <Target size={20} className={fairwayHit === 'Fairway' ? 'text-white' : 'text-ft-green-bright'} />
            {t('holeInput.fairway')}
          </button>
          <button
            onClick={() => handleFairwayTap('Right')}
            className={`flex flex-col items-center gap-1.5 rounded-xl py-3 text-xs font-medium transition-all active:scale-95 ${
              fairwayHit === 'Right'
                ? 'bg-ft-amber text-white shadow-sm'
                : 'border border-ft-border bg-ft-surface text-ft-muted'
            }`}
          >
            <ArrowRight size={20} className={fairwayHit === 'Right' ? 'text-white' : 'text-ft-amber'} />
            {t('holeInput.right')}
          </button>
          <button
            onClick={() => {
              if (fairwayHit !== null) {
                setFairwayHit(null);
              }
            }}
            className={`flex flex-col items-center gap-1.5 rounded-xl py-3 text-xs font-medium transition-all active:scale-95 ${
              fairwayHit === null
                ? 'border border-ft-rose/50 bg-ft-rose/10 text-ft-rose'
                : 'border border-ft-border bg-ft-surface text-ft-muted'
            }`}
          >
            <X size={20} className={fairwayHit === null ? 'text-ft-rose' : 'text-ft-label'} />
            {t('holeInput.miss')}
          </button>
        </div>
      </div>

      <div className="flex gap-3">
        <div className="flex-1">
          <label className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-ft-label">
            {t('holeInput.gir')}
          </label>
          <div className="flex gap-1.5">
            <button
              onClick={() => setGir(gir === true ? null : true)}
              className={`flex-1 rounded-lg py-2 text-xs font-medium transition-all active:scale-95 ${
                gir === true
                  ? 'bg-ft-green text-white'
                  : 'border border-ft-border bg-ft-surface text-ft-muted'
              }`}
            >
              {t('holeInput.yes')}
            </button>
            <button
              onClick={() => setGir(gir === false ? null : false)}
              className={`flex-1 rounded-lg py-2 text-xs font-medium transition-all active:scale-95 ${
                gir === false
                  ? 'bg-ft-rose text-white'
                  : 'border border-ft-border bg-ft-surface text-ft-muted'
              }`}
            >
              {t('holeInput.no')}
            </button>
          </div>
        </div>

        <div className="flex-1">
          <label className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-ft-label">
            {t('holeInput.sandSave')}
          </label>
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setSandSave(Math.max(0, sandSave - 1))}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-ft-border bg-ft-surface text-ft-muted transition-all active:scale-90"
            >
              <Minus size={16} />
            </button>
            <span className="font-mono min-w-[2ch] text-center text-lg font-bold text-ft-text">
              {sandSave}
            </span>
            <button
              onClick={() => setSandSave(sandSave + 1)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-ft-border bg-ft-surface text-ft-muted transition-all active:scale-90"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        <div className="flex-1">
          <label className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-ft-label">
            {t('holeInput.approach')}
          </label>
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setApproach(Math.max(0, approach - 1))}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-ft-border bg-ft-surface text-ft-muted transition-all active:scale-90"
            >
              <Minus size={16} />
            </button>
            <span className="font-mono min-w-[2ch] text-center text-lg font-bold text-ft-text">
              {approach}
            </span>
            <button
              onClick={() => setApproach(approach + 1)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-ft-border bg-ft-surface text-ft-muted transition-all active:scale-90"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <div className="flex-1">
          <label className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-ft-label">
            {t('holeInput.penalties')}
          </label>
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setPenalties(Math.max(0, penalties - 1))}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-ft-border bg-ft-surface text-ft-muted transition-all active:scale-90"
            >
              <Minus size={16} />
            </button>
            <span className="font-mono min-w-[2ch] text-center text-lg font-bold text-ft-text">
              {penalties}
            </span>
            <button
              onClick={() => setPenalties(penalties + 1)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-ft-border bg-ft-surface text-ft-muted transition-all active:scale-90"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-ft-label">
          {t('holeInput.puttDistance')}
        </label>
        <div className="flex gap-1.5">
          {(['<1', '1-2', '2-4', '4-8', '+8'] as const).map((d) => (
            <button
              key={d}
              onClick={() => setPuttDistance(puttDistance === d ? null : d)}
              className={`flex-1 rounded-lg py-2 text-xs font-medium transition-all active:scale-95 ${
                puttDistance === d
                  ? 'bg-ft-green text-white'
                  : 'border border-ft-border bg-ft-surface text-ft-muted'
              }`}
            >
              {t(`holeInput.puttDistances.${d}`)}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={() => setShowDistance(!showDistance)}
        className="flex items-center gap-2 text-xs font-medium text-ft-label"
      >
        <Crosshair size={14} />
        {showDistance ? t('holeInput.hideDistance') : t('holeInput.addDistance')}
      </button>

      <AnimatePresence>
        {showDistance && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <label className="mb-1 block text-xs font-medium text-ft-label">
              {t('holeInput.distanceLabel')}
            </label>
            <input
              type="number"
              inputMode="numeric"
              autoComplete="off"
              value={distance ?? ''}
              onChange={(e) =>
                setDistance(e.target.value ? parseInt(e.target.value) : null)
              }
              placeholder={t('holeInput.distancePlaceholder')}
              className="w-full rounded-lg border border-ft-border bg-ft-surface px-3 py-2 text-lg text-ft-text placeholder:text-ft-label focus:border-ft-green focus:outline-none"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={handleSave}
        disabled={!canSave}
        className={`flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-base font-bold transition-all active:scale-[0.98] ${
          canSave
            ? 'bg-ft-green text-white shadow-sm hover:bg-ft-green/90'
            : 'cursor-not-allowed bg-ft-card text-ft-label'
        }`}
      >
        <GripHorizontal size={18} />
        {canSave ? t('holeInput.saveHole') : t('holeInput.enterScoreFirst')}
      </button>
    </div>
  );
}

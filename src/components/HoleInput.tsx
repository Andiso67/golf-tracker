'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Minus, Plus, Crosshair, GripHorizontal } from 'lucide-react';
import { HoleData } from '@/types';
import { useTranslation } from '@/i18n/useTranslation';

interface HoleInputProps {
  hole: HoleData;
  onSave: (data: Partial<HoleData>) => void;
}

type FairwayOption = 'Yes' | 'No' | 'Left' | 'Right';

export default function HoleInput({ hole, onSave }: HoleInputProps) {
  const { t } = useTranslation();

  const [score, setScore] = useState(hole.score || 0);
  const [fairwayHit, setFairwayHit] = useState<FairwayOption | null>(
    hole.fairwayHit as FairwayOption | null
  );
  const [gir, setGir] = useState<boolean | null>(hole.gir);
  const [putts, setPutts] = useState(hole.putts || 0);
  const [puttDistance, setPuttDistance] = useState<HoleData['puttDistance']>(hole.puttDistance);
  const [penalties, setPenalties] = useState(hole.penalties || 0);
  const [sandSave, setSandSave] = useState<boolean | null>(hole.sandSave);
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
    onSave({
      score,
      fairwayHit,
      gir,
      putts,
      puttDistance,
      penalties,
      sandSave,
      drivingDistance: distance,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const canSave = score > 0;
  const showDirection = fairwayHit !== null && fairwayHit !== 'Yes';

  return (
    <div className="space-y-4 rounded-2xl bg-white p-4 shadow-sm dark:bg-zinc-900">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">
            {t('holeInput.hole', { number: hole.number })}
          </p>
          <p className="text-sm text-zinc-500">
            {t('holeInput.par', { par: hole.par })}
          </p>
        </div>
        <AnimatePresence>
          {saved && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300"
            >
              <Check size={16} />
              {t('holeInput.saved')}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-zinc-500">
          {t('holeInput.score')}
        </label>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setScore(Math.max(0, score - 1))}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 active:scale-90 dark:bg-zinc-800 dark:text-zinc-300"
          >
            <Minus size={20} />
          </button>
          <span className="min-w-[3ch] text-center text-3xl font-bold tabular-nums">
            {score || '-'}
          </span>
          <button
            onClick={() => setScore(score + 1)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 active:scale-90 dark:bg-zinc-800 dark:text-zinc-300"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium text-zinc-500">
          {t('holeInput.fairwayHit')}
        </label>
        <div className="flex gap-1.5">
          <button
            onClick={() => handleFairwayTap('Yes')}
            className={`flex-1 rounded-lg py-2 text-xs font-medium transition-all active:scale-95 ${
              fairwayHit === 'Yes'
                ? 'bg-emerald-500 text-white'
                : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800'
            }`}
          >
            {t('holeInput.hit')}
          </button>
          <button
            onClick={() => handleFairwayTap('No')}
            className={`flex-1 rounded-lg py-2 text-xs font-medium transition-all active:scale-95 ${
              fairwayHit === 'No' || fairwayHit === 'Left' || fairwayHit === 'Right'
                ? 'bg-rose-500 text-white'
                : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800'
            }`}
          >
            {t('holeInput.miss')}
          </button>
        </div>
        <AnimatePresence>
          {showDirection && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-1.5 flex gap-1.5 overflow-hidden"
            >
              <button
                onClick={() => handleFairwayTap('Left')}
                className={`flex-1 rounded-lg py-2 text-xs font-medium transition-all active:scale-95 ${
                  fairwayHit === 'Left'
                    ? 'bg-amber-500 text-white'
                    : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800'
                }`}
              >
                {t('holeInput.left')}
              </button>
              <button
                onClick={() => handleFairwayTap('Right')}
                className={`flex-1 rounded-lg py-2 text-xs font-medium transition-all active:scale-95 ${
                  fairwayHit === 'Right'
                    ? 'bg-amber-500 text-white'
                    : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800'
                }`}
              >
                {t('holeInput.right')}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex gap-3">
        <div className="flex-1">
          <label className="mb-1 block text-xs font-medium text-zinc-500">
            {t('holeInput.gir')}
          </label>
          <div className="flex gap-1.5">
            <button
              onClick={() => setGir(gir === true ? null : true)}
              className={`flex-1 rounded-lg py-2 text-xs font-medium transition-all active:scale-95 ${
                gir === true
                  ? 'bg-emerald-500 text-white'
                  : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800'
              }`}
            >
              {t('holeInput.yes')}
            </button>
            <button
              onClick={() => setGir(gir === false ? null : false)}
              className={`flex-1 rounded-lg py-2 text-xs font-medium transition-all active:scale-95 ${
                gir === false
                  ? 'bg-rose-500 text-white'
                  : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800'
              }`}
            >
              {t('holeInput.no')}
            </button>
          </div>
        </div>

        <div className="flex-1">
          <label className="mb-1 block text-xs font-medium text-zinc-500">
            {t('holeInput.sandSave')}
          </label>
          <div className="flex gap-1.5">
            <button
              onClick={() =>
                setSandSave(sandSave === true ? null : true)
              }
              className={`flex-1 rounded-lg py-2 text-xs font-medium transition-all active:scale-95 ${
                sandSave === true
                  ? 'bg-emerald-500 text-white'
                  : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800'
              }`}
            >
              {t('holeInput.yes')}
            </button>
            <button
              onClick={() =>
                setSandSave(sandSave === false ? null : false)
              }
              className={`flex-1 rounded-lg py-2 text-xs font-medium transition-all active:scale-95 ${
                sandSave === false
                  ? 'bg-rose-500 text-white'
                  : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800'
              }`}
            >
              {t('holeInput.na')}
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <div className="flex-1">
          <label className="mb-1 block text-xs font-medium text-zinc-500">
            {t('holeInput.putts')}
          </label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPutts(Math.max(0, putts - 1))}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 active:scale-90 dark:bg-zinc-800 dark:text-zinc-300"
            >
              <Minus size={16} />
            </button>
            <span className="min-w-[2ch] text-center text-lg font-bold tabular-nums">
              {putts}
            </span>
            <button
              onClick={() => setPutts(putts + 1)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 active:scale-90 dark:bg-zinc-800 dark:text-zinc-300"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        <div className="flex-1">
          <label className="mb-1 block text-xs font-medium text-zinc-500">
            {t('holeInput.penalties')}
          </label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPenalties(Math.max(0, penalties - 1))}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 active:scale-90 dark:bg-zinc-800 dark:text-zinc-300"
            >
              <Minus size={16} />
            </button>
            <span className="min-w-[2ch] text-center text-lg font-bold tabular-nums">
              {penalties}
            </span>
            <button
              onClick={() => setPenalties(penalties + 1)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 active:scale-90 dark:bg-zinc-800 dark:text-zinc-300"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium text-zinc-500">
          {t('holeInput.puttDistance')}
        </label>
        <div className="flex gap-1.5">
          {(['<1', '1-2', '2-4', '4-8', '+8'] as const).map((d) => (
            <button
              key={d}
              onClick={() => setPuttDistance(puttDistance === d ? null : d)}
              className={`flex-1 rounded-lg py-2 text-xs font-medium transition-all active:scale-95 ${
                puttDistance === d
                  ? 'bg-emerald-500 text-white'
                  : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800'
              }`}
            >
              {t(`holeInput.puttDistances.${d}`)}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={() => setShowDistance(!showDistance)}
        className="flex items-center gap-2 text-xs font-medium text-zinc-400"
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
            <label className="mb-1 block text-xs font-medium text-zinc-500">
              {t('holeInput.distanceLabel')}
            </label>
            <input
              type="number"
              value={distance ?? ''}
              onChange={(e) =>
                setDistance(e.target.value ? parseInt(e.target.value) : null)
              }
              placeholder={t('holeInput.distancePlaceholder')}
              className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-lg dark:border-zinc-700 dark:bg-zinc-800"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={handleSave}
        disabled={!canSave}
        className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-base font-bold transition-all active:scale-[0.98] ${
          canSave
            ? 'bg-emerald-500 text-white shadow-sm hover:bg-emerald-600'
            : 'cursor-not-allowed bg-zinc-100 text-zinc-300 dark:bg-zinc-800'
        }`}
      >
        <GripHorizontal size={18} />
        {canSave ? t('holeInput.saveHole') : t('holeInput.enterScoreFirst')}
      </button>
    </div>
  );
}

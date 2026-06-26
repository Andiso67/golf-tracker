'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useStore } from '@/store/useStore';
import {
  DEFAULT_TEES,
  DEFAULT_PARS_18,
  DEFAULT_PARS_9,
} from '@/types';
import type { SavedCourse, CourseTee } from '@/types';
import { useTranslation } from '@/i18n/useTranslation';
import { ChevronDown, MapPin, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function NewRoundForm() {
  const router = useRouter();
  const courses = useStore((s) => s.courses);
  const startRound = useStore((s) => s.startRound);
  const { t } = useTranslation();

  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [showCoursePicker, setShowCoursePicker] = useState(false);
  const [customCourseName, setCustomCourseName] = useState('');
  const [selectedTee, setSelectedTee] = useState<string | null>(null);
  const [totalHoles, setTotalHoles] = useState<9 | 18>(18);
  const [parInputs, setParInputs] = useState<number[]>(DEFAULT_PARS_18);
  const [customPars, setCustomPars] = useState(false);

  const selectedCourse = selectedCourseId
    ? courses.find((c) => c.id === selectedCourseId)
    : undefined;

  const handleSelectCourse = (course: SavedCourse) => {
    setSelectedCourseId(course.id);
    setCustomCourseName('');
    setSelectedTee(course.tees[0]?.name || null);
    setTotalHoles(course.tees[0]?.totalHoles || 18);
    if (course.tees[0]) {
      setParInputs([...course.tees[0].pars]);
    }
    setShowCoursePicker(false);
    setCustomPars(false);
  };

  const handleSelectTee = (tee: CourseTee) => {
    setSelectedTee(tee.name);
    setTotalHoles(tee.totalHoles);
    setParInputs([...tee.pars]);
    setCustomPars(false);
  };

  const handleUseCustomCourse = () => {
    setSelectedCourseId(null);
    setSelectedTee(null);
    setShowCoursePicker(false);
    const pars = totalHoles === 9 ? DEFAULT_PARS_9 : DEFAULT_PARS_18;
    setParInputs(pars);
    setCustomPars(false);
  };

  const handleHoleCountChange = (holes: 9 | 18) => {
    setTotalHoles(holes);
    if (!selectedCourseId) {
      setParInputs(holes === 9 ? DEFAULT_PARS_9 : DEFAULT_PARS_18);
    }
  };

  const handleParChange = (index: number, value: number) => {
    const updated = [...parInputs];
    updated[index] = Math.max(3, Math.min(6, value || 3));
    setParInputs(updated);
  };

  const handleStart = () => {
    const courseName = selectedCourse
      ? selectedCourse.name
      : customCourseName.trim();
    if (!courseName) return;

    const teeColor = selectedCourseId && selectedTee ? selectedTee : DEFAULT_TEES[2].name;
    const id = startRound(
      courseName,
      teeColor,
      totalHoles,
      customPars ? parInputs : undefined,
      selectedCourseId || undefined
    );
    router.push(`/round/${id}`);
  };

  const totalPar = parInputs.reduce((s, v) => s + v, 0);
  const courseName = selectedCourse
    ? selectedCourse.name
    : customCourseName;
  const canStart = courseName.trim().length > 0;

  const availableTees = selectedCourse
    ? selectedCourse.tees
    : [];
  const activeTeeObj = availableTees.find((t) => t.name === selectedTee);

  return (
    <div className="space-y-5">
      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-500">
          {t('newRound.courseName')}
        </label>

        <button
          onClick={() => setShowCoursePicker(!showCoursePicker)}
          className="flex w-full items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 py-3 text-left text-lg dark:border-zinc-700 dark:bg-zinc-900"
        >
          <span
            className={
              courseName ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-300'
            }
          >
            {courseName || t('newRound.selectCourse')}
          </span>
          <ChevronDown size={18} className="text-zinc-400" />
        </button>

        {showCoursePicker && (
          <div className="mt-2 rounded-xl border border-zinc-200 bg-white p-2 dark:border-zinc-700 dark:bg-zinc-900">
            {courses.map((course) => (
              <button
                key={course.id}
                onClick={() => handleSelectCourse(course)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                  selectedCourseId === course.id
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                    : 'hover:bg-zinc-50 dark:hover:bg-zinc-800'
                }`}
              >
                <MapPin
                  size={16}
                  className="shrink-0 text-zinc-400"
                />
                <div>
                  <p className="font-medium">{course.name}</p>
                  <p className="text-[11px] text-zinc-400">
                    {course.tees.length} {t('courses.tees')} ·{' '}
                    {course.tees[0]?.totalHoles || 18} {t('home.holes')}
                  </p>
                </div>
              </button>
            ))}
            <button
              onClick={handleUseCustomCourse}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                !selectedCourseId && !customCourseName
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50'
                  : 'hover:bg-zinc-50 dark:hover:bg-zinc-800'
              }`}
            >
              <Plus size={16} className="shrink-0 text-zinc-400" />
              <span className="font-medium">
                {t('newRound.quickRound')}
              </span>
            </button>
          </div>
        )}

        {!selectedCourseId && (
          <input
            type="text"
            value={customCourseName}
            onChange={(e) => setCustomCourseName(e.target.value)}
            placeholder={t('newRound.coursePlaceholder')}
            className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-lg placeholder-zinc-300 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100 dark:border-zinc-700 dark:bg-zinc-900 dark:placeholder-zinc-600 dark:focus:border-emerald-500 dark:focus:ring-emerald-900"
          />
        )}

        {!selectedCourseId && (
          <Link
            href="/courses"
            className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400"
          >
            <Plus size={14} />
            {t('newRound.saveCourse')}
          </Link>
        )}
      </div>

      {selectedCourseId && (
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-500">
            {t('newRound.teeColor')}
          </label>
          <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-5">
            {availableTees.map((tee) => (
              <button
                key={tee.name}
                onClick={() => handleSelectTee(tee)}
                className={`rounded-lg py-2 text-xs font-medium transition-all active:scale-95 ${
                  selectedTee === tee.name
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'border border-zinc-200 bg-white text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900'
                }`}
              >
                <span className="block">{tee.name}</span>
                <span className="block text-[9px] opacity-70">
                  R:{tee.rating} S:{tee.slope}
                </span>
              </button>
            ))}
          </div>
          {activeTeeObj && (
            <p className="mt-1 text-xs text-zinc-400">
              {t('newRound.totalPar', { par: activeTeeObj.pars.reduce((a, b) => a + b, 0) })}
              {' · '}
              {t('newRound.courseRating')}: {activeTeeObj.rating} /{' '}
              {activeTeeObj.slope}
            </p>
          )}
        </div>
      )}

      {!selectedCourseId && (
        <>
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-500">
              {t('newRound.numHoles')}
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => handleHoleCountChange(9)}
                className={`flex-1 rounded-xl py-3 text-base font-bold transition-all active:scale-95 ${
                  totalHoles === 9
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'border border-zinc-200 bg-white text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900'
                }`}
              >
                {t('newRound.holes9')}
              </button>
              <button
                onClick={() => handleHoleCountChange(18)}
                className={`flex-1 rounded-xl py-3 text-base font-bold transition-all active:scale-95 ${
                  totalHoles === 18
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'border border-zinc-200 bg-white text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900'
                }`}
              >
                {t('newRound.holes18')}
              </button>
            </div>
          </div>

          {!customPars && (
            <div>
              <button
                onClick={() => setCustomPars(true)}
                className="text-sm font-medium text-emerald-600 dark:text-emerald-400"
              >
                {t('newRound.customizePars')}
              </button>
            </div>
          )}

          <AnimatePresence>
            {customPars && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div>
                  <label className="mb-1 block text-sm font-medium text-zinc-500">
                    {t('newRound.parPerHole')}
                  </label>
                  <div className="grid grid-cols-9 gap-1">
                    {parInputs.map((par, i) => (
                      <div key={i} className="text-center">
                        <p className="text-[10px] text-zinc-400">#{i + 1}</p>
                        <input
                          type="number"
                          min={3}
                          max={6}
                          value={par}
                          onChange={(e) =>
                            handleParChange(i, parseInt(e.target.value))
                          }
                          className="w-full rounded border border-zinc-200 bg-zinc-50 py-1 text-center text-sm dark:border-zinc-700 dark:bg-zinc-800"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="mt-1 flex items-center justify-between">
                    <p className="text-xs text-zinc-400">
                      {t('newRound.totalPar', { par: totalPar })}
                    </p>
                    <button
                      onClick={() => setCustomPars(false)}
                      className="text-xs font-medium text-emerald-600 dark:text-emerald-400"
                    >
                      {t('newRound.useDefaultPars')}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      <button
        onClick={handleStart}
        disabled={!canStart}
        className={`flex w-full items-center justify-center gap-2 rounded-xl py-4 text-lg font-bold transition-all active:scale-[0.98] ${
          canStart
            ? 'bg-emerald-500 text-white shadow-sm hover:bg-emerald-600'
            : 'cursor-not-allowed bg-zinc-100 text-zinc-300 dark:bg-zinc-800'
        }`}
      >
        {t('newRound.startRound')}
      </button>
    </div>
  );
}

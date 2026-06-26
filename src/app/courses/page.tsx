'use client';

import { Suspense, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Trash2, Pencil, MapPin, Download } from 'lucide-react';
import Link from 'next/link';
import BottomNav from '@/components/BottomNav';
import ErrorBoundary from '@/components/ErrorBoundary';
import { useStore } from '@/store/useStore';
import { useTranslation } from '@/i18n/useTranslation';
import { TEE_NAMES, DEFAULT_PARS_18, DEFAULT_PARS_9 } from '@/types';
import type { CourseTee } from '@/types';

function CourseEditor({
  editId,
  onDone,
}: {
  editId: string | null;
  onDone: () => void;
}) {
  const { t } = useTranslation();
  const addCourse = useStore((s) => s.addCourse);
  const updateCourse = useStore((s) => s.updateCourse);
  const existing = useStore((s) =>
    editId ? s.courses.find((c) => c.id === editId) : undefined
  );

  const [name, setName] = useState(existing?.name || '');
  const [tees, setTees] = useState<CourseTee[]>(
    existing?.tees || [
      {
        name: 'White',
        rating: 71.0,
        slope: 130,
        pars: [...DEFAULT_PARS_18],
        totalHoles: 18,
      },
    ]
  );
  const [addingTee, setAddingTee] = useState(false);

  const handleAddTee = (teeName: string) => {
    if (tees.find((t) => t.name === teeName)) return;
    const totalHoles = tees[0]?.totalHoles || 18;
    const template = totalHoles === 18 ? DEFAULT_PARS_18 : DEFAULT_PARS_9;
    setTees([
      ...tees,
      {
        name: teeName,
        rating: 71.0,
        slope: 130,
        pars: [...template],
        totalHoles,
      },
    ]);
    setAddingTee(false);
  };

  const handleRemoveTee = (teeName: string) => {
    setTees(tees.filter((t) => t.name !== teeName));
  };

  const handleParChange = (
    teeIndex: number,
    holeIndex: number,
    value: number
  ) => {
    const updated = [...tees];
    updated[teeIndex] = {
      ...updated[teeIndex],
      pars: updated[teeIndex].pars.map((p, i) =>
        i === holeIndex ? Math.max(3, Math.min(6, value || 3)) : p
      ),
    };
    setTees(updated);
  };

  const handleRatingChange = (teeIndex: number, value: number) => {
    const updated = [...tees];
    updated[teeIndex] = { ...updated[teeIndex], rating: value };
    setTees(updated);
  };

  const handleSlopeChange = (teeIndex: number, value: number) => {
    const updated = [...tees];
    updated[teeIndex] = { ...updated[teeIndex], slope: value };
    setTees(updated);
  };

  const handleSave = () => {
    if (!name.trim()) return;
    if (editId) {
      updateCourse(editId, { name: name.trim(), tees });
    } else {
      addCourse(name.trim(), tees);
    }
    onDone();
  };

  const totalHoles = tees[0]?.totalHoles || 18;
  const availableTees = TEE_NAMES.filter(
    (tn) => !tees.find((t) => t.name === tn)
  );

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col px-4 pt-6">
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={onDone}
          className="inline-flex items-center gap-1 text-sm text-zinc-400"
        >
          <ArrowLeft size={16} />
          {t('courses.back')}
        </button>
        <button
          onClick={handleSave}
          disabled={!name.trim()}
          className={`rounded-lg px-4 py-2 text-sm font-bold ${
            name.trim()
              ? 'bg-emerald-500 text-white'
              : 'bg-zinc-100 text-zinc-300 dark:bg-zinc-800'
          }`}
        >
          {editId ? t('courses.save') : t('courses.add')}
        </button>
      </div>

      <h1 className="mb-2 text-2xl font-bold tracking-tight">
        {editId ? t('courses.editTitle') : t('courses.newTitle')}
      </h1>

      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-zinc-500">
          {t('courses.courseName')}
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('courses.courseNamePlaceholder')}
          className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-lg placeholder-zinc-300 focus:border-emerald-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900"
        />
      </div>

      <div className="mb-4">
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-medium text-zinc-500">
            {t('courses.tees')}
          </label>
          {availableTees.length > 0 && (
            <button
              onClick={() => setAddingTee(!addingTee)}
              className="text-sm font-medium text-emerald-600 dark:text-emerald-400"
            >
              + {t('courses.addTee')}
            </button>
          )}
        </div>

        {addingTee && (
          <div className="mb-2 flex flex-wrap gap-1.5">
            {availableTees.map((tn) => (
              <button
                key={tn}
                onClick={() => handleAddTee(tn)}
                className="rounded-lg border border-zinc-200 px-2.5 py-1 text-xs font-medium text-zinc-600 dark:border-zinc-700"
              >
                {tn}
              </button>
            ))}
          </div>
        )}

        <div className="space-y-3">
          {tees.map((tee, ti) => (
            <div
              key={tee.name}
              className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-bold">{tee.name}</span>
                {tees.length > 1 && (
                  <button
                    onClick={() => handleRemoveTee(tee.name)}
                    className="text-rose-400"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>

              <div className="mb-2 flex gap-2">
                <div className="flex-1">
                  <label className="text-[10px] text-zinc-400">
                    {t('courses.rating')}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={tee.rating}
                    onChange={(e) =>
                      handleRatingChange(ti, parseFloat(e.target.value) || 0)
                    }
                    className="w-full rounded border border-zinc-100 bg-zinc-50 px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-800"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] text-zinc-400">
                    {t('courses.slope')}
                  </label>
                  <input
                    type="number"
                    value={tee.slope}
                    onChange={(e) =>
                      handleSlopeChange(ti, parseInt(e.target.value) || 0)
                    }
                    className="w-full rounded border border-zinc-100 bg-zinc-50 px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-800"
                  />
                </div>
              </div>

              <label className="text-[10px] text-zinc-400">
                {t('courses.pars')}
              </label>
              <div
                className={`grid gap-1 ${
                  totalHoles === 18 ? 'grid-cols-18' : 'grid-cols-9'
                }`}
                style={{
                  gridTemplateColumns: `repeat(${totalHoles}, 1fr)`,
                }}
              >
                {tee.pars.map((par, hi) => (
                  <div key={hi} className="text-center">
                    <span className="text-[9px] text-zinc-400">{hi + 1}</span>
                    <input
                      type="number"
                      min={3}
                      max={6}
                      value={par}
                      onChange={(e) =>
                        handleParChange(ti, hi, parseInt(e.target.value))
                      }
                      className="w-full rounded border border-zinc-100 bg-zinc-50 py-0.5 text-center text-xs dark:border-zinc-700 dark:bg-zinc-800"
                    />
                  </div>
                ))}
              </div>
              <p className="mt-1 text-[10px] text-zinc-400">
                {t('courses.totalPar')}: {tee.pars.reduce((a, b) => a + b, 0)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CoursesList() {
  const { t } = useTranslation();
  const courses = useStore((s) => s.courses);
  const deleteCourse = useStore((s) => s.deleteCourse);
  const [editing, setEditing] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importMsg, setImportMsg] = useState<string | null>(null);

  const handleImport = async () => {
    setImporting(true);
    setImportMsg(null);
    try {
      const res = await fetch('/api/courses/import', { method: 'POST' });
      const data = await res.json();
      if (data.imported !== undefined) {
        setImportMsg(t('courses.importedCount', { count: data.imported }));
        const coursesRes = await fetch('/api/courses');
        if (coursesRes.ok) {
          const apiCourses = await coursesRes.json();
          useStore.setState({ courses: apiCourses });
        }
      } else {
        setImportMsg(t('courses.importError'));
      }
    } catch {
      setImportMsg(t('courses.importError'));
    } finally {
      setImporting(false);
    }
  };

  if (editing || adding) {
    return (
      <CourseEditor
        editId={editing}
        onDone={() => {
          setEditing(null);
          setAdding(false);
        }}
      />
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col px-4 pt-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 flex items-center justify-between"
      >
        <div>
          <Link
            href="/"
            className="mb-1 inline-flex items-center gap-1 text-sm text-zinc-400"
          >
            <ArrowLeft size={16} />
            {t('courses.back')}
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">
            {t('courses.title')}
          </h1>
        </div>
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-1 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-bold text-white"
        >
          <Plus size={18} />
          {t('courses.addCourse')}
        </button>
      </motion.div>

      <button
        onClick={handleImport}
        disabled={importing}
        className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-300 bg-white py-2.5 text-sm font-medium text-zinc-500 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
      >
        <Download size={16} className={importing ? 'animate-bounce' : ''} />
        {importing ? t('courses.importing') : t('courses.importRfeg')}
      </button>

      {importMsg && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-3 text-center text-sm text-emerald-600 dark:text-emerald-400"
        >
          {importMsg}
        </motion.p>
      )}


      {courses.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-zinc-200 py-12 text-center dark:border-zinc-800">
          <MapPin size={40} className="text-zinc-300 dark:text-zinc-600" />
          <p className="text-sm text-zinc-400">{t('courses.noCourses')}</p>
          <button
            onClick={() => setAdding(true)}
            className="text-sm font-medium text-emerald-600 dark:text-emerald-400"
          >
            {t('courses.addFirst')}
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {courses.map((course) => (
            <div
              key={course.id}
              className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-base font-bold">{course.name}</p>
                  <p className="text-xs text-zinc-400">
                    {course.tees.length}{' '}
                    {course.tees.length === 1
                      ? t('courses.tee')
                      : t('courses.tees')}
                    {' · '}
                    {course.tees[0]?.totalHoles || 18}{' '}
                    {t('courses.holes')}
                  </p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => setEditing(course.id)}
                    className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => deleteCourse(course.id)}
                    className="rounded-lg p-2 text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="mt-1 flex flex-wrap gap-1">
                {course.tees.map((tee) => (
                  <span
                    key={tee.name}
                    className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] text-zinc-500 dark:bg-zinc-800"
                  >
                    {tee.name} (R:{tee.rating} S:{tee.slope})
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CoursesPage() {
  return (
    <>
      <ErrorBoundary>
        <Suspense
          fallback={
            <div className="mx-auto flex max-w-lg flex-1 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
            </div>
          }
        >
          <CoursesList />
        </Suspense>
      </ErrorBoundary>
      <BottomNav />
    </>
  );
}

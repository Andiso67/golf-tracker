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
  const [imageUrl, setImageUrl] = useState(existing?.imageUrl || '');
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
      updateCourse(editId, { name: name.trim(), imageUrl: imageUrl.trim(), tees });
    } else {
      addCourse(name.trim(), tees, imageUrl.trim() || undefined);
    }
    onDone();
  };

  const totalHoles = tees[0]?.totalHoles || 18;
  const availableTees = TEE_NAMES.filter(
    (tn) => !tees.find((t) => t.name === tn)
  );

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col px-4 pt-[calc(env(safe-area-inset-top,0px)+1.5rem)]">
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={onDone}
          className="inline-flex items-center gap-1 text-sm text-ft-muted"
        >
          <ArrowLeft size={16} />
          {t('courses.back')}
        </button>
        <button
          onClick={handleSave}
          disabled={!name.trim()}
          className={`rounded-lg px-4 py-2 text-sm font-bold ${
            name.trim()
              ? 'bg-ft-green text-white'
              : 'bg-ft-surface text-ft-muted'
          }`}
        >
          {editId ? t('courses.save') : t('courses.add')}
        </button>
      </div>

      <h1 className="mb-2 text-2xl font-bold tracking-tight">
        {editId ? t('courses.editTitle') : t('courses.newTitle')}
      </h1>

      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-ft-muted">
          {t('courses.courseName')}
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('courses.courseNamePlaceholder')}
          className="w-full rounded-xl border border-ft-border bg-ft-surface px-4 py-3 text-lg placeholder-ft-muted focus:border-ft-green focus:outline-none"
        />
      </div>

      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-ft-muted">
          Image URL
        </label>
        <input
          type="text"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://example.com/course-image.jpg"
          className="w-full rounded-xl border border-ft-border bg-ft-surface px-4 py-2.5 text-sm placeholder-ft-muted focus:border-ft-green focus:outline-none"
        />
        {imageUrl && (
          <div className="mt-2 overflow-hidden rounded-xl">
            <img
              src={imageUrl}
              alt={name || 'Course preview'}
              className="h-32 w-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        )}
      </div>

      <div className="mb-4">
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-medium text-ft-muted">
            {t('courses.tees')}
          </label>
          {availableTees.length > 0 && (
            <button
              onClick={() => setAddingTee(!addingTee)}
              className="text-sm font-medium text-ft-green-bright"
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
                className="rounded-lg border border-ft-border px-2.5 py-1 text-xs font-medium text-ft-label"
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
              className="rounded-xl border border-ft-border bg-ft-surface p-3"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-bold">{tee.name}</span>
                {tees.length > 1 && (
                  <button
                    onClick={() => handleRemoveTee(tee.name)}
                    className="text-ft-rose"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>

              <div className="mb-2 flex gap-2">
                <div className="flex-1">
                  <label className="text-[10px] text-ft-muted">
                    {t('courses.rating')}
                  </label>
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.1"
                    value={tee.rating}
                    onChange={(e) =>
                      handleRatingChange(ti, parseFloat(e.target.value) || 0)
                    }
                    className="w-full rounded border border-ft-border bg-ft-surface px-2 py-1 text-sm"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] text-ft-muted">
                    {t('courses.slope')}
                  </label>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={tee.slope}
                    onChange={(e) =>
                      handleSlopeChange(ti, parseInt(e.target.value) || 0)
                    }
                    className="w-full rounded border border-ft-border bg-ft-surface px-2 py-1 text-sm"
                  />
                </div>
              </div>

              <label className="text-[10px] text-ft-muted">
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
                    <span className="text-[9px] text-ft-muted">{hi + 1}</span>
                    <input
                      type="number"
                      inputMode="numeric"
                      min={3}
                      max={6}
                      value={par}
                      onChange={(e) =>
                        handleParChange(ti, hi, parseInt(e.target.value))
                      }
                      className="w-full rounded border border-ft-border bg-ft-surface py-0.5 text-center text-xs"
                    />
                  </div>
                ))}
              </div>
              <p className="mt-1 text-[10px] text-ft-muted">
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
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col px-4 pt-[calc(env(safe-area-inset-top,0px)+1.5rem)]">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 flex items-center justify-between"
      >
        <div>
          <Link
            href="/"
            className="mb-1 inline-flex items-center gap-1 text-sm text-ft-muted"
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
          className="flex items-center gap-1 rounded-xl bg-ft-green px-4 py-2 text-sm font-bold text-white"
        >
          <Plus size={18} />
          {t('courses.addCourse')}
        </button>
      </motion.div>

      <button
        onClick={handleImport}
        disabled={importing}
        className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-ft-border bg-ft-surface py-2.5 text-sm font-medium text-ft-muted transition-colors hover:bg-ft-surface"
      >
        <Download size={16} className={importing ? 'animate-bounce' : ''} />
        {importing ? t('courses.importing') : t('courses.importRfeg')}
      </button>

      {importMsg && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-3 text-center text-sm text-ft-green-bright"
        >
          {importMsg}
        </motion.p>
      )}


      {courses.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-ft-border py-12 text-center">
          <MapPin size={40} className="text-ft-muted" />
          <p className="text-sm text-ft-muted">{t('courses.noCourses')}</p>
          <button
            onClick={() => setAdding(true)}
            className="text-sm font-medium text-ft-green-bright"
          >
            {t('courses.addFirst')}
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {courses.map((course) => (
            <div
              key={course.id}
              className="relative overflow-hidden rounded-xl border border-ft-border"
            >
              {course.imageUrl && (
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${course.imageUrl})` }}
                />
              )}
              <div className={`relative p-3 ${course.imageUrl ? 'bg-gradient-to-r from-black/70 to-black/40' : 'bg-ft-surface'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-base font-bold ${course.imageUrl ? 'text-white' : ''}`}>{course.name}</p>
                    <p className={`text-xs ${course.imageUrl ? 'text-white/70' : 'text-ft-muted'}`}>
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
                      className={`rounded-lg p-2 ${course.imageUrl ? 'text-white/70 hover:bg-white/10' : 'text-ft-muted hover:bg-ft-surface'}`}
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => deleteCourse(course.id)}
                      className="rounded-lg p-2 text-ft-rose hover:bg-ft-rose/10"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className={`mt-1 flex flex-wrap gap-1 ${course.imageUrl ? 'text-white/70' : ''}`}>
                  {course.tees.map((tee) => (
                    <span
                      key={tee.name}
                      className={`rounded-full px-2 py-0.5 text-[10px] ${course.imageUrl ? 'bg-white/20 text-white/90' : 'bg-ft-surface text-ft-muted'}`}
                    >
                      {tee.name} (R:{tee.rating} S:{tee.slope})
                    </span>
                  ))}
                </div>
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
              <div               className="h-8 w-8 animate-spin rounded-full border-2 border-ft-green-bright border-t-transparent" />
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

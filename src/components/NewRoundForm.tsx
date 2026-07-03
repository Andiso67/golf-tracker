'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useStore } from '@/store/useStore';
import {
  DEFAULT_TEES,
  DEFAULT_PARS_18,
  DEFAULT_PARS_9,
  GAME_MODES,
  isTeamMode,
  playerFullName,
  type GameMode,
  type Format,
} from '@/types';
import type { SavedCourse, CourseTee, Player } from '@/types';
import { useTranslation } from '@/i18n/useTranslation';
import { ChevronDown, MapPin, Plus, User, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function NewRoundForm() {
  const router = useRouter();
  const courses = useStore((s) => s.courses);
  const allPlayers = useStore((s) => s.players);
  const activePlayer = useStore((s) => s.player);
  const startRound = useStore((s) => s.startRound);
  const addPlayer = useStore((s) => s.addPlayer);
  const { t } = useTranslation();

  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [showCoursePicker, setShowCoursePicker] = useState(false);
  const [courseFilter, setCourseFilter] = useState('');
  const [customCourseName, setCustomCourseName] = useState('');
  const [format, setFormat] = useState<Format>('individual');
  const [gameMode, setGameMode] = useState<GameMode>('stroke-play');
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([activePlayer?.id || '']);
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [showPlayerPicker, setShowPlayerPicker] = useState(false);
  const [showNewPlayerForm, setShowNewPlayerForm] = useState(false);
  const [npFirstName, setNpFirstName] = useState('');
  const [npLastName1, setNpLastName1] = useState('');
  const [npLastName2, setNpLastName2] = useState('');
  const [npLicenseNumber, setNpLicenseNumber] = useState('');

  const [selectedTee, setSelectedTee] = useState<string | null>(null);
  const [totalHoles, setTotalHoles] = useState<9 | 18>(18);
  const [parInputs, setParInputs] = useState<number[]>(DEFAULT_PARS_18);
  const [customPars, setCustomPars] = useState(false);

  const filteredGameModes = GAME_MODES.filter((gm) => gm.formats.includes(format))

  const isPlayerCountValid = (() => {
    if (format === 'individual') return selectedPlayerIds.length >= 1 && selectedPlayerIds.length <= 4
    if (format === 'parejas') return selectedPlayerIds.length === 2 || selectedPlayerIds.length === 4
    return selectedPlayerIds.length >= 1
  })()

  const selectedCourse = selectedCourseId
    ? courses.find((c) => c.id === selectedCourseId)
    : undefined;

  const filteredCourses = courseFilter
    ? courses.filter((c) =>
        c.name.toLowerCase().includes(courseFilter.toLowerCase())
      )
    : courses;

  const getSelectedPlayers = (): Player[] => {
    return selectedPlayerIds
      .map((id) => allPlayers.find((p) => p.id === id))
      .filter((p): p is Player => p !== undefined);
  };

  const handleSelectCourse = (course: SavedCourse) => {
    setSelectedCourseId(course.id);
    setCustomCourseName('');
    setSelectedTee(course.tees[0]?.name || null);
    setTotalHoles(course.tees[0]?.totalHoles || 18);
    if (course.tees[0]) {
      setParInputs([...course.tees[0].pars]);
    }
    setShowCoursePicker(false);
    setCourseFilter('');
    setCustomPars(false);
  };

  const handleAddPlayer = () => {
    if (!selectedPlayer || selectedPlayerIds.includes(selectedPlayer)) return;
    if (format === 'individual' && selectedPlayerIds.length >= 4) return;
    if (format === 'parejas' && selectedPlayerIds.length >= 4) return;
    setSelectedPlayerIds((prev) => [...prev, selectedPlayer]);
    setSelectedPlayer('');
  };

  const handleRemovePlayer = (id: string) => {
    setSelectedPlayerIds((prev) => prev.filter((pid) => pid !== id));
  };

  const handleCreatePlayer = () => {
    if (!npFirstName.trim()) return;
    const id = addPlayer(npFirstName.trim(), npLastName1.trim(), npLastName2.trim(), npLicenseNumber.trim());
    setSelectedPlayerIds((prev) => [...prev, id]);
    setNpFirstName('');
    setNpLastName1('');
    setNpLastName2('');
    setNpLicenseNumber('');
    setShowNewPlayerForm(false);
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
    setCourseFilter('');
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

    const players = getSelectedPlayers();
    if (players.length === 0) return;

    const teeColor = selectedCourseId && selectedTee ? selectedTee : DEFAULT_TEES[2].name;
    const id = startRound(
      courseName,
      teeColor,
      totalHoles,
      customPars ? parInputs : undefined,
      selectedCourseId || undefined,
      gameMode,
      players
    );
    router.push(`/round/${id}`);
  };

  const totalPar = parInputs.reduce((s, v) => s + v, 0);
  const courseName = selectedCourse
    ? selectedCourse.name
    : customCourseName;
  const selectedPlayers = getSelectedPlayers();
  const canStart = courseName.trim().length > 0 && selectedPlayers.length > 0 && isPlayerCountValid;

  const availableTees = selectedCourse
    ? selectedCourse.tees
    : [];
  const activeTeeObj = availableTees.find((t) => t.name === selectedTee);

  return (
    <div className="space-y-5">
      {/* Format */}
      <div>
        <label className="mb-1 block text-sm font-medium text-ft-muted">
          {t('newRound.format')}
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(['individual', 'parejas', 'equipos'] as Format[]).map((f) => (
            <button
              key={f}
              onClick={() => {
                setFormat(f)
                const firstMode = GAME_MODES.find((gm) => gm.formats.includes(f))
                if (firstMode) setGameMode(firstMode.mode)
              }}
              className={`rounded-xl p-2.5 text-left transition-all active:scale-95 ${
                format === f
                  ? 'bg-ft-green text-white shadow-sm'
                  : 'border border-ft-border bg-ft-surface border-ft-border bg-ft-card'
              }`}
            >
              <span className="block text-xs font-bold">{t(`newRound.${f}`)}</span>
              <span className={`block text-[10px] ${format === f ? 'text-white/70' : 'text-ft-muted'}`}>
                {t(`newRound.${f}Desc`)}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Game Mode */}
      <div>
        <label className="mb-1 block text-sm font-medium text-ft-muted">
          {t('newRound.gameMode')}
        </label>
        <div className="grid grid-cols-2 gap-2">
          {filteredGameModes.map(({ mode, labelKey, descKey }) => (
            <button
              key={mode}
              onClick={() => setGameMode(mode)}
              className={`rounded-xl p-2.5 text-left transition-all active:scale-95 ${
                gameMode === mode
                  ? 'bg-ft-green text-white shadow-sm'
                  : 'border border-ft-border bg-ft-surface border-ft-border bg-ft-card'
              }`}
            >
              <span className="block text-xs font-bold">{t(labelKey)}</span>
              <span className={`block text-[10px] ${gameMode === mode ? 'text-white/70' : 'text-ft-muted'}`}>
                {t(descKey)}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Player Selection */}
      <div>
        <label className="mb-1 block text-sm font-medium text-ft-muted">
          {t('newRound.playerSelect')}
        </label>
        <div className="flex gap-2">
          <select
            value={selectedPlayer}
            onChange={(e) => setSelectedPlayer(e.target.value)}
            className="flex-1 rounded-lg border border-ft-border bg-ft-surface px-3 py-2 text-sm focus:border-ft-green focus:outline-none focus:ring-2 focus:ring-ft-green/20 border-ft-border bg-ft-surface"
          >
            <option value="">{t('newRound.selectPlayer')}</option>
            {allPlayers
              .filter((p) => !selectedPlayerIds.includes(p.id))
              .map((p) => (
                <option key={p.id} value={p.id}>{playerFullName(p)}</option>
              ))}
          </select>
          <button
            onClick={() => {
              if (selectedPlayer) {
                handleAddPlayer();
              } else {
                setShowNewPlayerForm(!showNewPlayerForm);
              }
            }}
            disabled={!!selectedPlayer && ((format === 'individual' && selectedPlayerIds.length >= 4) || (format === 'parejas' && selectedPlayerIds.length >= 4))}
            className="shrink-0 rounded-lg bg-ft-green px-4 py-2 text-xs font-bold text-white transition-all active:scale-95 disabled:cursor-not-allowed disabled:bg-ft-surface disabled:text-ft-muted"
          >
            {selectedPlayer ? t('players.addPlayer') : <><Plus size={16} /> {t('players.addPlayer')}</>}
          </button>
        </div>

        {selectedPlayerIds.length > 0 && (
          <div className="mt-2 space-y-1">
            {selectedPlayerIds.map((id) => {
              const p = allPlayers.find((pl) => pl.id === id);
              if (!p) return null;
              return (
                <div key={id} className="flex items-center justify-between rounded-lg bg-ft-surface px-3 py-2 bg-ft-surface">
                  <span className="text-sm font-medium">{playerFullName(p)}</span>
                  <button
                    onClick={() => handleRemovePlayer(id)}
                    className="text-ft-muted transition-colors hover:text-ft-rose"
                  >
                    <X size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <AnimatePresence>
          {showNewPlayerForm && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-2 overflow-hidden"
            >
              <div className="rounded-xl border border-ft-border bg-ft-card p-3">
                <input
                  type="text"
                  value={npFirstName}
                  onChange={(e) => setNpFirstName(e.target.value)}
                  placeholder={t('players.firstNamePlaceholder')}
                  className="mb-2 w-full rounded-lg border border-ft-border bg-ft-surface px-3 py-2 text-sm focus:border-ft-green focus:outline-none focus:ring-2 focus:ring-ft-green/20"
                  autoFocus
                />
                <input
                  type="text"
                  value={npLastName1}
                  onChange={(e) => setNpLastName1(e.target.value)}
                  placeholder={t('players.lastName1Placeholder')}
                  className="mb-2 w-full rounded-lg border border-ft-border bg-ft-surface px-3 py-2 text-sm focus:border-ft-green focus:outline-none focus:ring-2 focus:ring-ft-green/20"
                />
                <input
                  type="text"
                  value={npLastName2}
                  onChange={(e) => setNpLastName2(e.target.value)}
                  placeholder={t('players.lastName2Placeholder')}
                  className="mb-2 w-full rounded-lg border border-ft-border bg-ft-surface px-3 py-2 text-sm focus:border-ft-green focus:outline-none focus:ring-2 focus:ring-ft-green/20"
                />
                <input
                  type="text"
                  value={npLicenseNumber}
                  onChange={(e) => setNpLicenseNumber(e.target.value)}
                  placeholder={t('players.licenseNumber')}
                  className="mb-3 w-full rounded-lg border border-ft-border bg-ft-surface px-3 py-2 text-sm focus:border-ft-green focus:outline-none focus:ring-2 focus:ring-ft-green/20"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleCreatePlayer}
                    disabled={!npFirstName.trim()}
                    className="flex-1 rounded-lg bg-ft-green py-2 text-xs font-bold text-white transition-all active:scale-95 disabled:cursor-not-allowed disabled:bg-ft-surface disabled:text-ft-label"
                  >
                    {t('players.save')}
                  </button>
                  <button
                    onClick={() => setShowNewPlayerForm(false)}
                    className="rounded-lg border border-ft-border px-4 py-2 text-xs font-medium text-ft-muted transition-all active:scale-95"
                  >
                    {t('players.cancel')}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {format === 'parejas' && selectedPlayerIds.length > 0 && selectedPlayerIds.length !== 2 && selectedPlayerIds.length !== 4 && (
          <p className="mt-1 text-[10px] text-ft-amber">
            {t('newRound.addSecondPlayer')}
          </p>
        )}
      </div>

      {/* Course */}
      <div>
        <label className="mb-1 block text-sm font-medium text-ft-muted">
          {t('newRound.courseName')}
        </label>

        <button
          onClick={() => {
            setShowCoursePicker(!showCoursePicker);
            if (!showCoursePicker) setCourseFilter('');
          }}
          className="relative flex w-full items-center justify-between overflow-hidden rounded-xl border border-ft-border px-4 py-3 text-left text-lg"
        >
          {selectedCourse?.imageUrl && (
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${selectedCourse.imageUrl})` }}
            />
          )}
          <span
            className={
              selectedCourse?.imageUrl ? 'relative text-white' : courseName ? 'text-ft-text' : 'text-ft-label'
            }
          >
            {courseName || t('newRound.selectCourse')}
          </span>
          <ChevronDown size={18} className={selectedCourse?.imageUrl ? 'relative text-white/70' : 'text-ft-muted'} />
        </button>

        {showCoursePicker && (
          <div className="mt-2 rounded-xl border border-ft-border bg-ft-surface p-2 border-ft-border bg-ft-card">
            <input
              type="text"
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              placeholder={t('newRound.selectCourse')}
              className="mb-2 w-full rounded-lg border border-ft-border bg-ft-surface px-3 py-2 text-sm focus:border-ft-green focus:outline-none focus:ring-2 focus:ring-ft-green/20 border-ft-border bg-ft-surface"
              autoFocus
            />
            {filteredCourses.map((course) => (
              <button
                key={course.id}
                onClick={() => handleSelectCourse(course)}
                className={`relative flex w-full items-center gap-3 overflow-hidden rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                  selectedCourseId === course.id
                    ? 'bg-ft-green/10 text-ft-green-bright'
                    : 'hover:bg-ft-surface'
                }`}
              >
                {course.imageUrl && (
                  <div
                    className="absolute inset-0 bg-cover bg-center opacity-30"
                    style={{ backgroundImage: `url(${course.imageUrl})` }}
                  />
                )}
                <MapPin
                  size={16}
                  className="relative shrink-0 text-ft-muted"
                />
                <div className="relative">
                  <p className="font-medium">{course.name}</p>
                  <p className="text-[11px] text-ft-muted">
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
                  ? 'bg-ft-green/10 text-ft-green-bright bg-ft-green/10'
                  : 'hover:bg-ft-surface hover:bg-ft-surface'
              }`}
            >
              <Plus size={16} className="shrink-0 text-ft-muted" />
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
            className="mt-2 w-full rounded-xl border border-ft-border bg-ft-surface px-4 py-3 text-lg placeholder-ft-muted focus:border-ft-green focus:outline-none focus:ring-2 focus:ring-ft-green/20 border-ft-border bg-ft-card"
          />
        )}

        {!selectedCourseId && (
          <Link
            href="/courses"
            className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-ft-green-bright text-ft-green-bright"
          >
            <Plus size={14} />
            {t('newRound.saveCourse')}
          </Link>
        )}
      </div>

      {selectedCourseId && (
        <div>
          <label className="mb-1 block text-sm font-medium text-ft-muted">
            {t('newRound.teeColor')}
          </label>
          <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-5">
            {availableTees.map((tee) => (
              <button
                key={tee.name}
                onClick={() => handleSelectTee(tee)}
                className={`rounded-lg py-2 text-xs font-medium transition-all active:scale-95 ${
                  selectedTee === tee.name
                    ? 'bg-ft-green text-white shadow-sm'
                    : 'border border-ft-border bg-ft-surface text-ft-muted border-ft-border bg-ft-card'
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
            <p className="mt-1 text-xs text-ft-muted">
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
            <label className="mb-1 block text-sm font-medium text-ft-muted">
              {t('newRound.numHoles')}
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => handleHoleCountChange(9)}
                className={`flex-1 rounded-xl py-3 text-base font-bold transition-all active:scale-95 ${
                  totalHoles === 9
                    ? 'bg-ft-green text-white shadow-sm'
                    : 'border border-ft-border bg-ft-surface text-ft-muted border-ft-border bg-ft-card'
                }`}
              >
                {t('newRound.holes9')}
              </button>
              <button
                onClick={() => handleHoleCountChange(18)}
                className={`flex-1 rounded-xl py-3 text-base font-bold transition-all active:scale-95 ${
                  totalHoles === 18
                    ? 'bg-ft-green text-white shadow-sm'
                    : 'border border-ft-border bg-ft-surface text-ft-muted border-ft-border bg-ft-card'
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
                className="text-sm font-medium text-ft-green-bright text-ft-green-bright"
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
                  <label className="mb-1 block text-sm font-medium text-ft-muted">
                    {t('newRound.parPerHole')}
                  </label>
                  <div className="grid grid-cols-9 gap-1">
                    {parInputs.map((par, i) => (
                      <div key={i} className="text-center">
                        <p className="text-[10px] text-ft-muted">#{i + 1}</p>
                        <input
                          type="number"
                          min={3}
                          max={6}
                          value={par}
                          onChange={(e) =>
                            handleParChange(i, parseInt(e.target.value))
                          }
                          className="w-full rounded border border-ft-border bg-ft-surface py-1 text-center text-sm border-ft-border bg-ft-surface"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="mt-1 flex items-center justify-between">
                    <p className="text-xs text-ft-muted">
                      {t('newRound.totalPar', { par: totalPar })}
                    </p>
                    <button
                      onClick={() => setCustomPars(false)}
                      className="text-xs font-medium text-ft-green-bright text-ft-green-bright"
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
            ? 'bg-ft-green text-white shadow-sm hover:bg-ft-green/90'
            : 'cursor-not-allowed bg-ft-surface text-ft-label bg-ft-surface'
        }`}
      >
        {t('newRound.startRound')}
      </button>
    </div>
  );
}

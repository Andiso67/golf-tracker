'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  User,
  Plus,
  Trash2,
  Pencil,
  Check,
  X,
  Save,
  Users,
  MapPin,
  Flag,
  Search,
} from 'lucide-react';
import Link from 'next/link';
import BottomNav from '@/components/BottomNav';
import { useStore } from '@/store/useStore';
import { useTranslation } from '@/i18n/useTranslation';
import { playerFullName } from '@/types';
import type { Player } from '@/types';

function PlayerAvatar({ firstName, size = 'md' }: { firstName: string; size?: 'md' | 'lg' }) {
  const initial = firstName?.charAt(0)?.toUpperCase() || '?';
  const sizeClass = size === 'lg' ? 'h-14 w-14 text-xl' : 'h-10 w-10 text-sm';
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full bg-ft-green/10 font-bold text-ft-green-bright ${sizeClass}`}
    >
      {initial}
    </div>
  );
}

export default function PlayersPage() {
  const { t } = useTranslation();
  const players = useStore((s) => s.players);
  const activePlayerId = useStore((s) => s.activePlayerId);
  const addPlayer = useStore((s) => s.addPlayer);
  const updatePlayer = useStore((s) => s.updatePlayer);
  const player = useStore((s) => s.player);
  const courses = useStore((s) => s.courses);
  const setPlayer = useStore((s) => s.setPlayer);
  const deletePlayer = useStore((s) => s.deletePlayer);
  const userEmail = useStore((s) => s.userEmail);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [search, setSearch] = useState('');

  const currentPlayerId = player?.id || activePlayerId;

  useEffect(() => {
    if (!currentPlayerId) return;
    Promise.all([
      fetch('/api/players').then((r) => (r.ok ? r.json() : [])),
      fetch('/api/rounds').then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([apiPlayers, rounds]) => {
        const usedIds = new Set<string>();
        usedIds.add(currentPlayerId);
        for (const r of rounds) {
          const hasCurrent = (r.players || []).some(
            (p: any) => p.playerId === currentPlayerId
          );
          if (hasCurrent) {
            for (const p of r.players || []) {
              usedIds.add(p.playerId);
            }
          }
        }
        setAllPlayers(
          (apiPlayers as Player[]).filter((p) => usedIds.has(p.id))
        );
      })
      .catch(() => {});
  }, [currentPlayerId]);

  const [formFirstName, setFormFirstName] = useState('');
  const [formLastName1, setFormLastName1] = useState('');
  const [formLastName2, setFormLastName2] = useState('');
  const [formHandicap, setFormHandicap] = useState('');
  const [formHomeCourse, setFormHomeCourse] = useState('');
  const [formLicenseNumber, setFormLicenseNumber] = useState('');

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [verifyState, setVerifyState] = useState<'idle' | 'loading' | 'valid' | 'mismatch' | 'notfound' | 'error'>('idle');
  const [verifyResult, setVerifyResult] = useState<{ rfegName: string; handicap: string } | null>(null);

  const verifyLicense = async () => {
    if (!formLicenseNumber.trim() || !formFirstName.trim()) return;
    setVerifyState('loading');
    setVerifyResult(null);
    try {
      const res = await fetch('/api/rfeg/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          licenseNumber: formLicenseNumber.trim(),
          firstName: formFirstName.trim(),
          lastName1: formLastName1.trim(),
          lastName2: formLastName2.trim(),
        }),
      });
      if (res.status === 404) {
        setVerifyState('notfound');
        return;
      }
      if (!res.ok) {
        setVerifyState('error');
        return;
      }
      const data = await res.json();
      setVerifyResult({ rfegName: data.rfegName, handicap: data.handicap });
      setVerifyState(data.match ? 'valid' : 'mismatch');
      if (data.match) setFormHandicap(data.handicap);
    } catch {
      setVerifyState('error');
    }
  };

  const resetForm = () => {
    setFormFirstName('');
    setFormLastName1('');
    setFormLastName2('');
    setFormHandicap('');
    setFormHomeCourse('');
    setFormLicenseNumber('');
    setEditingId(null);
    setShowAddForm(false);
    setVerifyState('idle');
    setVerifyResult(null);
  };

  const startEdit = (p: Player) => {
    setEditingId(p.id);
    setFormFirstName(p.firstName);
    setFormLastName1(p.lastName1);
    setFormLastName2(p.lastName2);
    setFormHandicap(p.handicap.toString());
    setFormHomeCourse(p.homeCourse);
    setFormLicenseNumber(p.licenseNumber || '');
    setShowAddForm(true);
    setVerifyState('idle');
    setVerifyResult(null);
  };

  const handleSave = () => {
    if (!formFirstName.trim()) return;
    if (editingId) {
      const p = players.find((pl) => pl.id === editingId);
      if (p) {
        const updated = {
          ...p,
          firstName: formFirstName.trim(),
          lastName1: formLastName1.trim(),
          lastName2: formLastName2.trim(),
          handicap: parseFloat(formHandicap) || 0,
          homeCourse: formHomeCourse,
          licenseNumber: formLicenseNumber.trim(),
        };
        setPlayer(updated);
        fetch('/api/players', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updated),
        })
          .then((r) => (r.ok ? r.json() : null))
          .then((result) => {
            if (result) {
              setAllPlayers((prev) => prev.map((pl) => (pl.id === result.id ? result : pl)));
            }
          })
          .catch(() => {});
      }
    } else {
      const id = addPlayer(formFirstName.trim(), formLastName1.trim(), formLastName2.trim(), formLicenseNumber.trim(), '');
      const created = {
        id,
        email: '',
        firstName: formFirstName.trim(),
        lastName1: formLastName1.trim(),
        lastName2: formLastName2.trim(),
        handicap: parseFloat(formHandicap) || 0,
        homeCourse: formHomeCourse,
        licenseNumber: formLicenseNumber.trim(),
      };
      fetch('/api/players', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(created),
      })
        .then((r) => (r.ok ? r.json() : null))
        .then((result) => {
          if (result) setAllPlayers((prev) => [...prev, result]);
        })
        .catch(() => {});
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
    resetForm();
  };

  const handleDelete = (id: string) => {
    deletePlayer(id);
    setAllPlayers((prev) => prev.filter((p) => p.id !== id));
    setDeleteConfirmId(null);
  };

  const query = search.toLowerCase().trim();
  const filteredPlayers = allPlayers.filter(
    (p) =>
      !query ||
      p.firstName.toLowerCase().includes(query) ||
      p.lastName1.toLowerCase().includes(query) ||
      p.lastName2.toLowerCase().includes(query) ||
      (p.email || '').toLowerCase().includes(query) ||
      (p.homeCourse || '').toLowerCase().includes(query)
  );
  const sortedPlayers = [...filteredPlayers].sort((a, b) => {
    if (a.id === activePlayerId) return -1;
    if (b.id === activePlayerId) return 1;
    return playerFullName(a).localeCompare(playerFullName(b));
  });

  return (
    <>
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col px-4 pt-[calc(env(safe-area-inset-top,0px)+1.5rem)]">
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-6"
      >
        <Link
          href="/"
          className="mb-3 inline-flex items-center gap-1 text-sm text-ft-muted"
        >
          <ArrowLeft size={16} />
          {t('players.back')}
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">
            {t('players.title')}
          </h1>
          <p className="text-sm text-ft-muted">{t('players.subtitle')}</p>
        </motion.div>

        {player && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 rounded-xl border border-ft-green/20 bg-ft-green/10 p-4"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-ft-green text-lg font-bold text-white">
                {player.firstName?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium uppercase tracking-wider text-ft-green-bright">
                  {t('players.currentSession')}
                </p>
                <p className="text-base font-bold">{playerFullName(player)}</p>
              </div>
              <Check size={20} className="text-ft-green-bright" />
            </div>
          </motion.div>
        )}

        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-medium text-ft-muted">
            {t('players.playerCount', { count: allPlayers.length })}
          </p>
          <button
            onClick={() => {
              resetForm();
              setShowAddForm(true);
            }}
            className="flex items-center gap-1 text-sm font-medium text-ft-green-bright"
          >
            <Plus size={16} />
            {t('players.addPlayer')}
          </button>
        </div>

        <div className="relative mb-3">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ft-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('players.searchPlaceholder')}
            className="w-full rounded-xl border border-ft-border bg-ft-surface py-2.5 pl-9 pr-4 text-sm outline-none focus:border-ft-green focus:ring-2 focus:ring-ft-green/20"
          />
        </div>

        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-4 overflow-hidden"
            >
              <div className="rounded-xl border border-ft-border bg-ft-surface p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-bold">
                    {editingId ? t('players.editPlayer') : t('players.addPlayer')}
                  </h3>
                  <button
                    onClick={resetForm}
                    className="rounded-lg p-1 text-ft-muted hover:bg-ft-surface"
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="space-y-2.5">
                  <input
                    type="text"
                    value={formFirstName}
                    onChange={(e) => setFormFirstName(e.target.value)}
                    placeholder={t('players.firstNamePlaceholder')}
                    className="w-full rounded-lg border border-ft-border bg-ft-surface px-3 py-2 text-sm focus:border-ft-green focus:outline-none focus:ring-2 focus:ring-ft-green/20"
                    autoFocus
                  />
                  <input
                    type="text"
                    value={formLastName1}
                    onChange={(e) => setFormLastName1(e.target.value)}
                    placeholder={t('players.lastName1Placeholder')}
                    className="w-full rounded-lg border border-ft-border bg-ft-surface px-3 py-2 text-sm focus:border-ft-green focus:outline-none focus:ring-2 focus:ring-ft-green/20"
                  />
                  <input
                    type="text"
                    value={formLastName2}
                    onChange={(e) => setFormLastName2(e.target.value)}
                    placeholder={t('players.lastName2Placeholder')}
                    className="w-full rounded-lg border border-ft-border bg-ft-surface px-3 py-2 text-sm focus:border-ft-green focus:outline-none focus:ring-2 focus:ring-ft-green/20"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      autoComplete="off"
                      value={formLicenseNumber}
                      onChange={(e) => { setFormLicenseNumber(e.target.value); setVerifyState('idle'); setVerifyResult(null); }}
                      placeholder={t('players.licenseNumber')}
                      className="flex-1 rounded-lg border border-ft-border bg-ft-surface px-3 py-2 text-sm focus:border-ft-green focus:outline-none focus:ring-2 focus:ring-ft-green/20"
                    />
                    <button
                      onClick={verifyLicense}
                      disabled={verifyState === 'loading' || !formLicenseNumber.trim() || !formFirstName.trim()}
                      className={`shrink-0 rounded-lg px-3 py-2 text-xs font-bold transition-all active:scale-95 ${
                        verifyState === 'loading'
                          ? 'cursor-not-allowed bg-ft-surface text-ft-label'
                          : verifyState === 'valid'
                          ? 'bg-ft-green/10 text-ft-green-bright'
                          : verifyState === 'mismatch'
                          ? 'bg-ft-amber/10 text-ft-amber'
                          : 'bg-ft-surface text-ft-label hover:bg-ft-border'
                      }`}
                    >
                      {verifyState === 'loading' ? t('players.verifyingLicense') : t('players.verifyLicense')}
                    </button>
                  </div>
                  {verifyState === 'valid' && verifyResult && (
                    <p className="flex items-center gap-1 text-xs text-ft-green-bright">
                      <Check size={12} />
                      {t('players.licenseValid')} · {t('players.rfegName', { name: verifyResult.rfegName })} · {t('players.rfegHandicap', { handicap: verifyResult.handicap })}
                    </p>
                  )}
                  {verifyState === 'mismatch' && verifyResult && (
                    <p className="text-xs text-ft-amber">
                      {t('players.licenseMismatch')} · {t('players.rfegName', { name: verifyResult.rfegName })}
                    </p>
                  )}
                  {verifyState === 'notfound' && (
                    <p className="text-xs text-ft-rose">{t('players.licenseNotFound')}</p>
                  )}
                  {verifyState === 'error' && (
                    <p className="text-xs text-ft-rose">{t('players.licenseError')}</p>
                  )}
                  <div className="flex gap-2.5">
                    <div className="flex-1">
                        <input
                          type="number"
                          inputMode="decimal"
                          autoComplete="off"
                          value={formHandicap}
                          onChange={(e) => setFormHandicap(e.target.value)}
                          placeholder={t('players.handicap')}
                          step="0.1"
                          className="w-full rounded-lg border border-ft-border bg-ft-surface px-3 py-2 text-sm focus:border-ft-green focus:outline-none focus:ring-2 focus:ring-ft-green/20"
                        />
                    </div>
                    <div className="flex-1">
                      <select
                        value={formHomeCourse}
                        onChange={(e) => setFormHomeCourse(e.target.value)}
                        className="w-full rounded-lg border border-ft-border bg-ft-surface px-3 py-2 text-sm focus:border-ft-green focus:outline-none focus:ring-2 focus:ring-ft-green/20"
                      >
                        <option value="">{t('players.noCourse')}</option>
                        {courses.map((c) => (
                          <option key={c.id} value={c.name}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleSave}
                  disabled={!formFirstName.trim()}
                  className={`mt-3 flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-bold ${
                    formFirstName.trim()
                      ? 'bg-ft-green text-white'
                      : 'cursor-not-allowed bg-ft-surface text-ft-label'
                  }`}
                >
                  <Save size={16} />
                  {saved ? t('players.saved') : t('players.save')}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {sortedPlayers.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-ft-surface">
              <Users size={28} className="text-ft-label" />
            </div>
            <p className="text-sm text-ft-muted">{t('players.noPlayers')}</p>
            <button
              onClick={() => {
                resetForm();
                setShowAddForm(true);
              }}
              className="rounded-xl bg-ft-green px-4 py-2.5 text-sm font-bold text-white shadow-sm"
            >
              {t('players.addFirstPlayer')}
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {sortedPlayers.map((p) => {
                const isActive = p.id === activePlayerId;
                const isEditing = editingId === p.id;
                const isDeleting = deleteConfirmId === p.id;
                const isOwnPlayer = userEmail ? p.email?.toLowerCase() === userEmail.toLowerCase() : false;

                return (
                  <motion.div
                    key={p.id}
                    layout
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`rounded-xl border p-3 transition-colors ${
                      isActive
                        ? 'border-ft-green/20 bg-ft-green/10'
                        : 'border-ft-border bg-ft-surface'
                    }`}
                  >
                    {isDeleting ? (
                      <div className="flex flex-col items-center gap-3 py-2 text-center">
                        <p className="text-sm font-bold text-ft-rose">
                          {t('players.deleteConfirm')}
                        </p>
                        <p className="text-xs text-ft-muted">
                          {t('players.deleteWarning')}
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="rounded-lg border border-ft-border px-4 py-2 text-sm font-medium text-ft-label"
                          >
                            {t('players.cancel')}
                          </button>
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="rounded-lg bg-ft-rose px-4 py-2 text-sm font-bold text-white"
                          >
                            {t('players.delete')}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <PlayerAvatar firstName={p.firstName} />
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-sm font-bold">
                            {playerFullName(p)}
                            {isActive && (
                              <span className="ml-1.5 inline-flex items-center gap-0.5 rounded bg-ft-green/20 px-1.5 py-0.5 text-[9px] font-bold uppercase text-ft-green-bright">
                                <Check size={8} />
                                {t('players.activePlayer')}
                              </span>
                            )}
                          </p>
                          <p className="truncate text-xs text-ft-muted">
                            {p.handicap} HCP
                            {p.homeCourse ? ` · ${p.homeCourse}` : ''}
                            {p.licenseNumber ? ` · Lic: ${p.licenseNumber}` : ''}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
                          {isOwnPlayer && (
                            <button
                              onClick={() => startEdit(p)}
                              className="rounded-lg p-1.5 text-ft-muted hover:bg-ft-surface"
                            >
                              <Pencil size={14} />
                            </button>
                          )}
                          {isOwnPlayer && players.length > 1 && !isActive && (
                            <button
                              onClick={() => setDeleteConfirmId(p.id)}
                              className="rounded-lg p-1.5 text-ft-rose hover:bg-ft-rose/10"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
      <BottomNav />
    </>
  );
}

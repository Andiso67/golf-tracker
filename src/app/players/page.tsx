'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
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
      className={`flex shrink-0 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400 ${sizeClass}`}
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

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

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
      }
    } else {
      addPlayer(formFirstName.trim(), formLastName1.trim(), formLastName2.trim(), formLicenseNumber.trim());
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
    resetForm();
  };

  const handleDelete = (id: string) => {
    deletePlayer(id);
    setDeleteConfirmId(null);
  };

  const sortedPlayers = [...players].sort((a, b) => {
    if (a.id === activePlayerId) return -1;
    if (b.id === activePlayerId) return 1;
    return playerFullName(a).localeCompare(playerFullName(b));
  });

  return (
    <>
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col px-4 pt-[calc(env(safe-area-inset-top,0px)+1.5rem)]">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-2xl font-bold tracking-tight">
            {t('players.title')}
          </h1>
          <p className="text-sm text-zinc-500">{t('players.subtitle')}</p>
        </motion.div>

        {player && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950/30"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-lg font-bold text-white">
                {player.firstName?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  {t('players.currentSession')}
                </p>
                <p className="text-base font-bold">{playerFullName(player)}</p>
              </div>
              <Check size={20} className="text-emerald-500" />
            </div>
          </motion.div>
        )}

        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-medium text-zinc-500">
            {t('players.playerCount', { count: players.length })}
          </p>
          <button
            onClick={() => {
              resetForm();
              setShowAddForm(true);
            }}
            className="flex items-center gap-1 text-sm font-medium text-emerald-600 dark:text-emerald-400"
          >
            <Plus size={16} />
            {t('players.addPlayer')}
          </button>
        </div>

        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-4 overflow-hidden"
            >
              <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-bold">
                    {editingId ? t('players.editPlayer') : t('players.addPlayer')}
                  </h3>
                  <button
                    onClick={resetForm}
                    className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
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
                    className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100 dark:border-zinc-700 dark:bg-zinc-800"
                    autoFocus
                  />
                  <input
                    type="text"
                    value={formLastName1}
                    onChange={(e) => setFormLastName1(e.target.value)}
                    placeholder={t('players.lastName1Placeholder')}
                    className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100 dark:border-zinc-700 dark:bg-zinc-800"
                  />
                  <input
                    type="text"
                    value={formLastName2}
                    onChange={(e) => setFormLastName2(e.target.value)}
                    placeholder={t('players.lastName2Placeholder')}
                    className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100 dark:border-zinc-700 dark:bg-zinc-800"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      autoComplete="off"
                      value={formLicenseNumber}
                      onChange={(e) => { setFormLicenseNumber(e.target.value); setVerifyState('idle'); setVerifyResult(null); }}
                      placeholder={t('players.licenseNumber')}
                      className="flex-1 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100 dark:border-zinc-700 dark:bg-zinc-800"
                    />
                    <button
                      onClick={verifyLicense}
                      disabled={verifyState === 'loading' || !formLicenseNumber.trim() || !formFirstName.trim()}
                      className={`shrink-0 rounded-lg px-3 py-2 text-xs font-bold transition-all active:scale-95 ${
                        verifyState === 'loading'
                          ? 'cursor-not-allowed bg-zinc-100 text-zinc-300 dark:bg-zinc-800'
                          : verifyState === 'valid'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300'
                          : verifyState === 'mismatch'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300'
                          : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
                      }`}
                    >
                      {verifyState === 'loading' ? t('players.verifyingLicense') : t('players.verifyLicense')}
                    </button>
                  </div>
                  {verifyState === 'valid' && verifyResult && (
                    <p className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                      <Check size={12} />
                      {t('players.licenseValid')} · {t('players.rfegName', { name: verifyResult.rfegName })} · {t('players.rfegHandicap', { handicap: verifyResult.handicap })}
                    </p>
                  )}
                  {verifyState === 'mismatch' && verifyResult && (
                    <p className="text-xs text-amber-600 dark:text-amber-400">
                      {t('players.licenseMismatch')} · {t('players.rfegName', { name: verifyResult.rfegName })}
                    </p>
                  )}
                  {verifyState === 'notfound' && (
                    <p className="text-xs text-rose-600 dark:text-rose-400">{t('players.licenseNotFound')}</p>
                  )}
                  {verifyState === 'error' && (
                    <p className="text-xs text-rose-600 dark:text-rose-400">{t('players.licenseError')}</p>
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
                          className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100 dark:border-zinc-700 dark:bg-zinc-800"
                        />
                    </div>
                    <div className="flex-1">
                      <select
                        value={formHomeCourse}
                        onChange={(e) => setFormHomeCourse(e.target.value)}
                        className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100 dark:border-zinc-700 dark:bg-zinc-800"
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
                      ? 'bg-emerald-500 text-white'
                      : 'cursor-not-allowed bg-zinc-100 text-zinc-300 dark:bg-zinc-800'
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
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
              <Users size={28} className="text-zinc-300 dark:text-zinc-600" />
            </div>
            <p className="text-sm text-zinc-400">{t('players.noPlayers')}</p>
            <button
              onClick={() => {
                resetForm();
                setShowAddForm(true);
              }}
              className="rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-bold text-white shadow-sm"
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

                return (
                  <motion.div
                    key={p.id}
                    layout
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`rounded-xl border p-3 transition-colors ${
                      isActive
                        ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30'
                        : 'border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900'
                    }`}
                  >
                    {isDeleting ? (
                      <div className="flex flex-col items-center gap-3 py-2 text-center">
                        <p className="text-sm font-bold text-rose-600 dark:text-rose-400">
                          {t('players.deleteConfirm')}
                        </p>
                        <p className="text-xs text-zinc-400">
                          {t('players.deleteWarning')}
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 dark:border-zinc-700 dark:text-zinc-400"
                          >
                            {t('players.cancel')}
                          </button>
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="rounded-lg bg-rose-500 px-4 py-2 text-sm font-bold text-white"
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
                              <span className="ml-1.5 inline-flex items-center gap-0.5 rounded bg-emerald-200 px-1.5 py-0.5 text-[9px] font-bold uppercase text-emerald-700 dark:bg-emerald-800 dark:text-emerald-300">
                                <Check size={8} />
                                {t('players.activePlayer')}
                              </span>
                            )}
                          </p>
                          <p className="truncate text-xs text-zinc-400">
                            {p.handicap} HCP
                            {p.homeCourse ? ` · ${p.homeCourse}` : ''}
                            {p.licenseNumber ? ` · Lic: ${p.licenseNumber}` : ''}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
                          <button
                            onClick={() => startEdit(p)}
                            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                          >
                            <Pencil size={14} />
                          </button>
                          {players.length > 1 && !isActive && (
                            <button
                              onClick={() => setDeleteConfirmId(p.id)}
                              className="rounded-lg p-1.5 text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950"
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

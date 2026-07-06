'use client';

import { Suspense, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Save,
  Languages,
  User,
  MapPin,
  Users,
  ArrowRight,
  Settings as SettingsIcon,
  LogOut,
  Mail,
  ShieldCheck,
  ShieldAlert,
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  Loader2,
  UserCog,
} from 'lucide-react';
import Link from 'next/link';
import BottomNav from '@/components/BottomNav';
import ErrorBoundary from '@/components/ErrorBoundary';
import { useStore } from '@/store/useStore';
import { useTranslation } from '@/i18n/useTranslation';
import { useRouter } from 'next/navigation';

interface AuthUser {
  id: string;
  firstName: string;
  lastName1: string;
  lastName2: string;
  email: string;
  emailVerified: string | null;
  createdAt: string;
}

function UserManager({ currentUserId }: { currentUserId: string | null }) {
  const { t } = useTranslation();
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [fName, setFName] = useState('');
  const [l1, setL1] = useState('');
  const [l2, setL2] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/auth/users');
      if (res.ok) {
        const all = await res.json();
        setUsers(all.filter((u: AuthUser) => u.id === currentUserId));
      }
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchUsers() }, []);

  const resetForm = () => {
    setFName(''); setL1(''); setL2(''); setEmail('');
    setPassword(''); setEditingId(null); setShowForm(false);
  };

  const startEdit = (u: AuthUser) => {
    setEditingId(u.id); setFName(u.firstName); setL1(u.lastName1);
    setL2(u.lastName2); setEmail(u.email); setPassword(''); setShowForm(true);
  };

  const handleSave = async () => {
    if (!fName.trim() || !email.trim()) return;
    setSaving(true);
    try {
      if (editingId) {
        const body: Record<string, unknown> = {
          firstName: fName.trim(), lastName1: l1.trim(), lastName2: l2.trim(),
          email: email.trim(),
        };
        if (password) body.password = password;
        const res = await fetch(`/api/auth/users/${editingId}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
        });
        if (res.ok) fetchUsers();
      } else {
        await fetch('/api/auth/users', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ firstName: fName.trim(), lastName1: l1.trim(), lastName2: l2.trim(), email: email.trim(), password }),
        });
        fetchUsers();
      }
      resetForm();
    } catch {}
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/auth/users/${id}`, { method: 'DELETE' });
      if (res.ok) { fetchUsers(); setDeleteConfirmId(null); }
    } catch {}
  };

  if (loading) {
    return (
      <section className="flex items-center justify-center py-8">
        <Loader2 size={20} className="animate-spin text-ft-muted" />
      </section>
    );
  }

  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <UserCog size={18} className="text-ft-muted" />
        <h2 className="text-base font-bold text-ft-text">
          {t('settings.usersSection')}
        </h2>
      </div>

      <div className="rounded-xl border border-ft-border bg-ft-card">
        {users.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <UserCog size={28} className="text-ft-muted" />
            <p className="text-sm text-ft-muted">{t('users.noUsers')}</p>
            <button
              onClick={() => { resetForm(); setShowForm(true); }}
              className="flex items-center gap-1 rounded-lg bg-ft-green px-3 py-1.5 text-xs font-bold text-white"
            >
              <Plus size={14} />
              {t('users.addUser')}
            </button>
          </div>
        ) : (
            <div>
              <div className="border-b border-ft-border px-4 py-2.5">
                <p className="text-xs font-medium text-ft-muted">
                  {t('users.userCount', { count: users.length })}
                </p>
              </div>
            <div className="divide-y divide-ft-border">
              {users.map((u) => {
                const isEditing = editingId === u.id && showForm;
                const isDeleting = deleteConfirmId === u.id;
                return (
                  <div key={u.id} className="px-4 py-3">
                    {isDeleting ? (
                      <div className="flex flex-col items-center gap-2 py-2 text-center">
                        <p className="text-sm font-bold text-ft-rose">{t('users.deleteConfirm')}</p>
                        <p className="text-xs text-ft-muted">{t('users.deleteWarning')}</p>
                        <div className="flex gap-2">
                          <button onClick={() => setDeleteConfirmId(null)} className="rounded-lg border border-ft-border px-3 py-1.5 text-xs font-medium text-ft-muted">{t('users.cancel')}</button>
                          <button onClick={() => handleDelete(u.id)} className="rounded-lg bg-ft-rose px-3 py-1.5 text-xs font-bold text-white">{t('users.delete')}</button>
                        </div>
                      </div>
                    ) : isEditing ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-ft-muted">{t('users.editUser')}</p>
                          <button onClick={resetForm} className="rounded p-1 text-ft-muted hover:bg-ft-surface"><X size={14} /></button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <input type="text" value={fName} onChange={e => setFName(e.target.value)} placeholder={t('users.firstNamePlaceholder')} className="col-span-2 rounded-lg border border-ft-border bg-ft-surface px-3 py-2 text-sm outline-none focus:border-ft-green" />
                          <input type="text" value={l1} onChange={e => setL1(e.target.value)} placeholder={t('users.lastName1Placeholder')} className="rounded-lg border border-ft-border bg-ft-surface px-3 py-2 text-sm outline-none focus:border-ft-green" />
                          <input type="text" value={l2} onChange={e => setL2(e.target.value)} placeholder={t('users.lastName2Placeholder')} className="rounded-lg border border-ft-border bg-ft-surface px-3 py-2 text-sm outline-none focus:border-ft-green" />
                        </div>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={t('users.emailPlaceholder')} className="w-full rounded-lg border border-ft-border bg-ft-surface px-3 py-2 text-sm outline-none focus:border-ft-green" />
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder={t('users.leaveBlank')} className="w-full rounded-lg border border-ft-border bg-ft-surface px-3 py-2 text-sm outline-none focus:border-ft-green" />
                        <button
                          onClick={handleSave}
                          disabled={saving || !fName.trim() || !email.trim()}
                          className="flex w-full items-center justify-center gap-1 rounded-lg bg-ft-green py-2 text-xs font-bold text-white disabled:opacity-50"
                        >
                          {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                          {t('users.save')}
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ft-surface text-xs font-bold text-ft-muted">
                          {u.firstName?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold">{u.firstName} {u.lastName1}</p>
                          <p className="truncate text-xs text-ft-muted">{u.email}</p>
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
                          <button onClick={() => startEdit(u)} className="rounded-lg p-1.5 text-ft-muted hover:bg-ft-surface"><Pencil size={14} /></button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showForm && !editingId && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-2 overflow-hidden"
          >
            <div className="rounded-xl border border-ft-border bg-ft-card p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-bold">{t('users.addUser')}</h3>
                <button onClick={resetForm} className="rounded-lg p-1 text-ft-muted hover:bg-ft-surface"><X size={16} /></button>
              </div>
              <div className="space-y-2.5">
                <input type="text" value={fName} onChange={e => setFName(e.target.value)} placeholder={t('users.firstNamePlaceholder')} className="w-full rounded-lg border border-ft-border bg-ft-surface px-3 py-2 text-sm outline-none focus:border-ft-green" autoFocus />
                <div className="grid grid-cols-2 gap-2.5">
                  <input type="text" value={l1} onChange={e => setL1(e.target.value)} placeholder={t('users.lastName1Placeholder')} className="rounded-lg border border-ft-border bg-ft-surface px-3 py-2 text-sm outline-none focus:border-ft-green" />
                  <input type="text" value={l2} onChange={e => setL2(e.target.value)} placeholder={t('users.lastName2Placeholder')} className="rounded-lg border border-ft-border bg-ft-surface px-3 py-2 text-sm outline-none focus:border-ft-green" />
                </div>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={t('users.emailPlaceholder')} className="w-full rounded-lg border border-ft-border bg-ft-surface px-3 py-2 text-sm outline-none focus:border-ft-green" />
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder={t('users.passwordPlaceholder')} className="w-full rounded-lg border border-ft-border bg-ft-surface px-3 py-2 text-sm outline-none focus:border-ft-green" />
              </div>
              <button onClick={handleSave} disabled={saving || !fName.trim() || !email.trim() || !password} className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-ft-green py-2.5 text-sm font-bold text-white disabled:opacity-50">
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                {t('users.addUser')}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function SettingsContent() {
  const router = useRouter();
  const { t } = useTranslation();
  const player = useStore((s) => s.player);
  const courses = useStore((s) => s.courses);
  const setPlayer = useStore((s) => s.setPlayer);
  const storeLanguage = useStore((s) => s.language);
  const setLanguage = useStore((s) => s.setLanguage);
  const logout = useStore((s) => s.logout);
  const userEmail = useStore((s) => s.userEmail);
  const userEmailVerified = useStore((s) => s.userEmailVerified);
  const currentUserId = useStore((s) => s.auth.currentUserId);
  const [loggingOut, setLoggingOut] = useState(false);

  const [firstName, setFirstName] = useState('');
  const [lastName1, setLastName1] = useState('');
  const [lastName2, setLastName2] = useState('');
  const [homeCourse, setHomeCourse] = useState('');
  const [email, setEmail] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (player) {
      setFirstName(player.firstName || '');
      setLastName1(player.lastName1 || '');
      setLastName2(player.lastName2 || '');
      setHomeCourse(player.homeCourse || '');
      setEmail(player.email || '');
    }
  }, [player?.id]);

  const handleSaveProfile = async () => {
    const updated = {
      id: player?.id || Date.now().toString(),
      email: player?.email || '',
      firstName: firstName.trim() || 'Golfer',
      lastName1: lastName1.trim(),
      lastName2: lastName2.trim(),
      handicap: player?.handicap || 0,
      homeCourse,
      licenseNumber: player?.licenseNumber || '',
    };
    setPlayer(updated);

    if (currentUserId) {
      try {
        await fetch(`/api/auth/users/${currentUserId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firstName: updated.firstName,
            lastName1: updated.lastName1,
            lastName2: updated.lastName2,
          }),
        })
      } catch {}
    }

    if (player?.id) {
      try {
        await fetch('/api/players', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updated),
        })
      } catch {}
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col px-4 pt-[calc(env(safe-area-inset-top,0px)+1.5rem)]">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <Link href="/" className="mb-3 inline-flex items-center gap-1 text-sm text-ft-muted">
          <ArrowLeft size={16} />
          Back
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">
          {t('settings.title')}
        </h1>
        <p className="text-sm text-ft-muted">{t('settings.subtitle')}</p>
      </motion.div>

      <div className="space-y-6">
        {/* Profile Section */}
        <section>
          <div className="mb-3 flex items-center gap-2">
            <User size={18} className="text-ft-muted" />
            <h2 className="text-base font-bold text-ft-text">
              {t('settings.profileSection')}
            </h2>
          </div>
          <div className="space-y-3 rounded-xl border border-ft-border bg-ft-card p-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-ft-muted">
                {t('profile.firstName')}
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder={t('profile.firstNamePlaceholder')}
                className="w-full rounded-xl border border-ft-border bg-ft-surface px-4 py-3 text-lg placeholder:text-ft-label focus:border-ft-green focus:outline-none focus:ring-2 focus:ring-ft-green/20"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ft-muted">
                {t('profile.lastName1')}
              </label>
              <input
                type="text"
                value={lastName1}
                onChange={(e) => setLastName1(e.target.value)}
                placeholder={t('profile.lastName1Placeholder')}
                className="w-full rounded-xl border border-ft-border bg-ft-surface px-4 py-3 text-lg placeholder:text-ft-label focus:border-ft-green focus:outline-none focus:ring-2 focus:ring-ft-green/20"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ft-muted">
                {t('profile.lastName2')}
              </label>
              <input
                type="text"
                value={lastName2}
                onChange={(e) => setLastName2(e.target.value)}
                placeholder={t('profile.lastName2Placeholder')}
                className="w-full rounded-xl border border-ft-border bg-ft-surface px-4 py-3 text-lg placeholder:text-ft-label focus:border-ft-green focus:outline-none focus:ring-2 focus:ring-ft-green/20"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ft-muted">
                {t('profile.homeCourse')}
              </label>
              <select
                value={homeCourse}
                onChange={(e) => setHomeCourse(e.target.value)}
                className="w-full rounded-xl border border-ft-border bg-ft-surface px-4 py-3 text-lg focus:border-ft-green focus:outline-none focus:ring-2 focus:ring-ft-green/20"
              >
                <option value="">{t('profile.noCourse')}</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ft-muted">
                {t('profile.email')}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                className="w-full rounded-xl border border-ft-border bg-ft-surface px-4 py-3 text-lg placeholder:text-ft-label focus:border-ft-green focus:outline-none focus:ring-2 focus:ring-ft-green/20"
              />
            </div>
            <button
              onClick={handleSaveProfile}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-ft-green py-3 text-base font-bold text-white shadow-sm transition-all active:scale-[0.98]"
            >
              <Save size={18} />
              {saved ? t('profile.saved') : t('profile.save')}
            </button>
          </div>
        </section>

        {/* Language Section */}
        <section>
          <div className="mb-3 flex items-center gap-2">
            <Languages size={18} className="text-ft-muted" />
            <h2 className="text-base font-bold text-ft-text">
              {t('settings.languageSection')}
            </h2>
          </div>
          <div className="rounded-xl border border-ft-border bg-ft-card p-4">
            <div className="flex gap-2">
              <button
                onClick={() => setLanguage('en')}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-base font-bold transition-all active:scale-95 ${
                  storeLanguage === 'en'
                    ? 'bg-ft-green text-white shadow-sm'
                    : 'border border-ft-border bg-ft-card text-ft-muted'
                }`}
              >
                English
              </button>
              <button
                onClick={() => setLanguage('es')}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-base font-bold transition-all active:scale-95 ${
                  storeLanguage === 'es'
                    ? 'bg-ft-green text-white shadow-sm'
                    : 'border border-ft-border bg-ft-card text-ft-muted'
                }`}
              >
                Español
              </button>
            </div>
          </div>
        </section>

        {/* Players Section */}
        <section>
          <Link
            href="/players"
            className="flex items-center justify-between rounded-xl border border-ft-border bg-ft-card p-4 transition-colors hover:bg-ft-surface"
          >
            <div className="flex items-center gap-3">
              <Users size={18} className="text-ft-muted" />
              <div>
                <p className="text-sm font-bold">{t('settings.playerSection')}</p>
                <p className="text-xs text-ft-muted">
                  {t('settings.managePlayersDesc')}
                </p>
              </div>
            </div>
            <ArrowRight size={18} className="text-ft-muted" />
          </Link>
        </section>

        {/* Users Section */}
        <UserManager currentUserId={currentUserId} />

        {/* Courses Section */}
        <section>
          <div className="mb-3 flex items-center gap-2">
            <MapPin size={18} className="text-ft-muted" />
            <h2 className="text-base font-bold text-ft-text">
              {t('settings.courseSection')}
            </h2>
          </div>
          <Link
            href="/courses"
            className="flex items-center justify-between rounded-xl border border-ft-border bg-ft-card p-4 transition-colors hover:bg-ft-surface"
          >
            <div>
              <p className="text-sm font-bold">{t('settings.manageCourses')}</p>
              <p className="text-xs text-ft-muted">
                {t('settings.manageCoursesDesc')}
              </p>
            </div>
            <ArrowRight size={18} className="text-ft-muted" />
          </Link>
        </section>

        {/* Account Section */}
        {userEmail && (
          <section>
            <div className="mb-3 flex items-center gap-2">
              <Mail size={18} className="text-ft-muted" />
              <h2 className="text-base font-bold text-ft-text">
                Account
              </h2>
            </div>
            <div className="rounded-xl border border-ft-border bg-ft-card p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Mail size={16} className="text-ft-muted" />
                  <span className="text-sm text-ft-muted">
                    {userEmail}
                  </span>
                </div>
                {userEmailVerified ? (
                  <span className="flex items-center gap-1 text-xs font-medium text-ft-green-bright">
                    <ShieldCheck size={14} />
                    {t('auth.emailVerified')}
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs font-medium text-ft-amber">
                    <ShieldAlert size={14} />
                    {t('auth.emailNotVerified')}
                  </span>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Logout */}
        <section>
          <button
            onClick={async () => {
              setLoggingOut(true);
              await logout();
              router.push('/login');
            }}
            disabled={loggingOut}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-ft-rose/30 bg-ft-card py-3 text-sm font-bold text-ft-rose transition-all hover:bg-ft-rose/10 disabled:opacity-50"
          >
            <LogOut size={16} />
            {loggingOut ? t('auth.updating') : t('auth.logout')}
          </button>
        </section>

        {/* App Info */}
        <section className="pb-6 text-center">
          <div className="flex items-center justify-center gap-1.5 text-xs text-ft-muted">
            <SettingsIcon size={12} />
            <span>Golf Tracker v1.0.0</span>
          </div>
        </section>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <>
      <ErrorBoundary>
        <Suspense
          fallback={
            <div className="mx-auto flex max-w-lg flex-1 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-ft-green border-t-transparent" />
            </div>
          }
        >
          <SettingsContent />
        </Suspense>
      </ErrorBoundary>
      <BottomNav />
    </>
  );
}

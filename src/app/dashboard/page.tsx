'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  TrendingUp,
  Target,
  Flag,
  CircleDot,
  BarChart3,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import BottomNav from '@/components/BottomNav';
import StatsCard from '@/components/StatsCard';
import { useStore } from '@/store/useStore';
import { calculateRoundStats } from '@/lib/stats';
import { useTranslation } from '@/i18n/useTranslation';
import { mediumTap, heavyTap } from '@/lib/haptics';

const LineChart = dynamic(
  () => import('recharts').then((mod) => mod.LineChart),
  { ssr: false }
);
const Line = dynamic(() => import('recharts').then((mod) => mod.Line), {
  ssr: false,
});
const XAxis = dynamic(() => import('recharts').then((mod) => mod.XAxis), {
  ssr: false,
});
const YAxis = dynamic(() => import('recharts').then((mod) => mod.YAxis), {
  ssr: false,
});
const CartesianGrid = dynamic(
  () => import('recharts').then((mod) => mod.CartesianGrid),
  { ssr: false }
);
const Tooltip = dynamic(() => import('recharts').then((mod) => mod.Tooltip), {
  ssr: false,
});
const ResponsiveContainer = dynamic(
  () => import('recharts').then((mod) => mod.ResponsiveContainer),
  { ssr: false }
);
const AreaChart = dynamic(
  () => import('recharts').then((mod) => mod.AreaChart),
  { ssr: false }
);
const Area = dynamic(() => import('recharts').then((mod) => mod.Area), {
  ssr: false,
});

export default function DashboardPage() {
  const rounds = useStore((s) => s.rounds);
  const player = useStore((s) => s.player);
  const handicapHistory = useStore((s) => s.handicapHistory);
  const language = useStore((s) => s.language);
  const deleteRound = useStore((s) => s.deleteRound);
  const { t } = useTranslation();
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const currentPlayerId = player?.id;

  const completedRounds = rounds
    .filter((r) => r.completed && currentPlayerId)
    .filter((r) => (r.players || []).some((p) => p.playerId === currentPlayerId))
    .sort(
      (a, b) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
    );

  const locale = language === 'es' ? 'es-ES' : 'en-US';

  const chartData = useMemo(() => {
    return completedRounds.map((round) => {
      const stats = calculateRoundStats(round.players, round.gameMode);
      const myStats = stats.playerStats.find(
        (ps) => ps.playerId === currentPlayerId
      ) || stats.playerStats[0] || { scoreToPar: 0, totalScore: 0, girPercentage: 0, avgPutts: 0, fairwaysPercentage: 0, puttsByDistance: { '<1': 0, '1-2': 0, '2-4': 0, '4-8': 0, '+8': 0 } };
      return {
        date: new Date(round.date).toLocaleDateString(locale, {
          month: 'short',
          day: 'numeric',
        }),
        scoreToPar: myStats.scoreToPar,
        totalScore: myStats.totalScore,
        girPercentage: myStats.girPercentage,
        putts: myStats.avgPutts,
        fairwaysPercentage: myStats.fairwaysPercentage,
        puttsByDistance: myStats.puttsByDistance,
        label: round.courseName.slice(0, 10),
      };
    });
  }, [completedRounds, locale, currentPlayerId]);

  const handicapData = useMemo(() => {
    return handicapHistory.map((entry) => ({
      date: new Date(entry.date).toLocaleDateString(locale, {
        month: 'short',
        day: 'numeric',
      }),
      handicap: entry.handicap,
    }));
  }, [handicapHistory, locale]);

  const avgStats = useMemo(() => {
    if (completedRounds.length === 0) return null;
    const allStats = completedRounds.map((r) => {
      const s = calculateRoundStats(r.players, r.gameMode);
      return s.playerStats.find((ps) => ps.playerId === currentPlayerId) || s.playerStats[0] || { totalScore: 0, girPercentage: 0, avgPutts: 0, fairwaysPercentage: 0, scoreToPar: 0 };
    });
    return {
      avgScore: Math.round(
        allStats.reduce((s, st) => s + st.totalScore, 0) / allStats.length
      ),
      avgGIR: Math.round(
        allStats.reduce((s, st) => s + st.girPercentage, 0) / allStats.length
      ),
      avgPutts:
        Math.round(
          (allStats.reduce((s, st) => s + st.avgPutts, 0) / allStats.length) *
            10
        ) / 10,
      avgFairways: Math.round(
        allStats.reduce((s, st) => s + st.fairwaysPercentage, 0) /
          allStats.length
      ),
    };
  }, [completedRounds, currentPlayerId]);

  return (
    <>
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col px-4 pt-[calc(env(safe-area-inset-top,0px)+1.5rem)]">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Link href="/" className="mb-3 inline-flex items-center gap-1 text-sm text-zinc-400">
            <ArrowLeft size={16} />
            Back
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">
            {t('dashboard.title')}
          </h1>
          <p className="text-sm text-zinc-500">
            {t('dashboard.roundsCompleted', { count: completedRounds.length })}
          </p>
        </motion.div>

        {completedRounds.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-zinc-200 py-12 text-center dark:border-zinc-800"
          >
            <BarChart3 size={40} className="text-zinc-300 dark:text-zinc-600" />
            <p className="text-sm text-zinc-400">{t('dashboard.noRounds')}</p>
          </motion.div>
        ) : (
          <>
            {avgStats && (
              <div className="mb-6 grid grid-cols-2 gap-2">
                <StatsCard
                  label={t('dashboard.avgScore')}
                  value={avgStats.avgScore}
                  icon={Target}
                  color="emerald"
                />
                <StatsCard
                  label={t('dashboard.avgGir')}
                  value={`${avgStats.avgGIR}%`}
                  icon={Flag}
                  color="blue"
                />
                <StatsCard
                  label={t('dashboard.avgPutts')}
                  value={avgStats.avgPutts}
                  icon={CircleDot}
                  color="violet"
                />
                <StatsCard
                  label={t('dashboard.avgFairways')}
                  value={`${avgStats.avgFairways}%`}
                  icon={TrendingUp}
                  color="amber"
                />
              </div>
            )}

            {chartData.length > 1 && (
              <div className="mb-6 space-y-4">
                <div className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    {t('dashboard.scoreTrend')}
                  </h3>
                  <ResponsiveContainer width="100%" height={180}>
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient
                          id="colorScore"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#10b981"
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor="#10b981"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#e4e4e7"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 10, fill: '#a1a1aa' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 10, fill: '#a1a1aa' }}
                        axisLine={false}
                        tickLine={false}
                        width={30}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: 12,
                          border: '1px solid #e4e4e7',
                          fontSize: 12,
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="scoreToPar"
                        stroke="#10b981"
                        fill="url(#colorScore)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
                    <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                      {t('dashboard.girChart')}
                    </h3>
                    <ResponsiveContainer width="100%" height={120}>
                      <LineChart data={chartData}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#e4e4e7"
                          vertical={false}
                        />
                        <XAxis
                          dataKey="date"
                          tick={false}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fontSize: 9, fill: '#a1a1aa' }}
                          axisLine={false}
                          tickLine={false}
                          width={25}
                          domain={[0, 100]}
                          unit="%"
                        />
                        <Tooltip
                          contentStyle={{
                            borderRadius: 12,
                            border: '1px solid #e4e4e7',
                            fontSize: 12,
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="girPercentage"
                          stroke="#3b82f6"
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
                    <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                      {t('dashboard.puttsChart')}
                    </h3>
                    <ResponsiveContainer width="100%" height={120}>
                      <LineChart data={chartData}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#e4e4e7"
                          vertical={false}
                        />
                        <XAxis
                          dataKey="date"
                          tick={false}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fontSize: 9, fill: '#a1a1aa' }}
                          axisLine={false}
                          tickLine={false}
                          width={25}
                          domain={['dataMin - 1', 'dataMax + 1']}
                        />
                        <Tooltip
                          contentStyle={{
                            borderRadius: 12,
                            border: '1px solid #e4e4e7',
                            fontSize: 12,
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="putts"
                          stroke="#8b5cf6"
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {handicapData.length > 1 && (
              <div className="mb-6 rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  {t('dashboard.handicapChart')}
                </h3>
                <ResponsiveContainer width="100%" height={150}>
                  <AreaChart data={handicapData}>
                    <defs>
                      <linearGradient
                        id="colorHcp"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#f59e0b"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#f59e0b"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#e4e4e7"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 9, fill: '#a1a1aa' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 9, fill: '#a1a1aa' }}
                      axisLine={false}
                      tickLine={false}
                      width={25}
                      reversed
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 12,
                        border: '1px solid #e4e4e7',
                        fontSize: 12,
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="handicap"
                      stroke="#f59e0b"
                      fill="url(#colorHcp)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}

            {completedRounds.length > 0 && (
              <div className="mb-6 rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  {t('dashboard.puttsByDistance')}
                </h3>
                {(() => {
                  const keys = ['<1', '1-2', '2-4', '4-8', '+8'] as const;
                  const totals: Record<typeof keys[number], number> = { '<1': 0, '1-2': 0, '2-4': 0, '4-8': 0, '+8': 0 };
                  for (const r of completedRounds) {
                    const s = calculateRoundStats(r.players, r.gameMode);
                    const ps = s.playerStats.find((p) => p.playerId === currentPlayerId) || s.playerStats[0] || { puttsByDistance: { '<1': 0, '1-2': 0, '2-4': 0, '4-8': 0, '+8': 0 } };
                    for (const k of keys) {
                      totals[k] += ps.puttsByDistance[k];
                    }
                  }
                  const max = Math.max(...Object.values(totals), 1);
                  return (
                    <div className="space-y-1.5">
                      {keys.map((key) => (
                        <div key={key} className="flex items-center gap-2 text-xs">
                          <span className="w-8 text-right font-medium text-zinc-500">
                            {key}
                          </span>
                          <div className="h-4 flex-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                            <div
                              className="h-full rounded-full bg-violet-400 transition-all"
                              style={{ width: `${(totals[key] / max) * 100}%` }}
                            />
                          </div>
                          <span className="w-6 text-right font-bold tabular-nums text-zinc-700 dark:text-zinc-300">
                            {totals[key]}
                          </span>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            )}

            <div className="mb-6">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                {t('dashboard.allRounds')}
              </h3>
              <div className="space-y-2">
                {completedRounds
                  .slice()
                  .reverse()
                  .map((round) => {
                    const stats = calculateRoundStats(round.players, round.gameMode);
                    const ps = stats.playerStats.find((p) => p.playerId === currentPlayerId) || stats.playerStats[0] || { scoreToPar: 0, totalScore: 0, girPercentage: 0, avgPutts: 0, fairwaysPercentage: 0 };
                    const isDeleting = deleteConfirmId === round.id;
                    return (
                      <div
                        key={round.id}
                        className="flex items-center gap-2"
                      >
                        <div
                          className="flex flex-1 items-center justify-between rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900"
                        >
                          <div>
                            <p className="text-sm font-bold">
                              {round.courseName}
                            </p>
                            <p className="text-xs text-zinc-400">
                              {new Date(round.date).toLocaleDateString()} ·{' '}
                              {round.teeColor}
                            </p>
                          </div>
                          <div className="flex items-center gap-4 text-xs">
                            <span className="text-zinc-400">
                              {ps.girPercentage}% GIR
                            </span>
                            <span
                              className={`text-lg font-bold ${
                                ps.scoreToPar <= 0
                                  ? 'text-emerald-600 dark:text-emerald-400'
                                  : 'text-rose-600 dark:text-rose-400'
                              }`}
                            >
                              {ps.scoreToPar > 0 ? '+' : ''}
                              {ps.scoreToPar}
                            </span>
                          </div>
                        </div>
                        <motion.button
                          onClick={() => {
                            if (isDeleting) {
                              heavyTap()
                              deleteRound(round.id)
                              setDeleteConfirmId(null)
                            } else {
                              mediumTap()
                              setDeleteConfirmId(round.id)
                            }
                          }}
                          onBlur={() => setDeleteConfirmId(null)}
                          animate={isDeleting ? { scale: [1, 1.1, 1] } : {}}
                          transition={{ duration: 0.3 }}
                          className={`flex shrink-0 items-center justify-center rounded-xl p-3 transition-all ${
                            isDeleting
                              ? 'bg-rose-500 text-white shadow-sm'
                              : 'text-zinc-300 hover:text-rose-400 dark:text-zinc-600'
                          }`}
                          title={isDeleting ? t('round.confirmDelete') : t('round.delete')}
                        >
                          {isDeleting ? (
                            <span className="whitespace-nowrap text-xs font-bold">{t('round.confirmDelete')}</span>
                          ) : (
                            <Trash2 size={18} />
                          )}
                        </motion.button>
                      </div>
                    );
                  })}
              </div>
            </div>
          </>
        )}
      </div>
      <BottomNav />
    </>
  );
}

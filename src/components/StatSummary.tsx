'use client';

import {
  Target,
  MapPin,
  Flag,
  Navigation,
  Droplets,
  CircleDot,
  Trophy,
} from 'lucide-react';
import StatsCard from './StatsCard';
import { RoundStats, type GameMode } from '@/types';
import { useTranslation } from '@/i18n/useTranslation';

interface StatSummaryProps {
  stats: RoundStats;
  gameMode?: GameMode;
  activePlayerIndex?: number;
}

export default function StatSummary({ stats, gameMode = 'stroke-play', activePlayerIndex = 0 }: StatSummaryProps) {
  const { t } = useTranslation();
  const ps = stats.playerStats[activePlayerIndex];

  if (!ps) return null;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        {gameMode === 'stableford' ? (
          <StatsCard
            label={t('scorecard.stableford')}
            value={ps.stablefordTotal}
            sublabel={t('scorecard.points')}
            icon={Trophy}
            color={ps.stablefordTotal >= 36 ? 'emerald' : 'amber'}
          />
        ) : gameMode === 'match-play' && stats.matchPlayResult ? (
          <StatsCard
            label={t('scorecard.matchPlay')}
            value={stats.matchPlayResult.upDown}
            sublabel={`${stats.matchPlayResult.playerAWon}-${stats.matchPlayResult.playerBWon}`}
            icon={Trophy}
            color="emerald"
          />
        ) : (
          <StatsCard
            label={t('statSummary.totalScore')}
            value={ps.totalScore}
            sublabel={`${ps.scoreToPar > 0 ? '+' : ''}${ps.scoreToPar}`}
            icon={Target}
            color={ps.scoreToPar <= 0 ? 'emerald' : 'rose'}
          />
        )}
        <StatsCard
          label={t('statSummary.putts')}
          value={ps.totalPutts}
          sublabel={`${ps.avgPutts} ${t('statSummary.avg')}`}
          icon={CircleDot}
          color="blue"
        />
      </div>

      <div className="grid grid-cols-3 gap-2">
        <StatsCard
          label={t('statSummary.fairways')}
          value={`${ps.fairwaysPercentage}%`}
          sublabel={`${ps.fairwaysHit}/${ps.fairwaysTotal}`}
          icon={MapPin}
          color="amber"
        />
        <StatsCard
          label={t('statSummary.gir')}
          value={`${ps.girPercentage}%`}
          sublabel={`${ps.gir}/${ps.girTotal}`}
          icon={Flag}
          color="emerald"
        />
        <StatsCard
          label={t('statSummary.scrambling')}
          value={`${ps.scramblingPercentage}%`}
          sublabel={`${ps.scrambling}/${ps.scramblingTotal}`}
          icon={Navigation}
          color="violet"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <StatsCard
          label={t('statSummary.sandSaves')}
          value={`${ps.sandSavePercentage}%`}
          sublabel={`${ps.sandSaves}/${ps.sandSavesTotal}`}
          icon={Droplets}
          color="cyan"
        />
        <StatsCard
          label={t('statSummary.penalties')}
          value={ps.totalPenalties}
          icon={CircleDot}
          color="rose"
        />
      </div>

      <div>
        <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-zinc-400">
          {t('dashboard.puttsByDistance')}
        </p>
        <div className="space-y-1">
          {(Object.entries(ps.puttsByDistance) as Array<[string, number]>).map(
            ([key, count]) => (
              <div
                key={key}
                className="flex items-center gap-2 text-xs"
              >
                <span className="w-6 text-right font-medium text-zinc-500">
                  {key}
                </span>
                <div className="h-3 flex-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                  <div
                    className="h-full rounded-full bg-violet-400"
                    style={{
                      width: `${(count / Math.max(...Object.values(ps.puttsByDistance), 1)) * 100}%`,
                    }}
                  />
                </div>
                <span className="w-4 text-right font-bold tabular-nums text-zinc-600">
                  {count}
                </span>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

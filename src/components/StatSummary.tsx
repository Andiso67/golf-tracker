'use client';

import {
  Target,
  MapPin,
  Flag,
  Navigation,
  Droplets,
  CircleDot,
} from 'lucide-react';
import StatsCard from './StatsCard';
import { RoundStats } from '@/types';
import { useTranslation } from '@/i18n/useTranslation';

interface StatSummaryProps {
  stats: RoundStats;
}

export default function StatSummary({ stats }: StatSummaryProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <StatsCard
          label={t('statSummary.totalScore')}
          value={stats.totalScore}
          sublabel={`${stats.scoreToPar > 0 ? '+' : ''}${stats.scoreToPar}`}
          icon={Target}
          color={stats.scoreToPar <= 0 ? 'emerald' : 'rose'}
        />
        <StatsCard
          label={t('statSummary.putts')}
          value={stats.totalPutts}
          sublabel={`${stats.avgPutts} ${t('statSummary.avg')}`}
          icon={CircleDot}
          color="blue"
        />
      </div>

      <div className="grid grid-cols-3 gap-2">
        <StatsCard
          label={t('statSummary.fairways')}
          value={`${stats.fairwaysPercentage}%`}
          sublabel={`${stats.fairwaysHit}/${stats.fairwaysTotal}`}
          icon={MapPin}
          color="amber"
        />
        <StatsCard
          label={t('statSummary.gir')}
          value={`${stats.girPercentage}%`}
          sublabel={`${stats.gir}/${stats.girTotal}`}
          icon={Flag}
          color="emerald"
        />
        <StatsCard
          label={t('statSummary.scrambling')}
          value={`${stats.scramblingPercentage}%`}
          sublabel={`${stats.scrambling}/${stats.scramblingTotal}`}
          icon={Navigation}
          color="violet"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <StatsCard
          label={t('statSummary.sandSaves')}
          value={`${stats.sandSavePercentage}%`}
          sublabel={`${stats.sandSaves}/${stats.sandSavesTotal}`}
          icon={Droplets}
          color="cyan"
        />
        <StatsCard
          label={t('statSummary.penalties')}
          value={stats.totalPenalties}
          icon={CircleDot}
          color="rose"
        />
      </div>

      <div>
        <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-zinc-400">
          {t('dashboard.puttsByDistance')}
        </p>
        <div className="space-y-1">
          {(Object.entries(stats.puttsByDistance) as Array<[string, number]>).map(
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
                      width: `${(count / Math.max(...Object.values(stats.puttsByDistance), 1)) * 100}%`,
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

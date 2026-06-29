'use client';

import { HoleData, stablefordPoints, type GameMode } from '@/types';
import { useTranslation } from '@/i18n/useTranslation';

interface ScorecardTableProps {
  holes: HoleData[];
  compact?: boolean;
  gameMode?: GameMode;
}

export default function ScorecardTable({
  holes,
  compact = false,
  gameMode = 'stroke-play',
}: ScorecardTableProps) {
  const { t } = useTranslation();
  const totalPar = holes.reduce((s, h) => s + h.par, 0);
  const totalScore = holes.reduce(
    (s, h) => s + (h.score > 0 ? h.score : 0),
    0
  );
  const totalStableford = holes.reduce(
    (s, h) => s + stablefordPoints(h.score, h.par),
    0
  );

  if (compact) {
    return (
      <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-700">
        <table className="w-full text-center text-xs">
          <thead>
            <tr className="bg-zinc-50 dark:bg-zinc-800/50">
              <th className="px-1.5 py-1.5 font-medium text-zinc-400">
                {t('scorecard.hole')}
              </th>
              {holes.map((h) => (
                <th
                  key={h.number}
                  className="px-1.5 py-1.5 font-medium text-zinc-400"
                >
                  {h.number}
                </th>
              ))}
              <th className="px-1.5 py-1.5 font-medium text-zinc-400">
                {t('scorecard.total')}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-zinc-100 dark:border-zinc-800">
              <td className="px-1.5 py-1 font-medium text-zinc-400">
                {t('scorecard.par')}
              </td>
              {holes.map((h) => (
                <td key={h.number} className="px-1.5 py-1 text-zinc-500">
                  {h.par}
                </td>
              ))}
              <td className="px-1.5 py-1 font-medium text-zinc-500">
                {totalPar}
              </td>
            </tr>
            <tr className="border-t border-zinc-100 dark:border-zinc-800">
              <td className="px-1.5 py-1 font-medium text-zinc-400">
                {gameMode === 'stableford' ? t('scorecard.pts') : t('scorecard.you')}
              </td>
              {holes.map((h) => {
                const pts = stablefordPoints(h.score, h.par);
                const display = gameMode === 'stableford'
                  ? (h.score > 0 ? pts : '-')
                  : (h.score > 0 ? h.score : '-');
                const colorClass = gameMode === 'stableford'
                  ? pts >= 3
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : pts === 2
                      ? 'text-zinc-800 dark:text-zinc-200'
                      : pts > 0
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-zinc-300 dark:text-zinc-600'
                  : h.score > 0
                    ? h.score < h.par
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : h.score === h.par
                        ? 'text-zinc-800 dark:text-zinc-200'
                        : 'text-rose-600 dark:text-rose-400'
                    : 'text-zinc-300 dark:text-zinc-600';
                return (
                  <td key={h.number} className={`px-1.5 py-1 font-bold tabular-nums ${colorClass}`}>
                    {display}
                  </td>
                );
              })}
              <td
                className={`px-1.5 py-1 font-bold ${
                  totalScore > 0
                    ? gameMode === 'stableford'
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : totalScore < totalPar
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : totalScore === totalPar
                          ? 'text-zinc-800 dark:text-zinc-200'
                          : 'text-rose-600 dark:text-rose-400'
                    : 'text-zinc-300 dark:text-zinc-600'
                }`}
              >
                {totalScore > 0
                  ? gameMode === 'stableford'
                    ? totalStableford
                    : totalScore
                  : '-'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-700">
      <table className="w-full text-center text-xs">
        <thead>
          <tr className="bg-zinc-50 dark:bg-zinc-800/50">
            <th className="px-2 py-2 font-medium text-zinc-400">
              {t('scorecard.hash')}
            </th>
            <th className="px-2 py-2 font-medium text-zinc-400">
              {t('scorecard.par')}
            </th>
            <th className="px-2 py-2 font-medium text-zinc-400">
              {t('scorecard.score')}
            </th>
            {gameMode === 'stableford' && (
              <th className="px-2 py-2 font-medium text-zinc-400">
                {t('scorecard.pts')}
              </th>
            )}
            <th className="px-2 py-2 font-medium text-zinc-400">
              {t('scorecard.fw')}
            </th>
            <th className="px-2 py-2 font-medium text-zinc-400">
              {t('scorecard.gir')}
            </th>
            <th className="px-2 py-2 font-medium text-zinc-400">
              {t('scorecard.putts')}
            </th>
            <th className="px-2 py-2 font-medium text-zinc-400">
              {t('scorecard.pen')}
            </th>
            <th className="px-2 py-2 font-medium text-zinc-400">
              {t('scorecard.sand')}
            </th>
            <th className="px-2 py-2 font-medium text-zinc-400">
              {t('scorecard.app')}
            </th>
          </tr>
        </thead>
        <tbody>
          {holes.map((h) => (
            <tr
              key={h.number}
              className="border-t border-zinc-100 dark:border-zinc-800"
            >
              <td className="px-2 py-2 font-medium text-zinc-500">
                {h.number}
              </td>
              <td className="px-2 py-2 text-zinc-400">{h.par}</td>
              <td
                className={`px-2 py-2 font-bold tabular-nums ${
                  h.score > 0
                    ? h.score < h.par
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : h.score === h.par
                        ? 'text-zinc-800 dark:text-zinc-200'
                        : 'text-rose-600 dark:text-rose-400'
                    : 'text-zinc-300 dark:text-zinc-600'
                }`}
              >
                {h.score > 0 ? h.score : '-'}
              </td>
              {gameMode === 'stableford' && (
                <td className="px-2 py-2 font-bold tabular-nums">
                  {h.score > 0 ? stablefordPoints(h.score, h.par) : '-'}
                </td>
              )}
              <td className="px-2 py-2">
                <span
                  className={`inline-block h-5 w-5 rounded-full text-[10px] font-bold leading-5 ${
                    h.fairwayHit === 'Yes'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300'
                      : h.fairwayHit === 'No'
                        ? 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
                        : h.fairwayHit
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300'
                          : 'text-zinc-300 dark:text-zinc-600'
                  }`}
                >
                  {h.fairwayHit === 'Yes'
                    ? '✓'
                    : h.fairwayHit === 'No'
                      ? '✗'
                      : h.fairwayHit === 'Left'
                        ? '←'
                        : h.fairwayHit === 'Right'
                          ? '→'
                          : '-'}
                </span>
              </td>
              <td className="px-2 py-2">
                {h.gir !== null ? (
                  <span
                    className={`font-bold ${
                      h.gir
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-zinc-400 dark:text-zinc-500'
                    }`}
                  >
                    {h.gir ? 'Y' : 'N'}
                  </span>
                ) : (
                  <span className="text-zinc-300 dark:text-zinc-600">-</span>
                )}
              </td>
              <td className="px-2 py-2 tabular-nums">
                {h.putts > 0 ? h.putts : '-'}
              </td>
              <td className="px-2 py-2 tabular-nums">
                {h.penalties > 0 ? (
                  <span className="text-rose-500">{h.penalties}</span>
                ) : (
                  '-'
                )}
              </td>
              <td className="px-2 py-2 tabular-nums">
                {h.sandSave > 0 ? (
                  <span className="text-amber-500 font-bold">{h.sandSave}</span>
                ) : (
                  <span className="text-zinc-300 dark:text-zinc-600">-</span>
                )}
              </td>
              <td className="px-2 py-2 tabular-nums">
                {h.approach > 0 ? (
                  <span className="text-blue-500 font-bold">{h.approach}</span>
                ) : (
                  <span className="text-zinc-300 dark:text-zinc-600">-</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

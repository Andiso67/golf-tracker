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
      <div className="overflow-x-auto rounded-xl border border-ft-border">
        <table className="w-full text-center text-xs">
          <thead>
            <tr className="bg-ft-surface">
              <th className="px-1.5 py-1.5 font-medium text-ft-label">
                {t('scorecard.hole')}
              </th>
              {holes.map((h) => (
                <th
                  key={h.number}
                  className="px-1.5 py-1.5 font-medium text-ft-label"
                >
                  {h.number}
                </th>
              ))}
              <th className="px-1.5 py-1.5 font-medium text-ft-label">
                {t('scorecard.total')}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-ft-border">
              <td className="px-1.5 py-1 font-medium text-ft-label">
                {t('scorecard.par')}
              </td>
              {holes.map((h) => (
                <td key={h.number} className="px-1.5 py-1 text-ft-muted">
                  {h.par}
                </td>
              ))}
              <td className="px-1.5 py-1 font-medium text-ft-muted">
                {totalPar}
              </td>
            </tr>
            <tr className="border-t border-ft-border">
              <td className="px-1.5 py-1 font-medium text-ft-label">
                {gameMode === 'stableford' ? t('scorecard.pts') : t('scorecard.you')}
              </td>
              {holes.map((h) => {
                const pts = stablefordPoints(h.score, h.par);
                const display = gameMode === 'stableford'
                  ? (h.score > 0 ? pts : '-')
                  : (h.score > 0 ? h.score : '-');
                const colorClass = gameMode === 'stableford'
                  ? pts >= 3
                    ? 'text-ft-green-bright'
                    : pts === 2
                      ? 'text-ft-text'
                      : pts > 0
                        ? 'text-ft-amber'
                        : 'text-ft-label'
                  : h.score > 0
                    ? h.score < h.par
                      ? 'text-ft-green-bright'
                      : h.score === h.par
                        ? 'text-ft-text'
                        : 'text-ft-rose'
                    : 'text-ft-label';
                return (
                  <td key={h.number} className={`px-1.5 py-1 font-bold font-mono tabular-nums ${colorClass}`}>
                    {display}
                  </td>
                );
              })}
              <td
                className={`px-1.5 py-1 font-bold font-mono ${
                  totalScore > 0
                    ? gameMode === 'stableford'
                      ? 'text-ft-green-bright'
                      : totalScore < totalPar
                        ? 'text-ft-green-bright'
                        : totalScore === totalPar
                          ? 'text-ft-text'
                          : 'text-ft-rose'
                    : 'text-ft-label'
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
    <div className="overflow-x-auto rounded-xl border border-ft-border">
      <table className="w-full text-center text-xs">
        <thead>
          <tr className="bg-ft-surface">
            <th className="px-2 py-2 font-medium text-ft-label">
              {t('scorecard.hash')}
            </th>
            <th className="px-2 py-2 font-medium text-ft-label">
              {t('scorecard.par')}
            </th>
            <th className="px-2 py-2 font-medium text-ft-label">
              {t('scorecard.score')}
            </th>
            {gameMode === 'stableford' && (
              <th className="px-2 py-2 font-medium text-ft-label">
                {t('scorecard.pts')}
              </th>
            )}
            <th className="px-2 py-2 font-medium text-ft-label">
              {t('scorecard.fw')}
            </th>
            <th className="px-2 py-2 font-medium text-ft-label">
              {t('scorecard.gir')}
            </th>
            <th className="px-2 py-2 font-medium text-ft-label">
              {t('scorecard.putts')}
            </th>
            <th className="px-2 py-2 font-medium text-ft-label">
              {t('scorecard.pen')}
            </th>
            <th className="px-2 py-2 font-medium text-ft-label">
              {t('scorecard.sand')}
            </th>
            <th className="px-2 py-2 font-medium text-ft-label">
              {t('scorecard.app')}
            </th>
          </tr>
        </thead>
        <tbody>
          {holes.map((h) => (
            <tr
              key={h.number}
              className="border-t border-ft-border"
            >
              <td className="px-2 py-2 font-medium text-ft-muted">
                {h.number}
              </td>
              <td className="px-2 py-2 text-ft-muted">{h.par}</td>
              <td
                className={`px-2 py-2 font-bold font-mono tabular-nums ${
                  h.score > 0
                    ? h.score < h.par
                      ? 'text-ft-green-bright'
                      : h.score === h.par
                        ? 'text-ft-text'
                        : 'text-ft-rose'
                    : 'text-ft-label'
                }`}
              >
                {h.score > 0 ? h.score : '-'}
              </td>
              {gameMode === 'stableford' && (
                <td className="px-2 py-2 font-bold font-mono tabular-nums">
                  {h.score > 0 ? stablefordPoints(h.score, h.par) : '-'}
                </td>
              )}
              <td className="px-2 py-2">
                <span
                  className={`inline-block h-5 w-5 rounded-full text-[10px] font-bold leading-5 ${
                    h.fairwayHit === 'Yes'
                      ? 'bg-ft-green/20 text-ft-green-bright'
                      : h.fairwayHit === 'No'
                        ? 'bg-ft-surface text-ft-muted'
                        : h.fairwayHit
                          ? 'bg-ft-amber/20 text-ft-amber'
                          : 'text-ft-label'
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
                        ? 'text-ft-green-bright'
                        : 'text-ft-muted'
                    }`}
                  >
                    {h.gir ? 'Y' : 'N'}
                  </span>
                ) : (
                  <span className="text-ft-label">-</span>
                )}
              </td>
              <td className="px-2 py-2 font-mono tabular-nums">
                {h.putts > 0 ? h.putts : '-'}
              </td>
              <td className="px-2 py-2 font-mono tabular-nums">
                {h.penalties > 0 ? (
                  <span className="text-ft-rose">{h.penalties}</span>
                ) : (
                  '-'
                )}
              </td>
              <td className="px-2 py-2 font-mono tabular-nums">
                {h.sandSave > 0 ? (
                  <span className="text-ft-amber font-bold">{h.sandSave}</span>
                ) : (
                  <span className="text-ft-label">-</span>
                )}
              </td>
              <td className="px-2 py-2 font-mono tabular-nums">
                {h.approach > 0 ? (
                  <span className="text-ft-blue font-bold">{h.approach}</span>
                ) : (
                  <span className="text-ft-label">-</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

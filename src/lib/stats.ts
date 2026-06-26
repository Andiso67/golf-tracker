import { HoleData, RoundStats } from '@/types';

export function calculateRoundStats(holes: HoleData[]): RoundStats {
  const played = holes.filter((h) => h.score > 0);
  const totalScore = played.reduce((sum, h) => sum + h.score, 0);
  const totalPar = played.reduce((sum, h) => sum + h.par, 0);
  const scoreToPar = totalScore - totalPar;

  const fairwayHoles = played.filter((h) => h.fairwayHit !== null);
  const fairwaysHit = fairwayHoles.filter(
    (h) => h.fairwayHit === 'Yes'
  ).length;

  const girHoles = played.filter((h) => h.gir !== null);
  const gir = girHoles.filter((h) => h.gir === true).length;

  const totalPutts = played.reduce((sum, h) => sum + h.putts, 0);
  const playedCount = played.length || 1;

  const scramblingHoles = played.filter(
    (h) => h.gir === false && h.score > 0
  );
  const scrambling = scramblingHoles.filter(
    (h) => h.score <= h.par
  ).length;

  const sandSaveHoles = played.filter((h) => h.sandSave !== null);
  const sandSaves = sandSaveHoles.filter((h) => h.sandSave === true).length;

  const totalPenalties = played.reduce((sum, h) => sum + h.penalties, 0);

  const puttsByDistance: RoundStats['puttsByDistance'] = {
    '<1': 0,
    '1-2': 0,
    '2-4': 0,
    '4-8': 0,
    '+8': 0,
  };
  for (const h of played) {
    if (h.puttDistance) {
      puttsByDistance[h.puttDistance]++;
    }
  }

  return {
    totalScore,
    scoreToPar,
    fairwaysHit,
    fairwaysTotal: fairwayHoles.length,
    fairwaysPercentage:
      fairwayHoles.length > 0
        ? Math.round((fairwaysHit / fairwayHoles.length) * 100)
        : 0,
    gir,
    girTotal: girHoles.length,
    girPercentage:
      girHoles.length > 0
        ? Math.round((gir / girHoles.length) * 100)
        : 0,
    totalPutts,
    avgPutts: Math.round((totalPutts / playedCount) * 10) / 10,
    scrambling,
    scramblingTotal: scramblingHoles.length,
    scramblingPercentage:
      scramblingHoles.length > 0
        ? Math.round((scrambling / scramblingHoles.length) * 100)
        : 0,
    sandSaves,
    sandSavesTotal: sandSaveHoles.length,
    sandSavePercentage:
      sandSaveHoles.length > 0
        ? Math.round((sandSaves / sandSaveHoles.length) * 100)
        : 0,
    totalPenalties,
    puttsByDistance,
  };
}

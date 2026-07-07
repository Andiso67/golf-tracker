import { HoleData, PlayerStats, GameMode, RoundPlayer, RoundStats, stablefordPoints, isTeamMode } from '@/types';

function calculatePlayerStats(holes: HoleData[]): Omit<PlayerStats, 'playerId' | 'playerName'> {
  const played = holes.filter((h) => h.score > 0);
  const totalScore = played.reduce((sum, h) => sum + h.score, 0);
  const totalPar = played.reduce((sum, h) => sum + h.par, 0);
  const scoreToPar = totalScore - totalPar;
  const stablefordTotal = played.reduce(
    (sum, h) => sum + stablefordPoints(h.score, h.par),
    0
  );

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

  const sandSavesTotal = played.filter((h) => h.sandSave > 0).length;
  const sandSaves = played.filter((h) => h.sandSave > 0 && h.score <= h.par).length;

  const totalPenalties = played.reduce((sum, h) => sum + h.penalties, 0);

  const puttsByDistance: PlayerStats['puttsByDistance'] = {
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

  const drivingDistances = played.filter(
    (h) => h.drivingDistance != null && h.drivingDistance > 0
  );
  const avgDrivingDistance = drivingDistances.length > 0
    ? Math.round(
        drivingDistances.reduce((s, h) => s + h.drivingDistance!, 0) /
          drivingDistances.length
      )
    : 0;

  const par3 = played.filter((h) => h.par === 3);
  const par4 = played.filter((h) => h.par === 4);
  const par5 = played.filter((h) => h.par === 5);

  const par3Total = par3.reduce((s, h) => s + h.score, 0);
  const par4Total = par4.reduce((s, h) => s + h.score, 0);
  const par5Total = par5.reduce((s, h) => s + h.score, 0);

  const front = played.filter((h) => h.number <= 9);
  const back = played.filter((h) => h.number > 9);
  const frontScore = front.reduce((s, h) => s + h.score, 0);
  const backScore = back.reduce((s, h) => s + h.score, 0);
  const frontPar = front.reduce((s, h) => s + h.par, 0);
  const backPar = back.reduce((s, h) => s + h.par, 0);

  return {
    totalScore,
    scoreToPar,
    stablefordTotal,
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
    sandSavesTotal,
    sandSavePercentage:
      sandSavesTotal > 0
        ? Math.round((sandSaves / sandSavesTotal) * 100)
        : 0,
    totalPenalties,
    puttsByDistance,
    avgDrivingDistance,
    par3Count: par3.length,
    par3Avg: par3.length > 0 ? Math.round((par3Total / par3.length) * 10) / 10 : 0,
    par3ToPar: par3Total - par3.length * 3,
    par4Count: par4.length,
    par4Avg: par4.length > 0 ? Math.round((par4Total / par4.length) * 10) / 10 : 0,
    par4ToPar: par4Total - par4.length * 4,
    par5Count: par5.length,
    par5Avg: par5.length > 0 ? Math.round((par5Total / par5.length) * 10) / 10 : 0,
    par5ToPar: par5Total - par5.length * 5,
    front9Score: frontScore,
    front9ToPar: frontScore - frontPar,
    front9Putts: front.reduce((s, h) => s + h.putts, 0),
    back9Score: backScore,
    back9ToPar: backScore - backPar,
    back9Putts: back.reduce((s, h) => s + h.putts, 0),
  };
}

function calculateMatchPlay(players: RoundPlayer[]): { playerAWon: number; playerBWon: number; upDown: string } {
  const a = players[0];
  const b = players[1];
  let aWon = 0;
  let bWon = 0;
  for (let i = 0; i < a.holes.length; i++) {
    const ah = a.holes[i];
    const bh = b.holes[i];
    if (ah.score > 0 && bh.score > 0 && ah.score !== bh.score) {
      if (ah.score < bh.score) aWon++;
      else bWon++;
    }
  }
  const diff = aWon - bWon;
  const upDown = diff > 0 ? `${diff}UP` : diff < 0 ? `${Math.abs(diff)}DN` : 'AS';
  return { playerAWon: aWon, playerBWon: bWon, upDown };
}

function calculateSkins(players: RoundPlayer[]): string[] {
  if (players.length < 2) return [];
  const winners: string[] = [];
  for (let i = 0; i < players[0].holes.length; i++) {
    const scores = players.map((p) => ({ playerId: p.playerId, score: p.holes[i].score }));
    const played = scores.filter((s) => s.score > 0);
    if (played.length < 2) continue;
    played.sort((a, b) => a.score - b.score);
    if (played[0].score !== played[1].score) {
      winners.push(played[0].playerId);
    }
  }
  return winners;
}

function getTeamScore(players: RoundPlayer[], mode: GameMode, holeIndex: number): number {
  if (mode === 'scramble' || mode === 'shamble' || mode === 'foursome' || mode === 'greensome' || mode === 'greensome-chapman') {
    const scores = players.map((p) => p.holes[holeIndex].score);
    return Math.min(...scores.filter((s) => s > 0));
  }
  if (mode === 'fourball') {
    const scores = players.map((p) => p.holes[holeIndex].score);
    return Math.min(...scores.filter((s) => s > 0));
  }
  if (mode === 'copacanada') {
    return players.reduce((s, p) => s + p.holes[holeIndex].score, 0);
  }
  return players[0]?.holes[holeIndex]?.score || 0;
}

export function calculateRoundStats(players: RoundPlayer[], mode: GameMode): RoundStats {
  const playerStats: PlayerStats[] = players.map((p) => ({
    playerId: p.playerId,
    playerName: p.playerName,
    ...calculatePlayerStats(p.holes),
  }));

  const result: RoundStats = {
    mode,
    playerStats,
  };

  if (mode === 'match-play' && players.length >= 2) {
    result.matchPlayResult = calculateMatchPlay(players);
  }

  if (mode === 'skins' && players.length >= 2) {
    const skinWinners = calculateSkins(players);
    const uniqueWinners = [...new Set(skinWinners)];
    const withCounts = uniqueWinners.map((id) => {
      const count = skinWinners.filter((w) => w === id).length;
      const p = players.find((pl) => pl.playerId === id);
      return p ? `${p.playerName} (${count})` : id;
    });
    // store as meta
  }

  return result;
}

function holesToScore(holes: HoleData[], mode: GameMode): number {
  if (mode === 'stableford') {
    return holes.reduce((s, h) => s + stablefordPoints(h.score, h.par), 0);
  }
  return holes.reduce((s, h) => s + (h.score > 0 ? h.score : 0), 0);
}

export { calculatePlayerStats, calculateMatchPlay, calculateSkins, holesToScore };

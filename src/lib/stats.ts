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

  const totalBunker = played.reduce((sum, h) => sum + h.sandSave, 0);

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
    sandSaves: totalBunker,
    sandSavesTotal: totalBunker,
    sandSavePercentage: 0,
    totalPenalties,
    puttsByDistance,
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

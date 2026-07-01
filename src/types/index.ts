export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName1: string;
  lastName2: string;
  emailVerified?: string;
}

export interface Player {
  id: string;
  userId?: string;
  email: string;
  firstName: string;
  lastName1: string;
  lastName2: string;
  handicap: number;
  homeCourse: string;
  licenseNumber: string;
}

export interface AuthState {
  isLoggedIn: boolean;
  sessionToken: string | null;
  currentUserId: string | null;
}

export function playerFullName(p: Player): string {
  const parts = [p.firstName, p.lastName1, p.lastName2].filter(Boolean);
  return parts.join(' ') || 'Player';
}

export type GameMode =
  | 'stroke-play'
  | 'medal-play'
  | 'stableford'
  | 'max-score'
  | 'match-play'
  | 'foursome'
  | 'fourball'
  | 'greensome'
  | 'greensome-chapman'
  | 'scramble'
  | 'shamble'
  | 'copacanada'
  | 'skins';

export type Format = 'individual' | 'parejas' | 'equipos'

export const GAME_MODES: { mode: GameMode; labelKey: string; descKey: string; players: number; formats: Format[] }[] = [
  { mode: 'stroke-play', labelKey: 'newRound.strokePlay', descKey: 'newRound.strokePlayDesc', players: 1, formats: ['individual'] },
  { mode: 'medal-play', labelKey: 'newRound.medalPlay', descKey: 'newRound.medalPlayDesc', players: 1, formats: ['individual'] },
  { mode: 'stableford', labelKey: 'newRound.stableford', descKey: 'newRound.stablefordDesc', players: 1, formats: ['individual'] },
  { mode: 'max-score', labelKey: 'newRound.maxScore', descKey: 'newRound.maxScoreDesc', players: 1, formats: ['individual'] },
  { mode: 'match-play', labelKey: 'newRound.matchPlay', descKey: 'newRound.matchPlayDesc', players: 2, formats: ['parejas', 'equipos'] },
  { mode: 'foursome', labelKey: 'newRound.foursome', descKey: 'newRound.foursomeDesc', players: 2, formats: ['parejas'] },
  { mode: 'fourball', labelKey: 'newRound.fourball', descKey: 'newRound.fourballDesc', players: 2, formats: ['parejas', 'equipos'] },
  { mode: 'greensome', labelKey: 'newRound.greensome', descKey: 'newRound.greensomeDesc', players: 2, formats: ['parejas'] },
  { mode: 'greensome-chapman', labelKey: 'newRound.chapman', descKey: 'newRound.chapmanDesc', players: 2, formats: ['parejas'] },
  { mode: 'scramble', labelKey: 'newRound.scramble', descKey: 'newRound.scrambleDesc', players: 2, formats: ['parejas', 'equipos'] },
  { mode: 'shamble', labelKey: 'newRound.shamble', descKey: 'newRound.shambleDesc', players: 2, formats: ['parejas', 'equipos'] },
  { mode: 'copacanada', labelKey: 'newRound.copaCanada', descKey: 'newRound.copaCanadaDesc', players: 2, formats: ['parejas', 'equipos'] },
  { mode: 'skins', labelKey: 'newRound.skins', descKey: 'newRound.skinsDesc', players: 2, formats: ['parejas', 'equipos'] },
];

export function isTeamMode(mode: GameMode): boolean {
  return ['scramble', 'shamble', 'foursome', 'greensome', 'greensome-chapman'].includes(mode);
}

export function isTwoPlayerMode(mode: GameMode): boolean {
  return ['match-play', 'foursome', 'fourball', 'greensome', 'greensome-chapman', 'scramble', 'shamble', 'copacanada', 'skins'].includes(mode);
}

export function stablefordPoints(score: number, par: number): number {
  if (score <= 0) return 0;
  const diff = score - par;
  if (diff <= -3) return 5;
  if (diff === -2) return 4;
  if (diff === -1) return 3;
  if (diff === 0) return 2;
  if (diff === 1) return 1;
  return 0;
}

export function maxScoreValue(score: number, par: number, max: number = 8): number {
  if (score <= 0) return 0;
  return Math.min(score, Math.max(max, par * 2));
}

export function skinsWinner(holes: HoleData[], playerId: string, otherPlayerId: string, otherHoles: HoleData[]): { playerId: string; holes: number[] } {
  const won: number[] = [];
  for (let i = 0; i < holes.length; i++) {
    const a = holes[i];
    const b = otherHoles[i];
    if (a.score > 0 && b.score > 0 && a.score !== b.score) {
      if (a.score < b.score) won.push(a.number);
    }
  }
  return { playerId, holes: won };
}

export interface TeeColor {
  name: string;
  rating: number;
  slope: number;
}

export interface CourseTee {
  name: string;
  rating: number;
  slope: number;
  pars: number[];
  totalHoles: 9 | 18;
}

export interface SavedCourse {
  id: string;
  name: string;
  tees: CourseTee[];
  createdAt: string;
}

export interface HoleData {
  number: number;
  par: number;
  handicap?: number;
  score: number;
  fairwayHit: 'Yes' | 'No' | 'Left' | 'Right' | null;
  gir: boolean | null;
  putts: number;
  puttDistance: '<1' | '1-2' | '2-4' | '4-8' | '+8' | null;
  penalties: number;
  sandSave: number;
  approach: number;
  drivingDistance: number | null;
}

export function createEmptyHole(number: number, par: number = 4, handicap?: number): HoleData {
  return {
    number,
    par,
    handicap,
    score: 0,
    fairwayHit: null,
    gir: null,
    putts: 0,
    puttDistance: null,
    penalties: 0,
    sandSave: 0,
    approach: 0,
    drivingDistance: null,
  };
}

export interface RoundPlayer {
  playerId: string;
  playerName: string;
  handicap: number;
  holes: HoleData[];
  team?: number;
}

export interface Round {
  id: string;
  players: RoundPlayer[];
  courseName: string;
  courseId?: string;
  teeColor: string;
  gameMode: GameMode;
  maxScore?: number;
  date: string;
  totalHoles: 9 | 18;
  completed: boolean;
}

export interface PlayerStats {
  playerId: string;
  playerName: string;
  totalScore: number;
  scoreToPar: number;
  stablefordTotal: number;
  fairwaysHit: number;
  fairwaysTotal: number;
  fairwaysPercentage: number;
  gir: number;
  girTotal: number;
  girPercentage: number;
  totalPutts: number;
  avgPutts: number;
  scrambling: number;
  scramblingTotal: number;
  scramblingPercentage: number;
  sandSaves: number;
  sandSavesTotal: number;
  sandSavePercentage: number;
  totalPenalties: number;
  puttsByDistance: Record<'<1' | '1-2' | '2-4' | '4-8' | '+8', number>;
}

export interface MatchPlayResult {
  playerAWon: number;
  playerBWon: number;
  upDown: string;
}

export interface RoundStats {
  mode: GameMode;
  playerStats: PlayerStats[];
  matchPlayResult?: MatchPlayResult;
  skinsWinners?: string[];
}

export interface HandicapEntry {
  date: string;
  handicap: number;
}

export const DEFAULT_TEES: TeeColor[] = [
  { name: 'Black (Tips)', rating: 75.0, slope: 140 },
  { name: 'Blue', rating: 73.0, slope: 135 },
  { name: 'White', rating: 71.0, slope: 130 },
  { name: 'Gold (Senior)', rating: 69.0, slope: 125 },
  { name: 'Red (Forward)', rating: 67.0, slope: 120 },
];

export const DEFAULT_PARS_18: number[] = [
  4, 4, 5, 3, 4, 4, 3, 5, 4,
  4, 3, 5, 4, 4, 3, 5, 4, 4,
];

export const DEFAULT_PARS_9: number[] = [4, 4, 5, 3, 4, 4, 3, 5, 4];

export const TEE_NAMES = [
  'Black (Tips)',
  'Blue',
  'White',
  'Gold (Senior)',
  'Red (Forward)',
];

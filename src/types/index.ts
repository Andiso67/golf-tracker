export interface Player {
  id: string;
  name: string;
  handicap: number;
  homeCourse: string;
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
  score: number;
  fairwayHit: 'Yes' | 'No' | 'Left' | 'Right' | null;
  gir: boolean | null;
  putts: number;
  puttDistance: '<1' | '1-2' | '2-4' | '4-8' | '+8' | null;
  penalties: number;
  sandSave: boolean | null;
  drivingDistance: number | null;
}

export function createEmptyHole(number: number, par: number = 4): HoleData {
  return {
    number,
    par,
    score: 0,
    fairwayHit: null,
    gir: null,
    putts: 0,
    puttDistance: null,
    penalties: 0,
    sandSave: null,
    drivingDistance: null,
  };
}

export interface Round {
  id: string;
  playerId: string;
  courseName: string;
  courseId?: string;
  teeColor: string;
  date: string;
  totalHoles: 9 | 18;
  holes: HoleData[];
  completed: boolean;
}

export interface RoundStats {
  totalScore: number;
  scoreToPar: number;
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

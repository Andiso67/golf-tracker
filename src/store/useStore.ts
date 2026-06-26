'use client';

import { create } from 'zustand';
import { persist, createJSONStorage, type StateStorage } from 'zustand/middleware';

const ssrSafeStorage: StateStorage = {
  getItem: (name) => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(name);
  },
  setItem: (name, value) => {
    if (typeof window !== 'undefined') localStorage.setItem(name, value);
  },
  removeItem: (name) => {
    if (typeof window !== 'undefined') localStorage.removeItem(name);
  },
};

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

import {
  Player,
  Round,
  HoleData,
  SavedCourse,
  CourseTee,
  createEmptyHole,
  DEFAULT_PARS_18,
  DEFAULT_PARS_9,
  HandicapEntry,
} from '@/types';
import { calculateRoundStats } from '@/lib/stats';

export type Language = 'en' | 'es';

interface GolfStore {
  player: Player | null;
  rounds: Round[];
  courses: SavedCourse[];
  handicapHistory: HandicapEntry[];
  activeRoundId: string | null;
  language: Language;
  _hydrated: boolean;
  _syncing: boolean;

  setPlayer: (player: Player) => void;
  updatePlayer: (data: Partial<Player>) => void;
  setLanguage: (lang: Language) => void;

  syncFromApi: () => Promise<void>;
  syncPlayerToApi: (player: Player) => Promise<void>;

  addCourse: (name: string, tees: CourseTee[]) => string;
  updateCourse: (id: string, data: Partial<SavedCourse>) => void;
  deleteCourse: (id: string) => void;
  getCourse: (id: string) => SavedCourse | undefined;
  importCoursesFromJson: (jsonData: string) => number;

  startRound: (
    courseName: string,
    teeColor: string,
    totalHoles: 9 | 18,
    customPars?: number[],
    courseId?: string
  ) => string;
  getActiveRound: () => Round | undefined;
  updateHole: (roundId: string, holeNumber: number, data: Partial<HoleData>) => void;
  completeRound: (roundId: string) => void;
  syncCompleteRound: (roundId: string) => Promise<void>;
  deleteRound: (roundId: string) => void;

  getRoundStats: (roundId: string) => ReturnType<typeof calculateRoundStats> | null;
  getAllRounds: () => Round[];
}

export const useStore = create<GolfStore>()(
  persist(
    (set, get) => ({
      player: null,
      rounds: [],
      courses: [],
      handicapHistory: [],
      activeRoundId: null,
      language: 'en' as Language,
      _hydrated: false,
      _syncing: false,

      setPlayer: (player) => set({ player }),

      updatePlayer: (data) =>
        set((state) => ({
          player: state.player ? { ...state.player, ...data } : null,
        })),

      setLanguage: (language) => set({ language }),

      syncFromApi: async () => {
        set({ _syncing: true });
        try {
          const [coursesRes, roundsRes, playerRes] = await Promise.allSettled([
            fetch('/api/courses'),
            fetch('/api/rounds'),
            fetch('/api/player'),
          ])

          if (coursesRes.status === 'fulfilled' && coursesRes.value.ok) {
            const apiCourses: SavedCourse[] = await coursesRes.value.json()
            set((state) => {
              const localIds = new Set(state.courses.map((c) => c.id))
              const merged = [...state.courses]
              for (const c of apiCourses) {
                if (!localIds.has(c.id)) {
                  merged.push(c)
                  localIds.add(c.id)
                }
              }
              return { courses: merged }
            })
          }

          if (roundsRes.status === 'fulfilled' && roundsRes.value.ok) {
            const apiRounds: Round[] = await roundsRes.value.json()
            set((state) => {
              const localIds = new Set(state.rounds.map((r) => r.id))
              const merged = [...state.rounds]
              for (const r of apiRounds) {
                if (!localIds.has(r.id)) {
                  merged.push(r)
                  localIds.add(r.id)
                }
              }
              return { rounds: merged }
            })
          }

          if (playerRes.status === 'fulfilled' && playerRes.value.ok) {
            const apiPlayer: Player = await playerRes.value.json()
            set((state) => ({
              player: state.player ?? apiPlayer,
            }))
          }
        } catch {
          // silent fail — localStorage is the fallback
        }
        set({ _syncing: false })
      },

      syncPlayerToApi: async (player) => {
        try {
          await fetch('/api/player', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(player),
          })
        } catch {
          // offline — will sync later
        }
      },

      addCourse: (name, tees) => {
        const id = generateId();
        const course: SavedCourse = {
          id,
          name,
          tees,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ courses: [...state.courses, course] }));

        fetch('/api/courses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, tees }),
        }).then(async (res) => {
          if (res.ok) {
            const apiCourse = await res.json()
            set((state) => ({
              courses: state.courses.map((c) =>
                c.id === id ? { ...apiCourse, id: c.id } : c
              ),
            }))
          }
        }).catch(() => {})

        return id;
      },

      updateCourse: (id, data) =>
        set((state) => ({
          courses: state.courses.map((c) =>
            c.id === id ? { ...c, ...data } : c
          ),
        })),

      deleteCourse: (id) => {
        set((state) => ({
          courses: state.courses.filter((c) => c.id !== id),
        }))
        fetch(`/api/courses/${id}`, { method: 'DELETE' }).catch(() => {})
      },

      getCourse: (id) => get().courses.find((c) => c.id === id),

      importCoursesFromJson: (jsonData) => {
        let imported = 0;
        try {
          const data = JSON.parse(jsonData);
          const list = data.courses || [];
          const existing = get().courses;
          const existingNames = new Set(existing.map((c) => c.name.toLowerCase().trim()));

          for (const item of list) {
            const name = item.n || item.name;
            const key = name.toLowerCase().trim();
            if (existingNames.has(key)) continue;

            const tees: CourseTee[] = (item.t || item.tees || []).map((t: any) => ({
              name: t.n || t.name || '',
              rating: t.r ?? t.rating ?? 0,
              slope: t.s ?? t.slope ?? 0,
              totalHoles: t.h ?? t.totalHoles ?? (t.p ? t.p.length : 18),
              pars: [...(t.p || t.pars || [])],
            }));

            if (tees.length === 0) continue;

            const course: SavedCourse = {
              id: `rfeg_${item.id}`,
              name,
              tees,
              createdAt: new Date().toISOString(),
            };
            existing.push(course);
            existingNames.add(key);
            imported++;
          }

          set({ courses: [...existing] });
        } catch (e) {
          console.error('Failed to import courses:', e);
        }
        return imported;
      },

      startRound: (courseName, teeColor, totalHoles, customPars, courseId) => {
        const pars =
          customPars ||
          (totalHoles === 9 ? DEFAULT_PARS_9 : DEFAULT_PARS_18);
        const holes: HoleData[] = pars.map((par, i) =>
          createEmptyHole(i + 1, par)
        );
        const id = generateId();
        const now = new Date().toISOString();
        const round: Round = {
          id,
          playerId: get().player?.id || 'local',
          courseName,
          courseId,
          teeColor,
          date: now,
          totalHoles,
          holes,
          completed: false,
        };
        set((state) => ({
          rounds: [...state.rounds, round],
          activeRoundId: id,
        }));

        fetch('/api/rounds', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            playerId: round.playerId,
            courseName,
            courseId,
            teeColor,
            totalHoles,
            holes,
          }),
        }).then(async (res) => {
          if (res.ok) {
            const apiRound = await res.json()
            set((state) => ({
              rounds: state.rounds.map((r) =>
                r.id === id ? { ...apiRound, id: r.id } : r
              ),
            }))
          }
        }).catch(() => {})

        return id;
      },

      getActiveRound: () => {
        const { rounds, activeRoundId } = get();
        return rounds.find((r) => r.id === activeRoundId);
      },

      updateHole: (roundId, holeNumber, data) =>
        set((state) => ({
          rounds: state.rounds.map((r) =>
            r.id === roundId
              ? {
                  ...r,
                  holes: r.holes.map((h) =>
                    h.number === holeNumber ? { ...h, ...data } : h
                  ),
                }
              : r
          ),
        })),

      completeRound: (roundId) => {
        const { rounds } = get();
        const round = rounds.find((r) => r.id === roundId);
        if (!round) return;

        const stats = calculateRoundStats(round.holes);

        set((state) => ({
          rounds: state.rounds.map((r) =>
            r.id === roundId ? { ...r, completed: true } : r
          ),
          activeRoundId:
            state.activeRoundId === roundId ? null : state.activeRoundId,
          handicapHistory: [
            ...state.handicapHistory,
            {
              date: round.date,
              handicap: calculateHandicap(stats.scoreToPar),
            },
          ],
        }));

        fetch(`/api/rounds/${roundId}/complete`, { method: 'POST' }).catch(() => {})
      },

      syncCompleteRound: async (roundId) => {
        try {
          const res = await fetch(`/api/rounds/${roundId}/complete`, {
            method: 'POST',
          })
          if (res.ok) {
            const { rounds } = get()
            const round = rounds.find((r) => r.id === roundId)
            if (round) {
              const stats = calculateRoundStats(round.holes)
              set((state) => ({
                rounds: state.rounds.map((r) =>
                  r.id === roundId ? { ...r, completed: true } : r
                ),
                activeRoundId:
                  state.activeRoundId === roundId ? null : state.activeRoundId,
                handicapHistory: [
                  ...state.handicapHistory,
                  {
                    date: round.date,
                    handicap: calculateHandicap(stats.scoreToPar),
                  },
                ],
              }))
            }
          }
        } catch {
          // will retry later
        }
      },

      deleteRound: (roundId) =>
        set((state) => ({
          rounds: state.rounds.filter((r) => r.id !== roundId),
          activeRoundId:
            state.activeRoundId === roundId ? null : state.activeRoundId,
        })),

      getRoundStats: (roundId) => {
        const round = get().rounds.find((r) => r.id === roundId);
        if (!round) return null;
        return calculateRoundStats(round.holes);
      },

      getAllRounds: () => get().rounds,
    }),
    {
      name: 'golf-tracker-storage',
      storage: createJSONStorage(() => ssrSafeStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state._hydrated = true;
          if (typeof window !== 'undefined') {
            state.syncFromApi()
          }
        }
      },
    }
  )
);

function calculateHandicap(scoreToPar: number): number {
  return Math.round((scoreToPar * 0.96) * 10) / 10;
}

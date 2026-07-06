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
  User,
  Player,
  Round,
  HoleData,
  SavedCourse,
  CourseTee,
  RoundPlayer,
  createEmptyHole,
  DEFAULT_PARS_18,
  DEFAULT_PARS_9,
  HandicapEntry,
  GameMode,
  isTeamMode,
  playerFullName,
  AuthState,
} from '@/types';
import { calculateRoundStats } from '@/lib/stats';

export type Language = 'en' | 'es';

interface GolfStore {
  player: Player | null;
  players: Player[];
  activePlayerId: string | null;
  rounds: Round[];
  courses: SavedCourse[];
  handicapHistory: HandicapEntry[];
  activeRoundId: string | null;
  language: Language;
  _hydrated: boolean;
  _syncing: boolean;
  auth: AuthState;
  userEmail: string;
  userEmailVerified: string | null;

  setPlayer: (player: Player) => void;
  updatePlayer: (data: Partial<Player>) => void;
  setLanguage: (lang: Language) => void;
  addPlayer: (firstName: string, lastName1?: string, lastName2?: string, licenseNumber?: string, email?: string) => string;
  setActivePlayer: (id: string) => void;
  deletePlayer: (id: string) => void;

  syncFromApi: () => Promise<void>;
  syncPlayerToApi: (player: Player) => Promise<void>;

  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: { firstName: string; lastName1?: string; lastName2?: string; email: string; password: string; handicap?: number; homeCourse?: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;

  addCourse: (name: string, tees: CourseTee[], imageUrl?: string) => string;
  updateCourse: (id: string, data: Partial<SavedCourse>) => void;
  deleteCourse: (id: string) => void;
  getCourse: (id: string) => SavedCourse | undefined;
  importCoursesFromJson: (jsonData: string) => number;

  startRound: (
    courseName: string,
    teeColor: string,
    totalHoles: 9 | 18,
    customPars?: number[],
    courseId?: string,
    gameMode?: GameMode,
    selectedPlayers?: Player[]
  ) => string;
  getActiveRound: () => Round | undefined;
  updateHole: (roundId: string, holeNumber: number, data: Partial<HoleData>, playerIndex?: number) => void;
  completeRound: (roundId: string) => void;
  syncCompleteRound: (roundId: string) => Promise<void>;
  updateRoundDate: (roundId: string, date: string) => void;
  updateRoundCourse: (roundId: string, courseName: string) => void;
  deleteRound: (roundId: string) => void;

  getRoundStats: (roundId: string) => ReturnType<typeof calculateRoundStats> | null;
  getAllRounds: () => Round[];
}

export const useStore = create<GolfStore>()(
  persist(
    (set, get) => ({
      player: null,
      players: [],
      activePlayerId: null,
      rounds: [],
      courses: [],
      handicapHistory: [],
      activeRoundId: null,
      language: 'en' as Language,
      _hydrated: false,
      _syncing: false,
      auth: {
        isLoggedIn: false,
        sessionToken: null,
        currentUserId: null,
      },
      userEmail: '',
      userEmailVerified: null,

      setPlayer: (player) =>
        set((state) => {
          const exists = state.players.find((p) => p.id === player.id);
          const players = exists
            ? state.players.map((p) => (p.id === player.id ? player : p))
            : [...state.players, player];
          return { player, players, activePlayerId: player.id };
        }),

      updatePlayer: (data) =>
        set((state) => {
          if (!state.player) return {};
          const updated = { ...state.player, ...data };
          return {
            player: updated,
            players: state.players.map((p) =>
              p.id === state.player!.id ? updated : p
            ),
          };
        }),

      setLanguage: (language) => set({ language }),

      addPlayer: (firstName: string, lastName1?: string, lastName2?: string, licenseNumber?: string, email?: string) => {
        const id = generateId();
        const newPlayer: Player = {
          id,
          email: email || '',
          firstName,
          lastName1: lastName1 || '',
          lastName2: lastName2 || '',
          handicap: 0,
          homeCourse: '',
          licenseNumber: licenseNumber || '',
        };
        set((state) => ({
          players: [...state.players, newPlayer],
          player: state.players.length === 0 ? newPlayer : state.player,
          activePlayerId:
            state.players.length === 0 ? id : state.activePlayerId,
        }));
        return id;
      },

      setActivePlayer: (id) =>
        set((state) => {
          const p = state.players.find((pl) => pl.id === id);
          return p ? { player: p, activePlayerId: id } : {};
        }),

      deletePlayer: (id) =>
        set((state) => {
          const remaining = state.players.filter((p) => p.id !== id);
          if (state.activePlayerId === id) {
            const next = remaining[0] || null;
            return {
              players: remaining,
              player: next,
              activePlayerId: next?.id || null,
            };
          }
          return { players: remaining };
        }),

      login: async (email, password) => {
        try {
          const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          })
          const data = await res.json()
          if (!res.ok) {
            return { success: false, error: data.error || 'Login failed' }
          }
          set({
            auth: {
              isLoggedIn: true,
              sessionToken: null,
              currentUserId: data.userId,
            },
            userEmail: data.email,
            userEmailVerified: data.emailVerified || null,
          })
          // Auto-create or find player by email
          try {
            const playersRes = await fetch('/api/players')
            if (playersRes.ok) {
              const allPlayers = await playersRes.json()
              const existingPlayer = allPlayers.find(
                (p: any) => p.email?.toLowerCase() === data.email?.toLowerCase()
              )
              if (existingPlayer) {
                set((state) => ({
                  players: allPlayers,
                  player: existingPlayer,
                  activePlayerId: existingPlayer.id,
                }))
              } else {
                const playerRes = await fetch('/api/players', {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    firstName: data.firstName,
                    lastName1: data.lastName1 || '',
                    lastName2: data.lastName2 || '',
                    email: data.email,
                  }),
                })
                if (playerRes.ok) {
                  const newPlayer = await playerRes.json()
                  set((state) => ({
                    players: [...state.players, newPlayer],
                    player: newPlayer,
                    activePlayerId: newPlayer.id,
                  }))
                }
              }
            }
          } catch {}
          await get().syncFromApi()
          return { success: true }
        } catch {
          return { success: false, error: 'Network error' }
        }
      },

      register: async (data) => {
        try {
          const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          })
          const result = await res.json()
          if (!res.ok) {
            return { success: false, error: result.error || 'Registration failed' }
          }
          set({
            auth: {
              isLoggedIn: true,
              sessionToken: null,
              currentUserId: result.userId,
            },
            userEmail: result.email,
            userEmailVerified: result.emailVerified || null,
          })
          // Auto-create player from user data
          try {
            const playerRes = await fetch('/api/players', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                firstName: result.firstName,
                lastName1: result.lastName1 || '',
                lastName2: result.lastName2 || '',
                email: result.email,
              }),
            })
            if (playerRes.ok) {
              const newPlayer = await playerRes.json()
              set((state) => ({
                players: [...state.players, newPlayer],
                player: newPlayer,
                activePlayerId: newPlayer.id,
              }))
            }
          } catch {}
          await get().syncFromApi()
          return { success: true }
        } catch {
          return { success: false, error: 'Network error' }
        }
      },

      logout: async () => {
        try {
          await fetch('/api/auth/logout', { method: 'POST' })
        } catch {}
        set({
          auth: { isLoggedIn: false, sessionToken: null, currentUserId: null },
          player: null,
          userEmail: '',
          userEmailVerified: null,
        })
      },

      checkAuth: async () => {
        try {
          const res = await fetch('/api/auth/session')
          if (!res.ok) {
            set({ auth: { isLoggedIn: false, sessionToken: null, currentUserId: null } })
            return
          }
          const data = await res.json()
          set({
            auth: { isLoggedIn: true, sessionToken: null, currentUserId: data.user.id },
            userEmail: data.user.email,
            userEmailVerified: data.user.emailVerified || null,
          })
          // Try to select first player if none selected
          const state = get()
          if (!state.player) {
            try {
              const playersRes = await fetch('/api/players')
              if (playersRes.ok) {
                const allPlayers = await playersRes.json()
                if (allPlayers.length > 0) {
                  const matched = allPlayers.find((p: any) => p.email === data.email) || allPlayers[0]
                  set({ player: matched, players: allPlayers, activePlayerId: matched.id })
                }
              }
            } catch {}
          }
          await get().syncFromApi()
        } catch {
          // offline — keep current state
        }
      },

      syncFromApi: async () => {
        set({ _syncing: true });
        try {
          const [coursesRes, roundsRes, playersRes] = await Promise.allSettled([
            fetch('/api/courses'),
            fetch('/api/rounds'),
            fetch('/api/players'),
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

          if (playersRes.status === 'fulfilled' && playersRes.value.ok) {
            const apiPlayers: Player[] = await playersRes.value.json()
            set((state) => {
              const localIds = new Set(state.players.map((p) => p.id))
              const merged = [
                ...state.players,
                ...apiPlayers.filter((ap) => !localIds.has(ap.id)),
              ]
              const currentPlayerStillExists = state.player && merged.find((p) => p.id === state.player!.id)
              const nextPlayer = currentPlayerStillExists
                ? state.player
                : state.userEmail
                  ? (merged.find((p) => p.email === state.userEmail) ?? merged[0] ?? null)
                  : (merged[0] ?? null)
              return {
                players: merged,
                player: nextPlayer,
                activePlayerId: nextPlayer?.id ?? state.activePlayerId,
              }
            })
          }
        } catch {
          // silent fail — localStorage is the fallback
        }
        set({ _syncing: false })
      },

      syncPlayerToApi: async (player) => {
        try {
          await fetch('/api/players', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(player),
          })
        } catch {
          // offline — will sync later
        }
      },

      addCourse: (name, tees, imageUrl) => {
        const id = generateId();
        const course: SavedCourse = {
          id,
          name,
          imageUrl: imageUrl || '',
          tees,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ courses: [...state.courses, course] }));

        fetch('/api/courses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, tees, imageUrl: imageUrl || '' }),
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
              imageUrl: '',
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

      startRound: (courseName, teeColor, totalHoles, customPars, courseId, gameMode, selectedPlayers) => {
        const mode = gameMode || 'stroke-play';
        const pars =
          customPars ||
          (totalHoles === 9 ? DEFAULT_PARS_9 : DEFAULT_PARS_18);
        const holes: HoleData[] = pars.map((par, i) =>
          createEmptyHole(i + 1, par)
        );
        const id = generateId();
        const now = new Date().toISOString();

        const players = get().players;
        const active = get().player;
        const playersForRound: RoundPlayer[] = selectedPlayers && selectedPlayers.length > 0
          ? selectedPlayers.map((p) => ({
              playerId: p.id,
              playerName: playerFullName(p),
              handicap: p.handicap,
              holes: holes.map((h) => ({ ...h })),
              team: isTeamMode(mode) ? undefined : undefined,
            }))
          : [{
              playerId: active?.id || 'local',
              playerName: active ? playerFullName(active) : 'Player',
              handicap: active?.handicap || 0,
              holes: holes.map((h) => ({ ...h })),
            }];

        const round: Round = {
          id,
          players: playersForRound,
          courseName,
          courseId,
          teeColor,
          gameMode: mode,
          date: now,
          totalHoles,
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
            players: playersForRound,
            courseName,
            courseId,
            teeColor,
            totalHoles,
            holes: playersForRound[0].holes,
            gameMode: mode,
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

      updateHole: (roundId, holeNumber, data, playerIndex = 0) =>
        set((state) => ({
          rounds: state.rounds.map((r) =>
            r.id === roundId
              ? {
                  ...r,
                  players: r.players.map((p, i) =>
                    i === playerIndex
                      ? {
                          ...p,
                          holes: p.holes.map((h) =>
                            h.number === holeNumber ? { ...h, ...data } : h
                          ),
                        }
                      : p
                  ),
                }
              : r
          ),
        })),

      completeRound: (roundId) => {
        const { rounds } = get();
        const round = rounds.find((r) => r.id === roundId);
        if (!round) return;

        const stats = calculateRoundStats(round.players, round.gameMode);
        const firstPlayerScore = stats.playerStats[0]?.scoreToPar || 0;

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
              handicap: calculateHandicap(firstPlayerScore),
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
              const stats = calculateRoundStats(round.players, round.gameMode)
              const firstPlayerScore = stats.playerStats[0]?.scoreToPar || 0
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
                    handicap: calculateHandicap(firstPlayerScore),
                  },
                ],
              }))
            }
          }
        } catch {
          // will retry later
        }
      },

      updateRoundDate: (roundId, date) =>
        set((state) => ({
          rounds: state.rounds.map((r) =>
            r.id === roundId ? { ...r, date } : r
          ),
        })),

      updateRoundCourse: (roundId, courseName) =>
        set((state) => ({
          rounds: state.rounds.map((r) =>
            r.id === roundId ? { ...r, courseName } : r
          ),
        })),

      deleteRound: (roundId) => {
        set((state) => ({
          rounds: state.rounds.filter((r) => r.id !== roundId),
          activeRoundId:
            state.activeRoundId === roundId ? null : state.activeRoundId,
        }))
        fetch(`/api/rounds/${roundId}`, { method: 'DELETE' }).catch(() => {})
      },

      getRoundStats: (roundId) => {
        const round = get().rounds.find((r) => r.id === roundId);
        if (!round) return null;
        return calculateRoundStats(round.players, round.gameMode);
      },

      getAllRounds: () => get().rounds,
    }),
    {
      name: 'golf-tracker-storage',
      storage: createJSONStorage(() => ssrSafeStorage),
      partialize: (state) => {
        const { auth, _hydrated, _syncing, ...rest } = state
        return rest
      },
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Migrate single player
          if (state.player && state.players.length === 0) {
            state.players = [state.player];
            state.activePlayerId = state.player.id;
          }
          // Migrate old-format rounds (single playerId + holes) to new format (players[])
          for (const round of state.rounds) {
            if (!('players' in round)) {
              const old = round as any;
              (round as any).players = [{
                playerId: old.playerId || 'local',
                playerName: (() => {
                  const found = state.players?.find((p: Player) => p.id === old.playerId);
                  return found ? playerFullName(found) : old.playerId || 'Player';
                })(),
                handicap: state.player?.handicap || 0,
                holes: old.holes || [],
              }];
            }
          }
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

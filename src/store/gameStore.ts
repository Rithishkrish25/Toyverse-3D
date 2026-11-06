import { create } from 'zustand';
import type {
  GameState,
  GameStateData,
  ToyId,
  Locale,
  AchievementId,
  AchievementDefinition,
  PaintAction,
  SessionResult,
} from './types';
import { MISSIONS, LEVEL_TO_TOY } from '../missions/missionData';
import { TOY_DEFINITIONS } from '../toys/toyRegistry';
import { evaluatePaint } from '../missions/MissionEngine';

// ---------------------------------------------------------------------------
// Achievement definitions
// ---------------------------------------------------------------------------

const ACHIEVEMENT_DEFS: AchievementDefinition[] = [
  {
    id: 'first-stroke',
    nameKey: 'achievement.firstStroke.name',
    iconEmoji: '🎨',
    condition: (s) => s.paintHistory.length >= 1,
  },
  {
    id: 'speed-painter',
    nameKey: 'achievement.speedPainter.name',
    iconEmoji: '⚡',
    condition: (s) =>
      (s.phase === 'complete' || s.phase === 'timeout') && s.remainingSeconds >= 60,
  },
  {
    id: 'perfect-painter',
    nameKey: 'achievement.perfectPainter.name',
    iconEmoji: '⭐',
    condition: (s) =>
      (s.phase === 'complete' || s.phase === 'timeout') &&
      s.correctParts > 0 &&
      s.incorrectParts === 0,
  },
  {
    id: 'colour-explorer',
    nameKey: 'achievement.colourExplorer.name',
    iconEmoji: '🌈',
    condition: (s) => s.colorsUsedThisSession.length >= 12,
  },
  {
    id: 'toy-master',
    nameKey: 'achievement.toyMaster.name',
    iconEmoji: '🏆',
    condition: (s) => {
      const completedToys = new Set(
        s.sessionHistory
          .filter((r) => r.stars > 0)
          .map((r) => r.toyId)
      );
      return completedToys.size >= 5;
    },
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Read persisted locale from localStorage (safe). */
function readPersistedLocale(): Locale {
  try {
    const val = localStorage.getItem('toyverse_locale');
    if (val === 'ta') return 'ta';
  } catch {
    // ignore – localStorage may be unavailable (SSR / private browsing)
  }
  return 'en';
}

/** Read persisted unlocked levels from localStorage. Always includes level 1. */
function readUnlockedLevels(): number[] {
  try {
    const raw = localStorage.getItem('toyverse_unlocked_levels');
    if (raw) {
      const parsed = JSON.parse(raw) as number[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch { /* ignore */ }
  return [1];
}

/** Read persisted completed levels from localStorage. */
function readCompletedLevels(): number[] {
  try {
    const raw = localStorage.getItem('toyverse_completed_levels');
    if (raw) {
      const parsed = JSON.parse(raw) as number[];
      if (Array.isArray(parsed)) return parsed;
    }
  } catch { /* ignore */ }
  return [];
}

/** Persist level progress to localStorage. */
function persistLevels(unlocked: number[], completed: number[]): void {
  try {
    localStorage.setItem('toyverse_unlocked_levels', JSON.stringify(unlocked));
    localStorage.setItem('toyverse_completed_levels', JSON.stringify(completed));
  } catch { /* ignore */ }
}

/** Stars from score. */
function starsFromScore(score: number): 0 | 1 | 2 | 3 {
  if (score >= 90) return 3;
  if (score >= 50) return 2;
  if (score >= 10) return 1;
  return 0;
}

/**
 * Evaluate achievements against the provided state snapshot.
 * Returns the list of newly unlocked achievement ids and side-effects
 * (localStorage persistence) as a plain function so callers can use it
 * both in `paintPart` and `endSession`.
 *
 * The caller is responsible for merging the returned patch into state.
 */
function evalAchievements(
  snap: GameStateData,
  currentUnlocked: AchievementId[]
): { newUnlocked: AchievementId[]; lastToast: AchievementId | null } {
  let newUnlocked = [...currentUnlocked];
  let lastToast: AchievementId | null = null;

  for (const def of ACHIEVEMENT_DEFS) {
    if (!newUnlocked.includes(def.id) && def.condition(snap)) {
      newUnlocked = [...newUnlocked, def.id];
      lastToast = def.id;
      try {
        localStorage.setItem('toyverse_achievements', JSON.stringify(newUnlocked));
      } catch {
        // ignore storage errors for achievements
      }
    }
  }

  return { newUnlocked, lastToast };
}

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

const initialState: GameStateData = {
  activeToyId: null,
  activeMission: null,
  phase: 'start',
  partColors: {},
  activeColor: '#FF0000',
  paintHistory: [],
  showNoPalettePrompt: false,
  score: 0,
  correctParts: 0,
  incorrectParts: 0,
  timeTaken: 0,
  remainingSeconds: 120,
  timerRunning: false,
  unlockedAchievements: [],
  pendingAchievementToast: null,
  sessionHistory: [],
  colorsUsedThisSession: [],
  locale: readPersistedLocale(),
  storageWarning: false,
  currentLevel: 1,
  unlockedLevels: readUnlockedLevels(),
  completedLevels: readCompletedLevels(),
};

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useGameStore = create<GameState>()((set, get) => ({
  // --- initial state ---
  ...initialState,

  // --- actions ---

  selectToy: (toyId: ToyId) => {
    const mission = MISSIONS[toyId];
    let duration = mission.durationSeconds;
    try {
      const stored = localStorage.getItem('toyverse_timer_duration');
      if (stored !== null) {
        const parsed = parseInt(stored, 10);
        if (!isNaN(parsed) && parsed >= 30 && parsed <= 600) {
          duration = parsed;
        }
      }
    } catch {
      // ignore localStorage errors
    }
    set({
      activeToyId: toyId,
      activeMission: mission,
      phase: 'painting',
      partColors: {},
      paintHistory: [],
      score: 0,
      correctParts: 0,
      incorrectParts: 0,
      timeTaken: 0,
      colorsUsedThisSession: [],
      remainingSeconds: duration,
      timerRunning: true,
    });
  },

  selectLevel: (level: number) => {
    const state = get();
    if (!state.unlockedLevels.includes(level)) return; // guard: locked level
    const toyId = LEVEL_TO_TOY[level];
    if (!toyId) return;
    const mission = MISSIONS[toyId];
    let duration = mission.durationSeconds;
    try {
      const stored = localStorage.getItem('toyverse_timer_duration');
      if (stored !== null) {
        const parsed = parseInt(stored, 10);
        if (!isNaN(parsed) && parsed >= 30 && parsed <= 600) duration = parsed;
      }
    } catch { /* ignore */ }
    set({
      currentLevel: level,
      activeToyId: toyId,
      activeMission: mission,
      phase: 'painting',
      partColors: {},
      paintHistory: [],
      score: 0,
      correctParts: 0,
      incorrectParts: 0,
      timeTaken: 0,
      colorsUsedThisSession: [],
      remainingSeconds: duration,
      timerRunning: true,
    });
  },

  paintPart: (partName: string, color: string) => {
    const state = get();
    const previousColor = state.partColors[partName] ?? '#CCCCCC';
    const action: PaintAction = {
      partName,
      previousColor,
      newColor: color,
      timestamp: Date.now(),
    };
    const newPaintHistory = [...state.paintHistory, action];
    const newPartColors = { ...state.partColors, [partName]: color };
    const newColorsUsed = state.colorsUsedThisSession.includes(color)
      ? state.colorsUsedThisSession
      : [...state.colorsUsedThisSession, color];

    // Live mission evaluation
    const evalResult = evaluatePaint(
      state.activeMission,
      partName,
      color,
      newPartColors
    );
    const newScore = Math.max(0, state.score + evalResult.scoreDelta);
    const newCorrectParts = state.correctParts + (evalResult.isTargetHit ? 1 : 0);

    const snap: GameStateData = {
      ...state,
      paintHistory: newPaintHistory,
      partColors: newPartColors,
      colorsUsedThisSession: newColorsUsed,
      score: newScore,
      correctParts: newCorrectParts,
    };
    const { newUnlocked, lastToast } = evalAchievements(snap, state.unlockedAchievements);

    // Auto-complete when all mission targets are correctly painted
    if (evalResult.isComplete) {
      set({
        paintHistory: newPaintHistory,
        partColors: newPartColors,
        colorsUsedThisSession: newColorsUsed,
        score: newScore,
        correctParts: newCorrectParts,
        unlockedAchievements: newUnlocked,
        pendingAchievementToast: lastToast !== null ? lastToast : state.pendingAchievementToast,
        timerRunning: false,
        phase: 'submitting',
      });
      get().calculateResults();
      get().endSession();
      set({ phase: 'complete' });
    } else {
      set({
        paintHistory: newPaintHistory,
        partColors: newPartColors,
        colorsUsedThisSession: newColorsUsed,
        score: newScore,
        correctParts: newCorrectParts,
        unlockedAchievements: newUnlocked,
        pendingAchievementToast: lastToast !== null ? lastToast : state.pendingAchievementToast,
      });
    }
  },

  undoPaint: () => {
    const { paintHistory, partColors } = get();
    if (paintHistory.length === 0) return;

    const last = paintHistory[paintHistory.length - 1];
    set({
      paintHistory: paintHistory.slice(0, -1),
      partColors: { ...partColors, [last.partName]: last.previousColor },
    });
  },

  resetPainting: () =>
    set({
      partColors: {},
      paintHistory: [],
      score: 0,
      correctParts: 0,
      incorrectParts: 0,
      timeTaken: 0,
      colorsUsedThisSession: [],
    }),

  setActiveColor: (color: string) =>
    set({ activeColor: color, showNoPalettePrompt: false }),

  tickTimer: () => {
    const { timerRunning, remainingSeconds } = get();
    if (!timerRunning) return;
    if (remainingSeconds <= 1) {
      set({ remainingSeconds: 0, timerRunning: false, phase: 'timeout' });
      get().calculateResults();
      get().endSession();
      // Unlock next level if ≥1 star even on timeout
      const nextState = get();
      const stars = starsFromScore(nextState.score);
      if (stars >= 1) {
        const nextLevel = nextState.currentLevel + 1;
        const newUnlocked = nextState.unlockedLevels.includes(nextLevel)
          ? nextState.unlockedLevels
          : [...nextState.unlockedLevels, nextLevel];
        const newCompleted = nextState.completedLevels.includes(nextState.currentLevel)
          ? nextState.completedLevels
          : [...nextState.completedLevels, nextState.currentLevel];
        persistLevels(newUnlocked, newCompleted);
        set({ unlockedLevels: newUnlocked, completedLevels: newCompleted });
      }
    } else {
      set({ remainingSeconds: remainingSeconds - 1 });
    }
  },

  pauseTimer: () => set({ timerRunning: false }),

  resumeTimer: () => {
    const { phase } = get();
    if (phase === 'painting') {
      set({ timerRunning: true });
    }
  },

  endSession: () => {
    const state = get();
    const { activeToyId, score, unlockedAchievements, sessionHistory } = state;
    const stars = starsFromScore(score);
    const result: SessionResult = {
      toyId: activeToyId!,
      score,
      accuracy: score,
      stars,
      timestamp: Date.now(),
      achievementsUnlocked: [...unlockedAchievements],
    };
    const newSessionHistory = [...sessionHistory, result];
    let storageWarning = state.storageWarning;
    try {
      localStorage.setItem('toyverse_sessions', JSON.stringify(newSessionHistory));
    } catch {
      storageWarning = true;
    }
    const snap: GameStateData = { ...state, sessionHistory: newSessionHistory };
    const { newUnlocked, lastToast } = evalAchievements(snap, unlockedAchievements);
    set({
      sessionHistory: newSessionHistory,
      storageWarning,
      unlockedAchievements: newUnlocked,
      pendingAchievementToast: lastToast !== null ? lastToast : state.pendingAchievementToast,
    });
  },

  calculateResults: () => {
    const state = get();
    if (!state.activeMission || !state.activeToyId) return;
    const toyDef = TOY_DEFINITIONS[state.activeToyId];
    const totalParts = toyDef.parts.length;
    let correctParts = 0;
    for (const target of state.activeMission.targets) {
      // Use painted colour; fall back to the part's defaultColor (not #CCCCCC)
      // so wheels that were never repainted still match their black target.
      const partDef = toyDef.parts.find((p) => p.name === target.partName);
      const fallback = (partDef as { name: string; defaultColor?: string } | undefined)?.defaultColor ?? '#CCCCCC';
      const painted = state.partColors[target.partName] ?? fallback;
      if (painted.toUpperCase() === target.targetColor.toUpperCase()) {
        correctParts++;
      }
    }
    const accuracy = totalParts > 0 ? Math.round((correctParts / totalParts) * 100) : 0;
    const timeTaken = Math.max(0, state.activeMission.durationSeconds - state.remainingSeconds);
    const snap: GameStateData = {
      ...state,
      score: accuracy,
      correctParts,
      incorrectParts: totalParts - correctParts,
      timeTaken,
    };
    const { newUnlocked, lastToast } = evalAchievements(snap, state.unlockedAchievements);
    set({
      score: accuracy,
      correctParts,
      incorrectParts: totalParts - correctParts,
      timeTaken,
      unlockedAchievements: newUnlocked,
      pendingAchievementToast: lastToast !== null ? lastToast : state.pendingAchievementToast,
    });
  },

  submitChallenge: () => {
    const state = get();
    if (state.phase !== 'painting') return;
    set({ timerRunning: false, phase: 'submitting' });
    get().calculateResults();
    get().endSession();
    // Unlock next level if this level earned ≥1 star
    const nextState = get();
    const stars = starsFromScore(nextState.score);
    if (stars >= 1) {
      const nextLevel = nextState.currentLevel + 1;
      const newUnlocked = nextState.unlockedLevels.includes(nextLevel)
        ? nextState.unlockedLevels
        : [...nextState.unlockedLevels, nextLevel];
      const newCompleted = nextState.completedLevels.includes(nextState.currentLevel)
        ? nextState.completedLevels
        : [...nextState.completedLevels, nextState.currentLevel];
      persistLevels(newUnlocked, newCompleted);
      set({ unlockedLevels: newUnlocked, completedLevels: newCompleted });
    }
    set({ phase: 'complete' });
  },

  startGame: () => {
    const state = get();
    if (state.phase !== 'start') return;
    // Go directly to Level 1 (Car) — skip the level selection screen
    const level = 1;
    const toyId = LEVEL_TO_TOY[level];
    const mission = MISSIONS[toyId];
    let duration = mission.durationSeconds;
    try {
      const stored = localStorage.getItem('toyverse_timer_duration');
      if (stored !== null) {
        const parsed = parseInt(stored, 10);
        if (!isNaN(parsed) && parsed >= 30 && parsed <= 600) duration = parsed;
      }
    } catch { /* ignore */ }
    set({
      currentLevel: level,
      activeToyId: toyId,
      activeMission: mission,
      phase: 'painting',
      partColors: {},
      paintHistory: [],
      score: 0,
      correctParts: 0,
      incorrectParts: 0,
      timeTaken: 0,
      colorsUsedThisSession: [],
      remainingSeconds: duration,
      timerRunning: true,
    });
  },

  resetChallenge: () => {
    const state = get();
    if (!state.activeToyId || !state.activeMission) return;
    let duration = state.activeMission.durationSeconds;
    try {
      const stored = localStorage.getItem('toyverse_timer_duration');
      if (stored !== null) {
        const parsed = parseInt(stored, 10);
        if (!isNaN(parsed) && parsed >= 30 && parsed <= 600) {
          duration = parsed;
        }
      }
    } catch {
      // ignore
    }
    set({
      partColors: {},
      paintHistory: [],
      score: 0,
      correctParts: 0,
      incorrectParts: 0,
      timeTaken: 0,
      colorsUsedThisSession: [],
      remainingSeconds: duration,
      timerRunning: true,
      phase: 'painting',
    });
  },

  goHome: () => {
    set({
      phase: 'start',
      activeToyId: null,
      activeMission: null,
      partColors: {},
      paintHistory: [],
      score: 0,
      correctParts: 0,
      incorrectParts: 0,
      timeTaken: 0,
      colorsUsedThisSession: [],
      remainingSeconds: 120,
      timerRunning: false,
    });
  },

  setLocale: (locale: Locale) => {
    set({ locale });
    try {
      localStorage.setItem('toyverse_locale', locale);
    } catch {
      // ignore
    }
  },

  showAchievementToast: (id: AchievementId) =>
    set({ pendingAchievementToast: id }),

  dismissAchievementToast: () => set({ pendingAchievementToast: null }),

  setStorageWarning: (val: boolean) => set({ storageWarning: val }),

  showNoPalettePromptAction: () => set({ showNoPalettePrompt: true }),

  dismissNoPalettePrompt: () => set({ showNoPalettePrompt: false }),
}));

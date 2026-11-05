export type ToyId = 'car' | 'bike' | 'lorry';
export type Locale = 'en' | 'ta';
export type PaletteColorId = 'red' | 'orange' | 'yellow' | 'green' | 'teal' | 'blue' | 'purple' | 'pink' | 'brown' | 'white' | 'grey' | 'black';

export type Phase = 'start' | 'selection' | 'painting' | 'submitting' | 'complete' | 'timeout';

export interface PaletteColor {
  id: PaletteColorId;
  hex: string;
}

export interface PartDefinition {
  name: string;
  defaultColor: string;
  label: Record<Locale, string>;
}

export interface ToyDefinition {
  id: ToyId;
  label: Record<Locale, string>;
  parts: PartDefinition[];
}

export interface MissionTarget {
  partName: string;
  targetColor: string;
}

export interface Mission {
  id: string;
  toyId: ToyId;
  targets: MissionTarget[];
  durationSeconds: number;
}

export interface PaintAction {
  partName: string;
  previousColor: string;
  newColor: string;
  timestamp: number;
}

export type AchievementId =
  | 'first-stroke'
  | 'speed-painter'
  | 'perfect-painter'
  | 'colour-explorer'
  | 'toy-master';

export interface AchievementDefinition {
  id: AchievementId;
  nameKey: string;
  iconEmoji: string;
  condition: (state: Omit<GameState, keyof GameActions>) => boolean;
}

export interface SessionResult {
  toyId: ToyId;
  score: number;
  accuracy: number;
  stars: 0 | 1 | 2 | 3;
  timestamp: number;
  achievementsUnlocked: AchievementId[];
}

export interface GameActions {
  selectToy: (toyId: ToyId) => void;
  paintPart: (partName: string, color: string) => void;
  undoPaint: () => void;
  resetPainting: () => void;
  setActiveColor: (color: string) => void;
  tickTimer: () => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  endSession: () => void;
  setLocale: (locale: Locale) => void;
  showAchievementToast: (id: AchievementId) => void;
  dismissAchievementToast: () => void;
  setStorageWarning: (val: boolean) => void;
  showNoPalettePromptAction: () => void;
  dismissNoPalettePrompt: () => void;
  startGame: () => void;
  submitChallenge: () => void;
  calculateResults: () => void;
  resetChallenge: () => void;
  goHome: () => void;
}

export interface GameStateData {
  activeToyId: ToyId | null;
  activeMission: Mission | null;
  phase: Phase;
  partColors: Record<string, string>;
  activeColor: string | null;
  paintHistory: PaintAction[];
  showNoPalettePrompt: boolean;
  score: number;
  correctParts: number;
  incorrectParts: number;
  timeTaken: number;
  remainingSeconds: number;
  timerRunning: boolean;
  unlockedAchievements: AchievementId[];
  pendingAchievementToast: AchievementId | null;
  sessionHistory: SessionResult[];
  colorsUsedThisSession: string[];
  locale: Locale;
  storageWarning: boolean;
}

export type GameState = GameStateData & GameActions;

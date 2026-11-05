# Design Document: TOYVERSE – BUILD, PAINT & PLAY

## Overview

TOYVERSE is a browser-based 3D educational painting game for children built with React + Vite + TypeScript + Three.js + React Three Fiber (R3F) + Drei + Zustand. Players select one of five procedurally generated 3D toys, paint each named mesh part using a 12-colour palette, and complete colour-matching missions under a countdown timer. The experience rewards accuracy with points, stars, and achievements, and supports English and Tamil through a runtime-switchable i18n layer.

### Design Goals

- **Real 3D painting**: Every colour change mutates the Three.js `MeshStandardMaterial` directly on the GPU — no canvas overlays or texture swaps.
- **Separation of concerns**: 3D scene, painting logic, game state, UI, and i18n are fully isolated modules that communicate only through the Zustand `GameStore`.
- **Child-friendly performance**: 30 fps minimum on integrated GPUs, ≤50 000 triangles per toy, idle render throttle, and lazy geometry loading.
- **Extensibility**: Adding a sixth toy or a third language requires no changes to core engine code.

---

## Architecture

### High-Level Component Tree

```
App
└── AppRouter (React Router v6)
    ├── HomeScreen          → /
    ├── PaintingScreen      → /paint/:toyId
    ├── DashboardScreen     → /dashboard
    └── SettingsScreen      → /settings

PaintingScreen
├── WorkshopCanvas (R3F Canvas)
│   ├── EnvironmentSetup   (lights, background)
│   ├── CameraController   (OrbitControls + auto-rotate)
│   ├── ToyLoader          (lazy-loads selected toy)
│   │   └── <ToyModel>     (RacingCar | Robot | … )
│   │       └── <PartMesh> ×N  (individual paintable meshes)
│   └── PaintingController (raycasting → material update)
└── HUD overlay (DOM / CSS)
    ├── Palette
    ├── HUD (timer, score, accuracy)
    ├── UndoResetBar
    └── AchievementToast
```

### Data-Flow Diagram

```
User Interaction
      │
      ▼
PaintingController
  (raycast → partName + activeColour)
      │
      ▼
GameStore (Zustand)
  ├── paintPart()       → updates partColors map
  ├── pushPaintHistory()→ appends PaintAction
  ├── evaluateMission() → triggers MissionEngine
  └── updateScore()     → updates score / accuracy
      │
      ├─▶ ToyModel re-renders Part material colour
      ├─▶ HUD re-renders timer / score / accuracy
      └─▶ MissionEngine → CompletionAnimation (if all targets met)
```

### Module Boundaries

| Module | Responsibility | May import from |
|--------|---------------|----------------|
| `scene/` | R3F canvas, lights, camera | `store/`, `utils/` |
| `toys/` | Mesh geometry, part manifests | `store/`, `utils/` |
| `painting/` | Raycasting, hover, undo stack | `store/`, `utils/` |
| `missions/` | Mission data, scoring engine | `store/`, `utils/` |
| `animations/` | CompletionAnimation, particles | `store/`, `utils/` |
| `ui/` | All React DOM components | `store/`, `i18n/`, `utils/` |
| `store/` | Zustand store (single source of truth) | `utils/` only |
| `i18n/` | Translation lookup, locale persistence | `utils/` only |
| `utils/` | Pure helpers (color, math, storage) | none |

---

## Components and Interfaces

### WorkshopCanvas

R3F `<Canvas>` host. Provides the WebGL renderer, camera, and scene graph root.

```tsx
// scene/WorkshopCanvas.tsx
interface WorkshopCanvasProps {
  /** toyId of the currently loaded toy; undefined on HomeScreen */
  activeToyId?: ToyId;
}
```

Key responsibilities:
- Instantiates `EnvironmentSetup` (ambient + directional lights).
- Instantiates `CameraController` (OrbitControls, clamp, auto-rotate timer).
- Conditionally renders `ToyLoader` when `activeToyId` is defined.
- Disposes the previous toy's geometries/materials when `activeToyId` changes.

### CameraController

Wraps Drei's `<OrbitControls>` with auto-rotate logic.

- `minDistance=1`, `maxDistance=10`, `maxPolarAngle=Math.PI/2` (no below-ground).
- Auto-rotate activates after 5 s of pointer inactivity at 10°/s; pauses within one frame on `pointerdown`.
- Every pointer/touch event resets the idle timer.

### ToyLoader

Dynamic-imports the toy component for `activeToyId`, suspending while loading (Requirement 14.4).

```tsx
// toys/ToyLoader.tsx
interface ToyLoaderProps {
  toyId: ToyId;
  onLoaded: () => void;
}
```

Tracks which toy was previously mounted and calls `disposeToy(previousToyId)` before mounting the new one (Requirement 14.2).

### Toy Model Components (RacingCar, Robot, Dinosaur, Rocket, Aeroplane)

Each toy file exports:

```ts
// toys/types.ts
export interface PartDefinition {
  name: string;          // unique mesh userData.partName
  defaultColor: string;  // hex string e.g. "#FF0000"
  label: Record<Locale, string>; // display name per locale
}

export interface ToyDefinition {
  id: ToyId;
  label: Record<Locale, string>;
  parts: PartDefinition[];
  thumbnailComponent: React.FC; // small preview for HomeScreen
}
```

Each `<PartMesh>` inside a toy component:
- Receives `color` from `GameStore.partColors[partName]` (or `defaultColor`).
- Sets `mesh.material.color.set(color)` in a `useEffect` keyed on `color`.
- Fires `onPointerOver`/`onPointerOut` for hover glow via `PartHighlight`.
- Fires `onPointerDown` → `PaintingController.handlePartClick(partName)`.

### PaintingController

Pure logic hook — no JSX output.

```ts
// painting/PaintingController.tsx
interface PaintAction {
  partName: string;
  previousColor: string;
  newColor: string;
}

function usePaintingController(toyId: ToyId): {
  handlePartClick: (partName: string) => void;
}
```

Flow on `handlePartClick`:
1. Read `activeColor` from `GameStore`.
2. If `activeColor` is null → dispatch `showNoPalettePrompt()`.
3. Read `partColors[partName]` as `previousColor`.
4. Call `GameStore.paintPart(partName, activeColor)`.
5. Push `{ partName, previousColor, newColor: activeColor }` to `PaintHistory`.
6. Call `MissionEngine.evaluatePaint(partName, activeColor)`.

### PartHighlight

Manages hover emissive glow via `onPointerOver`/`onPointerOut` on each part mesh.

```ts
// painting/PartHighlight.tsx
function usePartHighlight(meshRef: React.RefObject<THREE.Mesh>): {
  onPointerOver: () => void;
  onPointerOut: () => void;
}
```

Sets `mesh.material.emissive.set(0x444444)` on hover; restores `0x000000` on leave. Does not alter `.color`.

### PaintHistory (Undo Stack)

```ts
// painting/PaintHistory.ts
interface PaintHistoryState {
  stack: PaintAction[];
  push: (action: PaintAction) => void;
  pop: () => PaintAction | undefined;
  clear: () => void;
  isEmpty: () => boolean;
}
```

Integrated into `GameStore` as a sub-slice. `undo()` action pops the stack and calls `paintPart(partName, previousColor)` without pushing to history (avoids loops).

### MissionEngine

Pure TypeScript module with no side effects; called by the store.

```ts
// missions/MissionEngine.ts
interface MissionEvalResult {
  isTargetHit: boolean;   // this paint matches the target
  isComplete: boolean;    // all targets in mission now correct
  scoreDelta: number;     // +10 or -5
  accuracyUpdate: { correct: number; total: number };
}

function evaluatePaint(
  mission: Mission,
  partName: string,
  paintedColor: string,
  partColorHistory: Record<string, string>
): MissionEvalResult
```

### Palette

```tsx
// ui/components/Palette.tsx
const PALETTE_COLORS: PaletteColor[] = [
  { id: 'red',    hex: '#FF0000' },
  { id: 'orange', hex: '#FF8000' },
  // … 12 total
];
```

- Renders 12 swatches at ≥44×44 px touch targets (Requirement 5.5).
- Fires `GameStore.setActiveColor(hex)` on swatch click.
- Applies selection indicator (4 px size increase or 3 px border) to active swatch.
- Pre-selects `#FF0000` on mount (Requirement 5.6).
- Positioned absolutely so it never overlaps the central 3D canvas region.

### HUD

```tsx
// ui/components/HUD.tsx
```

Displays:
- Timer in `MM:SS` format, red + pulsing at <30 s remaining.
- Current Score (updated within 100 ms of paint action via Zustand subscription).
- Accuracy `%`.
- Mission target hints (small colour swatches next to part labels).

### AchievementToast

Uses a CSS `@keyframes` fade-in/out. Renders for exactly 3 seconds then auto-dismisses via `setTimeout` (Requirement 11.6).

### AppRouter

```tsx
// ui/router/AppRouter.tsx
const routes = [
  { path: '/',              element: <HomeScreen /> },
  { path: '/paint/:toyId',  element: <PaintingScreen /> },
  { path: '/dashboard',     element: <DashboardScreen /> },
  { path: '/settings',      element: <SettingsScreen /> },
  { path: '*',              element: <Navigate to="/" /> }, // Req 13.4
];
```

---

## Data Models

### Core TypeScript Interfaces

```ts
// store/types.ts

export type ToyId = 'racing-car' | 'robot' | 'dinosaur' | 'rocket' | 'aeroplane';
export type Locale = 'en' | 'ta';
export type PaletteColorId = 'red' | 'orange' | 'yellow' | 'green' | 'teal'
  | 'blue' | 'purple' | 'pink' | 'brown' | 'white' | 'grey' | 'black';

export interface PaletteColor {
  id: PaletteColorId;
  hex: string; // e.g. "#FF0000"
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
  thumbnailComponent: React.FC;
}

export interface MissionTarget {
  partName: string;
  targetColor: string; // hex
}

export interface Mission {
  id: string;
  toyId: ToyId;
  targets: MissionTarget[];
  durationSeconds: number; // 30–600, default 120
}

export interface PaintAction {
  partName: string;
  previousColor: string;
  newColor: string;
  timestamp: number;
}

export interface AchievementDefinition {
  id: AchievementId;
  nameKey: string;          // i18n key
  iconUrl: string;
  condition: (state: GameState) => boolean;
}

export type AchievementId =
  | 'first-stroke'
  | 'speed-painter'
  | 'perfect-painter'
  | 'colour-explorer'
  | 'toy-master';

export interface SessionResult {
  toyId: ToyId;
  score: number;
  accuracy: number;       // 0–100
  stars: 0 | 1 | 2 | 3;
  timestamp: number;      // Unix ms
  achievementsUnlocked: AchievementId[];
}

export interface GameState {
  // Session
  activeToyId: ToyId | null;
  activeMission: Mission | null;
  phase: 'selection' | 'painting' | 'complete' | 'timeout';

  // Painting
  partColors: Record<string, string>;   // partName → current hex color
  activeColor: string | null;           // currently selected palette color
  paintHistory: PaintAction[];
  showNoPalettePrompt: boolean;

  // Scoring
  score: number;
  correctPaints: number;
  totalMissionPaints: number;

  // Timer
  remainingSeconds: number;
  timerRunning: boolean;

  // Achievements & Progress
  unlockedAchievements: AchievementId[];
  sessionHistory: SessionResult[];
  colorsUsedThisSession: Set<string>;

  // i18n
  locale: Locale;

  // Actions
  selectToy: (toyId: ToyId) => void;
  startMission: (mission: Mission) => void;
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
}
```

### localStorage Schema

```ts
// Key: "toyverse_sessions"
// Value: JSON.stringify(SessionResult[])

// Key: "toyverse_achievements"
// Value: JSON.stringify(AchievementId[])

// Key: "toyverse_locale"
// Value: "en" | "ta"
```

### Score Computation Rules

| Event | Score Delta | Floor |
|-------|------------|-------|
| Correct MissionTarget paint | +10 | — |
| Incorrect MissionTarget paint | −5 | 0 |

**Star Rating Thresholds:**

| Stars | Score Range |
|-------|------------|
| 0 ⭐ | < 10 |
| 1 ⭐ | ≥ 10 |
| 2 ⭐ | ≥ 50 |
| 3 ⭐ | ≥ 90 |

**Accuracy Formula:**  
`accuracy = Math.round((correctPaints / totalMissionPaints) * 100)` where `totalMissionPaints` counts every paint action on a MissionTarget part (including repaints).

### i18n Translation Structure

```ts
// i18n/en.ts
export const en: TranslationMap = {
  'home.title': 'TOYVERSE – BUILD, PAINT & PLAY',
  'home.selectToy': 'Choose Your Toy',
  'palette.label': 'Pick a Colour',
  'hud.score': 'Score',
  'hud.time': 'Time',
  'hud.accuracy': 'Accuracy',
  'mission.complete': 'Mission Complete!',
  'achievement.firstStroke.name': 'First Stroke',
  'achievement.speedPainter.name': 'Speed Painter',
  'achievement.perfectPainter.name': 'Perfect Painter',
  'achievement.colourExplorer.name': 'Colour Explorer',
  'achievement.toyMaster.name': 'Toy Master',
  'error.loadFailed': 'Failed to load. Please retry.',
  'error.noColourSelected': 'Please select a colour first!',
  // … (all keys also present in ta.ts)
};
```

Fallback: `i18n/index.ts` returns `en[key]` when `ta[key]` is undefined, and logs `console.warn`.

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property 1: Colour Application Round-Trip

*For any* paintable Part in any Toy and any valid hex colour string, after calling `paintPart(partName, colour)`, the Three.js mesh's `material.color` (converted to hex) SHALL equal the applied colour.

**Validates: Requirements 2.2, 4.3**

---

### Property 2: Camera Distance Invariant

*For any* scroll, pinch, or programmatic zoom input applied to the camera, the resulting camera distance from the Toy centre SHALL always remain within the closed interval [1, 10] units — it SHALL never be less than 1 or greater than 10.

**Validates: Requirements 3.2**

---

### Property 3: Camera Polar Angle Invariant

*For any* vertical drag input or programmatic camera tilt, the camera's polar angle SHALL never exceed `Math.PI / 2` radians (90°), ensuring the camera cannot descend below the scene's ground plane.

**Validates: Requirements 3.5**

---

### Property 4: Hover Emissive Isolation

*For any* Part mesh in any Toy, triggering `onPointerOver` SHALL set the mesh's `material.emissive` to a non-zero value, and subsequently triggering `onPointerOut` SHALL restore `material.emissive` to exactly `0x000000` — with the mesh's `material.color` unchanged throughout.

**Validates: Requirements 4.2**

---

### Property 5: Paint History Recording

*For any* Part name and any colour value passed to `paintPart()`, the `paintHistory` array SHALL contain a `PaintAction` entry with `partName` equal to that Part name, `newColor` equal to the applied colour, and `previousColor` equal to the colour that Part held immediately before the action.

**Validates: Requirements 4.4**

---

### Property 6: Part Painting Isolation

*For any* paint action targeting Part P with colour C, every other Part Q where `Q.name !== P.name` SHALL retain its colour value from immediately before the paint action — `partColors[Q.name]` SHALL be unchanged.

**Validates: Requirements 4.5**

---

### Property 7: Single Active Colour Invariant

*For any* sequence of palette swatch selections, at any point in time the `activeColor` in `GameStore` SHALL equal exactly the most recently selected swatch's hex value, and no other swatch SHALL carry the selection indicator.

**Validates: Requirements 5.2, 5.3**

---

### Property 8: Swatch Touch Target Size

*For every* rendered colour swatch in the Palette, the element's `offsetWidth` SHALL be ≥ 44 CSS pixels and `offsetHeight` SHALL be ≥ 44 CSS pixels.

**Validates: Requirements 5.5**

---

### Property 9: Correct-Paint Score Increment

*For any* `MissionTarget` whose `partName` and `targetColor` are defined, painting that Part with a colour whose RGB values are identical to `targetColor` SHALL increment `GameStore.score` by exactly 10 points.

**Validates: Requirements 6.3, 8.2**

---

### Property 10: Incorrect-Paint Score Decrement with Floor

*For any* `MissionTarget`, painting it with a colour whose RGB values differ from `targetColor` SHALL decrement `GameStore.score` by exactly 5 points, with `score` floored at 0 — `score` SHALL never become negative.

**Validates: Requirements 6.5, 8.3**

---

### Property 11: Accuracy Formula Invariant

*For any* sequence of paint actions on MissionTarget Parts, where `correctPaints` counts actions whose colour matched the target and `totalMissionPaints` counts all such actions (including repaints), the computed `accuracy` SHALL equal `Math.round((correctPaints / totalMissionPaints) * 100)` as an integer in the range [0, 100].

**Validates: Requirements 6.6**

---

### Property 12: Star Rating Threshold Mapping

*For any* numeric `score` value ≥ 0, `computeStarRating(score)` SHALL return: 0 when `score < 10`; 1 when `10 ≤ score < 50`; 2 when `50 ≤ score < 90`; 3 when `score ≥ 90`.

**Validates: Requirements 8.5**

---

### Property 13: Timer MM:SS Formatting

*For any* integer `remainingSeconds` in the range [0, 599], `formatTimer(remainingSeconds)` SHALL return a string of the form `"MM:SS"` where `MM` equals `Math.floor(remainingSeconds / 60)` zero-padded to two digits and `SS` equals `remainingSeconds % 60` zero-padded to two digits.

**Validates: Requirements 7.2**

---

### Property 14: Undo Restores Previous Colour

*For any* non-empty `paintHistory`, calling `undoPaint()` SHALL restore the Part referenced by the most recent `PaintAction` to its `previousColor` value and SHALL remove that entry from `paintHistory` — leaving all other Parts' colours unchanged.

**Validates: Requirements 9.2**

---

### Property 15: Reset Restores All Default Colours

*For any* set of paint actions applied to any Toy's Parts, after `resetPainting()` is confirmed, every Part's colour in `partColors` SHALL equal that Part's `defaultColor` as defined in its `PartDefinition`, and `paintHistory` SHALL be empty.

**Validates: Requirements 9.6**

---

### Property 16: Reset Cancel Preserves State

*For any* `partColors` and `paintHistory` state, cancelling the reset dialog (without confirming) SHALL leave `partColors` and `paintHistory` byte-for-byte identical to their pre-dialog state.

**Validates: Requirements 9.7**

---

### Property 17: Session Result Persistence Round-Trip

*For any* `SessionResult` produced by `endSession()`, reading the `"toyverse_sessions"` key from `localStorage` and parsing it SHALL yield an array containing an entry whose `toyId`, `score`, `accuracy`, `stars`, and `timestamp` fields are equal to the original `SessionResult`.

**Validates: Requirements 11.1**

---

### Property 18: Dashboard Session Coverage

*For any* array of `SessionResult` objects stored in `localStorage`, the Dashboard component SHALL render exactly the same number of session summary cards as there are entries in that array, with each card displaying the correct `toyId`, `score`, `accuracy`, `stars`, and `timestamp`.

**Validates: Requirements 11.3**

---

### Property 19: Total Stars Accumulation

*For any* array of `SessionResult` objects, `GameStore.totalStars` SHALL equal the arithmetic sum of the `stars` field across all stored sessions — i.e., `sessionHistory.reduce((sum, s) => sum + s.stars, 0)`.

**Validates: Requirements 11.4**

---

### Property 20: Achievement Dashboard Coverage

*For any* set of `unlockedAchievements` IDs, the Dashboard SHALL render all five Achievement entries; those whose ID is in `unlockedAchievements` SHALL be styled as unlocked (full opacity, coloured icon) and those not in the set SHALL be styled as locked (greyed-out placeholder).

**Validates: Requirements 11.7**

---

### Property 21: Translation Lookup Correctness

*For any* translation key `k` and any Locale `L` where `translationMap[L][k]` is defined, `t(k, L)` SHALL return exactly `translationMap[L][k]`.

**Validates: Requirements 12.2**

---

### Property 22: Locale Switch Persistence

*For any* Locale value `L` (either `"en"` or `"ta"`), after calling `setLocale(L)`, every visible UI text element SHALL re-render using strings from locale `L`'s translation map, and `localStorage.getItem("toyverse_locale")` SHALL equal `L`.

**Validates: Requirements 12.3**

---

### Property 23: i18n Fallback to English

*For any* translation key `k` that is present in the `"en"` translation map but absent from the `"ta"` translation map, calling `t(k, 'ta')` SHALL return the English string `en[k]` and SHALL invoke `console.warn` exactly once with a message referencing the missing key.

**Validates: Requirements 12.5**

---

### Property 24: Three.js Resource Disposal on Toy Unload

*For any* Toy that was previously loaded into the scene, when it is unloaded (i.e., when `activeToyId` changes away from it), `geometry.dispose()` SHALL have been called on every `THREE.BufferGeometry` associated with that Toy, `material.dispose()` SHALL have been called on every `THREE.Material`, and `texture.dispose()` SHALL have been called on every `THREE.Texture` referenced by those materials.

**Validates: Requirements 14.2**

---

### Property 25: Toy Name Locale Rendering

*For any* Toy in the selection screen and any active Locale, the rendered toy name text SHALL equal `toyDefinition.label[activeLocale]` as defined in that toy's `ToyDefinition`.

**Validates: Requirements 1.5**

---

### Property 26: Mission Hint Display Count

*For any* active Mission with `N` MissionTargets, the HUD SHALL render exactly `N` colour hint elements — one per MissionTarget Part — each displaying the corresponding `targetColor` swatch.

**Validates: Requirements 6.2**

---

## Error Handling

### Load Failures

- **Toy geometry load failure**: `ToyLoader` wraps `React.Suspense` with an `ErrorBoundary`. If a dynamic import rejects or times out beyond 5 s, the ErrorBoundary renders an error UI with a localised message and a "Retry" button that re-attempts the import (Requirement 1.6).
- **Application initial render failure**: A top-level `ErrorBoundary` in `App.tsx` catches render errors and shows a full-screen error fallback with a reload button.

### localStorage Unavailability

`storageUtils.ts` wraps all `localStorage` calls in `try/catch`. On `SecurityError` (private browsing mode or quota exceeded), it calls `GameStore.setStorageWarning(true)`, which causes the HUD to render a localised warning banner. The Session continues in-memory without persistence (Requirement 11.2).

### Missing Translation Keys

`i18n/index.ts` falls back to `en[key]` for any missing key in any non-English locale and calls `console.warn('i18n: missing key "%s" in locale "%s"', key, locale)`. The application never crashes on a missing translation (Requirement 12.5).

### Timer Edge Cases

- **Window blur before mission start**: Timer remains at initial value; no pause/resume needed.
- **Window blur and close before session end**: Session is not persisted (no `endSession()` call). This is acceptable — partial sessions are not saved.
- **Timer initialised outside [30, 600] s range**: `MissionEngine` clamps the value at construction time and logs a console warning.

### Painting Edge Cases

- **Click with no active colour**: `PaintingController` dispatches `showNoPalettePrompt()` instead of calling `paintPart()`. No history entry is pushed.
- **Undo on empty history**: `GameStore.undoPaint()` is a no-op; the Undo button is in a CSS `disabled` state and ignores click events (Requirement 9.3).
- **Reset on a pristine toy (no paint actions)**: Reset is still allowed; the confirmation dialog appears, and confirming is effectively a no-op (history is already empty, colours already at defaults).

### Navigation Edge Cases

- **Unknown route**: `AppRouter` includes a `path="*"` catch-all that navigates to `"/"` (Requirement 13.4).
- **Rapid route switching**: Each route transition cancels any in-flight dynamic imports from the previous navigation before initiating the new one, preventing race conditions on toy load.

---

## Testing Strategy

### Dual Testing Approach

TOYVERSE uses a dual-layer testing strategy:

1. **Unit / example-based tests** — verify specific behaviors, initialization states, edge cases, and UI structure.
2. **Property-based tests** — verify universal invariants (Properties 1–26 above) across randomly generated inputs using [fast-check](https://fast-check.io/), the TypeScript/JavaScript property-based testing library.

### Test Framework Setup

| Tool | Purpose |
|------|---------|
| **Vitest** | Test runner (integrates natively with Vite) |
| **React Testing Library** | Component rendering and DOM assertions |
| **fast-check** | Property-based testing (≥100 iterations per property) |
| **@testing-library/user-event** | Simulated pointer/keyboard events |
| **vitest-canvas-mock** | Stubs HTMLCanvasElement for jsdom |
| **three-stdlib** | Used alongside mocks for Three.js geometry/material spies |

### Property-Based Test Configuration

Each property-based test MUST:
- Run a minimum of **100 iterations** (configured via `fc.assert(fc.property(...), { numRuns: 100 })`).
- Be tagged with a comment referencing the design property.
- Use mocks for Three.js scene objects and `localStorage` to avoid I/O in unit tests.

Tag format:
```
// Feature: toyverse-game, Property N: <property title>
```

### Property Test Examples

**Property 1 — Colour Application Round-Trip:**
```ts
// Feature: toyverse-game, Property 1: Colour Application Round-Trip
fc.assert(fc.property(
  fc.constantFrom(...PART_NAMES),
  fc.hexaString({ minLength: 6, maxLength: 6 }).map(h => '#' + h),
  (partName, colour) => {
    store.getState().paintPart(partName, colour);
    const mesh = getMeshForPart(partName);
    expect('#' + mesh.material.color.getHexString().toUpperCase())
      .toBe(colour.toUpperCase());
  }
), { numRuns: 100 });
```

**Property 10 — Incorrect-Paint Score Decrement with Floor:**
```ts
// Feature: toyverse-game, Property 10: Incorrect-Paint Score Decrement with Floor
fc.assert(fc.property(
  fc.integer({ min: 0, max: 200 }),
  fc.constantFrom(...MISSION_TARGETS),
  fc.hexaString({ minLength: 6, maxLength: 6 }).map(h => '#' + h),
  (initialScore, target, wrongColour) => {
    fc.pre(wrongColour.toUpperCase() !== target.targetColor.toUpperCase());
    store.setState({ score: initialScore });
    store.getState().paintPart(target.partName, wrongColour);
    expect(store.getState().score).toBe(Math.max(0, initialScore - 5));
  }
), { numRuns: 100 });
```

**Property 12 — Star Rating Threshold Mapping:**
```ts
// Feature: toyverse-game, Property 12: Star Rating Threshold Mapping
fc.assert(fc.property(
  fc.integer({ min: 0, max: 500 }),
  (score) => {
    const stars = computeStarRating(score);
    if (score < 10) expect(stars).toBe(0);
    else if (score < 50) expect(stars).toBe(1);
    else if (score < 90) expect(stars).toBe(2);
    else expect(stars).toBe(3);
  }
), { numRuns: 200 });
```

### Unit / Example-Based Tests

Unit tests focus on:
- **Initialisation states**: `score===0`, `activeColor==='#FF0000'`, `phase==='selection'` on store creation.
- **Specific UI structure**: Palette renders exactly 12 swatches; HomeScreen renders 5 thumbnails.
- **Event-driven state transitions**: Timer stops on blur; auto-rotate resumes after 5 s idle; CompletionAnimation triggered when all targets matched.
- **Integration points**: `MissionEngine.evaluatePaint()` returns correct `MissionEvalResult` for concrete target/paint pairs.
- **Edge cases**: Undo on empty history is no-op; reset confirm clears history; undefined route redirects to Home.

### Integration / Smoke Tests

- **Three.js scene**: Scene contains ≥1 `AmbientLight` and ≥1 `DirectionalLight`.
- **Triangle budget**: Each toy's total triangle count is ≤50 000.
- **Touch targets**: All 12 palette swatches have `offsetWidth ≥ 44` and `offsetHeight ≥ 44`.
- **Bundle size**: Vite build output gzipped size (excluding peer deps) is ≤500 KB.
- **Font rendering**: Noto Sans Tamil WOFF2 file is present in `public/fonts/` and loaded via `@font-face`.
- **Router smoke**: Navigating to `/unknown-path` redirects to `/` with "page not found" text visible.

### Test File Organisation

```
src/
├── scene/__tests__/
│   ├── CameraController.test.ts    # Properties 2, 3
│   └── WorkshopCanvas.test.tsx     # Smoke: lights present
├── toys/__tests__/
│   ├── ToyLoader.test.tsx          # Property 24 (disposal)
│   └── toyModels.test.ts           # Part count ≥5; triangle budget
├── painting/__tests__/
│   ├── PaintingController.test.ts  # Properties 1, 4, 5, 6
│   └── PaintHistory.test.ts        # Properties 14, 15, 16
├── missions/__tests__/
│   ├── MissionEngine.test.ts       # Properties 9, 10, 11, 12, 26
│   └── missionData.test.ts         # ≥1 mission per toy
├── ui/__tests__/
│   ├── Palette.test.tsx            # Properties 7, 8 + examples
│   ├── HUD.test.tsx                # Property 13 + examples
│   ├── DashboardScreen.test.tsx    # Properties 18, 19, 20
│   └── HomeScreen.test.tsx         # Property 25 + 5 thumbnails check
├── store/__tests__/
│   └── gameStore.test.ts           # Properties 17 + init checks
└── i18n/__tests__/
    └── i18n.test.ts                # Properties 21, 22, 23
```

# Implementation Plan: TOYVERSE – BUILD, PAINT & PLAY

## Overview

Implementation follows the seven-phase development roadmap defined in the design document. Each phase builds on the previous one, starting with project scaffolding and ending with performance optimisation and polish. All code is TypeScript + React + Three.js + React Three Fiber + Zustand. Property-based tests use fast-check; unit and integration tests use Vitest + React Testing Library.

---

## Tasks

- [x] 1. Phase 1 – Scaffold & Scene Foundation
  - [x] 1.1 Initialise Vite + React + TypeScript project with required dependencies
    - Create `package.json` with exact versions: `react`, `react-dom`, `@react-three/fiber`, `@react-three/drei`, `three`, `zustand`, `react-router-dom`, `fast-check`, `vitest`, `@testing-library/react`, `@testing-library/user-event`, `vitest-canvas-mock`
    - Create `vite.config.ts` with React plugin and bundle-size budget (≤500 KB gzipped, excluding peer deps)
    - Create `tsconfig.json` with strict mode and path aliases for each module folder
    - Create `index.html` and `src/main.tsx` entry point
    - _Requirements: 14.5, 15.1_

  - [x] 1.2 Create project folder structure and core TypeScript interfaces
    - Create directories: `scene/`, `toys/models/`, `painting/`, `missions/`, `animations/`, `ui/screens/`, `ui/components/`, `ui/router/`, `store/`, `i18n/`, `utils/`
    - Create `store/types.ts` with all interfaces: `ToyId`, `Locale`, `PaletteColorId`, `PaletteColor`, `PartDefinition`, `ToyDefinition`, `MissionTarget`, `Mission`, `PaintAction`, `AchievementDefinition`, `AchievementId`, `SessionResult`, `GameState`
    - Create `toys/types.ts` re-exporting `PartDefinition` and `ToyDefinition`
    - Create `painting/types.ts` re-exporting `PaintAction`
    - Create `missions/types.ts` re-exporting `Mission` and `MissionTarget`
    - _Requirements: 15.1, 15.2_

  - [x] 1.3 Implement Zustand GameStore skeleton
    - Create `store/gameStore.ts` with fully typed `GameState` and all action stubs
    - Initialise `score: 0`, `activeColor: '#FF0000'`, `phase: 'selection'`, `paintHistory: []`, `partColors: {}`, `timerRunning: false`, `remainingSeconds: 120`, `unlockedAchievements: []`, `sessionHistory: []`, `colorsUsedThisSession: new Set()`
    - Export typed `useGameStore` hook; no direct mutations outside action functions
    - _Requirements: 8.1, 5.6, 15.4_

  - [x] 1.4 Implement utility modules
    - Create `utils/colorUtils.ts`: `hexToThreeColor(hex)`, `threeColorToHex(color)`, `colorsMatch(a, b)`
    - Create `utils/mathUtils.ts`: `clamp(value, min, max)`, `lerp(a, b, t)`, `degreesToRadians(deg)`
    - Create `utils/storageUtils.ts`: `safeGetItem(key)`, `safeSetItem(key, value)` with `try/catch` wrapping all `localStorage` calls; on `SecurityError` call `GameStore.setStorageWarning(true)`
    - Add JSDoc `@param`/`@returns` annotations to all exported functions
    - _Requirements: 11.2, 15.5_

  - [x] 1.5 Implement WorkshopCanvas, EnvironmentSetup, and CameraController
    - Create `scene/WorkshopCanvas.tsx`: R3F `<Canvas>` accepting `activeToyId?: ToyId`, mounting `EnvironmentSetup`, `CameraController`, and (conditionally) `ToyLoader`
    - Create `scene/EnvironmentSetup.tsx`: one `<ambientLight intensity={0.5}/>` and one `<directionalLight intensity={1}/>` positioned so no Part surface is fully unlit
    - Create `scene/CameraController.tsx`: Drei `<OrbitControls>` with `minDistance=1`, `maxDistance=10`, `maxPolarAngle={Math.PI/2}`; idle-rotation logic: starts 10°/s after 5 s of pointer inactivity; pauses within one frame on `pointerdown`; every pointer/touch resets idle timer
    - _Requirements: 2.3, 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x]* 1.6 Write unit tests for WorkshopCanvas scene setup (smoke)
    - Verify scene contains ≥1 `AmbientLight` and ≥1 `DirectionalLight`
    - Verify `CameraController` mounts without errors
    - _Requirements: 2.3_

- [x] 2. Phase 2 – Toy Models and Selection Screen

  - [x] 2.1 Implement RacingCar toy model with named Part meshes
    - Create `toys/models/RacingCar.tsx` with ≥5 named `<PartMesh>` components: `body`, `wheel-fl`, `wheel-fr`, `wheel-rl`, `wheel-rr`, `cabin` (at minimum)
    - Export `RACING_CAR_DEFINITION: ToyDefinition` manifest with `id`, bilingual `label`, and `parts[]` (each with `name`, `defaultColor`, bilingual `label`)
    - Each `<PartMesh>` reads colour from `GameStore.partColors[partName]` (falling back to `defaultColor`), sets `mesh.material.color.set(color)` in a `useEffect`
    - Wire `onPointerOver`/`onPointerOut` and `onPointerDown` props (handlers provided by painting layer)
    - Keep total triangle count ≤50 000 for the full toy
    - _Requirements: 2.1, 2.2, 4.1, 4.3, 14.5_

  - [x] 2.2 Implement Robot toy model
    - Create `toys/models/Robot.tsx` following identical structure to RacingCar
    - Parts: `torso`, `head`, `arm-left`, `arm-right`, `leg-left`, `leg-right` (at minimum)
    - Export `ROBOT_DEFINITION: ToyDefinition`
    - _Requirements: 2.1, 4.1_

  - [x] 2.3 Implement Dinosaur toy model
    - Create `toys/models/Dinosaur.tsx`
    - Parts: `body`, `head`, `tail`, `leg-fl`, `leg-rl` (at minimum)
    - Export `DINOSAUR_DEFINITION: ToyDefinition`
    - _Requirements: 2.1, 4.1_

  - [x] 2.4 Implement Rocket toy model
    - Create `toys/models/Rocket.tsx`
    - Parts: `fuselage`, `nose`, `fin-left`, `fin-right`, `engine`, `window` (at minimum)
    - Export `ROCKET_DEFINITION: ToyDefinition`
    - _Requirements: 2.1, 4.1_

  - [x] 2.5 Implement Aeroplane toy model
    - Create `toys/models/Aeroplane.tsx`
    - Parts: `fuselage`, `wing-left`, `wing-right`, `tail-fin`, `engine`, `cockpit` (at minimum)
    - Export `AEROPLANE_DEFINITION: ToyDefinition`
    - _Requirements: 2.1, 4.1_

  - [x] 2.6 Implement ToyLoader with lazy-loading and disposal
    - Create `toys/ToyLoader.tsx`: dynamically imports the toy component for `toyId` using `React.lazy`; wraps in `React.Suspense`; wraps in `ErrorBoundary` (5 s timeout, localised error + Retry button)
    - Track previously mounted toy; call `disposeToy(previousToyId)` before mounting the new one — calls `geometry.dispose()`, `material.dispose()`, `texture.dispose()` on all Three.js objects of the outgoing toy
    - Fires `onLoaded` callback once the toy geometry is ready
    - _Requirements: 1.6, 14.2, 14.4_

  - [ ]* 2.7 Write unit tests for toy models and ToyLoader
    - Verify each toy has ≥5 named Part meshes
    - Verify total triangle count ≤50 000 per toy
    - Verify `ToyLoader` calls `geometry.dispose()` / `material.dispose()` on toy unload (Property 24)
    - _Requirements: 4.1, 14.2, 14.5_

  - [x] 2.8 Implement HomeScreen (Toy Selection Screen)
    - Create `ui/screens/HomeScreen.tsx`: renders exactly five toy thumbnail cards (one per `ToyDefinition`)
    - Each card shows the toy's `label[activeLocale]` and a thumbnail component
    - On hover/focus: scale ≥1.05× or border ≥2 px (CSS transition)
    - On `pointerdown`: navigate to `/paint/:toyId` via React Router; transition must complete within 500 ms
    - If initial render takes >5 s: display localised error + retry action
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

  - [ ]* 2.9 Write property test for toy name locale rendering (Property 25)
    - **Property 25: Toy Name Locale Rendering**
    - **Validates: Requirements 1.5**
    - For any toy and any active locale, rendered name text equals `toyDefinition.label[activeLocale]`

  - [x] 2.10 Implement AppRouter and route skeleton screens
    - Create `ui/router/AppRouter.tsx` with four named routes: `/` → `HomeScreen`, `/paint/:toyId` → `PaintingScreen`, `/dashboard` → `DashboardScreen`, `/settings` → `SettingsScreen`, `*` → redirect to `/`
    - Create stub `PaintingScreen.tsx`, `DashboardScreen.tsx`, `SettingsScreen.tsx` (content added in later phases)
    - _Requirements: 13.1, 13.4_

  - [ ]* 2.11 Write unit tests for HomeScreen and router
    - Verify HomeScreen renders exactly 5 toy thumbnails
    - Verify undefined route redirects to `/` with "page not found" text visible
    - _Requirements: 1.2, 13.4_

- [x] 3. Checkpoint – Phase 1 & 2 complete
  - Ensure all tests pass. Verify the app loads, shows five toy cards, and navigating to one enters the painting view stub. Ask the user if questions arise.

- [x] 4. Phase 3 – Painting Core

  - [x] 4.1 Implement PaintHistory undo-stack logic
    - Create `painting/PaintHistory.ts`: `PaintHistoryState` with `stack: PaintAction[]`, `push(action)`, `pop()`, `clear()`, `isEmpty()`
    - Integrate as a sub-slice of `GameStore`: `undoPaint()` pops the stack, calls `paintPart(partName, previousColor)` without pushing to history
    - `undoPaint()` on empty stack is a no-op
    - When last entry is removed, transition Undo button to disabled state
    - _Requirements: 9.2, 9.3, 9.8_

  - [ ]* 4.2 Write property tests for PaintHistory (Properties 14, 15, 16)
    - **Property 14: Undo Restores Previous Colour** — Validates: Requirements 9.2
    - **Property 15: Reset Restores All Default Colours** — Validates: Requirements 9.6
    - **Property 16: Reset Cancel Preserves State** — Validates: Requirements 9.7

  - [x] 4.3 Implement PaintingController hook and raycasting
    - Create `painting/PaintingController.tsx`: `usePaintingController(toyId)` hook returning `handlePartClick(partName)`
    - Flow: read `activeColor` from store → if null dispatch `showNoPalettePrompt()` → read `partColors[partName]` as `previousColor` → call `GameStore.paintPart(partName, activeColor)` → push `PaintAction` to history → call `MissionEngine.evaluatePaint()`
    - Record `timestamp` in every `PaintAction`
    - _Requirements: 4.3, 4.4, 4.6_

  - [ ]* 4.4 Write property tests for PaintingController (Properties 1, 5, 6)
    - **Property 1: Colour Application Round-Trip** — Validates: Requirements 2.2, 4.3
    - **Property 5: Paint History Recording** — Validates: Requirements 4.4
    - **Property 6: Part Painting Isolation** — Validates: Requirements 4.5

  - [x] 4.5 Implement PartHighlight hover effect
    - Create `painting/PartHighlight.tsx`: `usePartHighlight(meshRef)` hook
    - `onPointerOver`: set `mesh.material.emissive.set(0x444444)`
    - `onPointerOut`: restore `mesh.material.emissive.set(0x000000)`
    - Must not alter `material.color`
    - _Requirements: 4.2_

  - [ ]* 4.6 Write property test for hover emissive isolation (Property 4)
    - **Property 4: Hover Emissive Isolation** — Validates: Requirements 4.2
    - Triggering `onPointerOver` sets emissive to non-zero; `onPointerOut` restores to `0x000000`; `material.color` unchanged throughout

  - [x] 4.7 Implement Palette component
    - Create `ui/components/Palette.tsx` with exactly 12 colour swatches: red `#FF0000`, orange `#FF8000`, yellow `#FFFF00`, green `#00AA00`, teal `#008080`, blue `#0000FF`, purple `#8000FF`, pink `#FF69B4`, brown `#8B4513`, white `#FFFFFF`, grey `#808080`, black `#000000`
    - Each swatch: minimum 44×44 CSS px touch target
    - On swatch click: call `GameStore.setActiveColor(hex)`, clear previous selection indicator
    - Active swatch selection indicator: ≥4 px size change or ≥3 px border
    - Pre-select `#FF0000` on mount
    - Position absolutely so it never overlaps the central 3D canvas region
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

  - [ ]* 4.8 Write property tests for Palette (Properties 7, 8)
    - **Property 7: Single Active Colour Invariant** — Validates: Requirements 5.2, 5.3
    - **Property 8: Swatch Touch Target Size** — Validates: Requirements 5.5

  - [x] 4.9 Implement UndoResetBar component and reset confirmation dialog
    - Create `ui/components/UndoResetBar.tsx` with Undo and Reset buttons, fully within viewport, no overlap with painting canvas
    - Undo button: disabled when `paintHistory` is empty (CSS disabled state, ignores clicks)
    - Reset button: opens confirmation dialog on click
    - Confirmation dialog: "Confirm" → `GameStore.resetPainting()` (restores all Part `defaultColor`s, clears `paintHistory`); "Cancel" → close dialog, no state changes
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8_

  - [ ]* 4.10 Write unit tests for UndoResetBar
    - Verify Undo button is disabled when history is empty and enabled when non-empty
    - Verify reset confirm restores default colours and clears history
    - Verify reset cancel leaves `partColors` and `paintHistory` unchanged
    - _Requirements: 9.3, 9.6, 9.7_

  - [x] 4.11 Wire PaintingController, PartHighlight, Palette, and UndoResetBar into PaintingScreen
    - Update `ui/screens/PaintingScreen.tsx`: render `WorkshopCanvas` with `activeToyId`, overlay `Palette`, `UndoResetBar`, and "no colour selected" prompt
    - "No colour selected" prompt: shown when `showNoPalettePrompt` is true; auto-dismisses when player selects a colour
    - Each `<PartMesh>` inside loaded toy receives `onPointerDown={handlePartClick}`, `onPointerOver`, `onPointerOut` from hooks
    - _Requirements: 4.3, 4.6, 5.4_

- [x] 5. Checkpoint – Phase 3 complete
  - Ensure all tests pass. Verify painting a part updates its 3D material colour, hover glow appears, undo reverts the last paint, and reset restores defaults after confirmation. Ask the user if questions arise.

- [x] 6. Phase 4 – Missions, Timer, and Scoring

  - [x] 6.1 Define mission data for all five toys
    - Create `missions/missionData.ts`: export `MISSIONS: Record<ToyId, Mission>` — at least one `Mission` per toy, each with `id`, `toyId`, `targets: MissionTarget[]` covering every Part, `durationSeconds: 120`
    - Each `MissionTarget` specifies `partName` and `targetColor` (valid hex)
    - Validate `durationSeconds` is in [30, 600]; clamp and `console.warn` if outside range
    - _Requirements: 6.1, 7.1_

  - [ ]* 6.2 Write unit tests for missionData
    - Verify ≥1 mission per toy
    - Verify all Part names in each mission correspond to the toy's `PartDefinition.name` list
    - _Requirements: 6.1_

  - [x] 6.3 Implement MissionEngine evaluation logic
    - Create `missions/MissionEngine.ts`: pure function `evaluatePaint(mission, partName, paintedColor, partColorHistory): MissionEvalResult`
    - `isTargetHit`: exact RGB match between `paintedColor` and `mission.targets` entry for `partName`
    - `isComplete`: all MissionTarget Parts now carry their `targetColor`
    - `scoreDelta`: `+10` if `isTargetHit`, `-5` otherwise
    - `accuracyUpdate`: increment `total`; increment `correct` only if `isTargetHit`
    - Integrate into `GameStore.paintPart()` flow: call `evaluatePaint`, update `score` (floor 0), update `correctPaints`/`totalMissionPaints`, trigger `CompletionAnimation` if `isComplete`
    - _Requirements: 6.3, 6.4, 6.5, 6.6, 8.2, 8.3_

  - [ ]* 6.4 Write property tests for MissionEngine (Properties 9, 10, 11, 12, 26)
    - **Property 9: Correct-Paint Score Increment** — Validates: Requirements 6.3, 8.2
    - **Property 10: Incorrect-Paint Score Decrement with Floor** — Validates: Requirements 6.5, 8.3
    - **Property 11: Accuracy Formula Invariant** — Validates: Requirements 6.6
    - **Property 12: Star Rating Threshold Mapping** — Validates: Requirements 8.5
    - **Property 26: Mission Hint Display Count** — Validates: Requirements 6.2

  - [x] 6.5 Implement countdown Timer logic in GameStore
    - Add `tickTimer()` action: decrement `remainingSeconds` by 1; when `remainingSeconds` reaches 0, set `phase: 'timeout'`, call `endSession()`, freeze painting interactions
    - Add `pauseTimer()` / `resumeTimer()` actions
    - Wire `window` `blur`/`focus` listeners in `PaintingScreen` to `pauseTimer`/`resumeTimer`
    - Timer starts when `startMission()` is dispatched
    - _Requirements: 7.1, 7.3, 7.5, 7.6_

  - [x] 6.6 Implement HUD component
    - Create `ui/components/HUD.tsx`: displays timer in `MM:SS` format (via `formatTimer` util), score (updated within 100 ms via Zustand subscription), accuracy `%`
    - Timer display: red colour + 1 Hz CSS pulsing animation when `remainingSeconds < 30`
    - Mission target hints: one colour swatch per `MissionTarget`, showing `targetColor`, next to the Part label — exactly `N` hints for a mission with `N` targets
    - _Requirements: 7.2, 7.4, 8.4, 6.2_

  - [ ]* 6.7 Write property test for timer formatting (Property 13)
    - **Property 13: Timer MM:SS Formatting** — Validates: Requirements 7.2
    - For any integer `remainingSeconds` in [0, 599], `formatTimer(s)` returns `"MM:SS"` with correct zero-padding

  - [x] 6.8 Implement `computeStarRating` utility and end-of-session screen
    - Create `utils/mathUtils.ts` entry `computeStarRating(score): 0|1|2|3`
    - Update `PaintingScreen` to show end-of-session overlay when `phase === 'timeout' || phase === 'complete'`: final score, accuracy %, star rating component
    - Create `ui/components/StarRating.tsx` rendering 0–3 filled stars
    - _Requirements: 8.5, 10.3_

- [x] 7. Checkpoint – Phase 4 complete
  - Ensure all tests pass. Verify mission hints display in HUD, correct/incorrect paints adjust score, timer counts down and turns red below 30 s, and end-of-session screen appears on timeout. Ask the user if questions arise.

- [x] 8. Phase 5 – Completion Animation, Achievements, and Dashboard

  - [x] 8.1 Implement CompletionAnimation with confetti and toy spin
    - Create `animations/Confetti.tsx`: particle system spawning ≥20 coloured quads with randomised velocity and gravity, cleaned up after 4 s
    - Create `animations/CompletionAnimation.tsx`: renders `Confetti` + toy spin (rotate 360° over 2 s) simultaneously; total duration 2–4 s
    - Render a skip button; on activation, stop animation and advance to results screen immediately
    - Trigger when `GameStore.phase` transitions to `'complete'`
    - _Requirements: 10.1, 10.2, 10.5_

  - [ ]* 8.2 Write unit tests for CompletionAnimation
    - Verify at least two effects render simultaneously (confetti particles present + toy spin active)
    - Verify skip button stops animation and navigates to results
    - _Requirements: 10.2, 10.5_

  - [x] 8.3 Implement post-completion results screen and navigation options
    - Update `PaintingScreen` completion overlay: show numeric score, accuracy %, star rating
    - Render three navigation buttons: "Play Again" (replay same toy), "Choose Toy" (→ `/`), "Dashboard" (→ `/dashboard`)
    - _Requirements: 10.3, 10.4_

  - [x] 8.4 Implement session persistence in `endSession` action
    - Update `GameStore.endSession()`: build `SessionResult` (`toyId`, `score`, `accuracy`, `stars`, `timestamp`, `achievementsUnlocked`) and write to `localStorage` via `storageUtils.safeSetItem('toyverse_sessions', ...)`
    - On `SecurityError`: call `setStorageWarning(true)` — HUD shows localised warning banner, session continues in-memory
    - _Requirements: 11.1, 11.2_

  - [ ]* 8.5 Write property test for session persistence round-trip (Property 17)
    - **Property 17: Session Result Persistence Round-Trip** — Validates: Requirements 11.1
    - For any `SessionResult`, reading and parsing `'toyverse_sessions'` from localStorage yields an array containing that result's fields

  - [x] 8.6 Implement Achievement definitions and unlock logic
    - Create achievement definitions in `store/gameStore.ts` or `store/achievementDefs.ts`:
      - `first-stroke`: first paint action in any session
      - `speed-painter`: complete mission with ≥60 s remaining
      - `perfect-painter`: 100% accuracy at session end
      - `colour-explorer`: all 12 palette colours used in one session (track `colorsUsedThisSession`)
      - `toy-master`: missions completed for all five toys (across sessions)
    - After each relevant state change, evaluate all `AchievementDefinition.condition(state)` functions; for newly met conditions, push to `unlockedAchievements`, write to `localStorage`, dispatch `showAchievementToast(id)`
    - _Requirements: 11.5, 11.6_

  - [x] 8.7 Implement AchievementToast component
    - Create `ui/components/AchievementToast.tsx`: CSS `@keyframes` fade-in/out; renders for exactly 3 seconds then auto-dismisses via `setTimeout`; displays achievement name (via i18n) and icon
    - _Requirements: 11.6_

  - [ ]* 8.8 Write unit tests for AchievementToast and achievement unlock
    - Verify toast auto-dismisses after 3 s
    - Verify each of the 5 achievement conditions fires correctly with boundary inputs
    - _Requirements: 11.5, 11.6_

  - [x] 8.9 Implement DashboardScreen
    - Create `ui/screens/DashboardScreen.tsx`
    - Session summary section: load `SessionResult[]` from localStorage; render one summary card per entry showing `toyId`, `score`, `accuracy`, `stars`, `timestamp`
    - Total stars display: sum of `stars` across all stored sessions
    - Achievement gallery: render all 5 achievement entries; unlocked → full opacity + coloured icon; locked → greyed-out placeholder
    - _Requirements: 11.3, 11.4, 11.7_

  - [ ]* 8.10 Write property tests for Dashboard (Properties 18, 19, 20)
    - **Property 18: Dashboard Session Coverage** — Validates: Requirements 11.3
    - **Property 19: Total Stars Accumulation** — Validates: Requirements 11.4
    - **Property 20: Achievement Dashboard Coverage** — Validates: Requirements 11.7

- [x] 9. Checkpoint – Phase 5 complete
  - Ensure all tests pass. Verify the completion animation fires with confetti + spin, results screen shows stars, Dashboard shows session history and achievements. Ask the user if questions arise.

- [ ] 10. Phase 6 – i18n and Accessibility

  - [x] 10.1 Implement i18n translation files and lookup module
    - Create `i18n/en.ts`: full `TranslationMap` covering all keys: `home.title`, `home.selectToy`, `palette.label`, `hud.score`, `hud.time`, `hud.accuracy`, `mission.complete`, all 5 achievement name keys, `error.loadFailed`, `error.noColourSelected`, `error.storageUnavailable`, `error.pageNotFound`, and any other UI strings
    - Create `i18n/ta.ts`: Tamil translations for every key in `en.ts`
    - Create `i18n/index.ts`: `t(key, locale)` — returns `translationMap[locale][key]`; falls back to `en[key]` if missing; calls `console.warn('i18n: missing key "%s" in locale "%s"', key, locale)` exactly once per missing key
    - Default locale when no persisted preference: `"en"`
    - _Requirements: 12.1, 12.2, 12.5, 12.6_

  - [ ]* 10.2 Write property tests for i18n (Properties 21, 22, 23)
    - **Property 21: Translation Lookup Correctness** — Validates: Requirements 12.2
    - **Property 22: Locale Switch Persistence** — Validates: Requirements 12.3
    - **Property 23: i18n Fallback to English** — Validates: Requirements 12.5

  - [x] 10.3 Integrate i18n into all UI components
    - Replace every hardcoded string in `HomeScreen`, `PaintingScreen`, `DashboardScreen`, `SettingsScreen`, `HUD`, `Palette`, `UndoResetBar`, `AchievementToast`, and error boundaries with `t(key, locale)` calls
    - Wire `locale` from `GameStore` into all components via `useGameStore` selector
    - _Requirements: 12.2_

  - [x] 10.4 Implement LanguageToggle and Settings screen
    - Create `ui/components/LanguageToggle.tsx`: toggles between `"en"` and `"ta"`; calls `GameStore.setLocale(locale)`
    - `setLocale` action: updates `locale` in store, writes `"toyverse_locale"` to localStorage, triggers re-render of all visible text within 500 ms without page reload
    - On app load: read `localStorage.getItem("toyverse_locale")`; restore if present, else default to `"en"`
    - Complete `ui/screens/SettingsScreen.tsx` with `LanguageToggle` and any other settings controls
    - _Requirements: 12.3, 12.6_

  - [ ] 10.5 Add Noto Sans Tamil font and CSS touch-target rules
    - Place `NotoSansTamil-Regular.woff2` in `public/fonts/`
    - Add `@font-face` rule in global CSS loading the woff2 file; apply `font-family: 'Noto Sans Tamil'` to the root element so Tamil characters in U+0B80–U+0BFF render without missing-glyph boxes
    - Add CSS rules ensuring all interactive elements have `min-width: 44px; min-height: 44px`
    - _Requirements: 12.4, 5.5_

  - [ ]* 10.6 Write integration test for font and touch targets
    - Verify `NotoSansTamil-Regular.woff2` is present in `public/fonts/`
    - Verify all 12 palette swatches have `offsetWidth ≥ 44` and `offsetHeight ≥ 44` in rendered DOM
    - _Requirements: 5.5, 12.4_

- [ ] 11. Checkpoint – Phase 6 complete
  - Ensure all tests pass. Verify toggling language updates all visible text within 500 ms, Tamil characters render correctly, and locale preference persists across page reload. Ask the user if questions arise.

- [ ] 12. Phase 7 – Performance, Polish, and Final QA

  - [ ] 12.1 Implement idle-mode render throttle
    - In `scene/WorkshopCanvas.tsx`, detect when `phase === 'selection'` and no user interaction has occurred for ≥5 s; reduce the R3F render loop to ≤10 fps using `frameloop="demand"` + manual `invalidate()` calls or R3F's `performance.regress`
    - Restore full frame rate on any user interaction
    - _Requirements: 14.3_

  - [ ] 12.2 Implement geometry instancing and material sharing
    - Audit all toy models; where two or more Parts share identical geometry (e.g. four wheels of same shape), use `THREE.InstancedMesh` or shared `BufferGeometry` references
    - Where two or more Parts share identical initial material settings, share a single `MeshStandardMaterial` instance (cloned per Part only when colour diverges)
    - _Requirements: 14.1_

  - [ ] 12.3 Implement route transition loading indicator
    - In `AppRouter` or `PaintingScreen`, detect when a route transition or toy load takes >300 ms; render an in-viewport loading spinner; remove it once the transition completes
    - Ensure route transitions complete within 300 ms under normal conditions
    - _Requirements: 13.2, 13.3_

  - [ ] 12.4 Implement browser back/forward navigation support
    - Verify React Router `useNavigate` + browser history integration handles back/forward within 300 ms
    - Write a smoke test: navigate forward to `/paint/racing-car`, press back, verify return to `/` within 300 ms
    - _Requirements: 13.5_

  - [ ] 12.5 Implement camera and scene properties for correct toy framing
    - In `WorkshopCanvas`, compute the loaded toy's bounding box and adjust the default camera distance so the toy occupies 60%–90% of the lesser viewport dimension
    - Update `CameraController` to derive initial `position` from bounding box
    - _Requirements: 2.4_

  - [ ]* 12.6 Write property tests for camera invariants (Properties 2, 3)
    - **Property 2: Camera Distance Invariant** — Validates: Requirements 3.2
    - **Property 3: Camera Polar Angle Invariant** — Validates: Requirements 3.5

  - [ ] 12.7 Add JSDoc comments to all exported functions and components
    - Audit every exported function and component across all modules
    - Add `@param` annotation for every parameter and `@returns` annotation for every non-void function
    - Extract any non-rendering logic block >200 lines into separate utility or hook files
    - _Requirements: 15.3, 15.5_

  - [ ] 12.8 Bundle size audit and optimisation
    - Run `vite build` and measure gzipped output size excluding Three.js and R3F peer dependencies
    - If bundle exceeds 500 KB gzipped: apply dynamic imports, tree-shaking, and code-splitting until within budget
    - _Requirements: 14.5_

  - [ ]* 12.9 Write integration smoke tests for performance and routing
    - Verify Vite build output (excluding peer deps) is ≤500 KB gzipped
    - Verify undefined route `/unknown-path` redirects to `/` with "page not found" text
    - Verify each toy's total triangle count ≤50 000
    - _Requirements: 14.5, 13.4, 2.5_

- [ ] 13. Final Checkpoint – All phases complete
  - Ensure all tests pass, bundle size is within budget, and all five toys paint correctly with working missions, timer, scores, achievements, Tamil language support, and smooth 30 fps performance. Ask the user if questions arise.

---

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP; all 26 correctness properties will then need manual verification.
- Each task references specific requirements for traceability.
- All property-based tests use `fast-check` with `numRuns: 100` minimum and are tagged with `// Feature: toyverse-game, Property N: <property title>`.
- Unit tests use Vitest + React Testing Library; Three.js objects are mocked via `vitest-canvas-mock` and `three-stdlib` spies.
- Checkpoints validate incremental progress and catch integration regressions early.
- The `utils/storageUtils.ts` safe wrappers ensure localStorage failures degrade gracefully rather than crashing the session.

---

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2"] },
    { "id": 1, "tasks": ["1.3", "1.4"] },
    { "id": 2, "tasks": ["1.5", "2.10"] },
    { "id": 3, "tasks": ["1.6", "2.1", "2.2", "2.3", "2.4", "2.5"] },
    { "id": 4, "tasks": ["2.6", "4.1", "4.3", "4.7", "6.1"] },
    { "id": 5, "tasks": ["2.7", "2.8", "4.2", "4.4", "4.5", "6.2", "6.3"] },
    { "id": 6, "tasks": ["2.9", "2.11", "4.6", "4.8", "4.9", "6.4", "6.5", "6.6"] },
    { "id": 7, "tasks": ["4.10", "4.11", "6.7", "6.8"] },
    { "id": 8, "tasks": ["8.1", "8.3", "8.4", "8.6"] },
    { "id": 9, "tasks": ["8.2", "8.5", "8.7", "8.9", "10.1"] },
    { "id": 10, "tasks": ["8.8", "8.10", "10.2", "10.3", "10.4"] },
    { "id": 11, "tasks": ["10.5", "10.6", "12.1", "12.2", "12.3", "12.4", "12.5"] },
    { "id": 12, "tasks": ["12.6", "12.7", "12.8"] },
    { "id": 13, "tasks": ["12.9"] }
  ]
}
```

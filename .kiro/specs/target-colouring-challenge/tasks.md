# Implementation Plan: Target Colouring Challenge

## Overview

This implementation plan converts the TOYVERSE game from a free-painting sandbox into a structured Target Image Based 3D Toy Colouring Challenge. The work involves updating the Zustand store's phase state machine, adding new UI components (StartScreen, SelectionScreen, TargetImagePanel, SubmitButton, ResultsOverlay), modifying existing components (PartMesh, HUD, MissionEngine, HomeScreen, PaintingScreen), changing all toy model default colours to neutral (#CCCCCC), adding i18n translations, and writing comprehensive property-based and unit tests.

The implementation follows a dependency-ordered approach: type definitions first, then store logic, then 3D rendering changes, then new UI components, then screen modifications, then i18n, and finally tests and verification.

## Tasks

- [x] 1. Update type definitions and create render-mode context
  - [x] 1.1 Update Phase type, GameStateData, and GameActions in src/store/types.ts
    - Add `'start'` and `'submitting'` to Phase type (was `'selection' | 'painting' | 'complete' | 'timeout'`)
    - Replace `correctPaints` and `totalMissionPaints` with `correctParts`, `incorrectParts`, `timeTaken` in GameStateData
    - Add `startGame`, `submitChallenge`, `calculateResults`, `resetChallenge`, `goHome` to GameActions
    - Remove `startMission` from GameActions
    - _Requirements: 1.1, 1.3, 7.9, 8.2, 8.3, 8.4, 8.5, 8.9, 9.1, 9.2, 9.3, 9.4, 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8, 10.9, 10.10, 11.12, 11.13, 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7, 12.8_

  - [x] 1.2 Create src/toys/ToyRenderModeContext.ts
    - Define `ToyRenderMode = 'paintable' | 'target'` type
    - Create and export `ToyRenderModeContext` with default value `'paintable'`
    - Export `ToyRenderModeProvider`
    - _Requirements: 3.2, 3.4, 13.3, 13.4_

- [x] 2. Refactor GameStore for new phase machine and end-of-session scoring
  - [x] 2.1 Update initialState and implement startGame, goHome, resetChallenge in src/store/gameStore.ts
    - Set initial `phase` to `'start'` (was `'selection'`)
    - Replace `correctPaints`/`totalMissionPaints` with `correctParts: 0`, `incorrectParts: 0`, `timeTaken: 0`
    - Implement `startGame()`: transition `start` to `selection`, change no other state fields
    - Implement `goHome()`: set phase to `'start'`, clear activeToyId and activeMission, reset all challenge state fields (partColors, paintHistory, score, correctParts, incorrectParts, timeTaken, colorsUsedThisSession, remainingSeconds, timerRunning)
    - Implement `resetChallenge()`: reset challenge state for same toy (clear partColors, paintHistory, score, correctParts, incorrectParts, timeTaken, colorsUsedThisSession), set remainingSeconds to configured duration, set timerRunning to true, transition phase to `'painting'`
    - Remove `startMission` action
    - _Requirements: 1.1, 1.3, 11.12, 11.13, 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7, 12.8_

  - [x] 2.2 Modify selectToy to absorb startMission with full state reset and custom timer
    - Load mission from `MISSIONS[toyId]` as `activeMission`
    - Read custom timer duration from localStorage key `toyverse_timer_duration`, validate range [30, 600], fallback to mission default durationSeconds (120)
    - Set `activeToyId`, `activeMission`, `phase` to `'painting'`
    - Clear `partColors` to `{}`, `paintHistory` to `[]`, `score` to 0, `correctParts` to 0, `incorrectParts` to 0, `timeTaken` to 0, `colorsUsedThisSession` to `[]`
    - Set `remainingSeconds` to configured duration, `timerRunning` to true
    - _Requirements: 2.2, 2.3, 7.1, 7.2, 7.3, 7.12, 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7, 12.8_

  - [x] 2.3 Modify paintPart to remove scoring and completion checks
    - Remove score increment/decrement logic (+10/-5)
    - Remove mission completion checking (allTargetsMet) and phase transition on completion
    - Remove `correctPaints` and `totalMissionPaints` tracking
    - Keep PaintAction recording: partName, previousColor (or #CCCCCC if unpainted), newColor, timestamp
    - Keep partColors update and colorsUsedThisSession tracking
    - Keep in-painting achievement evaluation (first-stroke, colour-explorer)
    - _Requirements: 4.7, 5.4, 5.10, 14.1, 14.2, 14.3_

  - [x] 2.4 Implement calculateResults and submitChallenge actions
    - `calculateResults()`: for each mission target, compare painted colour (or #CCCCCC fallback) against target colour using case-insensitive hex comparison (`painted.toUpperCase() === target.toUpperCase()`); count correctParts; compute Colour_Accuracy as `Math.round((correctParts / totalParts) * 100)` or 0 for zero-part toy; set score = Colour_Accuracy; set incorrectParts = totalParts - correctParts; compute timeTaken as `Math.max(0, challengeDuration - remainingSeconds)`; evaluate end-of-session achievements (perfect-painter, speed-painter, toy-master)
    - `submitChallenge()`: check `phase === 'painting'` (no-op otherwise); set `timerRunning` to false; transition phase to `'submitting'`; call `calculateResults()` and `endSession()`; transition phase to `'complete'`
    - _Requirements: 8.2, 8.3, 8.4, 8.5, 8.6, 8.9, 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8, 10.9, 10.10_

  - [x] 2.5 Modify tickTimer, endSession, resetPainting, and update achievement definitions
    - `tickTimer()`: when `remainingSeconds <= 1`, set remainingSeconds to 0, set timerRunning to false, set phase to `'timeout'`, call `calculateResults()` and `endSession()` (previously only set phase without calculating results)
    - `endSession()`: create SessionResult with toyId (matching activeToyId), score (= Colour_Accuracy), accuracy (= score), stars (via starsFromScore), timestamp (Date.now()), achievementsUnlocked (array copy); append to sessionHistory; persist to localStorage under `toyverse_sessions`; evaluate toy-master achievement against updated session history
    - `resetPainting()`: clear partColors, paintHistory, score, correctParts, incorrectParts, timeTaken, colorsUsedThisSession (update from old correctPaints/totalMissionPaints fields)
    - Update perfect-painter condition: check `correctParts > 0 && incorrectParts === 0` (was `correctPaints === totalMissionPaints`)
    - Update speed-painter condition: check `(phase === 'complete' || phase === 'timeout') && remainingSeconds >= 60` (was only `'complete'`)
    - _Requirements: 7.9, 7.10, 9.1, 9.2, 9.3, 9.4, 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8, 10.9, 10.10, 15.1, 15.2, 15.5, 15.6, 15.7_

  - [ ]* 2.6 Write property test: Phase transition start to selection
    - **Property 1: Phase transition from start to selection**
    - **Validates: Requirements 1.3**
    - Test that calling `startGame()` from any state where `phase === 'start'` transitions to `'selection'` and changes no other state fields
    - File: `src/store/gameStore.test.ts`

  - [ ]* 2.7 Write property test: Toy selection initializes the challenge
    - **Property 2: Toy selection initializes the challenge**
    - **Validates: Requirements 2.2, 2.3, 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7, 12.8**
    - Test that `selectToy(toyId)` for any valid ToyId sets activeToyId, loads mission, sets phase to painting, clears state, sets timer
    - File: `src/store/gameStore.test.ts`

  - [ ]* 2.8 Write property test: Paint isolation
    - **Property 3: Paint isolation**
    - **Validates: Requirements 4.7**
    - Test that painting part P only modifies partColors[P], leaving all other entries unchanged
    - File: `src/store/gameStore.test.ts`

  - [ ]* 2.9 Write property test: Paint action recording
    - **Property 4: Paint action recording**
    - **Validates: Requirements 5.4, 5.10**
    - Test that PaintAction contains correct partName, newColor, previousColor (or #CCCCCC if unpainted), and positive timestamp
    - File: `src/store/gameStore.test.ts`

  - [ ]* 2.10 Write property test: Undo round-trip
    - **Property 5: Undo round-trip**
    - **Validates: Requirements 6.2**
    - Test that undoPaint restores previousColor and removes action; repeated undo until history empty restores initial empty partColors state
    - File: `src/store/gameStore.test.ts`

  - [ ]* 2.11 Write property test: Challenge state reset
    - **Property 6: Challenge state reset**
    - **Validates: Requirements 4.1, 4.3, 6.5, 11.12, 12.1, 12.2, 12.3, 12.4, 12.5, 12.6**
    - Test that selectToy or resetChallenge resets all challenge state fields regardless of prior state
    - File: `src/store/gameStore.test.ts`

  - [ ]* 2.12 Write property test: Reset cancel is no-op
    - **Property 7: Reset cancel is a no-op**
    - **Validates: Requirements 6.6**
    - Test that cancelling reset confirmation leaves partColors and paintHistory unchanged (UI cancel path does not call resetPainting)
    - File: `src/store/gameStore.test.ts`

  - [ ]* 2.13 Write property test: Timer duration selection
    - **Property 8: Timer duration selection**
    - **Validates: Requirements 7.1, 7.12**
    - Test that selectToy uses custom duration from localStorage [30, 600] or mission default 120 when not configured
    - File: `src/store/gameStore.test.ts`

  - [ ]* 2.14 Write property test: Timer tick decrement
    - **Property 9: Timer tick decrement**
    - **Validates: Requirements 7.4**
    - Test that tickTimer decrements remainingSeconds by exactly 1 without changing phase or timerRunning when remainingSeconds > 0
    - File: `src/store/gameStore.test.ts`

  - [ ]* 2.15 Write property test: Timer expiry auto-end
    - **Property 10: Timer expiry auto-end**
    - **Validates: Requirements 7.9, 7.10, 9.1, 9.2, 9.3, 9.4**
    - Test that tickTimer at remainingSeconds === 1 sets remainingSeconds to 0, timerRunning to false, phase to timeout, calculates results, persists session
    - File: `src/store/gameStore.test.ts`

  - [ ]* 2.16 Write property test: Submit end transition
    - **Property 11: Submit end transition**
    - **Validates: Requirements 8.2, 8.3, 8.4, 8.5, 8.9**
    - Test that submitChallenge stops timer, transitions through submitting, calculates results, persists session, transitions to complete
    - File: `src/store/gameStore.test.ts`

  - [ ]* 2.17 Write property test: Target data separation
    - **Property 15: Target data separation**
    - **Validates: Requirements 3.5, 3.6, 13.1, 13.2, 13.3, 13.5**
    - Test that MissionData is never modified by paint actions, partColors only contains player-painted colours, not target colours
    - File: `src/store/gameStore.test.ts`

  - [ ]* 2.18 Write property test: No automatic completion
    - **Property 16: No automatic completion**
    - **Validates: Requirements 14.1, 14.2, 14.3**
    - Test that painting all parts to match targets does not transition phase or stop timer; paintPart never changes phase or timerRunning
    - File: `src/store/gameStore.test.ts`

  - [ ]* 2.19 Write property test: Home transition
    - **Property 17: Home transition**
    - **Validates: Requirements 11.13**
    - Test that goHome sets phase to start, clears activeToyId and activeMission, resets all challenge state fields
    - File: `src/store/gameStore.test.ts`

  - [ ]* 2.20 Write property test: SessionResult structure
    - **Property 20: SessionResult structure**
    - **Validates: Requirements 15.1**
    - Test that SessionResult contains toyId matching activeToyId, score matching Colour_Accuracy, accuracy matching score, stars from starsFromScore, positive timestamp, achievementsUnlocked as array
    - File: `src/store/gameStore.test.ts`

  - [ ]* 2.21 Write unit tests for GameStore actions
    - Initial state has phase === 'start'
    - startGame transitions to selection
    - selectToy for each of 5 toys loads correct mission
    - paintPart with activeColor === null triggers no-palette prompt
    - undoPaint with empty history is no-op
    - resetPainting clears partColors and paintHistory
    - tickTimer at remainingSeconds === 1 transitions to timeout
    - submitChallenge transitions through submitting to complete
    - goHome resets to start phase
    - resetChallenge resets state and transitions to painting
    - File: `src/store/gameStore.test.ts`

- [x] 3. Update PartMesh for render modes and change toy model default colours
  - [x] 3.1 Update PartMesh to support target and paintable modes via ToyRenderModeContext
    - Read `useContext(ToyRenderModeContext)` to determine render mode
    - In target mode: read colour from `activeMission.targets` by matching partName, render mesh without pointer event handlers (no onPointerOver, onPointerOut, onPointerDown)
    - In paintable mode: unchanged behaviour — read colour from `GameStore.partColors[partName]` with defaultColor fallback, attach pointer handlers for hover and painting
    - The useEffect that applies colour to material remains for both modes
    - _Requirements: 3.2, 3.4, 3.5, 3.6, 4.4, 4.7, 5.6, 5.7, 5.8, 13.3, 13.4_

  - [x] 3.2 Change all defaultColor props to #CCCCCC in src/toys/models/RacingCar.tsx
    - Change all 6 PartMesh defaultColor props from current values to `#CCCCCC`
    - Change all 6 ToyDefinition parts defaultColor values to `#CCCCCC`
    - Parts: body, cabin, wheel-fl, wheel-fr, wheel-rl, wheel-rr
    - _Requirements: 4.5, 4.6_

  - [x] 3.3 Change all defaultColor props to #CCCCCC in src/toys/models/Robot.tsx
    - Change all 6 PartMesh defaultColor props and ToyDefinition parts defaultColor values to `#CCCCCC`
    - Parts: head, torso, arm-left, arm-right, leg-left, leg-right
    - _Requirements: 4.5, 4.6_

  - [x] 3.4 Change all defaultColor props to #CCCCCC in src/toys/models/Dinosaur.tsx
    - Change all 7 PartMesh defaultColor props and ToyDefinition parts defaultColor values to `#CCCCCC`
    - Parts: body, head, tail, leg-fl, leg-fr, leg-rl, leg-rr
    - _Requirements: 4.5, 4.6_

  - [x] 3.5 Change all defaultColor props to #CCCCCC in src/toys/models/Rocket.tsx
    - Change all 6 PartMesh defaultColor props and ToyDefinition parts defaultColor values to `#CCCCCC`
    - Parts: fuselage, nose, fin-left, fin-right, engine, window
    - _Requirements: 4.5, 4.6_

  - [x] 3.6 Change all defaultColor props to #CCCCCC in src/toys/models/Aeroplane.tsx
    - Change all 6 PartMesh defaultColor props and ToyDefinition parts defaultColor values to `#CCCCCC`
    - Parts: fuselage, wing-left, wing-right, tail-fin, engine, cockpit
    - _Requirements: 4.5, 4.6_

- [ ] 4. Create new UI components
  - [x] 4.1 Create StartScreen component in src/ui/screens/StartScreen.tsx
    - Render when phase === 'start': display START GAME button
    - Call `startGame()` on START GAME click to transition phase to 'selection'
    - Display navigation links to /dashboard and /settings routes
    - Use i18n keys: start.title, start.startGame, start.dashboard, start.settings
    - _Requirements: 1.2, 1.3, 1.5_

  - [x] 4.2 Create SelectionScreen component in src/ui/screens/SelectionScreen.tsx
    - Render when phase === 'selection': display exactly 5 selectable toys (Racing Car, Robot, Dinosaur, Rocket, Aeroplane)
    - Each toy displays localized label from TOY_DEFINITIONS and an icon
    - On toy select: call `selectToy(toyId)`, navigate to `/paint/:toyId`
    - Display navigation links to /dashboard and /settings routes
    - Use i18n key: selection.title
    - _Requirements: 2.1, 2.2, 2.4, 2.5_

  - [x] 4.3 Create TargetImagePanel component in src/ui/components/TargetImagePanel.tsx
    - Host a non-interactive R3F Canvas rendering the selected toy with target colours from MissionData
    - Wrap ToyLoader in `ToyRenderModeProvider value="target"` so PartMesh reads from MissionData
    - Canvas DOM element has `pointer-events: none` to block all interaction
    - No OrbitControls (use simple auto-rotating camera component)
    - Include EnvironmentSetup for lighting
    - Responsive: ~35% width on desktop (>=768px), fixed height on mobile (<768px) stacked above paintable canvas
    - Use i18n key: painting.targetImage
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.6, 3.7, 17.1, 17.2_

  - [ ] 4.4 Create SubmitButton component in src/ui/components/SubmitButton.tsx
    - Visible during phase 'painting' and 'submitting'; hidden during 'start', 'selection', 'complete', 'timeout'
    - Disabled during 'submitting', 'complete', 'timeout' (prevents multiple submissions)
    - Call `submitChallenge()` on click
    - Clearly visible, positioned to avoid overlapping HUD, Palette, and UndoResetBar
    - Use i18n key: painting.submit
    - _Requirements: 8.1, 8.2, 8.3, 8.6, 8.7, 8.8, 17.5_

  - [x] 4.5 Create ResultsOverlay component in src/ui/components/ResultsOverlay.tsx
    - Render when phase === 'complete' or phase === 'timeout'
    - Display Score as numeric value, Colour_Accuracy as percentage, correctParts count, incorrectParts count, timeTaken in seconds
    - Display StarRating using StarRating component (compute stars via computeStarRating)
    - Display per-part comparison table: for each part in ToyDefinition, show localized part label, target colour swatch (from MissionData), painted colour swatch (from partColors or #CCCCCC), and correct/incorrect indicator
    - Display completed toy render with all Painted_Colours applied (reuse ToyLoader in paintable mode or static render)
    - Display PLAY AGAIN button (calls `resetChallenge()`) and HOME button (calls `goHome()`, navigate to `/`)
    - Display "Time's Up!" message when phase === 'timeout'
    - Centre content, remain scrollable on small screens
    - Use i18n keys: results.title, results.score, results.accuracy, results.correctParts, results.incorrectParts, results.timeTaken, results.stars, results.playAgain, results.home, results.partComparison, results.correct, results.incorrect, results.timeout
    - _Requirements: 9.5, 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7, 11.8, 11.9, 11.10, 11.11, 11.13, 17.6_

  - [ ]* 4.6 Write unit tests for new UI components
    - StartScreen renders START GAME button
    - SelectionScreen renders exactly 5 toy cards with labels and icons
    - SubmitButton visible during painting, hidden during start/selection/complete/timeout
    - SubmitButton disabled during submitting/complete/timeout
    - ResultsOverlay renders per-part comparison with target and painted colour swatches
    - ResultsOverlay renders PLAY AGAIN and HOME buttons
    - ResultsOverlay displays timeout message when phase === 'timeout'
    - File: `src/ui/components/components.test.tsx`

- [x] 5. Update existing screens and components
  - [x] 5.1 Modify HomeScreen to be phase-aware in src/ui/screens/HomeScreen.tsx
    - Render StartScreen component when phase === 'start'
    - Render SelectionScreen component when phase === 'selection'
    - Remove the `useEffect` that resets phase to 'selection' on mount (initial phase is now 'start')
    - Preserve not-found banner behaviour for unknown route redirects
    - _Requirements: 1.2, 1.4, 1.6, 2.1, 4.4_

  - [x] 5.2 Modify PaintingScreen for dual-canvas layout, submit button, and results overlay
    - Add TargetImagePanel alongside WorkshopCanvas in responsive flex layout (flex-direction: row on desktop >=768px, column on mobile <768px)
    - Add SubmitButton to the overlay, positioned to avoid overlapping HUD, Palette, and UndoResetBar
    - Replace inline results overlay with ResultsOverlay component
    - Remove references to startMission (selectToy now absorbs mission loading)
    - Remove references to correctPaints and totalMissionPaints
    - Update toy initialization to call only selectToy(validToyId) instead of selectToy + startMission
    - Preserve timer tick interval, window blur/focus pause/resume, no-palette prompt, storage warning, achievement toast
    - Remove back button (replaced by Submit and results navigation)
    - _Requirements: 3.1, 3.3, 3.7, 5.1, 5.2, 5.3, 6.1, 7.5, 7.7, 7.8, 8.1, 8.8, 9.5, 11.1, 17.1, 17.2, 17.3, 17.4, 17.5_

  - [x] 5.3 Modify HUD to remove incremental score/accuracy and mission target hints
    - Remove score display (score is end-of-session only, shown in ResultsOverlay)
    - Remove accuracy display (accuracy is end-of-session only)
    - Remove mission target hints section (TargetImagePanel replaces these)
    - Remove references to correctPaints, totalMissionPaints, MISSIONS, TOY_DEFINITIONS
    - Keep timer display in MM:SS format with low-time warning state (red, pulsing when remainingSeconds < 30 and phase === 'painting')
    - _Requirements: 7.5, 7.6_

  - [x] 5.4 Modify MissionEngine to remove automatic completion checking
    - Remove `isComplete` logic from `evaluatePaint()` (set to always false or remove the field)
    - Remove score delta calculation (no longer used by paintPart)
    - Ensure evaluatePaint never triggers phase transitions
    - Retain function signature for potential future scoring utilities
    - _Requirements: 14.2, 14.4_

  - [ ]* 5.5 Write component tests for modified screens
    - HUD renders timer in MM:SS format
    - Timer warning state active when remainingSeconds < 30 and phase === 'painting'
    - HUD does not render score or accuracy during painting
    - HUD does not render mission target hints
    - PaintingScreen renders TargetImagePanel alongside WorkshopCanvas
    - HomeScreen renders StartScreen when phase === 'start'
    - HomeScreen renders SelectionScreen when phase === 'selection'
    - File: `src/ui/screens/screens.test.tsx`

  - [ ]* 5.6 Write 3D interaction tests for PartMesh render modes
    - PartMesh in paintable mode attaches onPointerOver, onPointerOut, onPointerDown handlers
    - PartMesh in target mode does not attach pointer event handlers (no hover, no click-to-paint)
    - PartMesh in paintable mode reads colour from GameStore.partColors with defaultColor fallback
    - PartMesh in target mode reads colour from MissionData.targets by matching partName
    - PartMesh applies colour to material via useEffect in both modes
    - Hover glow (emissive set) triggers on pointerOver in paintable mode
    - Hover glow removes on pointerOut in paintable mode
    - Click with active colour calls paintPart in paintable mode
    - Click without active colour triggers no-palette prompt in paintable mode
    - Target mode mesh has pointer-events: none on canvas DOM element
    - File: `src/toys/PartMesh.test.tsx`
    - _Requirements: 3.2, 3.4, 3.5, 3.6, 4.4, 5.4, 5.6, 5.7, 5.8, 13.3, 13.4_

- [x] 6. Update i18n translations
  - [x] 6.1 Add new translation keys to src/i18n/en.ts
    - Add keys: start.title (TOYVERSE), start.startGame (START GAME), start.dashboard (Dashboard), start.settings (Settings), selection.title (Choose Your Toy), painting.submit (SUBMIT), painting.targetImage (Target Image), results.title (Challenge Complete!), results.score (Score), results.accuracy (Accuracy), results.correctParts (Correct Parts), results.incorrectParts (Incorrect Parts), results.timeTaken (Time Taken), results.stars (Stars), results.playAgain (PLAY AGAIN), results.home (HOME), results.partComparison (Part Comparison), results.correct (Correct), results.incorrect (Incorrect), results.timeout (Time's Up!)
    - _Requirements: 16.5, 16.8_

  - [x] 6.2 Add new translation keys to src/i18n/ta.ts
    - Add Tamil translations for all 20 new keys listed in 6.1
    - Keys and Tamil values per design: start.title (டாய்வர்ஸ்), start.startGame (விளையாட்டை தொடங்கு), start.dashboard (டாஷ்போர்டு), start.settings (அமைப்புகள்), selection.title (உங்கள் விளையாட்டை தேர்வு செய்), painting.submit (சமர்ப்பி), painting.targetImage (இலக்கு படம்), results.title (சவால் முடிந்தது!), results.score (மதிப்பெண்), results.accuracy (துல்லியம்), results.correctParts (சரியான பாகங்கள்), results.incorrectParts (தவறான பாகங்கள்), results.timeTaken (எடுத்த நேரம்), results.stars (நட்சத்திரங்கள்), results.playAgain (மீண்டும் விளையாடு), results.home (முகப்பு), results.partComparison (பாக ஒப்பீடு), results.correct (சரி), results.incorrect (தவறு), results.timeout (நேரம் முடிந்தது!)
    - _Requirements: 16.5, 16.8_

  - [ ]* 6.3 Write property test: i18n fallback to English
    - **Property 19: i18n fallback to English**
    - **Validates: Requirements 16.6**
    - Test that for any translation key existing in English but missing from Tamil, calling t(key, 'ta') returns the English value
    - File: `src/i18n/i18n.test.ts`

- [ ] 7. Write scoring and data validation tests
  - [ ]* 7.1 Write property test: Colour accuracy scoring
    - **Property 12: Colour accuracy scoring**
    - **Validates: Requirements 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.9**
    - Test that Colour_Accuracy equals Math.round((matchingParts / totalParts) * 100), Score equals Colour_Accuracy, correctParts + incorrectParts equals totalParts, zero-part toy gives accuracy 0, unpainted parts treated as #CCCCCC, case-insensitive hex comparison
    - File: `src/store/scoring.test.ts`

  - [ ]* 7.2 Write property test: Time taken calculation
    - **Property 14: Time taken calculation**
    - **Validates: Requirements 10.8**
    - Test that timeTaken equals Math.max(0, challengeDuration - remainingSeconds) for any duration and remaining seconds
    - File: `src/store/scoring.test.ts`

  - [ ]* 7.3 Write property test: Star rating calculation
    - **Property 13: Star rating calculation**
    - **Validates: Requirements 10.7**
    - Test that starsFromScore returns 3 for score >= 90, 2 for score >= 50, 1 for score >= 10, 0 otherwise, for any score in [0, 100]
    - File: `src/utils/mathUtils.test.ts`

  - [ ]* 7.4 Write property test: MissionData completeness
    - **Property 18: MissionData completeness**
    - **Validates: Requirements 18.1, 18.8**
    - Test that MISSIONS[toyId].targets contains an entry for every part name in TOY_DEFINITIONS[toyId].parts and the number of targets equals the number of parts, for all 5 toys
    - File: `src/missions/missionData.test.ts`

  - [ ]* 7.5 Write unit tests for scoring edge cases
    - All parts correct results in 100% accuracy and 3 stars
    - No parts correct results in 0% accuracy and 0 stars
    - Half parts correct results in 50% accuracy and 2 stars
    - Unpainted parts treated as #CCCCCC for comparison
    - Case-insensitive colour matching (#ff0000 matches #FF0000)
    - Zero-part toy results in accuracy = 0
    - File: `src/store/scoring.test.ts`

- [ ] 8. Write integration and smoke tests
  - [ ]* 8.1 Write integration tests for localStorage persistence
    - Session results persisted under key `toyverse_sessions`
    - Unlocked achievements persisted under key `toyverse_achievements`
    - Locale persisted under key `toyverse_locale`
    - Custom timer duration persisted under key `toyverse_timer_duration`
    - Dashboard reads and displays session history from localStorage
    - File: `src/integration/persistence.test.ts`

  - [ ]* 8.2 Write integration tests for window blur/focus timer behaviour
    - Timer pauses on window blur event during phase 'painting'
    - Timer resumes on window focus event during phase 'painting'
    - Timer does not resume on focus if phase is not 'painting'
    - File: `src/integration/timer.test.ts`

  - [ ]* 8.3 Write integration tests for route navigation
    - Unknown routes redirect to Home with "page not found" message
    - Existing routes (/, /paint/:toyId, /dashboard, /settings) are accessible
    - File: `src/integration/routes.test.ts`

  - [ ]* 8.4 Write smoke tests for configuration validation
    - All ToyDefinition defaultColor values are #CCCCCC across all 5 toy models
    - All PartMesh defaultColor props in model files are #CCCCCC
    - Palette has exactly 12 colours with correct hex values
    - Default mission duration is 120 seconds
    - MissionData targets match specified configurations (Racing Car: body #FF0000, cabin #FFFFFF, wheels #000000; Robot: head #FFFF00, torso #0000FF, arms #808080, legs #000000; Dinosaur: body/head #00AA00, tail #FF8000, legs #8B4513; Rocket: fuselage #FFFFFF, nose/fins #FF0000, engine #808080, window #008080; Aeroplane: fuselage #FFFFFF, wings #FF0000, tail-fin #0000FF, engine #808080, cockpit #008080)
    - File: `src/smoke/config.test.ts`

  - [ ]* 8.5 Write smoke tests for i18n key completeness
    - All 20 new translation keys exist in both en and ta locale files
    - File: `src/smoke/i18n.test.ts`

- [x] 9. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Final verification - Type check and production build
  - [x] 10.1 Run TypeScript type check
    - Run `npm run typecheck` and resolve any type errors
    - _Requirements: All (type safety across all changes)_

  - [x] 10.2 Run production build
    - Run `npm run build` and resolve any build errors
    - _Requirements: All (production readiness)_

- [x] 11. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties using fast-check (minimum 100 iterations per property)
- Unit tests validate specific examples and edge cases
- Integration tests verify interactions with external systems (localStorage, window events, routes)
- Smoke tests validate configuration consistency across the codebase
- The project uses Vitest + fast-check for testing, TypeScript for type checking, and Vite for builds
- Run tests with `npm test` (vitest run, single execution)
- Run type check with `npm run typecheck`
- Run production build with `npm run build`

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "3.2", "3.3", "3.4", "3.5", "3.6", "5.4", "6.1", "6.2"] },
    { "id": 1, "tasks": ["2.1", "3.1"] },
    { "id": 2, "tasks": ["2.2"] },
    { "id": 3, "tasks": ["2.3"] },
    { "id": 4, "tasks": ["2.4"] },
    { "id": 5, "tasks": ["2.5"] },
    { "id": 6, "tasks": ["4.1", "4.2", "4.3", "4.4", "4.5"] },
    { "id": 7, "tasks": ["5.1", "5.2", "5.3"] },
    { "id": 8, "tasks": ["2.6", "4.6", "5.5", "5.6", "6.3", "7.1", "7.3", "7.4", "8.1", "8.4"] },
    { "id": 9, "tasks": ["2.7", "7.2", "8.2", "8.5"] },
    { "id": 10, "tasks": ["2.8", "7.5", "8.3"] },
    { "id": 11, "tasks": ["2.9"] },
    { "id": 12, "tasks": ["2.10"] },
    { "id": 13, "tasks": ["2.11"] },
    { "id": 14, "tasks": ["2.12"] },
    { "id": 15, "tasks": ["2.13"] },
    { "id": 16, "tasks": ["2.14"] },
    { "id": 17, "tasks": ["2.15"] },
    { "id": 18, "tasks": ["2.16"] },
    { "id": 19, "tasks": ["2.17"] },
    { "id": 20, "tasks": ["2.18"] },
    { "id": 21, "tasks": ["2.19"] },
    { "id": 22, "tasks": ["2.20"] },
    { "id": 23, "tasks": ["2.21"] },
    { "id": 24, "tasks": ["10.1", "10.2"] }
  ]
}
```

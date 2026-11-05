# Requirements Document

## Introduction

TOYVERSE – BUILD, PAINT & PLAY is a professional 3D educational game for children. Players enter an interactive toy workshop, choose from five 3D toy models (Racing Car, Robot, Dinosaur, Rocket, Aeroplane), and paint each toy part-by-part using a 12-colour palette. The experience is built on real 3D geometry — every painted surface modifies the actual Three.js material, not a flat image overlay. Colour-matching missions, a timer, a score system, undo/reset controls, animated completion celebrations, achievements, a progress dashboard, and full English/Tamil language support are included.

The stack is: React + Vite + TypeScript + Three.js + React Three Fiber + Drei + Zustand + CSS.

---

## Glossary

- **Workshop**: The main 3D scene that houses the toy viewer, tool panel, and HUD.
- **Toy**: One of the five selectable 3D models: Racing Car, Robot, Dinosaur, Rocket, Aeroplane.
- **Part**: An individually named mesh within a Toy that can be selected and painted independently.
- **Material**: A Three.js `MeshStandardMaterial` (or equivalent) applied to a Part's mesh geometry.
- **ActiveColour**: The colour currently selected in the Palette that will be applied when the player clicks a Part.
- **Palette**: The UI panel containing the 12 selectable painting colours.
- **Mission**: A colour-matching challenge that specifies a target colour for one or more Parts.
- **MissionTarget**: A Part–colour pair defined by a Mission.
- **Score**: A numeric value accumulated by completing MissionTargets within the time limit.
- **Accuracy**: The ratio of correctly painted Parts to total painted Parts in a session, expressed as a percentage.
- **Session**: One complete play-through from toy selection to completion or timeout.
- **PaintHistory**: An ordered list of Part–colour actions recorded during a Session, used for Undo.
- **CompletionAnimation**: The celebratory animated sequence shown when all Parts of a Toy are painted.
- **Achievement**: A named milestone awarded when a defined condition is met (e.g. "Perfect Painter").
- **Dashboard**: The screen showing cumulative progress, unlocked Achievements, and Session history.
- **i18n**: The internationalisation subsystem handling English and Tamil text rendering.
- **Locale**: The currently active language setting ("en" or "ta").
- **Renderer**: The React Three Fiber WebGL canvas that renders the 3D Workshop scene.
- **GameStore**: The Zustand global state store.

---

## Requirements

---

### Requirement 1: Toy Selection Screen

**User Story:** As a child player, I want to see all available toys before I start painting, so that I can choose the one I want to play with.

#### Acceptance Criteria

1. THE Workshop SHALL display a Toy Selection Screen as the initial view when the application loads.
2. THE Toy Selection Screen SHALL present exactly five selectable Toy thumbnails: Racing Car, Robot, Dinosaur, Rocket, and Aeroplane.
3. WHEN a player hovers over or moves keyboard focus to a Toy thumbnail, THE Workshop SHALL highlight that thumbnail with a visible focus indicator consisting of a scale increase of at least 1.05× or a border of at least 2 px.
4. WHEN a player selects a Toy thumbnail (pointer-down event), THE Workshop SHALL complete the transition to the first interactive render of the Painting View for that Toy within 500 ms.
5. THE Toy Selection Screen SHALL display each Toy's name in the active Locale.
6. IF the application fails to render the Toy Selection Screen within 5 seconds of load, THEN THE Workshop SHALL display an error message in the active Locale and provide a retry action.

---

### Requirement 2: 3D Toy Rendering

**User Story:** As a child player, I want to see a real 3D toy model, so that painting feels like working on an actual object rather than a flat picture.

#### Acceptance Criteria

1. THE Renderer SHALL render each Toy as a three-dimensional mesh composed of procedurally generated or loaded GLTF geometry.
2. THE Renderer SHALL apply a `MeshStandardMaterial` to every Part of every Toy so that a colour change applied to a Part is reflected in the rendered scene within 100 ms.
3. THE Workshop SHALL illuminate the Toy with at least one ambient light and one directional light such that no Part surface renders as fully unlit (zero diffuse contribution).
4. WHEN the Painting View loads, THE Renderer SHALL display the Toy centred in the viewport such that the Toy's bounding box occupies between 60% and 90% of the lesser viewport dimension at the default camera distance.
5. THE Renderer SHALL maintain a minimum frame rate of 30 fps on a device with an integrated GPU by limiting scene complexity per Toy to a maximum of 50 000 triangles.

---

### Requirement 3: 360-Degree Rotation and Zoom

**User Story:** As a child player, I want to rotate and zoom the toy freely, so that I can reach and inspect every part without obstruction.

#### Acceptance Criteria

1. WHILE the Painting View is active, THE Workshop SHALL allow the player to rotate the Toy 360 degrees on all axes by dragging with a pointer or touch gesture, with any touch or scroll interaction resetting the idle timer.
2. WHILE the Painting View is active, THE Workshop SHALL allow the player to zoom in and out using a scroll wheel or pinch gesture, clamping the camera distance to a minimum of 1 unit and a maximum of 10 units from the Toy centre without bouncing or overshooting beyond those bounds.
3. WHEN no pointer or touch interaction has occurred for 5 seconds, THE Workshop SHALL resume a slow auto-rotation of the Toy at a rate of 10 degrees per second.
4. WHEN the player initiates a drag interaction, THE Workshop SHALL pause auto-rotation within one rendered frame.
5. THE Workshop SHALL clamp the camera's vertical angle so that it cannot pass below the ground plane of the scene.

---

### Requirement 4: Part-by-Part 3D Painting

**User Story:** As a child player, I want to click on individual parts of the toy and paint them, so that I can customise the toy with different colours.

#### Acceptance Criteria

1. THE Workshop SHALL subdivide each Toy into a minimum of five independently selectable Parts (e.g. body, wheels, eyes, wings, fins), each represented by a distinct named mesh.
2. WHEN a player moves a pointer over a Part, THE Renderer SHALL highlight that Part with a visible hover effect (e.g. emissive glow or outline) without changing its painted colour; WHEN the pointer leaves that Part, THE Renderer SHALL restore the Part to its current painted colour.
3. WHEN a player clicks a Part, THE Workshop SHALL apply the ActiveColour to that Part's Material by setting `material.color` on the Three.js mesh.
4. WHEN a player clicks a Part, THE Workshop SHALL record a PaintHistory entry containing the Part's unique identifier and the colour value applied.
5. THE Workshop SHALL ensure that painting one Part does not alter the Material of any other Part.
6. IF a Part is clicked when no colour is selected in the Palette, THEN THE Workshop SHALL display a prompt instructing the player to select a colour first; the prompt SHALL auto-dismiss when the player subsequently selects a colour.

---

### Requirement 5: 12-Colour Painting Palette

**User Story:** As a child player, I want a clear palette of colours to choose from, so that I can paint my toy with the colours I like.

#### Acceptance Criteria

1. THE Palette SHALL display exactly 12 colour swatches simultaneously with the following fixed colours: red (#FF0000), orange (#FF8000), yellow (#FFFF00), green (#00AA00), teal (#008080), blue (#0000FF), purple (#8000FF), pink (#FF69B4), brown (#8B4513), white (#FFFFFF), grey (#808080), black (#000000).
2. WHEN a player selects a colour swatch, THE Workshop SHALL set that swatch's colour as the ActiveColour and clear any previously selected swatch's ActiveColour designation.
3. WHEN a colour swatch is selected, THE Palette SHALL render a visible selection indicator on that swatch consisting of a size change of at least 4 CSS px or a border of at least 3 CSS px, and SHALL remove the selection indicator from any previously selected swatch.
4. WHILE the Painting View is active, THE Palette SHALL remain fully within the viewport and SHALL not overlap the central Toy viewport region.
5. THE Palette SHALL render each colour swatch at a minimum touch-target size of 44 × 44 CSS pixels.
6. WHEN the Painting View loads, THE Palette SHALL pre-select red (#FF0000) as the initial ActiveColour.

---

### Requirement 6: Colour-Matching Missions

**User Story:** As a child player, I want to be given a colour-matching challenge, so that I have a goal to work towards and can learn about colours.

#### Acceptance Criteria

1. THE Workshop SHALL present at least one Mission per Toy, specifying a target colour for each Part defined in that Mission.
2. WHEN a Mission is active, THE Workshop SHALL display each MissionTarget Part with a colour hint (e.g. a small target swatch overlaid on the Part label in the HUD).
3. WHEN a player paints a MissionTarget Part with a colour whose RGB values are identical to the MissionTarget colour for that Part, THE Workshop SHALL register that MissionTarget as correct and update the Score.
4. WHEN all MissionTargets of a Mission are correctly painted, THE Workshop SHALL trigger the CompletionAnimation.
5. IF a player paints a MissionTarget Part with a colour whose RGB values differ from the MissionTarget colour, THEN THE Workshop SHALL decrement the Score by a fixed penalty of 5 points, with the Score floored at 0.
6. THE Workshop SHALL compute Accuracy at Session end as the number of correct MissionTarget paints divided by the total number of paint actions on MissionTarget Parts (including repaints of the same Part), expressed as a percentage rounded to the nearest integer.

---

### Requirement 7: Timer

**User Story:** As a child player, I want to see a countdown timer, so that completing the toy quickly feels exciting and rewarding.

#### Acceptance Criteria

1. WHEN a Mission starts, THE Workshop SHALL start a countdown timer from a configurable initial value between 30 and 600 seconds (default 120 seconds).
2. WHILE a Mission is active, THE Workshop SHALL display the remaining time in MM:SS format in the HUD, updating every second.
3. WHEN the timer reaches zero, THE Workshop SHALL end the Session, freeze all painting interactions, and display the final Score and Accuracy.
4. WHEN the timer drops below 30 seconds, THE Workshop SHALL change the timer display colour to red and add a pulsing animation at a rate of 1 Hz to draw attention.
5. WHEN the application window loses focus, THE Workshop SHALL pause the timer.
6. WHEN the application window regains focus, THE Workshop SHALL resume the timer from the value at which it was paused.

---

### Requirement 8: Score System

**User Story:** As a child player, I want to earn points for correct painting, so that I feel rewarded for doing well.

#### Acceptance Criteria

1. THE GameStore SHALL initialise the Score to 0 at the start of each Session.
2. WHEN a player paints a MissionTarget Part with a colour whose RGB values are identical to that Part's required MissionTarget colour, THE GameStore SHALL increment the Score by 10 points.
3. WHEN a player paints a MissionTarget Part with a colour whose RGB values differ from that Part's required MissionTarget colour, THE GameStore SHALL decrement the Score by 5 points, with a minimum Score of 0.
4. WHILE a Session is active, THE Workshop SHALL display the current Score in the HUD, updating within 100 ms of each paint action.
5. WHEN a Session ends, THE Workshop SHALL display a star rating based on Score thresholds: 0 stars for Score < 10, 1 star for Score ≥ 10, 2 stars for Score ≥ 50, 3 stars for Score ≥ 90.

---

### Requirement 9: Undo and Reset

**User Story:** As a child player, I want to undo my last paint action or reset the whole toy, so that I can fix mistakes without starting over unnecessarily.

#### Acceptance Criteria

1. WHILE the Painting View is active, THE Workshop SHALL display an Undo button that is fully visible within the viewport and does not overlap the painting canvas.
2. WHEN the player activates the Undo button, THE Workshop SHALL revert the most recent entry in PaintHistory by restoring the previous Material colour of that Part.
3. IF PaintHistory is empty, THEN THE Workshop SHALL render the Undo button in a disabled state and take no other action when it is activated.
4. WHILE the Painting View is active, THE Workshop SHALL display a Reset button that is fully visible within the viewport and does not overlap the painting canvas.
5. WHEN the player activates the Reset button, THE Workshop SHALL display a confirmation dialog before executing the reset.
6. WHEN the player confirms the reset dialog, THE Workshop SHALL restore all Parts of the current Toy to their default unpainted colours and clear PaintHistory.
7. WHEN the player cancels the reset dialog, THE Workshop SHALL close the dialog and make no changes to Part colours or PaintHistory.
8. WHEN the last PaintHistory entry is removed by Undo, THE Workshop SHALL transition the Undo button to its disabled state.

---

### Requirement 10: Animated Toy Completion

**User Story:** As a child player, I want to see a celebration when I finish painting the toy, so that completing the mission feels exciting and rewarding.

#### Acceptance Criteria

1. WHEN all MissionTargets of a Mission are correctly painted (each Part's colour RGB values match its MissionTarget colour), THE Workshop SHALL play a CompletionAnimation lasting between 2 and 4 seconds.
2. WHILE the CompletionAnimation plays, THE Workshop SHALL render at least two of the following effects simultaneously: confetti particle system, toy spin, colour burst, or star pop.
3. WHEN the CompletionAnimation finishes, THE Workshop SHALL display the final Score (numeric), Accuracy (0–100%), and star rating (1–3 scale).
4. WHEN the CompletionAnimation finishes, THE Workshop SHALL offer the player three navigation options: replay the same Toy, choose a new Toy, or view the Dashboard.
5. WHEN the CompletionAnimation starts, THE Workshop SHALL display a skip button; WHEN the player activates the skip button, THE Workshop SHALL immediately stop the animation and proceed to the post-animation results screen.

---

### Requirement 11: Stars, Achievements, and Progress Dashboard

**User Story:** As a child player, I want to track my progress and unlock achievements, so that I stay motivated to keep playing.

#### Acceptance Criteria

1. WHEN a Session ends (either by completing all MissionTargets or by the timer reaching zero), THE GameStore SHALL persist Session results (Toy name, Score, Accuracy, star rating on a 1–3 scale, timestamp) to browser localStorage.
2. IF browser localStorage is unavailable, THEN THE Workshop SHALL display a warning message in the active Locale and continue the Session without persisting results.
3. WHEN the Dashboard is opened or a new Session result is saved, THE Dashboard SHALL display a summary card for each completed Session retrieved from localStorage, showing Toy name, Score, Accuracy, star rating, and timestamp.
4. WHEN the Dashboard is opened or a new Session result is saved, THE Dashboard SHALL display the player's total accumulated stars as the sum of star ratings across all stored Sessions.
5. THE Workshop SHALL define at least five Achievements with the following named conditions:
   - "First Stroke" — complete the first paint action in any Session
   - "Speed Painter" — complete a Mission with 60 or more seconds remaining on the timer
   - "Perfect Painter" — achieve 100% Accuracy in a Session
   - "Colour Explorer" — apply at least one paint stroke using each of the 12 palette colours in a single Session
   - "Toy Master" — complete a Mission for each of the five Toys at least once
6. WHEN an Achievement's condition is first met, THE Workshop SHALL display an Achievement unlock notification toast containing the Achievement's name and icon for exactly 3 seconds, then auto-dismiss it.
7. THE Dashboard SHALL display all unlocked Achievements with their names and icons, and SHALL display all locked Achievements as greyed-out placeholders.

---

### Requirement 12: English and Tamil Language Support

**User Story:** As a Tamil-speaking child or parent, I want the entire application to be available in Tamil, so that the game is accessible and comfortable to use in my language.

#### Acceptance Criteria

1. THE i18n subsystem SHALL support exactly two Locales: "en" (English) and "ta" (Tamil).
2. THE Workshop SHALL render all UI labels, button text, HUD text, mission descriptions, achievement names, and error messages using strings from the active Locale's translation file.
3. WHEN the player toggles the language selector, THE i18n subsystem SHALL switch the active Locale and re-render all visible text within 500 ms without reloading the page, and SHALL persist the selected Locale to localStorage so it is restored on the next application load.
4. THE Workshop SHALL load Tamil text using a font that correctly renders all characters in the Tamil Unicode block (U+0B80–U+0BFF) without displaying missing-glyph boxes (e.g. Noto Sans Tamil).
5. IF a translation key is missing from the active Locale's translation file, THEN THE i18n subsystem SHALL fall back to the English string for that key and log a console warning.
6. WHEN the application loads for the first time with no persisted Locale preference, THE i18n subsystem SHALL default to the "en" Locale.

---

### Requirement 13: Navigation and Routing

**User Story:** As a player, I want every button and screen transition to work reliably, so that I am never stuck on a broken screen.

#### Acceptance Criteria

1. THE Workshop SHALL implement client-side routing with at least four named routes: Home (Toy Selection), Painting View, Dashboard, and Settings.
2. WHEN the player clicks a navigation control, THE Workshop SHALL complete the route transition within 300 ms.
3. IF a route transition takes longer than 300 ms, THEN THE Workshop SHALL display a loading indicator within the viewport and remove it once the transition completes.
4. IF a player navigates to an undefined route, THEN THE Workshop SHALL redirect to the Home route and display a "page not found" message on the Home screen.
5. WHEN the player activates the browser back or forward control, THE Workshop SHALL navigate to the screen visited immediately before or after the current screen in the player's navigation history within 300 ms.

---

### Requirement 14: Performance Optimisation

**User Story:** As a player on an ordinary laptop, I want the game to run smoothly, so that slow hardware does not ruin the experience.

#### Acceptance Criteria

1. THE Renderer SHALL use geometry instancing and material sharing when two or more Parts share the same mesh or material.
2. WHEN a Toy is unloaded from the scene, THE Renderer SHALL dispose of all Three.js geometries, materials, and textures associated with that Toy.
3. WHEN the application is idle on the Toy Selection Screen (no user interaction detected for 5 or more consecutive seconds), THE Renderer SHALL reduce the WebGL render loop to at most 10 fps.
4. THE Workshop SHALL lazy-load each Toy's geometry only when that Toy is selected, not at application startup.
5. THE Workshop SHALL keep total JavaScript bundle size below 500 KB (gzipped) excluding Three.js and React Three Fiber peer dependencies.

---

### Requirement 15: Code Quality and Modularity

**User Story:** As a developer, I want the codebase to be clean and modular, so that each feature can be developed, tested, and maintained independently.

#### Acceptance Criteria

1. THE Workshop SHALL organise source files into feature-scoped modules: `scene/`, `toys/`, `painting/`, `missions/`, `ui/`, `store/`, `i18n/`, and `utils/`.
2. THE Workshop SHALL define TypeScript interfaces for all shared data structures (Toy, Part, Mission, Achievement, SessionResult, GameState).
3. IF a component or hook file's non-rendering logic (state management, data transformation, or side-effect code) exceeds 200 lines, THEN that logic MUST be extracted into a separate utility or hook file.
4. THE GameStore SHALL expose state and actions through a typed Zustand store where all state properties and action signatures have explicit TypeScript types, with no direct mutations outside store action functions.
5. THE Workshop SHALL include inline JSDoc comments for all exported functions and components, each containing at minimum a description, a `@param` annotation for every parameter, and a `@returns` annotation for every non-void function.

---

## Proposed Folder Structure

```
Toyverse-3D/
├── public/
│   └── fonts/
│       └── NotoSansTamil-Regular.woff2
├── src/
│   ├── main.tsx                    # Vite entry point
│   ├── App.tsx                     # Root router
│   ├── scene/
│   │   ├── WorkshopCanvas.tsx      # R3F Canvas + lights + camera
│   │   ├── CameraController.tsx    # OrbitControls + auto-rotate logic
│   │   └── EnvironmentSetup.tsx    # Lighting, background, grid
│   ├── toys/
│   │   ├── ToyLoader.tsx           # Lazy-loads toy geometry
│   │   ├── models/
│   │   │   ├── RacingCar.tsx       # Procedural Racing Car mesh + parts
│   │   │   ├── Robot.tsx
│   │   │   ├── Dinosaur.tsx
│   │   │   ├── Rocket.tsx
│   │   │   └── Aeroplane.tsx
│   │   └── types.ts                # Toy, Part TypeScript interfaces
│   ├── painting/
│   │   ├── PaintingController.tsx  # Raycasting, click → material update
│   │   ├── PartHighlight.tsx       # Hover glow / outline effect
│   │   ├── PaintHistory.ts         # Undo stack logic
│   │   └── types.ts                # PaintAction interface
│   ├── missions/
│   │   ├── MissionEngine.ts        # Mission evaluation, scoring
│   │   ├── missionData.ts          # Static mission definitions per toy
│   │   └── types.ts                # Mission, MissionTarget interfaces
│   ├── animations/
│   │   ├── CompletionAnimation.tsx # Confetti + spin sequence
│   │   └── Confetti.tsx            # Particle system
│   ├── ui/
│   │   ├── screens/
│   │   │   ├── HomeScreen.tsx      # Toy selection grid
│   │   │   ├── PaintingScreen.tsx  # Main painting HUD overlay
│   │   │   ├── DashboardScreen.tsx # Progress + achievements
│   │   │   └── SettingsScreen.tsx  # Language toggle, volume
│   │   ├── components/
│   │   │   ├── Palette.tsx         # 12-colour swatch panel
│   │   │   ├── HUD.tsx             # Timer, score, accuracy overlay
│   │   │   ├── UndoResetBar.tsx    # Undo / Reset buttons
│   │   │   ├── AchievementToast.tsx
│   │   │   ├── StarRating.tsx
│   │   │   └── LanguageToggle.tsx
│   │   └── router/
│   │       └── AppRouter.tsx       # React Router v6 route definitions
│   ├── store/
│   │   ├── gameStore.ts            # Zustand store (GameState + actions)
│   │   └── types.ts                # GameState, Achievement, SessionResult
│   ├── i18n/
│   │   ├── index.ts                # Locale lookup + fallback logic
│   │   ├── en.ts                   # English strings
│   │   └── ta.ts                   # Tamil strings
│   └── utils/
│       ├── colorUtils.ts           # Hex ↔ Three.js Color helpers
│       ├── storageUtils.ts         # localStorage read/write wrappers
│       └── mathUtils.ts            # Angle, clamp, lerp helpers
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## 3D Painting Implementation Approach

### Why procedural geometry, not image overlays

Every Part is an independent Three.js `Mesh` with its own `MeshStandardMaterial` instance. Painting calls `mesh.material.color.set(hexValue)` directly on the mesh, so the colour change is rendered by the GPU in the same lighting pass as the rest of the scene. There are no textures to swap, no canvas overlays, and no DOM-layer faking.

### Raycasting flow

1. On every `pointerdown` event on the R3F canvas, a `Raycaster` is cast from the camera through the cursor position.
2. The raycast result is filtered to only meshes that are registered Parts of the currently loaded Toy.
3. The first intersected Part mesh is identified by its `userData.partName`.
4. `PaintingController` reads the current `ActiveColour` from `GameStore` and sets `mesh.material.color`.
5. A `PaintAction { partName, previousColor, newColor }` is pushed onto the `PaintHistory` stack.

### Hover highlight

`PartHighlight` uses `onPointerMove` events on each Part mesh and temporarily raises `material.emissive` to a soft white on hover, restoring it on `pointerleave`. This avoids post-processing passes (expensive on integrated GPUs) while still giving clear feedback.

### Part isolation per toy

Each toy component file (`RacingCar.tsx`, etc.) exports a structured `TOY_PARTS` manifest listing every Part mesh name, its default colour, and its display label in both locales. The `PaintingController` uses this manifest to register which mesh names are valid paint targets.

---

## Phased Development Roadmap

| Phase | Deliverables | Key files |
|-------|-------------|-----------|
| **Phase 1 – Scaffold & Scene** | Vite + React + R3F project setup, basic WorkshopCanvas with lights and OrbitControls, empty toy placeholder box | `WorkshopCanvas.tsx`, `CameraController.tsx`, `vite.config.ts` |
| **Phase 2 – Toy Models** | All five procedural toy models with named Part meshes, ToyLoader lazy-loading, Toy Selection Screen | `models/*.tsx`, `ToyLoader.tsx`, `HomeScreen.tsx` |
| **Phase 3 – Painting Core** | Raycasting, material colour update, hover glow, Palette UI, Undo/Reset | `PaintingController.tsx`, `PartHighlight.tsx`, `Palette.tsx`, `UndoResetBar.tsx` |
| **Phase 4 – Missions & Scoring** | Mission data, MissionEngine, Timer, Score + Accuracy HUD, end-of-session screen | `MissionEngine.ts`, `missionData.ts`, `HUD.tsx` |
| **Phase 5 – Completion & Achievements** | CompletionAnimation, star rating, Achievement unlock toasts, Dashboard screen | `CompletionAnimation.tsx`, `DashboardScreen.tsx`, `AchievementToast.tsx` |
| **Phase 6 – i18n & Accessibility** | English + Tamil translation files, LanguageToggle, Noto Sans Tamil font, WCAG touch targets | `i18n/*.ts`, `LanguageToggle.tsx`, CSS touch-target rules |
| **Phase 7 – Performance & Polish** | Bundle audit, geometry disposal, idle-mode render throttle, CSS animations, final QA | `utils/*.ts`, Vite build config |

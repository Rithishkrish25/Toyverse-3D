# Implementation Plan: Toyverse Premium Upgrade

## Overview

This implementation plan covers the premium quality and visual upgrade of the Toyverse-3D toy painting game. The approach is **additive enhancement**: every change either replaces visual/geometry code in-place (preserving the same component interfaces and part names) or adds new CSS/styling. No store actions, mission engine logic, routing, or persistence behavior changes.

The plan follows the design document's component breakdown order: design tokens and CSS foundation first, then PartMesh PBR upgrades, then the three 3D model enhancements, then environment, then UI components (Palette, HUD, Confetti, StarRating, ResultsOverlay), then PaintingScreen responsive layout, and finally game logic preservation property tests.

All code is TypeScript with React 18, React Three Fiber, @react-three/drei, and Zustand. The project uses Vitest with fast-check 3.14.0 for property-based testing.

## Tasks

- [ ] 1. Design tokens and CSS foundation
  - [x] 1.1 Create `src/ui/theme/tokens.ts` with colour, spacing, typography, shadow, radius, and transition tokens
    - Export `COLORS`, `SPACING`, `FONT_WEIGHTS`, `FONT_STACKS`, `RADIUS`, `SHADOWS`, `TRANSITIONS` typed constants
    - Export `CSS_VARIABLES` string for `:root` injection
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.5, 2.6_

  - [x] 1.2 Add design token CSS variables, animation keyframes, and responsive styles to `src/index.css`
    - Add `:root` CSS custom properties (colours, radii, shadows, fonts, spacing)
    - Add button hover/press interaction styles (scale 1.04/150ms hover, scale 0.96/100ms press)
    - Add `overlay-enter` keyframe animation (fade-in + slide-up, 250ms)
    - Add `screen-fade` keyframe animation (route transition, 200ms)
    - Add `paint-flash` keyframe animation (brightness flash, 300ms)
    - Add `star-fill` keyframe animation (scale + rotate)
    - Add `score-pop` keyframe animation (scale pulse, 400ms)
    - Add `timer-calm`, `timer-warning`, `timer-urgent` CSS classes with gradient backgrounds and pulse animation
    - Add `.palette-swatch.active` and `.palette-swatch:hover` styles (gold border, scale, glow)
    - Add responsive media queries: 768px stacking, 480px swatch sizing, 320px overflow prevention
    - Add `overflow-x: hidden` on html/body/#root
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 3.2, 3.3, 3.4, 9.3, 9.4, 10.3, 11.2, 11.3, 11.4, 13.4, 15.5_

- [x] 2. PartMesh PBR materials and paint feedback
  - [x] 2.1 Add optional `materialProps` (metalness, roughness, transparent, opacity) to PartMesh interface and meshStandardMaterial
    - Extend `PartMeshProps` with optional `metalness` (default 0.1), `roughness` (default 0.6), `transparent` (default false), `opacity` (default 1.0)
    - Pass these props to `<meshStandardMaterial>` — backward-compatible (existing callers unchanged)
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 4.4_

  - [x] 2.2 Enhance hover emissive glow to be brighter than 0x666666
    - Change `materialRef.current.emissive.set(0x666666)` to `0x999999` on pointer over
    - Reset to `0x000000` on pointer out
    - _Requirements: 10.1, 10.2_

  - [x] 2.3 Add flash animation on click with timer cleanup on unmount
    - On pointer down with active colour: set emissive to white, emissiveIntensity to 0.8
    - Clear after 300ms via `setTimeout`, reset emissive to 0x000000 and intensity to 1.0
    - Add `useEffect` cleanup to clear `flashTimerRef` on unmount
    - _Requirements: 10.3_

  - [ ]* 2.4 Write property test for PartMesh interaction and raycasting preservation
    - **Property 2: PartMesh interaction and raycasting preservation**
    - **Validates: Requirements 4.6, 5.6, 6.6, 10.5**
    - Test file: `src/__tests__/toys/partMesh.test.tsx`

  - [ ]* 2.5 Write property test for PBR material assignment by part category
    - **Property 3: PBR material assignment by part category**
    - **Validates: Requirements 7.1, 7.2, 7.3, 7.4**
    - Test file: `src/__tests__/toys/partMesh.test.tsx`

  - [ ]* 2.6 Write property test for dual-mode color resolution
    - **Property 4: Dual-mode color resolution**
    - **Validates: Requirements 7.5, 7.6, 14.10**
    - Test file: `src/__tests__/toys/partMesh.test.tsx`

  - [ ]* 2.7 Write property test for PartMesh hover emissive lifecycle
    - **Property 5: PartMesh hover emissive lifecycle**
    - **Validates: Requirements 10.1, 10.2**
    - Test file: `src/__tests__/toys/partMesh.test.tsx`

- [x] 3. Car3D model enhancement
  - [x] 3.1 Rewrite body with `RoundedBox` beveled chassis and add hood separation
    - Replace `boxGeometry` body with `RoundedBox` from `@react-three/drei` (radius 0.08, smoothness 4)
    - Add separate hood section in front for visual separation between bonnet and cabin
    - Apply roughness 0.3, metalness 0.15 via materialProps
    - _Requirements: 4.1, 4.2, 7.1_

  - [x] 3.2 Add tire+rim wheel components for front and rear
    - Each wheel is a group: `torusGeometry` tire (partName=wheel-*, roughness 0.8) + `cylinderGeometry` rim (partName=wheel-*, metalness 0.5, roughness 0.3)
    - Render front and rear wheels on both sides
    - _Requirements: 4.3, 7.2, 7.4_

  - [x] 3.3 Add semi-transparent windows and bumper with higher metalness
    - Windows: `meshStandardMaterial` with `transparent opacity={0.5}` on front windscreen and side windows
    - Bumper: higher metalness (0.5) via materialProps
    - Preserve exact part names: body, roof, wheel-front, wheel-rear, window, bumper
    - _Requirements: 4.4, 4.5, 4.6, 7.2_

- [x] 4. Bike3D model enhancement
  - [x] 4.1 Add tire+rim wheels with spoke details
    - Each wheel: `torusGeometry` tire (roughness 0.8) + `cylinderGeometry` rim (metalness 0.5, roughness 0.3)
    - Add spoke details as thin `cylinderGeometry` meshes sharing the wheel partName
    - _Requirements: 5.1, 5.2, 7.2, 7.4_

  - [x] 4.2 Replace saddle with contoured geometry and handlebar with curved torus arc
    - Saddle: replace flat `boxGeometry` with flattened `sphereGeometry` or `capsuleGeometry` (roughness 0.8)
    - Handlebar: replace straight crossbar cylinder with curved `torusGeometry` arc segment
    - Preserve exact part names: frame, wheel-front, wheel-rear, handlebar, seat
    - _Requirements: 5.3, 5.4, 5.5, 5.6_

- [x] 5. Lorry3D model enhancement
  - [x] 5.1 Rewrite cab with `RoundedBox` and add exhaust stack detail
    - Replace `boxGeometry` cab with `RoundedBox` for beveled geometry
    - Add vertical `cylinderGeometry` exhaust stack on cab side, sharing partName="cab"
    - _Requirements: 6.1, 6.4_

  - [x] 5.2 Add cargo panel line ridges, tire+rim wheels, and semi-transparent window
    - Cargo: add panel line ridges as thin `boxGeometry` meshes on surface, sharing partName="cargo"
    - Wheels: same tire+rim pattern as Car3D (torus tire + cylinder rim)
    - Window: semi-transparent material (transparent, opacity 0.5)
    - Preserve exact part names: cab, cargo, wheel-front, wheel-rear, window, bumper
    - _Requirements: 6.2, 6.3, 6.4, 6.5, 6.6_

  - [ ]* 5.3 Write property test for toy model part name preservation
    - **Property 1: Toy model part name preservation**
    - **Validates: Requirements 4.5, 5.5, 6.5**
    - Test file: `src/__tests__/models/partNames.test.tsx`

- [x] 6. Checkpoint - 3D models and PartMesh
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. 3D Environment enhancement
  - [x] 7.1 Add 3-point lighting rig with shadow casting and ground plane
    - Key light: directionalLight at [5, 8, 5], intensity 1.5, castShadow, shadow-mapSize 2048x2048
    - Fill light: directionalLight at [-5, 4, 5], intensity 0.6
    - Rim light: directionalLight at [0, 6, -6], intensity 0.4
    - Ambient light: intensity 0.4
    - Ground plane: planeGeometry with shadowMaterial, receiveShadow
    - _Requirements: 8.1, 8.2, 8.3_

  - [x] 7.2 Add grid floor, fog, Environment map, and scene background
    - Grid floor: `Grid` from drei with cellSize/sectionSize, fadeDistance, infiniteGrid
    - Fog: `<fog attach="fog" args={['#1a1a2e', 8, 18]} />`
    - Environment map: `<Environment preset="city" />` from drei for PBR reflections
    - Scene background: `<color attach="background" args={['#1a1a2e']} />` (dark navy)
    - _Requirements: 8.4, 8.5, 8.6, 8.7_

- [x] 8. Premium Palette UI
  - [x] 8.1 Add colour name labels, active state, and hover transform to swatches
    - Each swatch: flex-column container with colour button on top and small label below
    - Active state: gold border (#FFD700), scale 1.12, glow box-shadow (via `.palette-swatch.active` CSS class)
    - Hover: scale 1.08, subtle box-shadow (via `.palette-swatch:hover` CSS class)
    - Verify pre-selected red (#FF0000) is the initial activeColor (already in store)
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.6_

  - [ ]* 8.2 Write property test for palette swatch selection
    - **Property 6: Palette swatch selection**
    - **Validates: Requirements 9.5**
    - Test file: `src/__tests__/ui/palette.test.tsx`

- [x] 9. Animated HUD
  - [x] 9.1 Create `src/ui/hooks/useAnimatedNumber.ts` hook
    - Pure React hook using `requestAnimationFrame` to animate from previous to new value
    - EaseOutCubic easing, configurable duration (default 400ms)
    - Cleanup: cancelAnimationFrame on unmount and when target changes
    - _Requirements: 11.1_

  - [x] 9.2 Add animated score counter and gradient timer zones to HUD
    - Score: use `useAnimatedNumber(score)` for count-up display over 300-500ms
    - Timer zones: `timer-calm` (>60s), `timer-warning` (31-60s), `timer-urgent` (≤30s with pulse animation)
    - _Requirements: 11.1, 11.2, 11.3, 11.4_

  - [x] 9.3 Enhance target hint chips with check indicators
    - Add ✓ check indicator when painted colour matches target colour for each hint chip
    - _Requirements: 11.5_

  - [ ]* 9.4 Write property test for timer color zone mapping
    - **Property 7: Timer color zone mapping**
    - **Validates: Requirements 11.2, 11.3, 11.4**
    - Test file: `src/__tests__/ui/hud.test.tsx`

  - [ ]* 9.5 Write property test for HUD target hint chips
    - **Property 8: HUD target hint chips**
    - **Validates: Requirements 11.5**
    - Test file: `src/__tests__/ui/hud.test.tsx`

- [ ] 10. Confetti particle enhancement
  - [x] 10.1 Increase to 80+ particles with varied colors, gravity, rotation, and top-spawn distribution
    - Particle count: 80 (up from 40)
    - Colors: red, orange, yellow, green, blue, purple, pink, gold
    - Gravity: decrease Y velocity each frame (`velocity.y -= 0.0008`)
    - Rotation: apply rotationSpeed to X/Y/Z each frame
    - Spawn: top of canvas (positive Y), X distributed across full width
    - Verify `onComplete` callback fires at 3000ms duration
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

  - [ ]* 10.2 Write property test for confetti initialization
    - **Property 9: Confetti initialization**
    - **Validates: Requirements 12.1, 12.4**
    - Test file: `src/__tests__/animations/confetti.test.ts`

  - [ ]* 10.3 Write property test for confetti motion
    - **Property 10: Confetti motion**
    - **Validates: Requirements 12.2, 12.3**
    - Test file: `src/__tests__/animations/confetti.test.ts`

- [x] 11. StarRating and ResultsOverlay enhancement
  - [x] 11.1 Add sequential scale-in star fill animation to StarRating
    - Apply `star-fill` keyframe animation to each filled star with sequential delay (i * 150ms)
    - Empty stars: no animation, dark grey color
    - _Requirements: 13.4_

  - [x] 11.2 Add entry animation, gradient background, and trophy icon to ResultsOverlay
    - Entry: add `className="overlay-enter"` to root div (fade-in + slide-up, 200-300ms)
    - Background: gradient `linear-gradient(135deg, rgba(255,247,232,0.97), rgba(232,221,202,0.97))`
    - Trophy: display 🏆 when challenge completed successfully
    - _Requirements: 13.1, 13.2, 13.3_

  - [x] 11.3 Verify/enhance stat cards and per-part comparison table styling
    - Stat cards (score, accuracy, correct parts, incorrect parts, time taken): consistent border-radius, padding, box-shadow using CSS variables
    - Per-part comparison table: target colour, painted colour, correct/incorrect status for each part
    - Verify Next Level button and Game Completed banner styling (gradient)
    - _Requirements: 13.5, 13.6, 13.7, 13.8_

  - [ ]* 11.4 Write property test for results stat card consistency
    - **Property 19: Results stat card consistency**
    - **Validates: Requirements 13.5**
    - Test file: `src/__tests__/ui/results.test.tsx`

  - [ ]* 11.5 Write property test for per-part comparison table completeness
    - **Property 20: Per-part comparison table completeness**
    - **Validates: Requirements 13.6**
    - Test file: `src/__tests__/ui/results.test.tsx`

- [x] 12. PaintingScreen responsive layout
  - [x] 12.1 Add responsive layout classes for breakpoint stacking and route transition fade
    - Add `className="painting-main"` to main flex container
    - Add `className="painting-target-panel"` to target panel div
    - Add `className="screen-fade"` to root for route transition animation
    - Inline styles remain as desktop fallback; CSS media queries override at 768px
    - _Requirements: 3.2, 2.4_

- [x] 13. Checkpoint - UI and scene components
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 14. Game logic preservation property tests
  - [ ]* 14.1 Write property test for score calculation delta
    - **Property 11: Score calculation delta**
    - **Validates: Requirements 14.2**
    - Test file: `src/__tests__/store/scoreCalculation.test.ts`

  - [ ]* 14.2 Write property test for results accuracy formula
    - **Property 12: Results accuracy formula**
    - **Validates: Requirements 14.3**
    - Test file: `src/__tests__/store/calculateResults.test.ts`

  - [ ]* 14.3 Write property test for undo paint round trip
    - **Property 13: Undo paint round trip**
    - **Validates: Requirements 14.4**
    - Test file: `src/__tests__/store/undoPaint.test.ts`

  - [ ]* 14.4 Write property test for reset painting clears all state
    - **Property 14: Reset painting clears all state**
    - **Validates: Requirements 14.5**
    - Test file: `src/__tests__/store/resetPainting.test.ts`

  - [ ]* 14.5 Write property test for timer decrement and timeout
    - **Property 15: Timer decrement and timeout**
    - **Validates: Requirements 14.7**
    - Test file: `src/__tests__/store/tickTimer.test.ts`

  - [ ]* 14.6 Write property test for sequential level unlocking
    - **Property 16: Sequential level unlocking**
    - **Validates: Requirements 14.1**
    - Test file: `src/__tests__/store/levelUnlocking.test.ts`

  - [ ]* 14.7 Write property test for submit challenge transition
    - **Property 17: Submit challenge transition**
    - **Validates: Requirements 14.6**
    - Test file: `src/__tests__/store/submitChallenge.test.ts`

  - [ ]* 14.8 Write property test for achievement evaluation
    - **Property 18: Achievement evaluation**
    - **Validates: Requirements 14.8**
    - Test file: `src/__tests__/store/achievements.test.ts`

  - [ ]* 14.9 Write property test for i18n translation key coverage
    - **Property 21: i18n translation key coverage**
    - **Validates: Requirements 15.6**
    - Test file: `src/__tests__/i18n/coverage.test.ts`

- [x] 15. Final checkpoint - build verification
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation after 3D model changes and UI component changes
- Property tests validate universal correctness properties using fast-check (100 iterations minimum)
- Unit tests validate specific examples and edge cases
- The design uses TypeScript with React 18, React Three Fiber, @react-three/drei, and Zustand
- All changes are additive: no game logic, store actions, mission engine, routing, or persistence changes
- The game logic PBT tests (task 14) verify that existing unchanged code (gameStore.ts, MissionEngine.ts) still works correctly after all visual upgrades
- Run tests with `vitest run` (single execution, not watch mode)
- Run build verification with `npm run build` (tsc + vite build)

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "9.1", "2.1", "7.1", "10.1", "14.1", "14.2", "14.3", "14.4", "14.5", "14.6", "14.7", "14.8", "14.9"] },
    { "id": 1, "tasks": ["1.2", "2.2", "7.2", "10.2", "3.1", "4.1", "5.1"] },
    { "id": 2, "tasks": ["2.3", "3.2", "4.2", "5.2", "10.3", "8.1", "11.1", "12.1", "9.2"] },
    { "id": 3, "tasks": ["2.4", "3.3", "9.3", "11.2", "8.2"] },
    { "id": 4, "tasks": ["2.5", "5.3", "9.4", "11.3"] },
    { "id": 5, "tasks": ["2.6", "9.5", "11.4"] },
    { "id": 6, "tasks": ["2.7", "11.5"] }
  ]
}
```

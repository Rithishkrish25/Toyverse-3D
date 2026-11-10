# Requirements Document

## Introduction

This specification covers a premium quality and visual upgrade of the existing Toyverse-3D toy painting game. The project already works end-to-end with React Three Fiber, Three.js, and Zustand. This upgrade improves UI design polish, 3D model detail, lighting and materials, gameplay feedback, and completion animations without breaking any existing game logic, routing, build, or deployment.

## Glossary

- **System**: The Toyverse-3D React application as a whole.
- **WorkshopCanvas**: The R3F Canvas component that hosts the 3D scene, camera, and lights.
- **EnvironmentSetup**: The component responsible for lighting, shadows, ground plane, and scene background within the WorkshopCanvas.
- **CameraController**: The component managing OrbitControls, zoom clamping, polar clamping, and auto-rotation.
- **PartMesh**: The component that wraps each toy part mesh, handling click-to-paint raycasting, hover glow, and dual render modes (paintable/target).
- **Car3D / Bike3D / Lorry3D**: Procedural 3D toy models built from boxGeometry, cylinderGeometry, and torusGeometry wrapped in PartMesh components.
- **GameStore**: The Zustand state store managing phase machine, partColors, paintHistory, timer, score, achievements, session history, and level progress.
- **MissionEngine**: The module that evaluates paint actions against mission targets and computes score deltas.
- **MissionData**: The data file defining levels (1=Car, 2=Bike, 3=Lorry), mission targets, duration, and toy part definitions.
- **ToyRenderModeContext**: React context controlling whether PartMesh renders in paintable mode (interactive, reads GameStore colours) or target mode (non-interactive reference image, reads mission target colours).
- **PaintHistory**: The undo stack of PaintAction records stored in GameStore.
- **Palette**: The 12-colour swatch picker component at the bottom of the PaintingScreen.
- **HUD**: The heads-up display showing timer, score, and target colour hints.
- **ResultsOverlay**: The post-challenge overlay showing score, stars, per-part comparison, and navigation buttons.
- **CompletionAnimation**: The celebratory overlay containing a confetti particle Canvas.
- **Confetti**: The instanced particle system rendered during CompletionAnimation.
- **StarRating**: The 0-3 star display component used in ResultsOverlay.
- **PBR**: Physically Based Rendering — materials that use metalness and roughness properties for realistic light interaction.
- **EnvironmentMap**: A pre-rendered or procedural image mapped onto the 3D scene to provide realistic reflections on PBR materials.
- **Touch Target**: An interactive UI element with a minimum bounding box of 44x44 pixels for accessibility compliance.

## Requirements

### Requirement 1: Premium Typography and Colour System

**User Story:** As a player, I want modern typography and a cohesive colour palette throughout the interface, so that the game feels polished and premium.

#### Acceptance Criteria

1. THE System SHALL use a consistent font stack across all screens with defined heading, body, and monospace styles.
2. THE System SHALL apply a unified colour palette with primary (#FF6B35), secondary (#4a90d9), success (#4CAF50), danger (#F44336), and neutral (#FFF7E8, #E8DDCA, #2D2D2D) tokens.
3. THE System SHALL apply consistent spacing scale values (4px, 8px, 12px, 16px, 24px, 32px) across all UI components.
4. WHEN rendering text, THE System SHALL apply font weights of 400 for body, 600 for labels, 700 for emphasis, and 800-900 for headings.

### Requirement 2: UI Component Polish and Animations

**User Story:** As a player, I want smooth transitions and subtle animations on buttons, cards, and overlays, so that the interface feels responsive and premium.

#### Acceptance Criteria

1. WHEN a button is hovered, THE System SHALL apply a transform scale of 1.04 with a transition duration of 150ms.
2. WHEN a button is pressed, THE System SHALL apply a transform scale of 0.96 with a transition duration of 100ms.
3. WHEN an overlay or modal appears, THE System SHALL animate the entry with a fade-in and slide-up over 200-300ms.
4. WHEN the active screen changes via route navigation, THE System SHALL apply a fade transition between screens.
5. THE System SHALL apply consistent border-radius values of 8px for small elements, 12px for panels, and 16px for large cards.
6. THE System SHALL apply consistent box-shadow elevation levels: level-1 (0 1px 6px rgba(0,0,0,0.05)), level-2 (0 2px 8px rgba(0,0,0,0.08)), level-3 (0 4px 20px rgba(0,0,0,0.12)).

### Requirement 3: Responsive Layout

**User Story:** As a player on mobile or desktop, I want the layout to adapt to my screen size, so that controls are reachable and the 3D canvas remains visible.

#### Acceptance Criteria

1. THE System SHALL render every interactive button and palette swatch with a minimum Touch Target of 44x44 pixels.
2. WHEN the viewport width is 768px or less, THE System SHALL stack the PaintingScreen target panel above the 3D canvas instead of side-by-side.
3. WHEN the viewport width is 480px or less, THE System SHALL reduce palette swatch size to 38x38 pixels while maintaining the 44px minimum Touch Target via padding.
4. THE System SHALL prevent horizontal scrolling on all screens at viewport widths of 320px and above.

### Requirement 4: Car3D Model Enhancement

**User Story:** As a player, I want a more detailed and realistic 3D car model, so that the painting experience feels richer.

#### Acceptance Criteria

1. THE Car3D SHALL render a body with bevelled or rounded geometry instead of a flat boxGeometry for the chassis.
2. THE Car3D SHALL include distinct front and rear sections with visual separation between the bonnet and cabin.
3. THE Car3D SHALL render wheels with tire (torusGeometry) and rim (cylinderGeometry) components instead of single cylinders.
4. THE Car3D SHALL render windows on both the front windscreen and side windows with semi-transparent material.
5. THE Car3D SHALL preserve the exact part names: body, roof, wheel-front, wheel-rear, window, bumper.
6. THE Car3D SHALL maintain click-to-paint raycasting on every PartMesh so that each part remains independently paintable.

### Requirement 5: Bike3D Model Enhancement

**User Story:** As a player, I want a more detailed and realistic 3D bike model, so that the painting experience feels richer.

#### Acceptance Criteria

1. THE Bike3D SHALL render wheels with tire (torusGeometry) and rim (cylinderGeometry) components instead of a single torus.
2. THE Bike3D SHALL render spokes or a hub detail within each wheel.
3. THE Bike3D SHALL render a saddle with contoured geometry instead of a flat boxGeometry.
4. THE Bike3D SHALL render the handlebar with a curved bar geometry rather than a straight cylinder crossbar.
5. THE Bike3D SHALL preserve the exact part names: frame, wheel-front, wheel-rear, handlebar, seat.
6. THE Bike3D SHALL maintain click-to-paint raycasting on every PartMesh so that each part remains independently paintable.

### Requirement 6: Lorry3D Model Enhancement

**User Story:** As a player, I want a more detailed and realistic 3D lorry model, so that the painting experience feels richer.

#### Acceptance Criteria

1. THE Lorry3D SHALL render the cab with bevelled or rounded geometry instead of a flat boxGeometry.
2. THE Lorry3D SHALL render the cargo box with visible panel lines or ridge details.
3. THE Lorry3D SHALL render wheels with tire (torusGeometry) and rim (cylinderGeometry) components instead of single cylinders.
4. THE Lorry3D SHALL include an exhaust stack or side mirror detail to increase visual richness.
5. THE Lorry3D SHALL preserve the exact part names: cab, cargo, wheel-front, wheel-rear, window, bumper.
6. THE Lorry3D SHALL maintain click-to-paint raycasting on every PartMesh so that each part remains independently paintable.

### Requirement 7: PBR Materials and PartMesh Rendering

**User Story:** As a player, I want parts to render with realistic materials, so that painted colours look vibrant and tactile.

#### Acceptance Criteria

1. THE PartMesh SHALL use meshStandardMaterial with physically based metalness and roughness properties.
2. THE PartMesh SHALL assign higher metalness (0.3-0.6) to metallic parts such as bumpers, handlebars, and wheel rims.
3. THE PartMesh SHALL assign lower roughness (0.2-0.4) to glossy parts such as windows and painted bodywork.
4. THE PartMesh SHALL assign higher roughness (0.7-0.9) to matte parts such as tires and seats.
5. WHEN a PartMesh is rendered in target mode, THE PartMesh SHALL display the target colour from MissionData without pointer event handlers.
6. WHEN a PartMesh is rendered in paintable mode, THE PartMesh SHALL display the colour from GameStore.partColors with the defaultColor fallback and attach pointer event handlers.

### Requirement 8: 3D Environment Enhancement

**User Story:** As a player, I want an attractive 3D environment with realistic lighting, shadows, and reflections, so that the workshop scene feels immersive.

#### Acceptance Criteria

1. THE EnvironmentSetup SHALL render a 3-point lighting rig with a key light, fill light, and rim light.
2. THE EnvironmentSetup SHALL enable shadow casting on the key directional light with a shadow map resolution of at least 1024x1024.
3. THE EnvironmentSetup SHALL render a ground plane that receives shadows.
4. THE EnvironmentSetup SHALL render a grid floor pattern on or above the ground plane to provide spatial reference.
5. THE EnvironmentSetup SHALL apply subtle fog with a colour matching the scene background and a far distance of at least 15 units.
6. THE EnvironmentSetup SHALL provide an EnvironmentMap for PBR material reflections using @react-three/drei Environment or a procedural gradient sky.
7. WHILE the scene background is rendered, THE System SHALL use a gradient or solid colour that makes painted toy colours visually distinct.

### Requirement 9: Premium Palette UI

**User Story:** As a player, I want a colour palette with larger swatches, colour labels, and a clear selected state, so that colour selection feels satisfying and clear.

#### Acceptance Criteria

1. THE Palette SHALL render 12 colour swatches with a minimum size of 44x44 pixels each.
2. THE Palette SHALL display a colour name label beneath or beside each swatch.
3. WHEN a swatch is the active colour, THE Palette SHALL apply a selected-state style with a gold border (#FFD700), a scale transform of 1.12, and a glow box-shadow.
4. WHEN a swatch is hovered, THE Palette SHALL apply a scale transform of 1.08 and a subtle box-shadow.
5. WHEN a swatch is clicked, THE Palette SHALL set the active colour in GameStore and dismiss any no-palette prompt.
6. THE Palette SHALL pre-select red (#FF0000) as the active colour when no colour has been explicitly chosen.

### Requirement 10: Paint Feedback and Part Highlighting

**User Story:** As a player, I want visual feedback when I paint a part and a clear highlight on the part I am hovering, so that I know my action registered and which part I am targeting.

#### Acceptance Criteria

1. WHEN the pointer hovers over a paintable PartMesh, THE PartMesh SHALL apply an emissive glow with an intensity brighter than the current 0x666666 value.
2. WHEN the pointer leaves a paintable PartMesh, THE PartMesh SHALL reset the emissive glow to 0x000000.
3. WHEN a paintable PartMesh is clicked with an active colour selected, THE PartMesh SHALL apply a ripple or flash animation effect on the mesh surface for 200-400ms.
4. WHEN a paintable PartMesh is clicked without an active colour selected, THE System SHALL show the no-palette prompt overlay.
5. WHEN the currently selected part changes, THE System SHALL maintain the existing raycasting hit-test behaviour so that the correct part is identified by partName.

### Requirement 11: HUD Animated Score and Gradient Timer

**User Story:** As a player, I want an animated score counter and a timer with visual urgency, so that I can track my progress and feel time pressure.

#### Acceptance Criteria

1. WHEN the score changes, THE HUD SHALL animate the displayed score number from the previous value to the new value over 300-500ms.
2. WHILE the remaining time is greater than 60 seconds, THE HUD SHALL render the timer with a calm colour (white background, dark text).
3. WHILE the remaining time is between 31 and 60 seconds, THE HUD SHALL render the timer with a warning gradient (yellow to orange).
4. WHILE the remaining time is 30 seconds or less, THE HUD SHALL render the timer with an urgent gradient (orange to red) and apply the pulse-timer animation.
5. THE HUD SHALL display target colour hint chips for each mission target part with a label and a check indicator when the part is correctly painted.

### Requirement 12: Confetti Particle Enhancement

**User Story:** As a player, I want a richer and more colourful confetti celebration, so that completing a level feels rewarding.

#### Acceptance Criteria

1. THE Confetti SHALL render at least 80 particles (increased from 40) with varied colours including red, orange, yellow, green, blue, purple, pink, and gold.
2. THE Confetti SHALL apply gravity to particles so that they fall realistically over the animation duration.
3. THE Confetti SHALL apply rotational motion to particles so that they spin while falling.
4. THE Confetti SHALL spawn particles from the top of the canvas and distribute them across the full width.
5. WHEN the CompletionAnimation duration reaches 3000ms, THE System SHALL call the onComplete callback.

### Requirement 13: Premium Results Screen

**User Story:** As a player, I want an attractive results screen with gradient backgrounds, animated entry, and a trophy icon, so that completing a level feels celebratory.

#### Acceptance Criteria

1. WHEN the ResultsOverlay appears, THE System SHALL animate the entry with a fade-in and slide-up over 200-300ms.
2. THE ResultsOverlay SHALL render a gradient background instead of a solid colour overlay.
3. WHEN the challenge is completed successfully, THE ResultsOverlay SHALL display a trophy or award icon.
4. THE ResultsOverlay SHALL render star ratings with a fill animation where each star scales in sequentially.
5. THE ResultsOverlay SHALL display score, accuracy, correct parts, incorrect parts, and time taken in stat cards with consistent styling.
6. THE ResultsOverlay SHALL display a per-part comparison table showing target colour, painted colour, and correct/incorrect status for each part.
7. WHEN the current level is completed and the next level is unlocked, THE ResultsOverlay SHALL display a "Next Level" button that navigates to the next toy.
8. WHEN all levels are completed, THE ResultsOverlay SHALL display a "Game Completed" banner with a celebratory gradient.

### Requirement 14: Game Logic Preservation

**User Story:** As a player, I want the existing game mechanics to remain unchanged, so that the upgrade does not break scoring, levels, or progress.

#### Acceptance Criteria

1. THE System SHALL preserve sequential level unlocking where Level 1 (Car) is always unlocked, Level 2 (Bike) unlocks after completing Level 1 with at least 1 star, and Level 3 (Lorry) unlocks after completing Level 2 with at least 1 star.
2. THE MissionEngine SHALL preserve the score calculation of +10 points for a correct paint and -5 points for an incorrect paint during live painting.
3. THE GameStore SHALL preserve the calculateResults function that computes final accuracy as the percentage of correctly painted parts.
4. THE GameStore SHALL preserve the undoPaint action that reverts the last PaintAction and restores the previous colour.
5. THE GameStore SHALL preserve the resetPainting action that clears all part colours, paint history, score, and session colour usage.
6. THE GameStore SHALL preserve the submitChallenge action that transitions from painting to submitting, calculates results, ends the session, and unlocks the next level if at least 1 star is earned.
7. THE GameStore SHALL preserve the tickTimer action that decrements remaining seconds and triggers timeout at 0 seconds.
8. THE GameStore SHALL preserve the achievement evaluation logic for all five achievements: first-stroke, speed-painter, perfect-painter, colour-explorer, and toy-master.
9. THE GameStore SHALL persist locale, unlocked levels, completed levels, achievements, and session history to localStorage.
10. THE GameStore SHALL preserve the ToyRenderModeContext dual-mode behaviour where paintable mode reads from partColors and target mode reads from MissionData targets.

### Requirement 15: Build and Deployment Compatibility

**User Story:** As a developer, I want the upgraded project to pass the build and deploy without breaking, so that the Vercel deployment continues to work.

#### Acceptance Criteria

1. THE System SHALL pass `npm run build` (tsc + vite build) without TypeScript errors.
2. THE System SHALL use BrowserRouter from react-router-dom v6 without any server-side dependencies.
3. THE System SHALL remain deployable to Vercel without additional configuration changes.
4. THE System SHALL preserve the existing project structure of src/ subdirectories (animations, i18n, missions, painting, scene, store, toys, ui).
5. WHEN rendered on a viewport of 320px width, THE System SHALL not overflow horizontally.
6. THE System SHALL maintain all existing i18n translations for English and Tamil locales.

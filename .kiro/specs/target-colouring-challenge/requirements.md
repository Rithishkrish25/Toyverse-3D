# Requirements Document

## Introduction

This feature redesigns the existing TOYVERSE game from a free-painting sandbox into a Target Image Based 3D Toy Colouring Challenge. The existing gameplay flow — where toys load with their target colours pre-applied and the player paints freely — is replaced entirely with a structured challenge: the player sees a target reference image, paints a neutral 3D toy to match it, and is scored on colour accuracy against a countdown timer.

The redesign reuses the existing React, TypeScript, Three.js, React Three Fiber, and Zustand architecture, existing toy models, and existing infrastructure (routes, dashboard, achievements, i18n). The core changes are: a new start screen phase, neutral default colours for all toy parts, a persistent target image preview, a submit button, per-part result comparison, and removal of automatic mission completion.

## Glossary

- **GameStore**: The Zustand store (src/store/gameStore.ts) that manages all application state including phase, part colours, timer, score, and session history.
- **Phase**: A named state in the challenge lifecycle. Valid values: `start`, `selection`, `painting`, `submitting`, `complete`, `timeout`.
- **Challenge**: A complete painting session for a selected toy, beginning when the timer starts and ending on submit or timer expiry.
- **Start_Screen**: The initial landing view displaying a START GAME button.
- **Selection_Screen**: The toy selection view displaying five selectable toys.
- **Painting_Screen**: The main gameplay view containing the neutral 3D toy, target image preview, palette, timer, and controls.
- **Results_Screen**: The end-of-challenge view showing per-part comparison, score, accuracy, stars, and navigation buttons.
- **Target_Image**: A non-interactive visual reference of the selected toy rendered with all target colours applied. Displayed alongside the paintable 3D toy throughout the painting session.
- **Neutral_Colour**: The unpainted state colour (#CCCCCC light grey) applied to every toy part at challenge start. No toy part displays its target colour before the player paints it.
- **Target_Colour**: The reference colour defined in MissionData for a specific toy part. The player must reproduce this colour on the corresponding part.
- **Painted_Colour**: The colour the player has applied to a specific toy part via the palette.
- **Part_Match**: A toy part whose final Painted_Colour equals its Target_Colour (case-insensitive hex comparison).
- **Colour_Accuracy**: The percentage of toy parts that are Part_Matches, calculated as (Part_Match count / total parts) × 100, rounded to the nearest integer.
- **Score**: A numeric value (0–100) equal to the Colour_Accuracy percentage, used for star rating calculation and session history.
- **Star_Rating**: A 0–3 rating derived from Score: 3 stars for Score ≥ 90, 2 stars for Score ≥ 50, 1 star for Score ≥ 10, 0 stars otherwise.
- **Timer**: The countdown mechanism tracking remaining seconds for the active challenge.
- **Submit_Button**: The control that allows the player to manually end the challenge before the timer expires.
- **Palette**: The set of 12 selectable colours presented to the player for painting toy parts.
- **MissionData**: The data structure (src/missions/missionData.ts) defining target colours and duration for each toy's challenge.
- **PaintAction**: A record of a single paint operation containing partName, previousColour, newColour, and timestamp, used for undo functionality.
- **ToyId**: One of five identifiers: `racing-car`, `robot`, `dinosaur`, `rocket`, `aeroplane`.
- **ToyDefinition**: A manifest defining a toy's id, label, and parts with their names and labels.
- **PartMesh**: The React component that renders an individual paintable toy part and handles hover and click-to-paint interaction.
- **SessionResult**: A persisted record of a completed challenge containing toyId, score, accuracy, stars, timestamp, and achievementsUnlocked.

## Requirements

### Requirement 1: Start Screen Phase

**User Story:** As a player, I want a start screen with a START GAME button, so that the game begins only when I choose to start.

#### Acceptance Criteria

1. WHEN the application loads, THE GameStore SHALL initialise with phase set to `start`.
2. WHILE phase is `start`, THE Start_Screen SHALL display a START GAME button.
3. WHEN the player clicks the START GAME button, THE GameStore SHALL transition phase from `start` to `selection`.
4. WHILE phase is `start`, THE Selection_Screen SHALL remain hidden.
5. WHILE phase is `start`, THE Start_Screen SHALL display navigation links to the Dashboard and Settings screens.
6. WHILE phase is `selection`, THE Start_Screen SHALL remain hidden.

### Requirement 2: Toy Selection

**User Story:** As a player, I want to select from five toys, so that I can begin a colouring challenge for my chosen toy.

#### Acceptance Criteria

1. WHILE phase is `selection`, THE Selection_Screen SHALL display exactly five selectable toys: Racing Car, Robot, Dinosaur, Rocket, and Aeroplane.
2. WHEN the player selects a toy, THE GameStore SHALL store the selected ToyId as activeToyId and transition phase to `painting`.
3. WHEN the player selects a toy, THE GameStore SHALL load the corresponding Mission from MissionData as the active mission.
4. WHILE phase is `selection`, THE Selection_Screen SHALL display a label in the active locale and an icon for each toy.
5. WHILE phase is `selection`, THE Selection_Screen SHALL display navigation links to the Dashboard and Settings screens.

### Requirement 3: Target Image Display

**User Story:** As a player, I want to see a colourful reference target image of the selected toy, so that I know what colours to reproduce on my 3D toy.

#### Acceptance Criteria

1. WHEN the Painting_Screen mounts for a selected toy, THE Painting_Screen SHALL render a Target_Image of the selected toy with all Target_Colours applied.
2. THE Target_Image SHALL be a non-interactive 3D render of the selected toy model with each part coloured according to its Target_Colour from MissionData.
3. WHILE phase is `painting`, THE Target_Image SHALL remain visible simultaneously with the paintable 3D toy such that both are observable on screen at the same time.
4. THE Target_Image SHALL not respond to pointer events or painting interactions.
5. THE Target_Image SHALL display each part using the Target_Colour from the MissionTarget whose partName matches that part, as defined in MissionData for the selected toy.
6. WHEN the player paints a part on the paintable 3D toy, THE Target_Image SHALL remain unchanged.
7. WHEN phase transitions from `painting` to `complete` or `timeout`, THE Painting_Screen SHALL stop displaying the Target_Image.

### Requirement 4: Neutral 3D Toy Display

**User Story:** As a player, I want my 3D toy to start with neutral colours, so that I can paint each part myself to match the target.

#### Acceptance Criteria

1. WHEN the Painting_Screen mounts for a selected toy, THE GameStore SHALL initialise the partColors record as empty so that all toy parts render the Neutral_Colour (#CCCCCC).
2. THE GameStore SHALL store part colours as a Record mapping partName to Painted_Colour, starting empty so that PartMesh falls back to the Neutral_Colour.
3. WHEN a new challenge begins, THE GameStore SHALL clear the partColors record so no Painted_Colour persists from a previous challenge.
4. IF a part has no entry in the partColors record, THEN THE PartMesh component SHALL display the Neutral_Colour (#CCCCCC).
5. THE ToyDefinition defaultColor for every part in every toy model SHALL be set to the Neutral_Colour (#CCCCCC).
6. THE PartMesh defaultColor prop for every PartMesh instance in every toy model file SHALL be set to the Neutral_Colour (#CCCCCC).
7. WHEN the player clicks a single 3D toy part, THE GameStore SHALL apply the active colour to only that part, leaving all other parts' colours unchanged.
8. WHEN a new challenge begins, THE paintable 3D toy SHALL not display any Target_Colour on any part.

### Requirement 5: Painting Gameplay

**User Story:** As a player, I want to select colours from a palette and click 3D toy parts to paint them, so that I can reproduce the target image's colour pattern.

#### Acceptance Criteria

1. WHILE phase is `painting`, THE Painting_Screen SHALL display the Palette with exactly 12 colours: red (#FF0000), orange (#FF8000), yellow (#FFFF00), green (#00AA00), teal (#008080), blue (#0000FF), purple (#8000FF), pink (#FF69B4), brown (#8B4513), white (#FFFFFF), grey (#808080), and black (#000000).
2. WHEN the Painting_Screen mounts, THE Palette SHALL pre-select red (#FF0000) as the active colour.
3. WHEN the player clicks a colour swatch in the Palette, THE GameStore SHALL set that colour as the active colour.
4. WHEN the player clicks a 3D toy part and an active colour is selected, THE GameStore SHALL apply the active colour to that part by recording a PaintAction and updating the partColors record.
5. WHEN the player clicks a 3D toy part and no active colour is selected, THE GameStore SHALL display a "no colour selected" prompt.
6. WHEN a part is painted, THE PartMesh SHALL update the material colour of that part to reflect the Painted_Colour immediately.
7. WHEN the player hovers over a 3D toy part, THE PartMesh SHALL display an emissive glow on that part.
8. WHEN the player's pointer leaves a 3D toy part, THE PartMesh SHALL remove the emissive glow from that part.
9. WHILE phase is `painting`, THE Palette SHALL display a visual indicator on the currently active colour swatch.
10. WHEN the player paints a part, THE GameStore SHALL record the Painted_Colour, the previous colour, the part name, and a timestamp in the PaintAction history.

### Requirement 6: Undo and Reset Controls

**User Story:** As a player, I want undo and reset controls, so that I can correct mistakes while painting.

#### Acceptance Criteria

1. WHILE phase is `painting`, THE Painting_Screen SHALL display an Undo button and a Reset button.
2. WHEN the player clicks the Undo button and the PaintAction history is non-empty, THE GameStore SHALL revert the most recent PaintAction by restoring the previous colour to the affected part and removing the action from history.
3. WHEN the PaintAction history is empty, THE Undo button SHALL be disabled.
4. WHEN the player clicks the Reset button, THE Painting_Screen SHALL display a confirmation dialog.
5. WHEN the player confirms the reset, THE GameStore SHALL clear the partColors record and the PaintAction history, returning all parts to the Neutral_Colour.
6. WHEN the player cancels the reset confirmation, THE GameStore SHALL not modify any part colours or history.

### Requirement 7: Countdown Timer

**User Story:** As a player, I want a countdown timer with warnings and pause behaviour, so that I know how much time remains and the challenge ends automatically when time runs out.

#### Acceptance Criteria

1. WHEN the painting challenge begins, THE GameStore SHALL set remainingSeconds to the custom timer duration from Settings if one is configured, otherwise to the default mission duration from MissionData.
2. WHEN the painting challenge begins, THE GameStore SHALL set timerRunning to true.
3. THE default mission duration SHALL be 120 seconds.
4. WHILE phase is `painting` and timerRunning is true, THE GameStore SHALL decrement remainingSeconds by 1 every second via the tickTimer action.
5. WHILE phase is `painting`, THE Painting_Screen SHALL display the remaining time in MM:SS format.
6. WHILE remainingSeconds is less than 30 and phase is `painting`, THE Timer display SHALL show a visual warning state.
7. WHEN the browser tab loses focus (window blur event) during phase `painting`, THE GameStore SHALL set timerRunning to false.
8. WHEN the browser tab regains focus (window focus event) during phase `painting`, THE GameStore SHALL set timerRunning to true.
9. WHEN remainingSeconds reaches zero during phase `painting`, THE GameStore SHALL set timerRunning to false, set phase to `timeout`, and trigger the results calculation.
10. WHEN remainingSeconds reaches zero, THE GameStore SHALL call the endSession action to persist the session result.
11. THE Settings screen SHALL allow the player to configure a custom timer duration between 30 and 600 seconds, stored in localStorage.
12. WHEN a custom timer duration is configured in Settings, THE GameStore SHALL use that duration as the challenge duration instead of the default 120 seconds.

### Requirement 8: Submit Button

**User Story:** As a player, I want a submit button, so that I can end the challenge manually before the timer expires.

#### Acceptance Criteria

1. WHILE phase is `painting`, THE Painting_Screen SHALL display a clearly visible Submit button.
2. WHEN the player clicks the Submit button, THE GameStore SHALL set timerRunning to false immediately.
3. WHEN the player clicks the Submit button, THE GameStore SHALL transition phase from `painting` to `submitting`.
4. WHEN phase is `submitting`, THE GameStore SHALL calculate the challenge results by comparing each painted part against its Target_Colour.
5. WHEN phase is `submitting`, THE GameStore SHALL call the endSession action to persist the session result.
6. WHEN phase transitions to `submitting`, THE Submit button SHALL become disabled to prevent multiple submissions.
7. WHEN phase is `submitting`, `complete`, or `timeout`, THE Submit button SHALL be disabled and not accept further clicks.
8. THE Submit button SHALL remain visible during phase `painting` and `submitting`, and hidden during phase `start`, `selection`, `complete`, and `timeout`.
9. AFTER the GameStore calculates results and calls endSession during phase `submitting`, THE GameStore SHALL transition phase from `submitting` to `complete`.

### Requirement 9: Timer Expiry Auto-End

**User Story:** As a player, I want the challenge to end automatically when the timer reaches zero, so that the results are calculated even if I do not submit manually.

#### Acceptance Criteria

1. WHEN remainingSeconds reaches zero, THE GameStore SHALL transition phase to `timeout`.
2. WHEN phase transitions from `painting` to `timeout`, THE GameStore SHALL set timerRunning to false.
3. WHEN phase transitions from `painting` to `timeout`, THE GameStore SHALL calculate the challenge results by comparing each painted part against its Target_Colour.
4. WHEN phase transitions from `painting` to `timeout`, THE GameStore SHALL call the endSession action to persist the session result.
5. WHEN phase transitions from `painting` to `timeout`, THE Painting_Screen SHALL display the Results_Screen.

### Requirement 10: Colour Accuracy and Score Calculation

**User Story:** As a player, I want my painting to be scored on colour accuracy, so that I can see how well I matched the target image.

#### Acceptance Criteria

1. WHEN the challenge ends (by submit or timer expiry), THE GameStore SHALL compare each toy part's Painted_Colour against its Target_Colour from the active mission using case-insensitive hex string comparison.
2. WHEN a part has no Painted_Colour in the partColors record, THE GameStore SHALL treat that part's colour as the Neutral_Colour (#CCCCCC) for comparison.
3. THE GameStore SHALL count a part as a Part_Match when the part's Painted_Colour equals the Target_Colour (case-insensitive).
4. THE GameStore SHALL calculate Colour_Accuracy as (Part_Match count / total number of parts for the active toy) × 100, rounded to the nearest integer.
5. WHEN the active toy has zero parts, THE GameStore SHALL define Colour_Accuracy as 0 as a safe default for that degenerate case.
6. THE GameStore SHALL set Score equal to the Colour_Accuracy value.
7. THE GameStore SHALL calculate the Star_Rating from Score: 3 stars for Score ≥ 90, 2 stars for Score ≥ 50, 1 star for Score ≥ 10, 0 stars otherwise.
8. THE GameStore SHALL calculate time taken as (configured challenge duration − remainingSeconds).
9. THE GameStore SHALL store the Part_Match count as correctParts and the non-matching count as incorrectParts in the session result.
10. WHEN the challenge ends, THE GameStore SHALL evaluate and unlock achievements against a state snapshot containing the final Score, Colour_Accuracy, session history, colours used this session, and remaining time.

### Requirement 11: Results Screen Display

**User Story:** As a player, I want a results screen showing my score and per-part comparison, so that I can understand how I performed.

#### Acceptance Criteria

1. WHEN phase is `complete` or `timeout`, THE Painting_Screen SHALL display the Results_Screen as an overlay.
2. THE Results_Screen SHALL display the Score as a numeric value.
3. THE Results_Screen SHALL display the Colour_Accuracy as a percentage.
4. THE Results_Screen SHALL display the correct parts count.
5. THE Results_Screen SHALL display the incorrect parts count.
6. THE Results_Screen SHALL display the time taken in seconds.
7. THE Results_Screen SHALL display the Star_Rating using the StarRating component.
8. THE Results_Screen SHALL display a per-part comparison listing each part name, its Target_Colour swatch, its Painted_Colour swatch, and a correct or incorrect indicator.
9. THE Results_Screen SHALL display the completed toy with all Painted_Colours applied.
10. THE Results_Screen SHALL display a PLAY AGAIN button.
11. THE Results_Screen SHALL display a HOME button.
12. WHEN the player clicks the PLAY AGAIN button, THE GameStore SHALL reset the challenge for the same toy by clearing part colours, resetting the timer, and transitioning phase to `painting`.
13. WHEN the player clicks the HOME button, THE Application SHALL navigate to the Start_Screen and set phase to `start`.

### Requirement 12: Challenge State Reset

**User Story:** As a developer, I want the challenge state to reset cleanly between sessions, so that no painted colours or scores leak between challenges.

#### Acceptance Criteria

1. WHEN a new challenge begins, THE GameStore SHALL clear the partColors record to an empty object.
2. WHEN a new challenge begins, THE GameStore SHALL clear the PaintAction history to an empty array.
3. WHEN a new challenge begins, THE GameStore SHALL reset Score to zero.
4. WHEN a new challenge begins, THE GameStore SHALL reset correctParts to zero and incorrectParts to zero.
5. WHEN a new challenge begins, THE GameStore SHALL reset the colours used this session to an empty array.
6. WHEN a new challenge begins, THE GameStore SHALL set remainingSeconds to the mission duration.
7. WHEN a new challenge begins, THE GameStore SHALL set timerRunning to true.
8. WHEN a new challenge begins, THE GameStore SHALL set phase to `painting`.

### Requirement 13: Target Data Separation

**User Story:** As a developer, I want target colour data to remain separate from player-painted colours, so that the reference configuration is never accidentally modified by gameplay.

#### Acceptance Criteria

1. THE MissionData SHALL store Target_Colours in a read-only data structure separate from the GameStore partColors record.
2. THE GameStore SHALL never write Target_Colour values into the partColors record as a result of painting actions.
3. THE Target_Image render SHALL read Target_Colours exclusively from MissionData, not from the GameStore partColors record.
4. THE paintable 3D toy render SHALL read colours exclusively from the GameStore partColors record (with Neutral_Colour fallback), not from MissionData.
5. WHEN the player paints a part, THE GameStore SHALL update only the partColors record and SHALL not modify MissionData.

### Requirement 14: Removal of Automatic Mission Completion

**User Story:** As a developer, I want the challenge to end only on submit or timer expiry, so that the player controls when their painting is evaluated.

#### Acceptance Criteria

1. WHEN the player paints a part and all parts match their Target_Colours, THE GameStore SHALL not automatically transition phase to `complete`.
2. THE GameStore paintPart action SHALL not check for mission completion or transition phase based on target matches.
3. THE challenge SHALL end only when the player clicks the Submit button or when the Timer reaches zero.
4. THE MissionEngine evaluatePaint function SHALL not trigger phase transitions.

### Requirement 15: Preserve Dashboard and Achievements

**User Story:** As a player, I want my session history and achievements to persist, so that I can track my progress across challenges.

#### Acceptance Criteria

1. WHEN a challenge ends, THE GameStore SHALL create a SessionResult with toyId, Score, Colour_Accuracy, Star_Rating, timestamp, and achievementsUnlocked.
2. THE GameStore SHALL append the SessionResult to the session history and persist it to localStorage under the key `toyverse_sessions`.
3. WHEN the persisted session history is non-empty, THE Dashboard screen SHALL display total stars, session count, total score, and best accuracy as positive values derived from the stored sessions.
4. THE Dashboard screen SHALL display the achievement gallery with locked and unlocked states.
5. THE GameStore SHALL evaluate achievement conditions using the existing achievement definitions: first-stroke, speed-painter, perfect-painter, colour-explorer, and toy-master.
6. WHEN an achievement is unlocked, THE GameStore SHALL display an AchievementToast for 3 seconds.
7. THE GameStore SHALL persist unlocked achievements to localStorage under the key `toyverse_achievements`.

### Requirement 16: Preserve Routes and Language Settings

**User Story:** As a player, I want navigation routes and language settings to continue working, so that I can access all parts of the application in my preferred language.

#### Acceptance Criteria

1. THE Application SHALL maintain the existing routes: `/` (Home), `/paint/:toyId` (Painting), `/dashboard` (Dashboard), `/settings` (Settings).
2. THE Application SHALL redirect unknown routes to Home with a "page not found" message.
3. THE GameStore SHALL support two locales: `en` (English) and `ta` (Tamil).
4. THE GameStore SHALL persist the selected locale to localStorage under the key `toyverse_locale`.
5. THE i18n module SHALL provide translations for all new UI strings in both English and Tamil locales, including: START GAME, SUBMIT, results screen labels (score, accuracy, correct parts, incorrect parts, time taken, stars), PLAY AGAIN, and HOME.
6. WHEN a translation key is missing from the active locale, THE i18n module SHALL fall back to the English translation and log a console warning.
7. THE Settings screen SHALL allow the player to toggle between English and Tamil.
8. THE Application SHALL render all UI text in the active locale.

### Requirement 17: Responsive Layout

**User Story:** As a player, I want the game to work on different screen sizes, so that I can play on desktop and mobile devices.

#### Acceptance Criteria

1. THE Painting_Screen SHALL display the Target_Image and the paintable 3D toy side by side on wide screens.
2. WHEN the viewport width is below 768px (tablet breakpoint), THE Painting_Screen SHALL stack the Target_Image above the paintable 3D toy.
3. THE Palette SHALL be positioned at the bottom of the Painting_Screen and SHALL not overlap the central 3D canvas area.
4. THE Palette swatches SHALL each be a minimum of 44 × 44 pixels for touch accessibility.
5. THE HUD, Palette, Undo/Reset bar, and Submit button SHALL be positioned to avoid overlapping each other.
6. THE Results_Screen overlay SHALL centre its content and remain scrollable on small screens.

### Requirement 18: Target Colour Configuration

**User Story:** As a developer, I want each toy to have a defined and consistent target colour configuration, so that target images and 3D models correspond to the same colour scheme.

#### Acceptance Criteria

1. THE MissionData SHALL define a Target_Colour for every part of every toy.
2. THE Racing Car target configuration SHALL be: body #FF0000, cabin #FFFFFF, wheel-fl #000000, wheel-fr #000000, wheel-rl #000000, wheel-rr #000000.
3. THE Robot target configuration SHALL be: head #FFFF00, torso #0000FF, arm-left #808080, arm-right #808080, leg-left #000000, leg-right #000000.
4. THE Dinosaur target configuration SHALL be: body #00AA00, head #00AA00, tail #FF8000, leg-fl #8B4513, leg-fr #8B4513, leg-rl #8B4513, leg-rr #8B4513.
5. THE Rocket target configuration SHALL be: fuselage #FFFFFF, nose #FF0000, fin-left #FF0000, fin-right #FF0000, engine #808080, window #008080.
6. THE Aeroplane target configuration SHALL be: fuselage #FFFFFF, wing-left #FF0000, wing-right #FF0000, tail-fin #0000FF, engine #808080, cockpit #008080.
7. THE Target_Image SHALL render the same 3D toy model as the paintable 3D toy, with each part coloured according to the target configuration.
8. THE number of MissionData targets for each toy SHALL equal the number of parts in the corresponding ToyDefinition.

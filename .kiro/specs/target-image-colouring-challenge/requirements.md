# Requirements Document

## Introduction

This specification redesigns the existing TOYVERSE game from its current free-painting mission model into a Target Image Based 3D Toy Colouring Challenge. The new gameplay flow replaces the current approach with a structured experience: a start screen, toy selection, a target image reference displayed alongside an unpainted 3D toy, timed painting gameplay with a submit button, and a results screen that compares each painted part against the target configuration. The existing React, TypeScript, Three.js, React Three Fiber, and Zustand architecture, toy models, dashboard, achievements, and language settings are preserved.

## Glossary

- **Toyverse**: The 3D toy colouring challenge application.
- **Start_Screen**: The initial landing screen displaying a START GAME button that gates entry into gameplay.
- **Toy_Selection_Screen**: The screen presenting five selectable toys.
- **Challenge_Screen**: The main painting screen showing the Target_Image, the Playable_Toy, the Colour_Palette, the Countdown_Timer, and the Submit_Button.
- **Results_Screen**: The screen displayed after a challenge ends, showing the player's performance metrics.
- **Target_Image**: A colourful reference image of a toy rendered with that toy's Target_Colour_Configuration, shown to the player as the goal to reproduce.
- **Target_Colour_Configuration**: The fixed mapping of each Toy_Part name to its expected Target_Colour for a given toy.
- **Playable_Toy**: The 3D model displayed beside the Target_Image that the player paints during the challenge.
- **Toy_Part**: An individual, independently paintable mesh within a Playable_Toy model.
- **Target_Colour**: The expected hex colour value for a specific Toy_Part as defined in the Target_Colour_Configuration.
- **Player_Colour**: The hex colour value applied by the player to a specific Toy_Part during painting.
- **Neutral_Colour**: The initial colour applied to every Toy_Part before the player begins painting, set to light grey (#CCCCCC).
- **Colour_Palette**: The set of twelve selectable colour swatches available to the player for painting.
- **Paint_Action**: A single application of a Colour_Palette colour to a Toy_Part.
- **Countdown_Timer**: The decreasing timer that limits the challenge duration, displayed in MM:SS format.
- **Challenge_Duration**: The total time in seconds allocated for a painting challenge; the default is 120 seconds.
- **Time_Taken**: The elapsed time from challenge start to challenge end, calculated as Challenge_Duration minus remaining seconds.
- **Colour_Accuracy**: The percentage of Toy_Parts whose Player_Colour matches their Target_Colour, calculated as (Correct_Parts / Total_Parts) × 100.
- **Correct_Parts**: The count of Toy_Parts whose Player_Colour matches their Target_Colour at challenge end.
- **Incorrect_Parts**: The count of Toy_Parts whose Player_Colour does not match their Target_Colour at challenge end.
- **Score**: A numeric performance value based on Colour_Accuracy and time remaining at challenge end.
- **Star_Rating**: A 0 to 3 star assessment derived from Colour_Accuracy thresholds.
- **Submit_Button**: A button on the Challenge_Screen that allows the player to manually end the challenge before the Countdown_Timer expires.
- **Dashboard**: The existing screen displaying session history, total stars, and achievement gallery.
- **Achievements**: The existing system tracking player accomplishments across sessions.
- **Locale**: The active language setting, either English (en) or Tamil (ta).

## Requirements

### Requirement 1: Start Screen

**User Story:** As a player, I want a start screen with a clear START GAME button, so that I can control when the game begins.

#### Acceptance Criteria

1. THE Toyverse SHALL display a Start_Screen with a START GAME button.
2. THE Toyverse SHALL NOT begin a challenge until the player clicks the START GAME button.
3. WHEN the player clicks the START GAME button, THE Toyverse SHALL transition from the Start_Screen to the Toy_Selection_Screen.

### Requirement 2: Toy Selection Screen

**User Story:** As a player, I want to select from five toys, so that I can choose which toy to paint in the colouring challenge.

#### Acceptance Criteria

1. THE Toy_Selection_Screen SHALL display exactly five selectable toys: Racing Car, Robot, Dinosaur, Rocket, and Aeroplane.
2. WHEN the player selects a toy, THE Toyverse SHALL open the Challenge_Screen for the selected toy.
3. THE Toy_Selection_Screen SHALL display a label for each toy in the active Locale.

### Requirement 3: Target Image Display

**User Story:** As a player, I want to see a colourful reference image of the toy I need to reproduce, so that I know what colours to paint each part.

#### Acceptance Criteria

1. WHEN the Challenge_Screen loads for a selected toy, THE Toyverse SHALL display the Target_Image showing the selected toy rendered with its Target_Colour_Configuration.
2. WHILE the challenge is in progress, THE Toyverse SHALL keep the Target_Image visible on the Challenge_Screen.
3. THE Toyverse SHALL use a consistent Target_Colour_Configuration for each toy across all challenge sessions.
4. THE Target_Image SHALL depict the same toy model and the same Target_Colour_Configuration as the Playable_Toy on the Challenge_Screen.

### Requirement 4: Unpainted 3D Toy Initialisation

**User Story:** As a player, I want to see the 3D toy in neutral colours beside the target image, so that I can paint each part to match the target.

#### Acceptance Criteria

1. WHEN the Challenge_Screen loads, THE Toyverse SHALL display the Playable_Toy beside the Target_Image.
2. WHEN a new challenge begins, THE Toyverse SHALL set every Toy_Part to the Neutral_Colour (#CCCCCC).
3. THE Toyverse SHALL NOT pre-apply any Target_Colour to any Toy_Part on the Playable_Toy.
4. THE Toyverse SHALL make every Toy_Part independently paintable via a separate pointer interaction.
5. WHEN a new challenge begins, THE Toyverse SHALL clear all previously applied Player_Colours and Paint_Actions.

### Requirement 5: Painting Gameplay

**User Story:** As a player, I want to select colours from a palette and click toy parts to paint them, so that I can reproduce the target image's colour pattern.

#### Acceptance Criteria

1. THE Challenge_Screen SHALL display the Colour_Palette with twelve selectable colour swatches.
2. WHEN the player selects a colour from the Colour_Palette, THE Toyverse SHALL set the colour as the active painting colour.
3. WHEN the player clicks a Toy_Part with an active colour selected, THE Toyverse SHALL apply the active colour to that Toy_Part.
4. WHEN a Toy_Part is painted, THE Toyverse SHALL display visual feedback indicating the colour change on that Toy_Part.
5. IF the player clicks a Toy_Part without a colour selected, THE Toyverse SHALL display a prompt instructing the player to select a colour.
6. THE Toyverse SHALL render every Toy_Part surface with sufficient lighting to make painted colours clearly visible.

### Requirement 6: Undo and Reset Controls

**User Story:** As a player, I want to undo my last paint action and reset all colours, so that I can correct mistakes during the challenge.

#### Acceptance Criteria

1. THE Challenge_Screen SHALL display an Undo control.
2. WHEN the player clicks the Undo control, THE Toyverse SHALL revert the most recent Paint_Action by restoring the previous colour on the affected Toy_Part.
3. IF no Paint_Actions exist, THE Toyverse SHALL disable the Undo control.
4. THE Challenge_Screen SHALL display a Reset control.
5. WHEN the player clicks the Reset control, THE Toyverse SHALL display a confirmation dialog before clearing all applied colours.
6. WHEN the player confirms the reset, THE Toyverse SHALL set all Toy_Parts back to the Neutral_Colour and clear all Paint_Actions.

### Requirement 7: Countdown Timer

**User Story:** As a player, I want a countdown timer that shows remaining time and warns me when time is low, so that I can manage my painting pace.

#### Acceptance Criteria

1. THE Toyverse SHALL set the default Challenge_Duration to 120 seconds.
2. WHEN the painting challenge begins, THE Toyverse SHALL start the Countdown_Timer.
3. THE Toyverse SHALL display the Countdown_Timer in MM:SS format on the Challenge_Screen.
4. WHILE the Countdown_Timer has 30 seconds or fewer remaining, THE Toyverse SHALL display a visual time warning.
5. WHEN the browser tab loses focus or the challenge is paused, THE Toyverse SHALL pause the Countdown_Timer.
6. WHEN the browser tab regains focus or the challenge is resumed, THE Toyverse SHALL resume the Countdown_Timer from the paused value.
7. WHEN the Countdown_Timer reaches zero seconds, THE Toyverse SHALL automatically end the challenge and calculate the result.

### Requirement 8: Submit Button

**User Story:** As a player, I want to submit my painting before the timer expires, so that I can finish the challenge when I am satisfied with my work.

#### Acceptance Criteria

1. THE Challenge_Screen SHALL display a Submit_Button that is clearly visible throughout the challenge.
2. WHEN the player clicks the Submit_Button, THE Toyverse SHALL end the challenge and calculate the result.
3. WHEN the player clicks the Submit_Button, THE Toyverse SHALL stop the Countdown_Timer immediately.
4. THE Toyverse SHALL prevent multiple submissions; after the first submission, the Submit_Button SHALL be disabled.

### Requirement 9: Results Calculation and Display

**User Story:** As a player, I want to see my painting results with accuracy, score, and star rating, so that I know how well I matched the target image.

#### Acceptance Criteria

1. WHEN the challenge ends, THE Toyverse SHALL compare each Toy_Part's Player_Colour against its Target_Colour from the Target_Colour_Configuration.
2. THE Toyverse SHALL calculate Colour_Accuracy as (Correct_Parts / total Toy_Parts) × 100, rounded to the nearest integer percentage.
3. THE Toyverse SHALL calculate Correct_Parts as the count of Toy_Parts whose Player_Colour matches their Target_Colour.
4. THE Toyverse SHALL calculate Incorrect_Parts as the count of Toy_Parts whose Player_Colour does not match their Target_Colour.
5. THE Toyverse SHALL calculate Time_Taken as Challenge_Duration minus remaining Countdown_Timer seconds.
6. THE Toyverse SHALL calculate Score as a numeric value based on Colour_Accuracy and remaining time.
7. THE Toyverse SHALL calculate Star_Rating from Colour_Accuracy using defined thresholds.
8. THE Results_Screen SHALL display the Score, Correct_Parts count, Incorrect_Parts count, Colour_Accuracy percentage, Time_Taken, and Star_Rating.
9. THE Results_Screen SHALL display the completed Playable_Toy with all applied Player_Colours.
10. THE Results_Screen SHALL display a PLAY AGAIN button.
11. THE Results_Screen SHALL display a HOME button.
12. WHEN the player clicks the PLAY AGAIN button, THE Toyverse SHALL start a new challenge for the same toy with all Toy_Parts reset to Neutral_Colour.
13. WHEN the player clicks the HOME button, THE Toyverse SHALL navigate to the Start_Screen.

### Requirement 10: Architecture and Compatibility

**User Story:** As a developer, I want the redesign to reuse existing architecture and preserve existing features, so that the codebase stays maintainable and no functionality breaks.

#### Acceptance Criteria

1. THE Toyverse SHALL reuse the existing React, TypeScript, Three.js, React Three Fiber, and Zustand technology stack.
2. THE Toyverse SHALL reuse existing toy model components (RacingCar, Robot, Dinosaur, Rocket, Aeroplane) and their PartMesh infrastructure.
3. THE Toyverse SHALL store Target_Colour_Configuration data separate from Player_Colour data in the application state.
4. THE Toyverse SHALL maintain a responsive layout that adapts to different screen sizes across the Start_Screen, Toy_Selection_Screen, Challenge_Screen, and Results_Screen.
5. THE Toyverse SHALL preserve existing routes for the Dashboard and Settings screens.
6. THE Toyverse SHALL preserve the existing Dashboard functionality including session history display and achievement gallery.
7. THE Toyverse SHALL preserve the existing Achievements system and its evaluation logic.
8. THE Toyverse SHALL preserve the existing Locale switching functionality between English and Tamil.
9. THE Toyverse SHALL persist session results to localStorage on challenge completion.

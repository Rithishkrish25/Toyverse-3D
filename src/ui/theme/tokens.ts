/** Colour palette tokens (Requirement 1.2) */
export const COLORS = {
  primary: '#FF6B35',
  secondary: '#4a90d9',
  success: '#4CAF50',
  danger: '#F44336',
  neutral: {
    cream: '#FFF7E8',
    sand: '#E8DDCA',
    dark: '#2D2D2D',
  },
  gold: '#FFD700',
  sceneBg: '#1a1a2e',
} as const;

/** Spacing scale in px (Requirement 1.3) */
export const SPACING = [4, 8, 12, 16, 24, 32] as const;

/** Font weights (Requirement 1.4) */
export const FONT_WEIGHTS = {
  body: 400,
  label: 600,
  emphasis: 700,
  heading: 800,
  hero: 900,
} as const;

/** Font stacks (Requirement 1.1) */
export const FONT_STACKS = {
  heading: "'Noto Sans Tamil', system-ui, -apple-system, sans-serif",
  body: "'Noto Sans Tamil', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  mono: "'SF Mono', 'Cascadia Code', 'Courier New', monospace",
} as const;

/** Border radius (Requirement 2.5) */
export const RADIUS = { small: 8, panel: 12, large: 16 } as const;

/** Box shadow elevation levels (Requirement 2.6) */
export const SHADOWS = {
  level1: '0 1px 6px rgba(0,0,0,0.05)',
  level2: '0 2px 8px rgba(0,0,0,0.08)',
  level3: '0 4px 20px rgba(0,0,0,0.12)',
} as const;

/** Transition durations (Requirement 2.1-2.4) */
export const TRANSITIONS = {
  hover: '150ms',
  press: '100ms',
  overlay: '300ms',
  route: '200ms',
} as const;

/** Generates a CSS :root block string for injection into index.css */
export const CSS_VARIABLES = `
:root {
  --color-primary: ${COLORS.primary};
  --color-secondary: ${COLORS.secondary};
  --color-success: ${COLORS.success};
  --color-danger: ${COLORS.danger};
  --color-cream: ${COLORS.neutral.cream};
  --color-sand: ${COLORS.neutral.sand};
  --color-dark: ${COLORS.neutral.dark};
  --color-gold: ${COLORS.gold};
  --radius-small: ${RADIUS.small}px;
  --radius-panel: ${RADIUS.panel}px;
  --radius-large: ${RADIUS.large}px;
  --shadow-1: ${SHADOWS.level1};
  --shadow-2: ${SHADOWS.level2};
  --shadow-3: ${SHADOWS.level3};
  --font-heading: ${FONT_STACKS.heading};
  --font-body: ${FONT_STACKS.body};
  --font-mono: ${FONT_STACKS.mono};
}
` as const;

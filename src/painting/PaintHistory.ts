import type { PaintAction } from '../store/types';

/**
 * PaintHistory stack state — a pure data structure used by the GameStore
 * to track paint actions for undo functionality.
 */
export interface PaintHistoryState {
  stack: PaintAction[];
}

/**
 * Creates a new empty PaintHistory stack state.
 * @returns An empty PaintHistoryState instance.
 */
export function createPaintHistory(): PaintHistoryState {
  return { stack: [] };
}

/**
 * Push a PaintAction onto the history stack.
 * @param state - The current PaintHistoryState.
 * @param action - The PaintAction to record.
 * @returns A new PaintHistoryState with the action pushed.
 */
export function pushPaintAction(
  state: PaintHistoryState,
  action: PaintAction
): PaintHistoryState {
  return { stack: [...state.stack, action] };
}

/**
 * Pop the most recent PaintAction from the stack.
 * @param state - The current PaintHistoryState.
 * @returns An object with the popped action (if any) and the new state.
 */
export function popPaintAction(
  state: PaintHistoryState
): { action: PaintAction | undefined; state: PaintHistoryState } {
  if (state.stack.length === 0) {
    return { action: undefined, state };
  }
  const action = state.stack[state.stack.length - 1];
  return {
    action,
    state: { stack: state.stack.slice(0, -1) },
  };
}

/**
 * Clear all entries from the PaintHistory stack.
 * @param state - The current PaintHistoryState.
 * @returns A new PaintHistoryState with an empty stack.
 */
export function clearPaintHistory(): PaintHistoryState {
  return { stack: [] };
}

/**
 * Check if the PaintHistory stack is empty.
 * @param state - The current PaintHistoryState.
 * @returns True if the stack has no entries.
 */
export function isPaintHistoryEmpty(state: PaintHistoryState): boolean {
  return state.stack.length === 0;
}

/**
 * Get the number of entries in the PaintHistory stack.
 * @param state - The current PaintHistoryState.
 * @returns The stack length.
 */
export function getPaintHistoryLength(state: PaintHistoryState): number {
  return state.stack.length;
}

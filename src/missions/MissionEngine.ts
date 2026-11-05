import type { Mission, MissionTarget } from '../store/types';

export interface MissionEvalResult {
  isTargetHit: boolean;
  isComplete: boolean;
  scoreDelta: number;
}

/**
 * Evaluate a single paint action against the active mission.
 *
 * @param mission - The active mission, or null if none.
 * @param partName - The part that was just painted.
 * @param paintedColor - The colour applied to the part.
 * @param partColors - The full map of current part colours (after applying this paint).
 * @returns Evaluation result with hit/complete flags and score delta.
 */
export function evaluatePaint(
  mission: Mission | null,
  partName: string,
  paintedColor: string,
  partColors: Record<string, string>
): MissionEvalResult {
  if (!mission) {
    return { isTargetHit: false, isComplete: false, scoreDelta: 0 };
  }

  const target: MissionTarget | undefined = mission.targets.find(
    (t) => t.partName === partName
  );

  if (!target) {
    // Painted a part that isn't a mission target — no score effect
    return { isTargetHit: false, isComplete: false, scoreDelta: 0 };
  }

  const isTargetHit =
    paintedColor.toUpperCase() === target.targetColor.toUpperCase();

  const scoreDelta = isTargetHit ? 10 : -5;

  // isComplete: every mission target now has its target colour
  const isComplete = mission.targets.every((t) => {
    const current = partColors[t.partName] ?? '#FFFFFF';
    return current.toUpperCase() === t.targetColor.toUpperCase();
  });

  return { isTargetHit, isComplete, scoreDelta };
}

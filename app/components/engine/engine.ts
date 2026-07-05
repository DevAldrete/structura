import type { StEvent } from '~/components/engine/event';
import type { Position } from '~/components/models/position';

export interface Step {
  array: number[];
  compare: [number, number] | null;
  swapping: [number, number] | null;
}

export function collectSteps(arr: number[], algo: () => Generator<StEvent>): Step[] {
  const a = [...arr];
  const gen = algo();
  const steps: Step[] = [{ array: [...a], compare: null, swapping: null }];

  for (const event of gen) {
    if (event.action === 'compare') {
      steps.push({ array: [...a], compare: event.ids, swapping: null });
    } else if (event.action === 'swap') {
      [a[event.ids[0]], a[event.ids[1]]] = [a[event.ids[1]], a[event.ids[0]]];
      steps.push({ array: [...a], compare: null, swapping: event.ids });
    }
  }

  steps.push({ array: [...a], compare: null, swapping: null });
  return steps;
}

export function getNodePositions(
  arr: number[],
  canvasWidth: number,
  canvasHeight: number,
): Map<number, Position> {
  const positions = new Map<number, Position>();
  const gap = Math.min(60, (canvasWidth - 40) / arr.length);
  const startX = (canvasWidth - gap * (arr.length - 1)) / 2;
  arr.forEach((_, i) => {
    positions.set(i, { x: startX + gap * i, y: canvasHeight / 2 });
  });
  return positions;
}

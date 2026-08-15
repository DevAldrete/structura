import type { StEvent } from '~/components/engine/event';

export interface Step {
  array: number[];
  compare: [number, number] | null;
  swapping: [number, number] | null;
  written: { index: number; value: number } | null;
}

export type SortingAlgo = (arr: number[]) => Generator<StEvent>;

export function collectSteps(arr: number[], algo: SortingAlgo): Step[] {
  const a = [...arr];
  const gen = algo(a);
  const steps: Step[] = [{ array: [...a], compare: null, swapping: null, written: null }];

  for (const event of gen) {
    if (event.action === 'compare') {
      steps.push({ array: [...a], compare: event.ids, swapping: null, written: null });
    } else if (event.action === 'swap') {
      [a[event.ids[0]], a[event.ids[1]]] = [a[event.ids[1]], a[event.ids[0]]];
      steps.push({ array: [...a], compare: null, swapping: event.ids, written: null });
    } else {
      a[event.index] = event.value;
      steps.push({
        array: [...a],
        compare: null,
        swapping: null,
        written: { index: event.index, value: event.value },
      });
    }
  }

  steps.push({ array: [...a], compare: null, swapping: null, written: null });
  return steps;
}

import type { StEvent } from '~/components/engine/event';

export function* bubbleSort(arr: number[]): Generator<StEvent> {
  const a = [...arr];
  const n = a.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      yield { action: 'compare', ids: [j, j + 1] };
      if (a[j] > a[j + 1]) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        yield { action: 'swap', ids: [j, j + 1] };
      }
    }
  }
}

import type { StEvent } from '~/components/engine/event';

export function* insertionSort(arr: number[]): Generator<StEvent> {
  const a = [...arr];
  for (let i = 1; i < a.length; i++) {
    let j = i;
    while (j > 0) {
      yield { action: 'compare', ids: [j - 1, j] };
      if (a[j - 1] <= a[j]) break;
      [a[j - 1], a[j]] = [a[j], a[j - 1]];
      yield { action: 'swap', ids: [j - 1, j] };
      j--;
    }
  }
}

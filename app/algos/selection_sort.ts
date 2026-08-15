import type { StEvent } from '~/components/engine/event';

export function* selectionSort(arr: number[]): Generator<StEvent> {
  const a = [...arr];
  const n = a.length;
  for (let i = 0; i < n - 1; i++) {
    let min = i;
    for (let j = i + 1; j < n; j++) {
      yield { action: 'compare', ids: [min, j] };
      if (a[j] < a[min]) min = j;
    }
    if (min !== i) {
      [a[i], a[min]] = [a[min], a[i]];
      yield { action: 'swap', ids: [i, min] };
    }
  }
}

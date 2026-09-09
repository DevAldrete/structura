import type { StEvent } from '~/components/engine/event';

export function* shellSort(arr: number[]): Generator<StEvent> {
  const a = [...arr];
  const n = a.length;
  for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
    for (let i = gap; i < n; i++) {
      let j = i;
      while (j >= gap) {
        yield { action: 'compare', ids: [j - gap, j] };
        if (a[j - gap] <= a[j]) break;
        [a[j - gap], a[j]] = [a[j], a[j - gap]];
        yield { action: 'swap', ids: [j - gap, j] };
        j -= gap;
      }
    }
  }
}

import type { StEvent } from '~/components/engine/event';

export function* quickSort(arr: number[]): Generator<StEvent> {
  const a = [...arr];
  yield* qs(a, 0, a.length - 1);
}

function* qs(a: number[], lo: number, hi: number): Generator<StEvent> {
  if (lo >= hi) return;
  const p = yield* partition(a, lo, hi);
  yield* qs(a, lo, p - 1);
  yield* qs(a, p + 1, hi);
}

function* partition(a: number[], lo: number, hi: number): Generator<StEvent> {
  const pivot = a[hi];
  let i = lo;
  for (let j = lo; j < hi; j++) {
    yield { action: 'compare', ids: [j, hi] };
    if (a[j] < pivot) {
      if (i !== j) {
        [a[i], a[j]] = [a[j], a[i]];
        yield { action: 'swap', ids: [i, j] };
      }
      i++;
    }
  }
  [a[i], a[hi]] = [a[hi], a[i]];
  yield { action: 'swap', ids: [i, hi] };
  return i;
}

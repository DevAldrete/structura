import type { StEvent } from '~/components/engine/event';

export function* heapSort(arr: number[]): Generator<StEvent> {
  const a = [...arr];
  const n = a.length;

  function* siftDown(start: number, end: number): Generator<StEvent> {
    let root = start;
    while (root * 2 + 1 < end) {
      let child = root * 2 + 1;
      if (child + 1 < end) {
        yield { action: 'compare', ids: [child, child + 1] };
        if (a[child] < a[child + 1]) child++;
      }
      yield { action: 'compare', ids: [root, child] };
      if (a[root] >= a[child]) return;
      [a[root], a[child]] = [a[child], a[root]];
      yield { action: 'swap', ids: [root, child] };
      root = child;
    }
  }

  for (let start = Math.floor(n / 2) - 1; start >= 0; start--) {
    yield* siftDown(start, n);
  }
  for (let end = n - 1; end > 0; end--) {
    [a[0], a[end]] = [a[end], a[0]];
    yield { action: 'swap', ids: [0, end] };
    yield* siftDown(0, end);
  }
}

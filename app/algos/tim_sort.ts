import type { StEvent } from '~/components/engine/event';

const MIN_RUN = 32;

export function* timSort(arr: number[]): Generator<StEvent> {
  const a = [...arr];
  const n = a.length;
  if (n <= 1) return;

  // 1. Insertion sort on small runs (simplified: fixed MIN_RUN, no galloping).
  const runLen = Math.min(MIN_RUN, n);
  for (let start = 0; start < n; start += runLen) {
    const end = Math.min(start + runLen - 1, n - 1);
    for (let i = start + 1; i <= end; i++) {
      let j = i;
      while (j > start) {
        yield { action: 'compare', ids: [j - 1, j] };
        if (a[j - 1] <= a[j]) break;
        [a[j - 1], a[j]] = [a[j], a[j - 1]];
        yield { action: 'swap', ids: [j - 1, j] };
        j--;
      }
    }
  }

  // 2. Merge runs, doubling the size each pass.
  const buffer = new Array<number>(n);
  for (let size = runLen; size < n; size *= 2) {
    for (let left = 0; left < n; left += size * 2) {
      const mid = Math.min(left + size, n);
      const right = Math.min(left + size * 2, n);
      if (mid >= right) continue;
      let i = left;
      let j = mid;
      let k = left;
      while (i < mid && j < right) {
        yield { action: 'compare', ids: [i, j] };
        buffer[k++] = a[i] <= a[j] ? a[i++] : a[j++];
      }
      while (i < mid) buffer[k++] = a[i++];
      while (j < right) buffer[k++] = a[j++];
      for (let m = left; m < right; m++) {
        if (a[m] !== buffer[m]) {
          a[m] = buffer[m];
          yield { action: 'write', index: m, value: buffer[m] };
        }
      }
    }
  }
}

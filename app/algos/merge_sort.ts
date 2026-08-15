import type { StEvent } from '~/components/engine/event';

export function* mergeSort(arr: number[]): Generator<StEvent> {
  const a = [...arr];
  const n = a.length;
  const buffer: number[] = new Array(n);
  for (let width = 1; width < n; width *= 2) {
    for (let left = 0; left < n; left += width * 2) {
      const mid = Math.min(left + width, n);
      const right = Math.min(left + width * 2, n);
      let i = left;
      let j = mid;
      let k = 0;
      while (i < mid && j < right) {
        yield { action: 'compare', ids: [i, j] };
        buffer[k++] = a[i] <= a[j] ? a[i++] : a[j++];
      }
      while (i < mid) buffer[k++] = a[i++];
      while (j < right) buffer[k++] = a[j++];
      for (let m = 0; m < k; m++) {
        a[left + m] = buffer[m];
        yield { action: 'write', index: left + m, value: buffer[m] };
      }
    }
  }
}

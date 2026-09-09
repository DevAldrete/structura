import type { StEvent } from '~/components/engine/event';

// LSD radix sort (base 10) for non-negative integers.
// The array visualizer only accepts values >= 0, so we clamp negatives to 0
// and work on integer parts to keep the animation meaningful.
export function* radixSort(arr: number[]): Generator<StEvent> {
  const a = arr.map((v) => Math.max(0, Math.floor(v)));
  // Mirror the sanitized input so the first frames match what is animated.
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== arr[i]) yield { action: 'write', index: i, value: a[i] };
  }
  const n = a.length;
  if (n <= 1) return;
  const max = Math.max(...a);
  const output = new Array<number>(n);
  for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {
    const count = new Array<number>(10).fill(0);
    for (let i = 0; i < n; i++) {
      const digit = Math.floor(a[i] / exp) % 10;
      count[digit]++;
    }
    for (let d = 1; d < 10; d++) count[d] += count[d - 1];
    for (let i = n - 1; i >= 0; i--) {
      const digit = Math.floor(a[i] / exp) % 10;
      output[--count[digit]] = a[i];
    }
    for (let i = 0; i < n; i++) {
      if (a[i] !== output[i]) {
        a[i] = output[i];
        yield { action: 'write', index: i, value: a[i] };
      }
    }
  }
}

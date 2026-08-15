import type { SortingAlgo } from '~/components/engine/engine';
import { bubbleSort } from './bubble_sort';
import { insertionSort } from './insertion_sort';
import { mergeSort } from './merge_sort';
import { quickSort } from './quick_sort';
import { selectionSort } from './selection_sort';

export interface AlgoEntry {
  slug: string;
  name: string;
  desc: string;
  complexity: string;
  run: SortingAlgo;
}

export const ALGOS: Record<string, AlgoEntry> = {
  'bubble-sort': {
    slug: 'bubble-sort',
    name: 'Bubble Sort',
    desc: 'Repeatedly steps through the list, swapping adjacent items that are out of order.',
    complexity: 'O(n²)',
    run: bubbleSort,
  },
  'selection-sort': {
    slug: 'selection-sort',
    name: 'Selection Sort',
    desc: 'Repeatedly selects the smallest remaining element and moves it to its sorted position.',
    complexity: 'O(n²)',
    run: selectionSort,
  },
  'insertion-sort': {
    slug: 'insertion-sort',
    name: 'Insertion Sort',
    desc: 'Builds the sorted array one item at a time by inserting each into its correct place.',
    complexity: 'O(n²)',
    run: insertionSort,
  },
  'merge-sort': {
    slug: 'merge-sort',
    name: 'Merge Sort',
    desc: 'Divides the list in half, sorts each half, then merges the halves back together.',
    complexity: 'O(n log n)',
    run: mergeSort,
  },
  'quick-sort': {
    slug: 'quick-sort',
    name: 'Quick Sort',
    desc: 'Picks a pivot, partitions around it, and recurses on each side.',
    complexity: 'O(n log n)',
    run: quickSort,
  },
};

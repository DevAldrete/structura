import type { SortingAlgo } from '~/components/engine/engine';
import type { GraphRunner } from '~/graph/graph';
import { bubbleSort } from './bubble_sort';
import { heapSort } from './heap_sort';
import { insertionSort } from './insertion_sort';
import { mergeSort } from './merge_sort';
import { quickSort } from './quick_sort';
import { radixSort } from './radix_sort';
import { selectionSort } from './selection_sort';
import { shellSort } from './shell_sort';
import { timSort } from './tim_sort';
import { myersDiff, type DiffRunner } from './myers_diff';
import { bfs } from '~/graph/bfs';
import { dfs } from '~/graph/dfs';
import { dijkstra } from '~/graph/dijkstra';

export interface AlgoBase {
  slug: string;
  name: string;
  desc: string;
  complexity: string;
}

export type AlgoEntry = AlgoBase &
  (
    | { input: 'array'; run: SortingAlgo }
    | { input: 'graph'; run: GraphRunner; defaultStart: number }
    | { input: 'diff'; run: DiffRunner }
  );

export type ArrayAlgo = Extract<AlgoEntry, { input: 'array' }>;
export type GraphAlgo = Extract<AlgoEntry, { input: 'graph' }>;
export type DiffAlgo = Extract<AlgoEntry, { input: 'diff' }>;

export const ALGOS: Record<string, AlgoEntry> = {
  'bubble-sort': {
    slug: 'bubble-sort',
    name: 'Bubble Sort',
    desc: 'Repeatedly steps through the list, swapping adjacent items that are out of order.',
    complexity: 'O(n²)',
    input: 'array',
    run: bubbleSort,
  },
  'selection-sort': {
    slug: 'selection-sort',
    name: 'Selection Sort',
    desc: 'Repeatedly selects the smallest remaining element and moves it to its sorted position.',
    complexity: 'O(n²)',
    input: 'array',
    run: selectionSort,
  },
  'insertion-sort': {
    slug: 'insertion-sort',
    name: 'Insertion Sort',
    desc: 'Builds the sorted array one item at a time by inserting each into its correct place.',
    complexity: 'O(n²)',
    input: 'array',
    run: insertionSort,
  },
  'merge-sort': {
    slug: 'merge-sort',
    name: 'Merge Sort',
    desc: 'Divides the list in half, sorts each half, then merges the halves back together.',
    complexity: 'O(n log n)',
    input: 'array',
    run: mergeSort,
  },
  'quick-sort': {
    slug: 'quick-sort',
    name: 'Quick Sort',
    desc: 'Picks a pivot, partitions around it, and recurses on each side.',
    complexity: 'O(n log n) avg',
    input: 'array',
    run: quickSort,
  },
  'shell-sort': {
    slug: 'shell-sort',
    name: 'Shell Sort',
    desc: 'Generalizes insertion sort by comparing elements gapped apart, shrinking the gap.',
    complexity: 'O(n log n) ~ O(n²)',
    input: 'array',
    run: shellSort,
  },
  'heap-sort': {
    slug: 'heap-sort',
    name: 'Heap Sort',
    desc: 'Builds a max-heap, then repeatedly extracts the maximum to the end.',
    complexity: 'O(n log n)',
    input: 'array',
    run: heapSort,
  },
  'radix-sort': {
    slug: 'radix-sort',
    name: 'Radix Sort',
    desc: 'Stable LSD digit sort (base 10) for non-negative integers — no comparisons.',
    complexity: 'O(d·n)',
    input: 'array',
    run: radixSort,
  },
  'tim-sort': {
    slug: 'tim-sort',
    name: 'Tim Sort',
    desc: 'Insertion sort on small runs, then stable merges (simplified, no galloping).',
    complexity: 'O(n log n)',
    input: 'array',
    run: timSort,
  },
  bfs: {
    slug: 'bfs',
    name: 'Breadth-First Search',
    desc: 'Explores a graph level by level, visiting every neighbour of a node before going deeper.',
    complexity: 'O(V + E)',
    input: 'graph',
    defaultStart: 0,
    run: bfs,
  },
  dfs: {
    slug: 'dfs',
    name: 'Depth-First Search',
    desc: 'Explores a graph by going as deep as possible along each branch before backtracking.',
    complexity: 'O(V + E)',
    input: 'graph',
    defaultStart: 0,
    run: dfs,
  },
  dijkstra: {
    slug: 'dijkstra',
    name: "Dijkstra's Algorithm",
    desc: 'Finds the shortest path from a source to every other node in a weighted graph.',
    complexity: 'O(E log V)',
    input: 'graph',
    defaultStart: 0,
    run: dijkstra,
  },
  'myers-diff': {
    slug: 'myers-diff',
    name: 'Myers Diff',
    desc: 'Finds the shortest edit script between two sequences by walking the edit graph diagonals.',
    complexity: 'O(ND)',
    input: 'diff',
    run: myersDiff,
  },
};

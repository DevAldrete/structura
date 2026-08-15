import type { DSState } from './engine';
import { btreeScript, type BTreeOp } from './b_tree';
import { graphScript, type GraphOp } from './graph';
import { linkedListScript, type ListKind, type ListOp } from './lists';
import { queueScript, type QueueOp } from './queue';
import { stackScript, type StackOp } from './stack';
import { bstScript, type TreeOp } from './tree';

export type DSOp = ListOp | StackOp | QueueOp | TreeOp | BTreeOp | GraphOp;

export type Layout = 'row' | 'column' | 'tree' | 'graph';
export type Arrows = 'none' | 'forward' | 'both';

export interface OpMeta {
  id: string;
  label: string;
  needsValue: boolean;
  needsIndex: boolean;
  build: (value: number, index: number) => DSOp;
}

export interface StructureEntry {
  slug: string;
  name: string;
  desc: string;
  layout: Layout;
  arrows: Arrows;
  wrap: boolean;
  xor: boolean;
  initial: number[];
  defaultOps: DSOp[];
  ops: OpMeta[];
  build: (ops: DSOp[]) => Generator<DSState>;
}

const listOps = (insert: boolean, del: boolean): OpMeta[] => [
  {
    id: 'pushFront',
    label: 'push front',
    needsValue: true,
    needsIndex: false,
    build: (value: number) => ({ type: 'pushFront', value }),
  },
  {
    id: 'pushBack',
    label: 'push back',
    needsValue: true,
    needsIndex: false,
    build: (value: number) => ({ type: 'pushBack', value }),
  },
  ...(insert
    ? ([
        {
          id: 'insert',
          label: 'insert',
          needsValue: true,
          needsIndex: true,
          build: (value: number, index: number) => ({ type: 'insert', index, value }),
        },
      ] as OpMeta[])
    : []),
  {
    id: 'popFront',
    label: 'pop front',
    needsValue: false,
    needsIndex: false,
    build: () => ({ type: 'popFront' }),
  },
  {
    id: 'popBack',
    label: 'pop back',
    needsValue: false,
    needsIndex: false,
    build: () => ({ type: 'popBack' }),
  },
  ...(del
    ? ([
        {
          id: 'delete',
          label: 'delete',
          needsValue: false,
          needsIndex: true,
          build: (_value: number, index: number) => ({ type: 'delete', index }),
        },
      ] as OpMeta[])
    : []),
  {
    id: 'search',
    label: 'search',
    needsValue: true,
    needsIndex: false,
    build: (value: number) => ({ type: 'search', value }),
  },
];

const listEntry = (
  slug: string,
  name: string,
  desc: string,
  kind: ListKind,
  initial: number[],
  defaultOps: ListOp[],
  opts: { wrap?: boolean; xor?: boolean; arrows?: Arrows } = {},
): StructureEntry => ({
  slug,
  name,
  desc,
  layout: 'row',
  arrows: opts.arrows ?? 'forward',
  wrap: opts.wrap ?? false,
  xor: opts.xor ?? false,
  initial,
  defaultOps,
  ops: listOps(true, true),
  build: (ops) => linkedListScript(initial, ops as ListOp[], kind),
});

const treeOps = (deleteable: boolean): OpMeta[] => [
  {
    id: 'insert',
    label: 'insert',
    needsValue: true,
    needsIndex: false,
    build: (value: number) => ({ type: 'insert', value }),
  },
  {
    id: 'search',
    label: 'search',
    needsValue: true,
    needsIndex: false,
    build: (value: number) => ({ type: 'search', value }),
  },
  ...(deleteable
    ? ([
        {
          id: 'delete',
          label: 'delete',
          needsValue: true,
          needsIndex: false,
          build: (value: number) => ({ type: 'delete', value }),
        },
      ] as OpMeta[])
    : []),
];

export const STRUCTURES: Record<string, StructureEntry> = {
  'linked-list': listEntry(
    'linked-list',
    'Linked List',
    'A linear sequence of nodes; each node points to the next one.',
    'singly',
    [1, 2, 3],
    [
      { type: 'pushBack', value: 4 },
      { type: 'insert', index: 2, value: 9 },
      { type: 'search', value: 9 },
      { type: 'popFront' },
      { type: 'pushFront', value: 7 },
    ],
  ),
  'doubly-linked-list': listEntry(
    'doubly-linked-list',
    'Doubly Linked List',
    'Each node keeps a pointer to both the previous and the next node.',
    'doubly',
    [10, 20, 30],
    [
      { type: 'pushBack', value: 40 },
      { type: 'delete', index: 1 },
      { type: 'pushFront', value: 5 },
      { type: 'search', value: 20 },
    ],
    { arrows: 'both' },
  ),
  'circular-linked-list': listEntry(
    'circular-linked-list',
    'Circular Linked List',
    'The tail wraps around and points back to the head, forming a ring.',
    'circular',
    [4, 8, 15],
    [
      { type: 'pushBack', value: 16 },
      { type: 'pushBack', value: 23 },
      { type: 'popFront' },
      { type: 'insert', index: 0, value: 42 },
    ],
    { wrap: true },
  ),
  'xor-linked-list': listEntry(
    'xor-linked-list',
    'XOR Linked List',
    'Each node stores prev XOR next; you need the previous node to reach the next.',
    'xor',
    [3, 1, 4],
    [
      { type: 'pushBack', value: 1 },
      { type: 'pushFront', value: 5 },
      { type: 'search', value: 4 },
    ],
    { xor: true },
  ),
  'binary-search-tree': {
    slug: 'binary-search-tree',
    name: 'Binary Search Tree',
    desc: 'An ordered tree — left children hold smaller values, right children hold larger ones.',
    layout: 'tree',
    arrows: 'none',
    wrap: false,
    xor: false,
    initial: [5, 3, 8],
    defaultOps: [
      { type: 'insert', value: 7 },
      { type: 'insert', value: 1 },
      { type: 'search', value: 3 },
      { type: 'delete', value: 8 },
      { type: 'insert', value: 9 },
    ],
    ops: treeOps(true),
    build: (ops) => bstScript([5, 3, 8], ops as TreeOp[]),
  },
  'b-tree': {
    slug: 'b-tree',
    name: 'B-Tree',
    desc: 'A self-balancing tree where nodes hold many keys and splits keep every leaf at the same depth.',
    layout: 'tree',
    arrows: 'none',
    wrap: false,
    xor: false,
    initial: [10, 20, 30, 40, 50],
    defaultOps: [
      { type: 'insert', value: 25 },
      { type: 'insert', value: 5 },
      { type: 'insert', value: 15 },
      { type: 'search', value: 30 },
    ],
    ops: treeOps(false),
    build: (ops) => btreeScript([10, 20, 30, 40, 50], ops as BTreeOp[]),
  },
  graph: {
    slug: 'graph',
    name: 'Graph',
    desc: 'A set of nodes joined by edges. Node ids are their positions around the circle.',
    layout: 'graph',
    arrows: 'none',
    wrap: false,
    xor: false,
    initial: [1, 2],
    defaultOps: [
      { type: 'addNode', value: 3 },
      { type: 'addEdge', from: 0, to: 2 },
      { type: 'addEdge', from: 1, to: 2 },
      { type: 'search', value: 3 },
      { type: 'addNode', value: 4 },
      { type: 'addEdge', from: 2, to: 4 },
    ],
    ops: [
      {
        id: 'addNode',
        label: 'add node',
        needsValue: true,
        needsIndex: false,
        build: (value: number) => ({ type: 'addNode', value }),
      },
      {
        id: 'addEdge',
        label: 'connect',
        needsValue: true,
        needsIndex: true,
        build: (value: number, index: number) => ({ type: 'addEdge', from: value, to: index }),
      },
      {
        id: 'search',
        label: 'search',
        needsValue: true,
        needsIndex: false,
        build: (value: number) => ({ type: 'search', value }),
      },
    ],
    build: (ops) => graphScript([1, 2], ops as GraphOp[]),
  },
  stack: {
    slug: 'stack',
    name: 'Stack',
    desc: 'LIFO — the last item pushed is the first one popped.',
    layout: 'column',
    arrows: 'none',
    wrap: false,
    xor: false,
    initial: [7, 3],
    defaultOps: [
      { type: 'push', value: 9 },
      { type: 'push', value: 2 },
      { type: 'pop' },
      { type: 'pop' },
      { type: 'push', value: 1 },
    ],
    ops: [
      {
        id: 'push',
        label: 'push',
        needsValue: true,
        needsIndex: false,
        build: (value: number) => ({ type: 'push', value }),
      },
      {
        id: 'pop',
        label: 'pop',
        needsValue: false,
        needsIndex: false,
        build: () => ({ type: 'pop' }),
      },
    ],
    build: (ops) => stackScript([7, 3], ops as StackOp[]),
  },
  queue: {
    slug: 'queue',
    name: 'Queue',
    desc: 'FIFO — items are enqueued at the rear and dequeued at the front.',
    layout: 'row',
    arrows: 'forward',
    wrap: false,
    xor: false,
    initial: [2, 4],
    defaultOps: [
      { type: 'enqueue', value: 6 },
      { type: 'enqueue', value: 8 },
      { type: 'dequeue' },
      { type: 'enqueue', value: 10 },
    ],
    ops: [
      {
        id: 'enqueue',
        label: 'enqueue',
        needsValue: true,
        needsIndex: false,
        build: (value: number) => ({ type: 'enqueue', value }),
      },
      {
        id: 'dequeue',
        label: 'dequeue',
        needsValue: false,
        needsIndex: false,
        build: () => ({ type: 'dequeue' }),
      },
    ],
    build: (ops) => queueScript([2, 4], ops as QueueOp[]),
  },
};

import type { DSState } from './engine';
import { linkedListScript, type ListKind, type ListOp } from './lists';
import { queueScript, type QueueOp } from './queue';
import { stackScript, type StackOp } from './stack';

export type DSOp = ListOp | StackOp | QueueOp;

export type Layout = 'row' | 'column';
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

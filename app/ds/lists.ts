import { clampIndex, makeEmitter, type DSState, type StateBuilder } from './engine';

export type ListKind = 'singly' | 'doubly' | 'circular' | 'xor';

export type ListOp =
  | { type: 'pushFront'; value: number }
  | { type: 'pushBack'; value: number }
  | { type: 'popFront' }
  | { type: 'popBack' }
  | { type: 'insert'; index: number; value: number }
  | { type: 'delete'; index: number }
  | { type: 'search'; value: number };

function structuralLabels(values: number[]): Record<number, string[]> {
  const labels: Record<number, string[]> = {};
  if (values.length) {
    labels[0] = ['head'];
    labels[values.length - 1] = ['tail'];
  }
  return labels;
}

export function xorField(index: number, length: number): number {
  const prev = index > 0 ? index : 0;
  const next = index < length - 1 ? index + 2 : 0;
  return prev ^ next;
}

function* traverse(
  values: number[],
  target: number,
  emit: StateBuilder,
  kind: ListKind,
  note: string,
): Generator<DSState> {
  const end = Math.min(target, values.length - 1);
  for (let i = 0; i <= end; i++) {
    if (kind === 'xor') {
      const stored = xorField(i, values.length);
      const addr = i + 1;
      yield emit(`${note} — addr ${addr} holds X${stored}`, [i]);
    } else {
      yield emit(`${note} — index ${i}`, [i]);
    }
  }
}

function* applyListOp(
  values: number[],
  op: ListOp,
  emit: StateBuilder,
  kind: ListKind,
): Generator<DSState> {
  switch (op.type) {
    case 'pushFront': {
      values.unshift(op.value);
      yield emit(`push ${op.value} at head`, [], [0]);
      break;
    }
    case 'pushBack': {
      values.push(op.value);
      yield emit(`push ${op.value} at tail`, [], [values.length - 1]);
      break;
    }
    case 'popFront': {
      if (values.length === 0) {
        yield emit('list is empty — nothing to pop', []);
        break;
      }
      const v = values.shift();
      yield emit(`pop ${v} from head`, [], []);
      break;
    }
    case 'popBack': {
      if (values.length === 0) {
        yield emit('list is empty — nothing to pop', []);
        break;
      }
      const v = values.pop();
      yield emit(`pop ${v} from tail`, [], []);
      break;
    }
    case 'insert': {
      const idx = clampIndex(op.index, values.length);
      const word = kind === 'doubly' ? 'walking the links' : 'following next pointers';
      yield* traverse(values, idx - 1, emit, kind, word);
      values.splice(idx, 0, op.value);
      yield emit(`insert ${op.value} at index ${idx}`, [], [idx]);
      break;
    }
    case 'delete': {
      if (values.length === 0) {
        yield emit('list is empty — nothing to delete', []);
        break;
      }
      const idx = clampIndex(op.index, values.length - 1);
      const word = kind === 'doubly' ? 'walking the links' : 'following next pointers';
      yield* traverse(values, idx, emit, kind, word);
      const v = values.splice(idx, 1)[0];
      yield emit(`delete ${v} at index ${idx}`, [], []);
      break;
    }
    case 'search': {
      let found = -1;
      for (let i = 0; i < values.length; i++) {
        if (kind === 'xor') {
          const stored = xorField(i, values.length);
          const addr = i + 1;
          yield emit(`scanning addr ${addr} (X${stored})`, [i]);
        } else {
          yield emit(`scanning index ${i}`, [i]);
        }
        if (values[i] === op.value) {
          found = i;
          break;
        }
      }
      if (found >= 0) {
        yield emit(`found ${op.value} at index ${found}`, [found]);
      } else {
        yield emit(`${op.value} is not in the list`, []);
      }
      break;
    }
  }
}

export function* linkedListScript(
  initial: number[],
  ops: ListOp[],
  kind: ListKind,
): Generator<DSState> {
  const values = [...initial];
  const emit = makeEmitter(values, structuralLabels(values));

  yield emit(kind === 'xor' ? 'initial list — each node stores prev XOR next' : 'initial list');

  for (const op of ops) {
    yield* applyListOp(values, op, emit, kind);
  }
}

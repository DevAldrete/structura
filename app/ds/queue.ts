import { makeEmitter, type DSState } from './engine';

export type QueueOp = { type: 'enqueue'; value: number } | { type: 'dequeue' };

function structuralLabels(values: number[]): Record<number, string[]> {
  const labels: Record<number, string[]> = {};
  if (values.length) {
    labels[0] = ['front'];
    labels[values.length - 1] = ['rear'];
  }
  return labels;
}

export function* queueScript(initial: number[], ops: QueueOp[]): Generator<DSState> {
  const values = [...initial];
  const emit = makeEmitter(values, structuralLabels(values));

  yield emit('initial queue');

  for (const op of ops) {
    if (op.type === 'enqueue') {
      values.push(op.value);
      yield emit(`enqueue ${op.value} at the rear`, [], [values.length - 1]);
    } else {
      if (values.length === 0) {
        yield emit('queue underflow — nothing to dequeue', []);
        continue;
      }
      const v = values.shift();
      yield emit(`dequeue ${v} from the front`, [], []);
    }
  }
}

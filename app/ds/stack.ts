import { makeEmitter, type DSState } from './engine';

export type StackOp = { type: 'push'; value: number } | { type: 'pop' };

function structuralLabels(values: number[]): Record<number, string[]> {
  return values.length ? { [values.length - 1]: ['top'] } : {};
}

export function* stackScript(initial: number[], ops: StackOp[]): Generator<DSState> {
  const values = [...initial];
  const emit = makeEmitter(values, structuralLabels(values));

  yield emit('initial stack');

  for (const op of ops) {
    if (op.type === 'push') {
      values.push(op.value);
      yield emit(`push ${op.value} onto the stack`, [], [values.length - 1]);
    } else {
      if (values.length === 0) {
        yield emit('stack underflow — nothing to pop', []);
        continue;
      }
      const v = values.pop();
      yield emit(`pop ${v} off the stack`, [], []);
    }
  }
}

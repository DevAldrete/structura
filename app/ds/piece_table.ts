import { clampIndex, type DSState } from './engine';

export type PieceTableOp =
  | { type: 'insert'; index: number; value: number }
  | { type: 'delete'; index: number }
  | { type: 'search'; value: number };

interface Piece {
  source: 'orig' | 'add';
  start: number;
  length: number;
}

const charOf = (code: number): string => {
  const c = String.fromCharCode(code);
  return /^[\x20-\x7e]$/.test(c) ? c : `\\u{${code}}`;
};

export function* pieceTableScript(initial: number[], ops: PieceTableOp[]): Generator<DSState> {
  const original = [...initial];
  const add: number[] = [];
  let pieces: Piece[] = original.length
    ? [{ source: 'orig', start: 0, length: original.length }]
    : [];

  const bufOf = (p: Piece): number[] => (p.source === 'orig' ? original : add);

  const flatten = (): number[] =>
    pieces.flatMap((p) => bufOf(p).slice(p.start, p.start + p.length));

  const pieceDesc = (): string => {
    if (!pieces.length) return '∅';
    return pieces
      .map((p) => {
        const text = bufOf(p)
          .slice(p.start, p.start + p.length)
          .map(charOf)
          .join('');
        return `[${p.source} ${p.start}..${p.start + p.length}]“${text}”`;
      })
      .join(' ');
  };

  const emit = (note: string, highlighted: number[] = [], active: number[] = []): DSState => {
    const values = flatten();
    const labels: Record<number, string[]> = {};
    if (values.length) {
      labels[0] = ['head'];
      labels[values.length - 1] = ['tail'];
    }
    return {
      values,
      highlighted: [...highlighted],
      active: [...active],
      done: [],
      labels,
      note: `${note} — pieces: ${pieceDesc()}`,
    };
  };

  const splitAt = (index: number): void => {
    let offset = 0;
    const next: Piece[] = [];
    for (const p of pieces) {
      const end = offset + p.length;
      if (index > offset && index < end) {
        const cut = index - offset;
        next.push({ ...p, length: cut });
        next.push({ ...p, start: p.start + cut, length: p.length - cut });
      } else {
        next.push(p);
      }
      offset = end;
    }
    pieces = next;
  };

  const total = (): number => pieces.reduce((s, p) => s + p.length, 0);

  yield emit(`initial text “${flatten().map(charOf).join('')}”`);

  for (const op of ops) {
    if (op.type === 'insert') {
      const len = total();
      const at = clampIndex(op.index, len);
      splitAt(at);
      add.push(op.value);
      let offset = 0;
      const next: Piece[] = [];
      let inserted = false;
      for (const p of pieces) {
        if (!inserted && offset === at) {
          next.push({ source: 'add', start: add.length - 1, length: 1 });
          inserted = true;
        }
        next.push(p);
        offset += p.length;
      }
      if (!inserted) next.push({ source: 'add', start: add.length - 1, length: 1 });
      pieces = next.filter((p) => p.length > 0);
      yield emit(`insert ‘${charOf(op.value)}’ (${op.value}) at ${at}`, [], [at]);
    } else if (op.type === 'delete') {
      const len = total();
      if (len === 0) {
        yield emit('piece table is empty — nothing to delete');
        continue;
      }
      const at = clampIndex(op.index, len - 1);
      splitAt(at);
      splitAt(at + 1);
      let offset = 0;
      const removed: number[] = [];
      pieces = pieces.filter((p) => {
        const end = offset + p.length;
        const drop = offset === at && p.length === 1;
        if (drop) removed.push(...bufOf(p).slice(p.start, p.start + 1));
        offset = end;
        return !drop;
      });
      const ch = removed.length ? `‘${charOf(removed[0])}’ ` : '';
      yield emit(`delete ${ch}at ${at}`);
    } else {
      const values = flatten();
      let found = -1;
      for (let i = 0; i < values.length; i++) {
        yield emit(`search for ‘${charOf(op.value)}’ — at index ${i} (‘${charOf(values[i])}’)`, [
          i,
        ]);
        if (values[i] === op.value) {
          found = i;
          break;
        }
      }
      if (found >= 0) yield emit(`found ‘${charOf(op.value)}’ at ${found}`, [], [found]);
      else yield emit(`‘${charOf(op.value)}’ (${op.value}) is not in the text`);
    }
  }
}

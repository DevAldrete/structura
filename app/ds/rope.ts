import { clampIndex, type DSState, type Value } from './engine';

export type RopeOp =
  | { type: 'insert'; index: number; value: number }
  | { type: 'delete'; index: number }
  | { type: 'search'; value: number };

const LEAF_CAP = 4;

interface RNode {
  id: number;
  left: RNode | null;
  right: RNode | null;
  text: number[];
}

const charOf = (code: number): string => {
  const c = String.fromCharCode(code);
  return /^[\x20-\x7e]$/.test(c) ? c : `\\u{${code}}`;
};

export function* ropeScript(initial: number[], ops: RopeOp[]): Generator<DSState> {
  let nextId = 0;
  const leaf = (text: number[]): RNode => ({
    id: nextId++,
    left: null,
    right: null,
    text: [...text],
  });
  const concat = (left: RNode | null, right: RNode | null): RNode | null => {
    if (!left) return right;
    if (!right) return left;
    return { id: nextId++, left, right, text: [] };
  };

  const buildBalanced = (chars: number[]): RNode | null => {
    if (!chars.length) return null;
    if (chars.length <= LEAF_CAP) return leaf(chars);
    const mid = Math.floor(chars.length / 2);
    return concat(buildBalanced(chars.slice(0, mid)), buildBalanced(chars.slice(mid)));
  };

  let root: RNode | null = buildBalanced(initial);

  const flatten = (n: RNode | null): number[] => {
    if (!n) return [];
    if (!n.left && !n.right) return [...n.text];
    return [...flatten(n.left), ...flatten(n.right)];
  };

  const fullText = (): string => flatten(root).map(charOf).join('');

  function snapshot(): { values: Value[]; children: Record<number, number[]>; root: number } {
    const values: Value[] = [];
    const children: Record<number, number[]> = {};
    const indexOf = new Map<number, number>();
    if (root) {
      const visit = (n: RNode): number => {
        const i = values.length;
        indexOf.set(n.id, i);
        const isLeaf = !n.left && !n.right;
        values.push(isLeaf ? [...n.text] : flatten(n).length);
        const kids: number[] = [];
        if (n.left) kids.push(visit(n.left));
        if (n.right) kids.push(visit(n.right));
        children[i] = kids;
        return i;
      };
      visit(root);
    }
    return { values, children, root: root ? (indexOf.get(root.id) ?? -1) : -1 };
  }

  const emit = (note: string, highlighted: number[] = [], active: number[] = []): DSState => {
    const s = snapshot();
    const labels: Record<number, string[]> = {};
    if (s.root >= 0) labels[s.root] = [`len=${flatten(root).length}`];
    return {
      values: s.values,
      highlighted,
      active,
      done: [],
      labels,
      note: `${note} — “${fullText()}”`,
      root: s.root,
      children: s.children,
      treeLayout: 'span',
    };
  };

  yield emit(`initial rope “${fullText()}”`);

  for (const op of ops) {
    if (op.type === 'insert') {
      const chars = flatten(root);
      const at = clampIndex(op.index, chars.length);
      chars.splice(at, 0, op.value);
      root = buildBalanced(chars);
      yield emit(`insert ‘${charOf(op.value)}’ (${op.value}) at ${at} — rebalanced`, [], [0]);
    } else if (op.type === 'delete') {
      const chars = flatten(root);
      if (!chars.length) {
        yield emit('rope is empty — nothing to delete');
        continue;
      }
      const at = clampIndex(op.index, chars.length - 1);
      const [removed] = chars.splice(at, 1);
      root = buildBalanced(chars);
      yield emit(`delete ‘${charOf(removed)}’ at ${at} — rebalanced`);
    } else {
      const chars = flatten(root);
      let found = -1;
      for (let i = 0; i < chars.length; i++) {
        if (chars[i] === op.value) {
          found = i;
          break;
        }
      }
      if (found < 0) {
        yield emit(`‘${charOf(op.value)}’ (${op.value}) is not in the rope`);
      } else {
        yield emit(`found ‘${charOf(op.value)}’ at flat index ${found}`, [], [0]);
      }
    }
  }
}

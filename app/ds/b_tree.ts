import type { DSState, Value } from './engine';

export type BTreeOp = { type: 'insert'; value: number } | { type: 'search'; value: number };

const ORDER = 2;
const MAX_KEYS = 2 * ORDER - 1;

interface BNode {
  id: number;
  keys: number[];
  children: (BNode | null)[];
  leaf: boolean;
}

export function* btreeScript(initial: number[], ops: BTreeOp[]): Generator<DSState> {
  let root: BNode | null = null;
  let nextId = 0;
  const makeNode = (keys: number[] = [], children: (BNode | null)[] = []): BNode => ({
    id: nextId++,
    keys: [...keys],
    children: children.map((c) => c),
    leaf: !children.some((c) => c !== null),
  });

  const insertInto = (node: BNode, value: number) => {
    const i = node.keys.findIndex((k) => value < k);
    if (i < 0) node.keys.push(value);
    else node.keys.splice(i, 0, value);
  };

  const seed = (value: number) => {
    if (!root) {
      root = makeNode([value]);
      return;
    }
    const path: BNode[] = [];
    let cur = root;
    while (!cur.leaf) {
      path.push(cur);
      let i = 0;
      while (i < cur.keys.length && value > cur.keys[i]) i++;
      const next = cur.children[i];
      if (!next) break;
      cur = next;
    }
    insertInto(cur, value);
    let node = cur;
    while (node.keys.length > MAX_KEYS) {
      const mid = Math.floor(node.keys.length / 2);
      const midKey = node.keys[mid];
      const left = makeNode(node.keys.slice(0, mid), node.children.slice(0, mid + 1));
      const right = makeNode(node.keys.slice(mid + 1), node.children.slice(mid + 1));
      const parent = path.pop();
      if (!parent) {
        root = makeNode([midKey], [left, right]);
        break;
      }
      const idx = parent.children.indexOf(node);
      parent.keys.splice(idx, 0, midKey);
      parent.children.splice(idx, 1, left, right);
      node = parent;
    }
  };

  for (const v of initial) seed(v);

  function snapshot(): {
    values: Value[];
    children: Record<number, number[]>;
    root: number;
    indexOf: Map<number, number>;
  } {
    const values: Value[] = [];
    const children: Record<number, number[]> = {};
    const indexOf = new Map<number, number>();
    if (root) {
      const visit = (n: BNode): number => {
        const i = values.length;
        indexOf.set(n.id, i);
        values.push(n.keys);
        const kids: number[] = [];
        for (const c of n.children) if (c) kids.push(visit(c));
        children[i] = kids;
        return i;
      };
      visit(root);
    }
    return { values, children, root: root ? (indexOf.get(root.id) ?? -1) : -1, indexOf };
  }

  function emit(note: string, highlight: BNode[] = [], active: BNode[] = []): DSState {
    const s = snapshot();
    const highlighted = highlight
      .map((n) => s.indexOf.get(n.id))
      .filter((i): i is number => i !== undefined);
    const activeIdx = active
      .map((n) => s.indexOf.get(n.id))
      .filter((i): i is number => i !== undefined);
    const labels: Record<number, string[]> = {};
    if (s.root >= 0) labels[s.root] = ['root'];
    return {
      values: s.values,
      highlighted,
      active: activeIdx,
      labels,
      note,
      root: s.root,
      children: s.children,
      treeLayout: 'span',
    };
  }

  const fmt = (n: BNode) => `[${n.keys.join(' | ')}]`;

  yield emit('initial B-tree (order 2)');

  for (const op of ops) {
    if (op.type === 'insert') {
      if (!root) {
        root = makeNode([op.value]);
        yield emit(`insert ${op.value} — start a root node`, [], [root]);
        continue;
      }
      const path: BNode[] = [];
      let cur = root;
      while (!cur.leaf) {
        yield emit(`descend — search ${op.value} in node ${fmt(cur)}`, [cur]);
        path.push(cur);
        let i = 0;
        while (i < cur.keys.length && op.value > cur.keys[i]) i++;
        const next = cur.children[i];
        if (!next) break;
        cur = next;
      }
      yield emit(`reach leaf ${fmt(cur)} — insert ${op.value}`, [cur]);
      insertInto(cur, op.value);
      yield emit(`leaf is now ${fmt(cur)}`, [], [cur]);
      let node = cur;
      while (node.keys.length > MAX_KEYS) {
        const mid = Math.floor(node.keys.length / 2);
        const midKey = node.keys[mid];
        const left = makeNode(node.keys.slice(0, mid), node.children.slice(0, mid + 1));
        const right = makeNode(node.keys.slice(mid + 1), node.children.slice(mid + 1));
        yield emit(`split ${fmt(node)} — promote ${midKey}`, [], [node]);
        const parent = path.pop();
        if (!parent) {
          root = makeNode([midKey], [left, right]);
          yield emit(`make a new root holding ${midKey}`, [], [root]);
          break;
        }
        const idx = parent.children.indexOf(node);
        parent.keys.splice(idx, 0, midKey);
        parent.children.splice(idx, 1, left, right);
        yield emit(`parent is now ${fmt(parent)}`, [], [parent]);
        node = parent;
      }
    } else {
      if (!root) {
        yield emit('tree is empty — nothing to search', []);
        continue;
      }
      let cur: BNode | null = root;
      let depth = 0;
      while (cur) {
        yield emit(`search ${op.value} in node ${fmt(cur)}`, [cur]);
        let i = 0;
        while (i < cur.keys.length && op.value > cur.keys[i]) i++;
        if (i < cur.keys.length && cur.keys[i] === op.value) {
          yield emit(`found ${op.value} at depth ${depth}`, [cur]);
          break;
        }
        if (cur.leaf) {
          yield emit(`${op.value} is not in the tree`, []);
          break;
        }
        const next: BNode | null = cur.children[i];
        if (!next) break;
        cur = next;
        depth++;
      }
    }
  }
}

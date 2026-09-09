import type { DSState } from './engine';

export type SplayOp =
  | { type: 'insert'; value: number }
  | { type: 'search'; value: number }
  | { type: 'delete'; value: number }
  | { type: 'traverse'; order: 'in' | 'pre' | 'post' };

interface SNode {
  id: number;
  value: number;
  left: SNode | null;
  right: SNode | null;
}

export function* splayScript(initial: number[], ops: SplayOp[]): Generator<DSState> {
  let root: SNode | null = null;
  let nextId = 0;
  const makeNode = (value: number): SNode => ({ id: nextId++, value, left: null, right: null });

  function snapshot(): {
    values: number[];
    children: Record<number, number[]>;
    root: number;
    indexOf: Map<number, number>;
  } {
    const values: number[] = [];
    const children: Record<number, number[]> = {};
    const indexOf = new Map<number, number>();
    if (root) {
      const visit = (n: SNode): number => {
        const i = values.length;
        indexOf.set(n.id, i);
        values.push(n.value);
        const kids: number[] = [];
        if (n.left) kids.push(visit(n.left));
        if (n.right) kids.push(visit(n.right));
        children[i] = kids;
        return i;
      };
      visit(root);
    }
    return { values, children, root: root ? (indexOf.get(root.id) ?? -1) : -1, indexOf };
  }

  function emit(
    note: string,
    highlight: SNode[] = [],
    active: SNode[] = [],
    done: SNode[] = [],
  ): DSState {
    const s = snapshot();
    const map = (ns: SNode[]) =>
      ns.map((n) => s.indexOf.get(n.id)).filter((i): i is number => i !== undefined);
    const labels: Record<number, string[]> = {};
    if (s.root >= 0) labels[s.root] = ['root'];
    return {
      values: s.values,
      highlighted: map(highlight),
      active: map(active),
      done: map(done),
      labels,
      note,
      root: s.root,
      children: s.children,
      treeLayout: 'binary',
    };
  }

  const rotateRight = (x: SNode): SNode => {
    const y = x.left as SNode;
    x.left = y.right;
    y.right = x;
    return y;
  };

  const rotateLeft = (x: SNode): SNode => {
    const y = x.right as SNode;
    x.right = y.left;
    y.left = x;
    return y;
  };

  // Bottom-up splay using the recorded path. Emits each rotation.
  function* splay(path: SNode[]): Generator<DSState> {
    while (path.length > 1) {
      const node = path.pop() as SNode;
      const parent = path[path.length - 1];
      if (path.length === 1) {
        // zig
        if (parent.left === node) {
          yield emit(`zig right — rotate ${parent.value} down`, [parent], [node]);
          root = parent === root ? rotateRight(parent) : root;
          if (path[0] === parent) path[0] = node;
        } else {
          yield emit(`zig left — rotate ${parent.value} down`, [parent], [node]);
          root = parent === root ? rotateLeft(parent) : root;
          if (path[0] === parent) path[0] = node;
        }
        // Fix links above the rotated pair.
        if (path.length > 1) {
          const gp = path[path.length - 2];
          if (gp.left === parent) gp.left = node;
          else if (gp.right === parent) gp.right = node;
        } else {
          root = node;
        }
      } else {
        const grand = path[path.length - 2];
        const leftP = grand.left === parent;
        const leftN = parent.left === node;
        if (leftP && leftN) {
          yield emit(
            `zig-zig right — ${grand.value}, ${parent.value}, ${node.value}`,
            [grand],
            [node],
          );
          if (grand.left === parent && parent.left === node) {
            const r = rotateRight(grand);
            const rr = rotateRight(r);
            if (path.length > 2) {
              const gg = path[path.length - 3];
              if (gg.left === grand) gg.left = rr;
              else if (gg.right === grand) gg.right = rr;
            } else root = rr;
            path.splice(path.length - 2, 2, rr);
          }
        } else if (!leftP && !leftN) {
          yield emit(
            `zig-zig left — ${grand.value}, ${parent.value}, ${node.value}`,
            [grand],
            [node],
          );
          const r = rotateLeft(grand);
          const rr = rotateLeft(r);
          if (path.length > 2) {
            const gg = path[path.length - 3];
            if (gg.left === grand) gg.left = rr;
            else if (gg.right === grand) gg.right = rr;
          } else root = rr;
          path.splice(path.length - 2, 2, rr);
        } else if (leftP && !leftN) {
          yield emit(`zig-zag — rotate ${node.value} up twice`, [parent, grand], [node]);
          grand.left = rotateLeft(parent);
          const r = rotateRight(grand);
          if (path.length > 2) {
            const gg = path[path.length - 3];
            if (gg.left === grand) gg.left = r;
            else if (gg.right === grand) gg.right = r;
          } else root = r;
          path.splice(path.length - 2, 2, r);
        } else {
          yield emit(`zag-zig — rotate ${node.value} up twice`, [parent, grand], [node]);
          grand.right = rotateRight(parent);
          const r = rotateLeft(grand);
          if (path.length > 2) {
            const gg = path[path.length - 3];
            if (gg.left === grand) gg.left = r;
            else if (gg.right === grand) gg.right = r;
          } else root = r;
          path.splice(path.length - 2, 2, r);
        }
      }
    }
    if (path[0]) root = path[0];
  }

  const findWithPath = (value: number): { node: SNode | null; path: SNode[] } => {
    const path: SNode[] = [];
    let cur = root;
    while (cur) {
      path.push(cur);
      if (value === cur.value) return { node: cur, path };
      cur = value < cur.value ? cur.left : cur.right;
    }
    return { node: null, path };
  };

  const seed = (value: number) => {
    if (!root) {
      root = makeNode(value);
      return;
    }
    let cur = root;
    while (true) {
      if (value < cur.value) {
        if (!cur.left) {
          cur.left = makeNode(value);
          return;
        }
        cur = cur.left;
      } else {
        if (!cur.right) {
          cur.right = makeNode(value);
          return;
        }
        cur = cur.right;
      }
    }
  };

  for (const v of initial) seed(v);

  yield emit('initial splay tree (seeded as BST — ops will splay)');

  for (const op of ops) {
    if (op.type === 'insert') {
      if (!root) {
        root = makeNode(op.value);
        yield emit(`insert ${op.value} — it becomes the root`, [], [root]);
        continue;
      }
      let cur: SNode | null = root;
      const path: SNode[] = [];
      while (cur) {
        path.push(cur);
        yield emit(`compare ${op.value} against ${cur.value}`, [cur]);
        if (op.value === cur.value) break;
        cur = op.value < cur.value ? cur.left : cur.right;
      }
      const parent = path[path.length - 1];
      if (op.value === parent.value) {
        yield* splay([...path]);
        yield emit(`${op.value} already present — splayed to root`, [], [root as SNode]);
        continue;
      }
      const node = makeNode(op.value);
      if (op.value < parent.value) parent.left = node;
      else parent.right = node;
      yield emit(`insert ${op.value} under ${parent.value}`, [parent], [node]);
      yield* splay([...path, node]);
      yield emit(`${op.value} splayed to root`, [], [root as SNode]);
    } else if (op.type === 'search') {
      if (!root) {
        yield emit('tree is empty — nothing to find');
        continue;
      }
      let cur: SNode | null = root;
      const path: SNode[] = [];
      let found: SNode | null = null;
      while (cur) {
        path.push(cur);
        yield emit(`search for ${op.value} — at ${cur.value}`, [cur]);
        if (cur.value === op.value) {
          found = cur;
          break;
        }
        cur = op.value < cur.value ? cur.left : cur.right;
      }
      yield* splay(found ? [...path] : path);
      if (found) yield emit(`found ${op.value} — splayed to root`, [], [root as SNode]);
      else yield emit(`${op.value} is not in the tree — last access splayed to root`);
    } else if (op.type === 'delete') {
      if (!root) {
        yield emit('tree is empty — nothing to delete');
        continue;
      }
      const { node, path } = findWithPath(op.value);
      if (!node) {
        for (const n of path) yield emit(`search for ${op.value} to delete — at ${n.value}`, [n]);
        yield* splay([...path]);
        yield emit(`${op.value} is not in the tree`);
        continue;
      }
      for (const n of path) yield emit(`search for ${op.value} to delete — at ${n.value}`, [n]);
      yield* splay([...path]);
      const target = root as SNode;
      if (!target.left) {
        root = target.right;
        yield emit(`remove ${op.value} — replace root with right subtree`);
      } else if (!target.right) {
        root = target.left;
        yield emit(`remove ${op.value} — replace root with left subtree`);
      } else {
        const left = target.left;
        const maxPath: SNode[] = [];
        let cur: SNode | null = left;
        while (cur) {
          maxPath.push(cur);
          cur = cur.right;
        }
        const max = maxPath[maxPath.length - 1];
        // Splay max within the left subtree, then attach right subtree.
        root = left;
        yield* splay([...maxPath]);
        (root as SNode).right = target.right;
        yield emit(
          `remove ${op.value} — join: max of left (${max.value}) becomes root`,
          [],
          [root as SNode],
        );
      }
    } else {
      if (!root) {
        yield emit('tree is empty — nothing to traverse');
        continue;
      }
      const order = op.order;
      const seq: number[] = [];
      const visited: SNode[] = [];
      const noteOf = (node: SNode) =>
        `${order}-order visit ${node.value} — sequence: [${seq.join(', ')}]`;
      const push = function* (node: SNode): Generator<DSState> {
        seq.push(node.value);
        yield emit(noteOf(node), [], [node], visited);
        visited.push(node);
      };
      const walk = function* (node: SNode): Generator<DSState> {
        if (order === 'pre') yield* push(node);
        if (node.left) yield* walk(node.left);
        if (order === 'in') yield* push(node);
        if (node.right) yield* walk(node.right);
        if (order === 'post') yield* push(node);
      };
      yield emit(`${order}-order traversal of the splay tree`, []);
      yield* walk(root);
      yield emit(`${order}-order result: [${seq.join(', ')}]`, []);
    }
  }
}

import type { DSState } from './engine';

export type TreeOp =
  | { type: 'insert'; value: number }
  | { type: 'search'; value: number }
  | { type: 'delete'; value: number }
  | { type: 'traverse'; order: 'in' | 'pre' | 'post' };

interface BNode {
  id: number;
  value: number;
  left: BNode | null;
  right: BNode | null;
}

export function* bstScript(initial: number[], ops: TreeOp[]): Generator<DSState> {
  let root: BNode | null = null;
  let nextId = 0;
  const makeNode = (value: number): BNode => ({ id: nextId++, value, left: null, right: null });

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
      const visit = (n: BNode): number => {
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
    highlight: BNode[] = [],
    active: BNode[] = [],
    done: BNode[] = [],
  ): DSState {
    const s = snapshot();
    const highlighted = highlight
      .map((n) => s.indexOf.get(n.id))
      .filter((i): i is number => i !== undefined);
    const activeIdx = active
      .map((n) => s.indexOf.get(n.id))
      .filter((i): i is number => i !== undefined);
    const doneIdx = done
      .map((n) => s.indexOf.get(n.id))
      .filter((i): i is number => i !== undefined);
    const labels: Record<number, string[]> = {};
    if (s.root >= 0) labels[s.root] = ['root'];
    return {
      values: s.values,
      highlighted,
      active: activeIdx,
      done: doneIdx,
      labels,
      note,
      root: s.root,
      children: s.children,
      treeLayout: 'binary',
    };
  }

  yield emit('initial binary search tree');
  for (const op of ops) {
    switch (op.type) {
      case 'insert': {
        if (!root) {
          root = makeNode(op.value);
          yield emit(`insert ${op.value} — it becomes the root`, [], [root]);
          break;
        }
        let cur: BNode | null = root;
        while (cur) {
          yield emit(`compare ${op.value} against ${cur.value}`, [cur]);
          if (op.value < cur.value) {
            if (!cur.left) {
              cur.left = makeNode(op.value);
              yield emit(`insert ${op.value} as the left child of ${cur.value}`, [cur], [cur.left]);
              break;
            }
            cur = cur.left;
          } else {
            if (!cur.right) {
              cur.right = makeNode(op.value);
              yield emit(
                `insert ${op.value} as the right child of ${cur.value}`,
                [cur],
                [cur.right],
              );
              break;
            }
            cur = cur.right;
          }
        }
        break;
      }
      case 'search': {
        if (!root) {
          yield emit('tree is empty — nothing to find', []);
          break;
        }
        let cur: BNode | null = root;
        let depth = 0;
        while (cur) {
          yield emit(`search for ${op.value} — at ${cur.value}`, [cur]);
          if (cur.value === op.value) {
            yield emit(`found ${op.value} at depth ${depth}`, [cur]);
            break;
          }
          cur = op.value < cur.value ? cur.left : cur.right;
          depth++;
        }
        if (!cur) yield emit(`${op.value} is not in the tree`, []);
        break;
      }
      case 'delete': {
        if (!root) {
          yield emit('tree is empty — nothing to delete', []);
          break;
        }
        let parent: BNode | null = null;
        let cur: BNode | null = root;
        while (cur && cur.value !== op.value) {
          yield emit(`search for ${op.value} to delete — at ${cur.value}`, [cur]);
          parent = cur;
          cur = op.value < cur.value ? cur.left : cur.right;
        }
        if (!cur) {
          yield emit(`${op.value} is not in the tree`, []);
          break;
        }
        const target: BNode = cur;
        yield emit(`found ${op.value} — deleting it`, [target]);
        if (!target.left && !target.right) {
          if (!parent) root = null;
          else if (parent.left === target) parent.left = null;
          else parent.right = null;
          yield emit(`remove ${op.value} — it is a leaf`, []);
        } else if (target.left || target.right) {
          const child = target.left ?? target.right;
          if (child) {
            if (!parent) root = child;
            else if (parent.left === target) parent.left = child;
            else parent.right = child;
            yield emit(`remove ${op.value} — splice in its only child ${child.value}`, [], [child]);
          }
        } else {
          const rightChild = target.right;
          if (rightChild) {
            let succParent = target;
            let succ: BNode = rightChild;
            while (succ.left) {
              yield emit(`hunt for the in-order successor — at ${succ.value}`, [succ]);
              succParent = succ;
              succ = succ.left;
            }
            yield emit(
              `successor ${succ.value} takes the place of ${target.value}`,
              [succ],
              [target],
            );
            target.value = succ.value;
            if (succParent.left === succ) succParent.left = succ.right;
            else succParent.right = succ.right;
            yield emit(
              `copy ${succ.value} over ${op.value} and drop the old successor`,
              [],
              [target],
            );
          }
        }
        break;
      }
      case 'traverse': {
        if (!root) {
          yield emit('tree is empty — nothing to traverse', []);
          break;
        }
        const order = op.order;
        const formula = {
          in: 'left → root → right',
          pre: 'root → left → right',
          post: 'left → right → root',
        }[order];
        const useCase = {
          in: 'useful: a BST visited in-order yields its values in sorted order',
          pre: 'useful: serializing or copying a tree — the order preserves its structure',
          post: 'useful: deleting a tree bottom-up and evaluating postfix expressions',
        }[order];
        const seq: number[] = [];
        const visited: BNode[] = [];
        const note = (node: BNode) =>
          `${order}-order visit ${node.value} — sequence: [${seq.join(', ')}]`;
        const push = (node: BNode): Generator<DSState> =>
          (function* () {
            seq.push(node.value);
            yield emit(note(node), [], [node], visited);
            visited.push(node);
          })();
        const walk = (node: BNode): Generator<DSState> =>
          (function* () {
            if (order === 'pre') yield* push(node);
            if (node.left) yield* walk(node.left);
            if (order === 'in') yield* push(node);
            if (node.right) yield* walk(node.right);
            if (order === 'post') yield* push(node);
          })();
        yield emit(`${order}-order: ${formula}. ${useCase}`, []);
        yield* walk(root);
        yield emit(`${order}-order result: [${seq.join(', ')}] — ${useCase}`, []);
        break;
      }
    }
  }
}

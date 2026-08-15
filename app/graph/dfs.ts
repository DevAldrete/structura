import type { NodeVariant } from '~/components/models/StructCanvas';
import { neighbors, type GraphRunner } from './graph';

export const dfs: GraphRunner = function* (g, start) {
  const visited = new Set<number>();
  const stack: number[] = [start];
  const order: number[] = [];

  yield {
    nodeVariant: { [start]: 'active' },
    edgeVariant: {},
    labels: {},
    note: `start at node ${start} — push it`,
  };

  while (stack.length > 0) {
    const cur = stack.pop();
    if (cur === undefined) break;
    if (visited.has(cur)) continue;
    visited.add(cur);
    order.push(cur);
    const nv: Record<number, NodeVariant> = {};
    for (const id of visited) nv[id] = 'done';
    for (const s of stack) nv[s] = 'highlight';
    nv[cur] = 'active';
    yield {
      nodeVariant: nv,
      edgeVariant: {},
      labels: {},
      note: `pop ${cur} — stack: [${stack.join(', ')}]`,
    };
    const nbs = neighbors(g, cur);
    for (let i = nbs.length - 1; i >= 0; i--) {
      const nb = nbs[i];
      if (visited.has(nb)) continue;
      stack.push(nb);
      const nv2: Record<number, NodeVariant> = { ...nv, [nb]: 'highlight' };
      yield { nodeVariant: nv2, edgeVariant: {}, labels: {}, note: `push ${nb} onto the stack` };
    }
  }

  const nv: Record<number, NodeVariant> = {};
  for (const id of visited) nv[id] = 'done';
  yield {
    nodeVariant: nv,
    edgeVariant: {},
    labels: {},
    note: `done — visited ${order.join(' → ')}`,
  };
};

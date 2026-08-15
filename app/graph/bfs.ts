import type { NodeVariant } from '~/components/models/StructCanvas';
import { neighbors, type GraphRunner } from './graph';

export const bfs: GraphRunner = function* (g, start) {
  const visited = new Set<number>();
  const queue: number[] = [start];
  const order: number[] = [];
  visited.add(start);

  const nodesOf = (cur: number) => {
    const nv: Record<number, NodeVariant> = {};
    for (const id of visited) nv[id] = 'done';
    for (const q of queue) nv[q] = 'highlight';
    nv[cur] = 'active';
    return nv;
  };

  yield {
    nodeVariant: nodesOf(start),
    edgeVariant: {},
    labels: {},
    note: `start at node ${start} — enqueue it`,
  };

  while (queue.length > 0) {
    const cur = queue.shift();
    if (cur === undefined) break;
    order.push(cur);
    yield {
      nodeVariant: nodesOf(cur),
      edgeVariant: {},
      labels: {},
      note: `dequeue ${cur} — queue: [${queue.join(', ')}]`,
    };
    for (const nb of neighbors(g, cur)) {
      if (visited.has(nb)) continue;
      visited.add(nb);
      queue.push(nb);
      yield {
        nodeVariant: nodesOf(cur),
        edgeVariant: {},
        labels: {},
        note: `discover ${nb} from ${cur} — enqueue it`,
      };
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

import type { EdgeVariant, NodeVariant } from '~/components/models/StructCanvas';
import { edgeIndex, type GraphRunner } from './graph';

export const dijkstra: GraphRunner = function* (g, start) {
  const n = g.values.length;
  const dist: number[] = new Array(n).fill(Infinity);
  const parent: (number | null)[] = new Array(n).fill(null);
  const done = new Set<number>();
  dist[start] = 0;

  const labelsOf = (): Record<number, string[]> => {
    const l: Record<number, string[]> = {};
    for (let i = 0; i < n; i++) if (Number.isFinite(dist[i])) l[i] = [`d=${dist[i]}`];
    return l;
  };

  const nodesOf = (cur: number | null) => {
    const nv: Record<number, NodeVariant> = {};
    for (const d of done) nv[d] = 'done';
    if (cur !== null) nv[cur] = 'active';
    return nv;
  };

  yield {
    nodeVariant: { [start]: 'active' },
    edgeVariant: {},
    labels: { [start]: ['d=0'] },
    note: `start at node ${start} — dist[${start}] = 0`,
  };

  while (done.size < n) {
    let best = -1;
    let bestD = Infinity;
    for (let i = 0; i < n; i++) {
      if (!done.has(i) && dist[i] < bestD) {
        best = i;
        bestD = dist[i];
      }
    }
    if (best < 0) break;
    done.add(best);
    yield {
      nodeVariant: nodesOf(best),
      edgeVariant: {},
      labels: labelsOf(),
      note: `finalize node ${best} — shortest distance ${bestD}`,
    };

    for (let i = 0; i < g.edges.length; i++) {
      const e = g.edges[i];
      if (e.from !== best || done.has(e.to)) continue;
      const w = e.weight ?? 1;
      if (dist[best] + w < dist[e.to]) {
        dist[e.to] = dist[best] + w;
        parent[e.to] = best;
        yield {
          nodeVariant: nodesOf(best),
          edgeVariant: { [i]: 'active' },
          labels: labelsOf(),
          note: `relax ${best} → ${e.to} (w ${w}) — dist[${e.to}] = ${dist[e.to]}`,
        };
      } else {
        yield {
          nodeVariant: nodesOf(best),
          edgeVariant: { [i]: 'highlight' },
          labels: labelsOf(),
          note: `edge ${best} → ${e.to} (w ${w}) does not improve dist[${e.to}]`,
        };
      }
    }
  }

  const ev: Record<number, EdgeVariant> = {};
  for (let i = 0; i < n; i++) {
    const p = parent[i];
    if (p !== null) {
      const idx = edgeIndex(g, p, i);
      if (idx >= 0) ev[idx] = 'highlight';
    }
  }
  const nv: Record<number, NodeVariant> = {};
  for (const d of done) nv[d] = 'done';
  yield {
    nodeVariant: nv,
    edgeVariant: ev,
    labels: labelsOf(),
    note: `done — the shortest path tree is highlighted`,
  };
};

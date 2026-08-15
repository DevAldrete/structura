import type { Position } from '~/components/models/position';
import type { EdgeVariant, NodeVariant } from '~/components/models/StructCanvas';
import type { GraphEdge } from '~/ds/engine';
import { CANVAS_HEIGHT, CANVAS_WIDTH } from '~/components/models/size';

export interface GraphData {
  values: number[];
  positions: Record<number, Position>;
  edges: GraphEdge[];
  directed: boolean;
}

export interface GraphStep {
  nodeVariant: Record<number, NodeVariant>;
  edgeVariant: Record<number, EdgeVariant>;
  labels: Record<number, string[]>;
  note: string;
}

export type GraphRunner = (g: GraphData, start: number) => Generator<GraphStep>;

export function circlePositions(
  n: number,
  width: number,
  height: number,
): Record<number, Position> {
  const pos: Record<number, Position> = {};
  const cx = width / 2;
  const cy = height / 2;
  const r = Math.min(width, height) / 2 - 50;
  for (let i = 0; i < n; i++) {
    const a = (i / Math.max(n, 1)) * Math.PI * 2 - Math.PI / 2;
    pos[i] = { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  }
  return pos;
}

export function randomGraph(n = 6, directed = true): GraphData {
  const values = Array.from({ length: n }, () => 1 + Math.floor(Math.random() * 99));
  const edges: GraphEdge[] = [];
  for (let i = 1; i < n; i++) {
    edges.push({ from: i - 1, to: i, weight: 1 + Math.floor(Math.random() * 9) });
  }
  const extra = 2 + Math.floor(Math.random() * 2);
  for (let e = 0; e < extra; e++) {
    const u = Math.floor(Math.random() * n);
    const v = (u + 1 + Math.floor(Math.random() * (n - 1))) % n;
    if (edgeIndex({ values, positions: {}, edges, directed }, u, v) < 0) {
      edges.push({ from: u, to: v, weight: 1 + Math.floor(Math.random() * 9) });
    }
  }
  return {
    values,
    positions: circlePositions(n, CANVAS_WIDTH, CANVAS_HEIGHT),
    edges,
    directed,
  };
}

export function neighbors(g: GraphData, u: number): number[] {
  const out: number[] = [];
  for (const e of g.edges) {
    if (e.from === u) out.push(e.to);
    else if (!g.directed && e.to === u) out.push(e.from);
  }
  return out;
}

export function edgeIndex(g: GraphData, from: number, to: number): number {
  return g.edges.findIndex((e) => e.from === from && e.to === to);
}

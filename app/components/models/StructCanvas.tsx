import { useId } from 'react';
import { motion } from 'motion/react';
import type { Position } from './position';
import type { Arrows } from '~/ds';
import type { GraphEdge, Value } from '~/ds/engine';

export type NodeVariant = 'idle' | 'highlight' | 'active' | 'done';
export type EdgeVariant = 'idle' | 'highlight' | 'active';

export interface CanvasState {
  values: Value[];
  variant: Record<number, NodeVariant>;
  labels: Record<number, string[]>;
  root?: number;
  children?: Record<number, number[]>;
  treeLayout?: 'binary' | 'span';
  positions?: Record<number, Position>;
  edges?: GraphEdge[];
  directed?: boolean;
  edgeVariant?: Record<number, EdgeVariant>;
}

const NODE = 44;
const PAD = 30;

interface RenderEdge {
  from: Position;
  to: Position;
  back: boolean;
  dashed: boolean;
  marker: boolean;
  variant: EdgeVariant;
  weight?: number;
}

interface Props {
  state: CanvasState;
  width: number;
  height: number;
  layout: 'row' | 'column' | 'tree' | 'graph';
  arrows: Arrows;
  wrap: boolean;
}

function shrink(from: Position, to: Position, r: number): [Position, Position] {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.hypot(dx, dy);
  if (len === 0) return [from, to];
  const ux = dx / len;
  const uy = dy / len;
  return [
    { x: from.x + ux * r, y: from.y + uy * r },
    { x: to.x - ux * r, y: to.y - uy * r },
  ];
}

function layoutPositions(count: number, width: number, height: number, layout: 'row' | 'column') {
  const positions: Position[] = [];
  if (count === 0) return positions;
  const dim = layout === 'row' ? width : height;
  const gap = Math.min(60, (dim - 40) / count);
  const start = (dim - gap * (count - 1)) / 2;
  for (let i = 0; i < count; i++) {
    if (layout === 'row') {
      positions.push({ x: start + gap * i, y: height / 2 });
    } else {
      positions.push({ x: width / 2, y: start + gap * i });
    }
  }
  return positions;
}

function nodeSizeFor(gap: number): number {
  return Math.max(20, Math.min(NODE, gap * 0.9));
}

function treePositions(
  root: number,
  children: Record<number, number[]>,
  width: number,
  height: number,
  mode: 'binary' | 'span',
): Record<number, Position> {
  const pos: Record<number, Position> = {};
  const depth: Record<number, number> = {};
  depth[root] = 0;
  let maxDepth = 0;
  const queue: number[] = [root];
  for (const id of queue) {
    maxDepth = Math.max(maxDepth, depth[id]);
    for (const c of children[id] ?? []) {
      depth[c] = depth[id] + 1;
      queue.push(c);
    }
  }
  let slot = 0;
  const walk = (id: number) => {
    const kids = children[id] ?? [];
    if (mode === 'binary') {
      if (kids[0] !== undefined) walk(kids[0]);
      pos[id] = { x: slot, y: depth[id] };
      slot++;
      if (kids[1] !== undefined) walk(kids[1]);
      return;
    }
    if (kids.length === 0) {
      pos[id] = { x: slot, y: depth[id] };
      slot++;
      return;
    }
    for (const k of kids) walk(k);
    const xs = kids.map((k) => pos[k].x);
    pos[id] = { x: (Math.min(...xs) + Math.max(...xs)) / 2, y: depth[id] };
  };
  if (root !== undefined) walk(root);
  const maxX = slot - 1;
  const innerW = Math.max(1, width - PAD * 2);
  const innerH = Math.max(1, height - PAD * 2);
  for (const key in pos) {
    const p = pos[key];
    pos[key] = {
      x: PAD + (maxX > 0 ? (p.x / maxX) * innerW : innerW / 2),
      y: PAD + (maxDepth > 0 ? (p.y / maxDepth) * innerH : innerH / 2),
    };
  }
  return pos;
}

export function StructCanvas({ state, width, height, layout, arrows, wrap }: Props) {
  const markerId = useId();
  const head = markerId.replace(/:/g, '');
  const arrowFwd = `arrow-${head}`;
  const arrowBack = `arrow-back-${head}`;

  const n = state.values.length;
  const edges: RenderEdge[] = [];
  let positions: Record<number, Position> = {};
  let size = NODE;

  if (layout === 'row' || layout === 'column') {
    const list = layoutPositions(n, width, height, layout);
    positions = Object.fromEntries(list.map((p, i) => [i, p]));
    const dim = layout === 'row' ? width : height;
    const gap = n > 1 ? Math.min(60, (dim - 40) / n) : 60;
    size = nodeSizeFor(gap);
    const marker = arrows !== 'none';
    for (let i = 0; i < n - 1; i++) {
      edges.push({
        from: list[i],
        to: list[i + 1],
        back: arrows === 'both',
        dashed: false,
        marker,
        variant: 'idle',
      });
    }
    if (wrap && n > 1) {
      edges.push({
        from: list[n - 1],
        to: list[0],
        back: false,
        dashed: true,
        marker,
        variant: 'idle',
      });
    }
  } else if (layout === 'tree' && n > 0 && state.root !== undefined) {
    const mode = state.treeLayout ?? 'span';
    positions = treePositions(state.root, state.children ?? {}, width, height, mode);
    const xs = Object.values(positions).map((p) => p.x);
    const ys = Object.values(positions).map((p) => p.y);
    const xGap =
      xs.length > 1 ? (Math.max(...xs) - Math.min(...xs)) / Math.max(xs.length - 1, 1) : Infinity;
    const levels = Array.from(new Set(ys.map((y) => Math.round(y)))).sort((a, b) => a - b);
    const yGap =
      levels.length > 1 ? (levels[levels.length - 1] - levels[0]) / (levels.length - 1) : Infinity;
    size = Math.min(NODE, Math.max(18, Math.min(xGap, yGap) * 0.8));
    const children = state.children ?? {};
    for (const id in children) {
      const f = positions[Number(id)];
      for (const c of children[id]) {
        const t = positions[c];
        if (f && t)
          edges.push({
            from: f,
            to: t,
            back: false,
            dashed: false,
            marker: false,
            variant: 'idle',
          });
      }
    }
  } else if (layout === 'graph') {
    const ps = state.positions ?? {};
    for (const key in ps) positions[Number(key)] = ps[Number(key)];
    const ev = state.edgeVariant ?? {};
    (state.edges ?? []).forEach((e, i) => {
      const f = ps[e.from];
      const t = ps[e.to];
      if (!f || !t) return;
      const v = ev[i] ?? 'idle';
      edges.push({
        from: f,
        to: t,
        back: false,
        dashed: v === 'highlight',
        marker: !!state.directed,
        variant: v,
        weight: e.weight,
      });
    });
  }

  const stroke = 'currentColor';

  return (
    <div className="relative border border-gray-200 dark:border-gray-800" style={{ width, height }}>
      <svg className="absolute inset-0" width={width} height={height}>
        <defs>
          <marker
            id={arrowFwd}
            markerWidth="8"
            markerHeight="8"
            refX="8"
            refY="3"
            orient="auto"
            markerUnits="userSpaceOnUse"
          >
            <path d="M0,0 L0,6 L8,3 z" fill="currentColor" opacity={0.4} />
          </marker>
          <marker
            id={arrowBack}
            markerWidth="8"
            markerHeight="8"
            refX="0"
            refY="3"
            orient="auto"
            markerUnits="userSpaceOnUse"
          >
            <path d="M8,0 L8,6 L0,3 z" fill="currentColor" opacity={0.4} />
          </marker>
        </defs>
        {edges.map((edge, i) => {
          const [f, t] = shrink(edge.from, edge.to, size / 2);
          const style =
            edge.variant === 'active'
              ? { strokeWidth: 2.5, opacity: 1 }
              : edge.variant === 'highlight'
                ? { strokeWidth: 2, opacity: 0.8 }
                : { strokeWidth: 1.5, opacity: edge.dashed ? 0.15 : 0.35 };
          return (
            <g key={i}>
              <motion.line
                x1={f.x}
                y1={f.y}
                x2={t.x}
                y2={t.y}
                stroke={stroke}
                strokeWidth={style.strokeWidth}
                strokeDasharray={edge.dashed ? '4 4' : undefined}
                initial={{ x1: f.x, y1: f.y, x2: f.x, y2: f.y, opacity: 0 }}
                animate={{ x1: f.x, y1: f.y, x2: t.x, y2: t.y, opacity: style.opacity }}
                transition={{ duration: 0.25 }}
                markerEnd={edge.marker ? `url(#${arrowFwd})` : undefined}
                markerStart={edge.back ? `url(#${arrowBack})` : undefined}
              />
              {edge.weight !== undefined && (
                <text
                  x={(f.x + t.x) / 2}
                  y={(f.y + t.y) / 2 - 6}
                  className="fill-current"
                  fontSize={10}
                  fontFamily="monospace"
                  textAnchor="middle"
                  opacity={0.6}
                >
                  {edge.weight}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {state.values.map((value, i) => {
        const pos = positions[i];
        if (!pos) return null;
        const variant = state.variant[i] ?? 'idle';
        const labels = state.labels[i] ?? [];
        const multi = Array.isArray(value);
        const keys = multi ? (value as number[]) : null;
        const w = multi ? Math.max(size, (keys?.length ?? 0) * Math.max(20, size * 0.55)) : size;
        const h = size;
        const fontSize = multi
          ? Math.min(12, Math.max(9, size * 0.32))
          : Math.min(14, Math.max(10, size * 0.42));
        const cls =
          variant === 'active'
            ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-black'
            : variant === 'highlight'
              ? 'border-black bg-white text-black dark:border-white dark:bg-black dark:text-white'
              : variant === 'done'
                ? 'border-gray-400 bg-gray-100 text-gray-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-400'
                : 'border-gray-300 bg-white text-gray-500 dark:border-gray-700 dark:bg-black dark:text-gray-400';
        return (
          <div key={i}>
            {labels.length > 0 && (
              <div
                className="absolute text-[9px] font-mono uppercase tracking-wide pointer-events-none whitespace-nowrap"
                style={{
                  left: pos.x - 20,
                  top: pos.y - h / 2 - 14,
                  width: 40,
                  textAlign: 'center',
                  color: 'currentColor',
                  opacity: 0.6,
                }}
              >
                {labels.join(' ')}
              </div>
            )}
            <motion.div
              initial={{ opacity: 0, scale: 0.5, x: pos.x - w / 2, y: pos.y - h / 2 }}
              animate={{ opacity: 1, scale: 1, x: pos.x - w / 2, y: pos.y - h / 2 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              style={{ left: 0, top: 0, width: w, height: h, fontSize }}
              className={`absolute flex items-center justify-center font-mono font-bold border-2 transition-colors duration-200 ${multi ? 'rounded-md' : 'rounded-full'} ${cls}`}
            >
              {keys ? keys.join(' | ') : value}
            </motion.div>
          </div>
        );
      })}
    </div>
  );
}

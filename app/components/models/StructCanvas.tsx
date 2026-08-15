import { useId } from 'react';
import { motion } from 'motion/react';
import type { Position } from './position';
import type { Arrows } from '~/ds';

export type NodeVariant = 'idle' | 'highlight' | 'active';

export interface CanvasState {
  values: number[];
  variant: Record<number, NodeVariant>;
  labels: Record<number, string[]>;
}

const NODE = 44;

interface Props {
  state: CanvasState;
  width: number;
  height: number;
  layout: 'row' | 'column';
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

export function StructCanvas({ state, width, height, layout, arrows, wrap }: Props) {
  const markerId = useId();
  const head = markerId.replace(/:/g, '');
  const arrowFwd = `arrow-${head}`;
  const arrowBack = `arrow-back-${head}`;

  const n = state.values.length;
  const positions = layoutPositions(n, width, height, layout);
  const dim = layout === 'row' ? width : height;
  const gap = n > 1 ? Math.min(60, (dim - 40) / n) : 60;
  const size = nodeSizeFor(gap);

  const edges: { from: Position; to: Position; back: boolean; wrap: boolean }[] = [];
  for (let i = 0; i < n - 1; i++) {
    edges.push({ from: positions[i], to: positions[i + 1], back: arrows === 'both', wrap: false });
  }
  if (wrap && n > 1) {
    edges.push({ from: positions[n - 1], to: positions[0], back: false, wrap: true });
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
          return (
            <motion.line
              key={i}
              x1={f.x}
              y1={f.y}
              x2={t.x}
              y2={t.y}
              stroke={stroke}
              strokeWidth={1.5}
              strokeDasharray={edge.wrap ? '4 4' : undefined}
              initial={{ x1: f.x, y1: f.y, x2: f.x, y2: f.y, opacity: 0 }}
              animate={{ x1: f.x, y1: f.y, x2: t.x, y2: t.y, opacity: edge.wrap ? 0.15 : 0.35 }}
              transition={{ duration: 0.25 }}
              markerEnd={`url(#${arrowFwd})`}
              markerStart={edge.back ? `url(#${arrowBack})` : undefined}
            />
          );
        })}
      </svg>

      {state.values.map((value, i) => {
        const pos = positions[i];
        if (!pos) return null;
        const variant = state.variant[i] ?? 'idle';
        const labels = state.labels[i] ?? [];
        const fontSize = Math.min(14, Math.max(10, size * 0.42));
        const cls =
          variant === 'active'
            ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-black'
            : variant === 'highlight'
              ? 'border-black bg-white text-black dark:border-white dark:bg-black dark:text-white'
              : 'border-gray-300 bg-white text-gray-500 dark:border-gray-700 dark:bg-black dark:text-gray-400';
        return (
          <div key={i}>
            {labels.length > 0 && (
              <div
                className="absolute text-[9px] font-mono uppercase tracking-wide pointer-events-none whitespace-nowrap"
                style={{
                  left: pos.x - 20,
                  top: pos.y - size / 2 - 14,
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
              initial={{ opacity: 0, scale: 0.5, x: pos.x - size / 2, y: pos.y - size / 2 }}
              animate={{ opacity: 1, scale: 1, x: pos.x - size / 2, y: pos.y - size / 2 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              style={{ left: 0, top: 0, width: size, height: size, fontSize }}
              className={`absolute rounded-full flex items-center justify-center font-mono font-bold border-2 transition-colors duration-200 ${cls}`}
            >
              {value}
            </motion.div>
          </div>
        );
      })}
    </div>
  );
}

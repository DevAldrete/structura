import type { DiffStep } from '~/algos/myers_diff';

const CELL = 26;
const PAD = 24;

export function DiffCanvas({ a, b, step }: { a: string[]; b: string[]; step: DiffStep }) {
  const cols = a.length + 1;
  const rows = b.length + 1;
  const width = PAD * 2 + cols * CELL;
  const height = PAD * 2 + rows * CELL;
  const gx = (x: number) => PAD + x * CELL;
  const gy = (y: number) => PAD + y * CELL;

  const diags: { x1: number; y1: number; x2: number; y2: number }[] = [];
  for (let x = 1; x < cols; x++) {
    for (let y = 1; y < rows; y++) {
      if (a[x - 1] === b[y - 1]) {
        diags.push({ x1: gx(x - 1), y1: gy(y - 1), x2: gx(x), y2: gy(y) });
      }
    }
  }

  const points = step.path.map((p) => `${gx(p.x)},${gy(p.y)}`).join(' ');

  return (
    <div className="relative border border-gray-200 dark:border-gray-800" style={{ width, height }}>
      <svg className="absolute inset-0" width={width} height={height}>
        {Array.from({ length: cols }, (_, x) => (
          <line
            key={`v${x}`}
            x1={gx(x)}
            y1={PAD}
            x2={gx(x)}
            y2={PAD + rows * CELL}
            stroke="currentColor"
            strokeWidth={1}
            opacity={0.08}
          />
        ))}
        {Array.from({ length: rows }, (_, y) => (
          <line
            key={`h${y}`}
            x1={PAD}
            y1={gy(y)}
            x2={PAD + cols * CELL}
            y2={gy(y)}
            stroke="currentColor"
            strokeWidth={1}
            opacity={0.08}
          />
        ))}
        {diags.map((d, i) => (
          <line
            key={i}
            x1={d.x1}
            y1={d.y1}
            x2={d.x2}
            y2={d.y2}
            stroke="currentColor"
            strokeWidth={1.5}
            opacity={0.25}
          />
        ))}
        {a.map((ch, x) => (
          <text
            key={`a${x}`}
            x={gx(x) + CELL / 2}
            y={PAD / 2 + 8}
            className="fill-current"
            fontSize={12}
            fontFamily="monospace"
            textAnchor="middle"
            opacity={0.5}
          >
            {ch}
          </text>
        ))}
        {b.map((ch, y) => (
          <text
            key={`b${y}`}
            x={PAD / 2 - 2}
            y={gy(y) + CELL / 2 + 4}
            className="fill-current"
            fontSize={12}
            fontFamily="monospace"
            textAnchor="end"
            opacity={0.5}
          >
            {ch}
          </text>
        ))}
        {points !== '' && (
          <polyline
            points={points}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            opacity={0.9}
          />
        )}
        {step.cursor && (
          <circle cx={gx(step.cursor.x)} cy={gy(step.cursor.y)} r={5} fill="currentColor" />
        )}
      </svg>
    </div>
  );
}

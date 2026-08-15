import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router';
import { STRUCTURES, type DSOp, type StructureEntry } from '~/ds';
import { xorField } from '~/ds/lists';
import type { DSState } from '~/ds/engine';
import {
  StructCanvas,
  type CanvasState,
  type EdgeVariant,
  type NodeVariant,
} from '~/components/models/StructCanvas';
import { CANVAS_HEIGHT, CANVAS_WIDTH } from '~/components/models/size';
import { Playback } from '~/components/controls/Playback';
import { usePlayback } from '~/hooks/usePlayback';

function dsToCanvas(s: DSState, xor: boolean): CanvasState {
  const variant: Record<number, NodeVariant> = {};
  for (const i of s.highlighted) variant[i] = 'highlight';
  for (const i of s.active) variant[i] = 'active';

  const labels: Record<number, string[]> = {};
  for (const [k, ls] of Object.entries(s.labels)) {
    labels[Number(k)] = [...ls];
  }
  if (xor) {
    for (let i = 0; i < s.values.length; i++) {
      labels[i] = [...(labels[i] ?? []), `X${xorField(i, s.values.length)}`];
    }
  }

  const edgeVariant: Record<number, EdgeVariant> = {};
  for (const i of s.edgeHighlight ?? []) edgeVariant[i] = 'highlight';
  for (const i of s.edgeActive ?? []) edgeVariant[i] = 'active';

  return {
    values: s.values,
    variant,
    labels,
    root: s.root,
    children: s.children,
    treeLayout: s.treeLayout,
    positions: s.positions,
    edges: s.edges,
    directed: s.directed,
    edgeVariant,
  };
}

function toNum(raw: string): number {
  const n = Number(raw.trim());
  return Number.isFinite(n) ? n : 0;
}

export default function StructurePage() {
  const { slug } = useParams();
  const ds = slug ? STRUCTURES[slug] : undefined;

  if (!ds) {
    return (
      <div className="min-h-screen bg-white text-black flex flex-col items-center justify-center px-4 dark:bg-black dark:text-white">
        <h1 className="text-2xl font-mono font-bold tracking-tight mb-4">Unknown structure</h1>
        <Link
          to="/ds"
          className="text-xs font-mono text-gray-400 underline underline-offset-2 hover:text-black dark:hover:text-white"
        >
          &larr; back to data structures
        </Link>
      </div>
    );
  }

  return <StructureView key={ds.slug} ds={ds} />;
}

function StructureView({ ds }: { ds: StructureEntry }) {
  const [ops, setOps] = useState<DSOp[]>(ds.defaultOps);
  const [value, setValue] = useState('');
  const [index, setIndex] = useState('');
  const [speed, setSpeed] = useState(1);

  const steps = useMemo(() => [...ds.build(ops)], [ds, ops]);
  const playback = usePlayback(steps, { resetKey: ops, interval: 600 / speed });
  const step = steps[Math.min(playback.index, steps.length - 1)];

  const needsValue = ds.ops.some((o) => o.needsValue);
  const needsIndex = ds.ops.some((o) => o.needsIndex);
  const state = step ? dsToCanvas(step, ds.xor) : { values: [], variant: {}, labels: {} };

  const runOp = (build: (v: number, i: number) => DSOp) => {
    setOps((prev) => [...prev, build(toNum(value), toNum(index))]);
    if (needsValue) setValue('');
  };

  const resetScript = () => setOps([...ds.defaultOps]);

  const btn =
    'px-3 py-1 border border-gray-200 text-gray-400 hover:border-black hover:text-black transition-colors dark:border-gray-800 dark:hover:border-white dark:hover:text-white';

  return (
    <div className="min-h-screen bg-white text-black flex flex-col items-center justify-center px-4 dark:bg-black dark:text-white">
      <h1 className="text-2xl font-mono font-bold tracking-tight mb-1">{ds.name}</h1>
      <p className="text-sm text-gray-400 font-mono mb-6 text-center max-w-sm">{ds.desc}</p>

      {step && <p className="text-xs font-mono text-gray-400 mb-3 h-4">{step.note}</p>}

      <StructCanvas
        state={state}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        layout={ds.layout}
        arrows={ds.arrows}
        wrap={ds.wrap}
      />

      <Playback playback={playback} speed={speed} onSpeed={setSpeed} />

      <div className="flex flex-wrap items-end gap-2 mt-6 text-sm font-mono max-w-xl justify-center">
        {needsValue && (
          <label className="flex flex-col gap-1 text-[10px] uppercase tracking-wide text-gray-400">
            value
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-20 px-2 py-1 border border-gray-200 bg-transparent text-black placeholder-gray-400 focus:border-black outline-none dark:border-gray-800 dark:text-white dark:focus:border-white"
              placeholder="0"
              aria-label="value"
            />
          </label>
        )}
        {needsIndex && (
          <label className="flex flex-col gap-1 text-[10px] uppercase tracking-wide text-gray-400">
            index
            <input
              value={index}
              onChange={(e) => setIndex(e.target.value)}
              className="w-20 px-2 py-1 border border-gray-200 bg-transparent text-black placeholder-gray-400 focus:border-black outline-none dark:border-gray-800 dark:text-white dark:focus:border-white"
              placeholder="0"
              aria-label="index"
            />
          </label>
        )}
        {ds.ops.map((op) => (
          <button key={op.id} className={btn} onClick={() => runOp(op.build)}>
            {op.label}
          </button>
        ))}
        <button className={btn} onClick={resetScript}>
          reset script
        </button>
      </div>

      <Link
        to="/ds"
        className="mt-8 text-xs font-mono text-gray-400 underline underline-offset-2 hover:text-black dark:hover:text-white"
      >
        &larr; back
      </Link>
    </div>
  );
}

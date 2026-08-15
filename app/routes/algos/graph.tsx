import { useMemo, useState } from 'react';
import { StructCanvas, type CanvasState } from '~/components/models/StructCanvas';
import { CANVAS_HEIGHT, CANVAS_WIDTH } from '~/components/models/size';
import { Playback } from '~/components/controls/Playback';
import { Page } from '~/components/controls/Page';
import { usePlayback } from '~/hooks/usePlayback';
import { randomGraph } from '~/graph/graph';
import type { GraphAlgo } from '~/algos';

const btn =
  'px-3 py-1 border border-gray-200 text-gray-400 hover:border-black hover:text-black transition-colors dark:border-gray-800 dark:hover:border-white dark:hover:text-white';

export function GraphView({ algo }: { algo: GraphAlgo }) {
  const [graph, setGraph] = useState(() => randomGraph());
  const [start, setStart] = useState(algo.defaultStart);
  const [speed, setSpeed] = useState(1);

  const steps = useMemo(() => [...algo.run(graph, start)], [algo, graph, start]);
  const playback = usePlayback(steps, { resetKey: graph, interval: 600 / speed });
  const step = steps[Math.min(playback.index, steps.length - 1)];

  const state: CanvasState = step
    ? {
        values: graph.values,
        variant: step.nodeVariant,
        labels: step.labels,
        positions: graph.positions,
        edges: graph.edges,
        directed: graph.directed,
        edgeVariant: step.edgeVariant,
      }
    : { values: [], variant: {}, labels: {} };

  return (
    <Page title={algo.name} meta={algo.complexity} desc={algo.desc} backTo="/algos">
      {step && <p className="text-xs font-mono text-gray-400 mb-3 h-4">{step.note}</p>}

      <StructCanvas
        state={state}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        layout="graph"
        arrows="none"
        wrap={false}
      />

      <Playback playback={playback} speed={speed} onSpeed={setSpeed} />

      <div className="flex flex-wrap items-end gap-2 mt-6 text-sm font-mono justify-center">
        <label className="flex flex-col gap-1 text-[10px] uppercase tracking-wide text-gray-400">
          start node
          <select
            className="px-2 py-1 border border-gray-200 bg-transparent font-mono text-xs cursor-pointer dark:border-gray-800"
            value={start}
            onChange={(e) => setStart(Number(e.target.value))}
            aria-label="start node"
          >
            {graph.values.map((_, i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </select>
        </label>
        <button className={btn} onClick={() => setGraph(randomGraph())}>
          random graph
        </button>
      </div>

      <div className="flex gap-4 mt-8 text-xs font-mono text-gray-400 flex-wrap justify-center">
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-full border-2 border-gray-300 bg-white dark:border-gray-700 dark:bg-black" />{' '}
          idle
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-full border-2 border-black bg-white dark:border-white dark:bg-black" />{' '}
          frontier
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-full border-2 border-black bg-black dark:border-white dark:bg-white" />{' '}
          current
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-full border-2 border-gray-400 bg-gray-100 dark:border-gray-600 dark:bg-gray-900" />{' '}
          visited
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-6 border-t-2 border-black dark:border-white" /> edge under
          focus
        </span>
      </div>
    </Page>
  );
}

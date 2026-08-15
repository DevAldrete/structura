import { useMemo, useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router';
import { ALGOS } from '~/algos';
import { collectSteps, type Step } from '~/components/engine/engine';
import { StructCanvas, type CanvasState, type NodeVariant } from '~/components/models/StructCanvas';
import { Playback } from '~/components/controls/Playback';
import { usePlayback } from '~/hooks/usePlayback';

const WIDTH = 500;
const HEIGHT = 200;
const MAX_NODES = 10;
const DEFAULT_DATA = [64, 34, 25, 12, 22, 11, 90];

function parseInput(text: string): number[] | null {
  const values = text
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .map((s) => Number(s))
    .filter((v) => Number.isFinite(v) && v >= 0);
  if (values.length === 0) return null;
  return values.slice(0, MAX_NODES);
}

function randomData(): number[] {
  const n = 5 + Math.floor(Math.random() * 4);
  return Array.from({ length: n }, () => Math.floor(Math.random() * 90) + 10);
}

function stepToCanvas(step: Step): CanvasState {
  const variant: Record<number, NodeVariant> = {};
  if (step.compare) for (const i of step.compare) variant[i] = 'highlight';
  if (step.swapping) for (const i of step.swapping) variant[i] = 'active';
  if (step.written) variant[step.written.index] = 'active';
  return { values: step.array, variant, labels: {} };
}

function stepNote(step: Step): string {
  if (step.swapping) {
    const [a, b] = step.swapping;
    return `swap values at ${a} and ${b}`;
  }
  if (step.compare) {
    const [a, b] = step.compare;
    return `compare values at ${a} and ${b}`;
  }
  if (step.written) {
    return `write ${step.written.value} at index ${step.written.index}`;
  }
  return 'done';
}

export default function AlgoPage() {
  const { slug } = useParams();
  const algo = slug ? ALGOS[slug] : undefined;

  const [text, setText] = useState(DEFAULT_DATA.join(', '));
  const [dataset, setDataset] = useState<number[]>(DEFAULT_DATA);
  const [speed, setSpeed] = useState(1);

  const steps = useMemo(() => (algo ? collectSteps(dataset, algo.run) : []), [dataset, algo]);
  const playback = usePlayback(steps, { resetKey: dataset, interval: 600 / speed });
  const step = steps[Math.min(playback.index, steps.length - 1)];

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const parsed = parseInput(text);
    if (parsed) setDataset(parsed);
    else setText(dataset.join(', '));
  };

  const onRandom = () => {
    const data = randomData();
    setDataset(data);
    setText(data.join(', '));
  };

  if (!algo) {
    return (
      <div className="min-h-screen bg-white text-black flex flex-col items-center justify-center px-4 dark:bg-black dark:text-white">
        <h1 className="text-2xl font-mono font-bold tracking-tight mb-4">Unknown algorithm</h1>
        <Link
          to="/algos"
          className="text-xs font-mono text-gray-400 underline underline-offset-2 hover:text-black dark:hover:text-white"
        >
          &larr; back to algorithms
        </Link>
      </div>
    );
  }

  const state = step ? stepToCanvas(step) : { values: [], variant: {}, labels: {} };

  return (
    <div className="min-h-screen bg-white text-black flex flex-col items-center justify-center px-4 dark:bg-black dark:text-white">
      <h1 className="text-2xl font-mono font-bold tracking-tight mb-1">{algo.name}</h1>
      <p className="text-sm text-gray-400 font-mono mb-1">{algo.complexity}</p>
      <p className="text-xs text-gray-400 font-mono mb-6 text-center max-w-sm">{algo.desc}</p>

      {step && <p className="text-xs font-mono text-gray-400 mb-3 h-4">{stepNote(step)}</p>}

      <StructCanvas
        state={state}
        width={WIDTH}
        height={HEIGHT}
        layout="row"
        arrows="none"
        wrap={false}
      />

      <Playback playback={playback} speed={speed} onSpeed={setSpeed} />

      <form onSubmit={onSubmit} className="flex items-center gap-2 mt-6 text-sm font-mono">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-64 px-3 py-1 border border-gray-200 bg-transparent text-black placeholder-gray-400 focus:border-black outline-none dark:border-gray-800 dark:text-white dark:focus:border-white"
          placeholder="e.g. 64, 34, 25, 12, 22, 11"
          aria-label="array values"
        />
        <button
          type="submit"
          className="px-3 py-1 border border-black text-black hover:bg-black hover:text-white transition-colors dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-black"
        >
          sort
        </button>
        <button
          type="button"
          onClick={onRandom}
          className="px-3 py-1 border border-gray-200 text-gray-400 hover:border-black hover:text-black transition-colors dark:border-gray-800 dark:hover:border-white dark:hover:text-white"
        >
          random
        </button>
      </form>

      <div className="flex gap-4 mt-8 text-xs font-mono text-gray-400">
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-full border-2 border-gray-300 bg-white dark:border-gray-700 dark:bg-black" />{' '}
          idle
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-full border-2 border-black bg-white dark:border-white dark:bg-black" />{' '}
          compare
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-full border-2 border-black bg-black dark:border-white dark:bg-white" />{' '}
          swap / write
        </span>
      </div>

      <Link
        to="/algos"
        className="mt-8 text-xs font-mono text-gray-400 underline underline-offset-2 hover:text-black dark:hover:text-white"
      >
        &larr; back
      </Link>
    </div>
  );
}

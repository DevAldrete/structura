import { useMemo, useState, useEffect } from 'react';
import { bubbleSort } from '~/algos/bubble_sort';
import { collectSteps, getNodePositions } from '~/components/engine/engine';
import { Node } from '~/components/models/Node';

const DATA = [64, 34, 25, 12, 22, 11, 90];
const INTERVAL = 600;
const WIDTH = 500;
const HEIGHT = 200;

export default function BubbleSortPage() {
  const steps = useMemo(() => collectSteps(DATA, () => bubbleSort(DATA)), []);
  const [index, setIndex] = useState(0);
  const step = steps[index] ?? steps[steps.length - 1];

  useEffect(() => {
    if (index >= steps.length - 1) return;
    const t = setTimeout(() => setIndex((i) => i + 1), INTERVAL);
    return () => clearTimeout(t);
  }, [index, steps.length]);

  const positions = useMemo(() => getNodePositions(step.array, WIDTH, HEIGHT), [step.array]);

  return (
    <div className="min-h-screen bg-white text-black flex flex-col items-center justify-center px-4 dark:bg-black dark:text-white">
      <h1 className="text-2xl font-mono font-bold tracking-tight mb-2">Bubble Sort</h1>
      <p className="text-sm text-gray-400 font-mono mb-8">
        step {Math.min(index + 1, steps.length)} / {steps.length}
      </p>

      <div
        className="relative border border-gray-200 dark:border-gray-800"
        style={{ width: WIDTH, height: HEIGHT }}
      >
        {step.array.map((val, i) => {
          const [c0, c1] = step.compare ?? [-1, -1];
          const [s0, s1] = step.swapping ?? [-1, -1];
          return (
            <Node
              key={val}
              id={`node-${val}`}
              value={val}
              pos={positions.get(i) ?? { x: 0, y: 0 }}
              highlighted={i === c0 || i === c1}
              swapping={i === s0 || i === s1}
            />
          );
        })}
      </div>

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
          swap
        </span>
      </div>

      <a
        href="/algos"
        className="mt-10 text-xs font-mono text-gray-400 underline underline-offset-2 hover:text-black dark:hover:text-white"
      >
        &larr; back
      </a>
    </div>
  );
}

import type { usePlayback } from '~/hooks/usePlayback';

const SPEEDS = [
  { label: '0.5x', value: 0.5 },
  { label: '1x', value: 1 },
  { label: '2x', value: 2 },
];

export function Playback({
  playback,
  speed,
  onSpeed,
}: {
  playback: ReturnType<typeof usePlayback>;
  speed: number;
  onSpeed: (s: number) => void;
}) {
  const { index, total, playing, toggle, stepForward, stepBack, reset } = playback;

  const btn =
    'px-2 py-1 border border-gray-200 font-mono text-xs hover:border-black transition-colors dark:border-gray-800 dark:hover:border-white';

  return (
    <div className="flex items-center gap-2 mt-8 text-gray-400">
      <button className={btn} onClick={reset} aria-label="reset">
        reset
      </button>
      <button className={btn} onClick={stepBack} aria-label="step back">
        &lsaquo;
      </button>
      <button
        className={`${btn} min-w-16 text-black dark:text-white`}
        onClick={toggle}
        aria-label={playing ? 'pause' : 'play'}
      >
        {playing ? 'pause' : 'play'}
      </button>
      <button className={btn} onClick={stepForward} aria-label="step forward">
        &rsaquo;
      </button>
      <span className="text-xs font-mono tabular-nums whitespace-nowrap">
        {Math.min(index + 1, total)} / {total}
      </span>
      <select
        className="px-2 py-1 border border-gray-200 font-mono text-xs bg-transparent cursor-pointer dark:border-gray-800"
        value={speed}
        onChange={(e) => onSpeed(Number(e.target.value))}
        aria-label="speed"
      >
        {SPEEDS.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
    </div>
  );
}

import { useMemo, useState, type FormEvent } from 'react';
import { DiffCanvas } from '~/components/models/DiffCanvas';
import { Playback } from '~/components/controls/Playback';
import { Page } from '~/components/controls/Page';
import { usePlayback } from '~/hooks/usePlayback';
import type { DiffAlgo } from '~/algos';

const MAX_TOKENS = 8;

function tokenize(text: string): string[] {
  const t = text.trim();
  if (!t) return [];
  if (t.includes(',')) {
    const parts = t
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    return parts.length > 0 ? parts.slice(0, MAX_TOKENS) : Array.from(t.slice(0, MAX_TOKENS));
  }
  return Array.from(t.slice(0, MAX_TOKENS));
}

function randomPair(): { a: string[]; b: string[] } {
  const alphabet = 'ABC';
  const make = () =>
    Array.from(
      { length: 5 + Math.floor(Math.random() * 4) },
      () => alphabet[Math.floor(Math.random() * alphabet.length)],
    );
  return { a: make(), b: make() };
}

const inputCls =
  'w-40 px-3 py-1 border border-gray-200 bg-transparent text-black placeholder-gray-400 focus:border-black outline-none dark:border-gray-800 dark:text-white dark:focus:border-white';

export function DiffView({ algo }: { algo: DiffAlgo }) {
  const [aText, setAText] = useState('ABCABBA');
  const [bText, setBText] = useState('CBABAC');
  const [tokens, setTokens] = useState<{ a: string[]; b: string[] }>(() => ({
    a: tokenize('ABCABBA'),
    b: tokenize('CBABAC'),
  }));
  const [speed, setSpeed] = useState(1);

  const steps = useMemo(() => [...algo.run(tokens.a, tokens.b)], [algo, tokens]);
  const playback = usePlayback(steps, { resetKey: tokens, interval: 600 / speed });
  const step = steps[Math.min(playback.index, steps.length - 1)];

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setTokens({ a: tokenize(aText), b: tokenize(bText) });
  };

  const onRandom = () => {
    const pair = randomPair();
    setAText(pair.a.join(''));
    setBText(pair.b.join(''));
    setTokens(pair);
  };

  return (
    <Page title={algo.name} meta={algo.complexity} desc={algo.desc} backTo="/algos">
      {step && <p className="text-xs font-mono text-gray-400 mb-3 h-4">{step.note}</p>}

      {step && <DiffCanvas a={tokens.a} b={tokens.b} step={step} />}

      <Playback playback={playback} speed={speed} onSpeed={setSpeed} />

      <form
        onSubmit={onSubmit}
        className="flex flex-wrap items-end gap-2 mt-6 text-sm font-mono justify-center"
      >
        <label className="flex flex-col gap-1 text-[10px] uppercase tracking-wide text-gray-400">
          a
          <input
            value={aText}
            onChange={(e) => setAText(e.target.value)}
            className={inputCls}
            placeholder="e.g. ABCABBA"
            aria-label="sequence a"
          />
        </label>
        <label className="flex flex-col gap-1 text-[10px] uppercase tracking-wide text-gray-400">
          b
          <input
            value={bText}
            onChange={(e) => setBText(e.target.value)}
            className={inputCls}
            placeholder="e.g. CBABAC"
            aria-label="sequence b"
          />
        </label>
        <button
          type="submit"
          className="px-3 py-1 border border-black text-black hover:bg-black hover:text-white transition-colors dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-black"
        >
          diff
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
          <span className="inline-block w-4 border-t-2 border-gray-400" /> matching diagonal
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-6 border-t-2 border-black dark:border-white" /> edit
          script
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-full bg-black dark:bg-white" /> cursor
        </span>
      </div>
    </Page>
  );
}

import { useCallback, useEffect, useState } from 'react';

export function usePlayback<T>(steps: T[], opts: { interval?: number; resetKey?: unknown } = {}) {
  const { interval = 600, resetKey } = opts;

  const [prevKey, setPrevKey] = useState(resetKey);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);

  if (prevKey !== resetKey) {
    setPrevKey(resetKey);
    setIndex(0);
    setPlaying(true);
  }

  const total = steps.length;

  useEffect(() => {
    if (!playing) return;
    if (total === 0) return;
    const t = setTimeout(() => {
      setIndex((i) => (i >= total - 1 ? i : i + 1));
      if (index >= total - 1) setPlaying(false);
    }, interval);
    return () => clearTimeout(t);
  }, [playing, index, total, interval]);

  const toggle = useCallback(() => {
    if (total === 0) return;
    if (index >= total - 1) {
      setIndex(0);
      setPlaying(true);
      return;
    }
    setPlaying((p) => !p);
  }, [index, total]);

  const stepForward = useCallback(() => {
    setPlaying(false);
    setIndex((i) => Math.min(i + 1, total - 1));
  }, [total]);

  const stepBack = useCallback(() => {
    setPlaying(false);
    setIndex((i) => Math.max(i - 1, 0));
  }, []);

  const reset = useCallback(() => {
    setPlaying(false);
    setIndex(0);
  }, []);

  return { index, playing, total, toggle, stepForward, stepBack, reset };
}

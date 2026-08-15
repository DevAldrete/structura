export interface DSState {
  values: number[];
  highlighted: number[];
  active: number[];
  labels: Record<number, string[]>;
  note: string;
}

export type StateBuilder = (
  note: string,
  highlighted?: number[],
  active?: number[],
  extra?: Record<number, string[]>,
) => DSState;

export function makeEmitter(values: number[], structural: Record<number, string[]>): StateBuilder {
  return (note, highlighted = [], active = [], extra = {}) => {
    const labels: Record<number, string[]> = {};
    for (const i of values.keys()) {
      const merged = [...(structural[i] ?? []), ...(extra[i] ?? [])];
      if (merged.length) labels[i] = merged;
    }
    return {
      values: [...values],
      highlighted: [...highlighted],
      active: [...active],
      labels,
      note,
    };
  };
}

export function clampIndex(index: number, max: number): number {
  if (!Number.isFinite(index)) return 0;
  return Math.max(0, Math.min(Math.floor(index), max));
}

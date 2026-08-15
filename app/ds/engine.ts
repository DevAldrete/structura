import type { Position } from '~/components/models/position';

export type Value = number | number[];

export interface GraphEdge {
  from: number;
  to: number;
  weight?: number;
}

export interface DSStructure {
  root?: number;
  children?: Record<number, number[]>;
  treeLayout?: 'binary' | 'span';
  positions?: Record<number, Position>;
  edges?: GraphEdge[];
  directed?: boolean;
  edgeActive?: number[];
  edgeHighlight?: number[];
}

export interface DSState extends DSStructure {
  values: Value[];
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
  structure?: DSStructure,
) => DSState;

export function makeEmitter(values: Value[], structural: Record<number, string[]>): StateBuilder {
  return (note, highlighted = [], active = [], extra = {}, structure = {}) => {
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
      ...structure,
    };
  };
}

export function clampIndex(index: number, max: number): number {
  if (!Number.isFinite(index)) return 0;
  return Math.max(0, Math.min(Math.floor(index), max));
}

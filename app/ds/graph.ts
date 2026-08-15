import { CANVAS_HEIGHT, CANVAS_WIDTH } from '~/components/models/size';
import { circlePositions } from '~/graph/graph';
import { clampIndex, type DSState } from './engine';

export type GraphOp =
  | { type: 'addNode'; value: number }
  | { type: 'addEdge'; from: number; to: number }
  | { type: 'search'; value: number };

export function* graphScript(initial: number[], ops: GraphOp[]): Generator<DSState> {
  const nodes: number[] = [...initial];
  const edges: { from: number; to: number }[] = [];

  const emit = (
    note: string,
    highlighted: number[] = [],
    active: number[] = [],
    edgeActive: number[] = [],
    labels: Record<number, string[]> = {},
  ): DSState => ({
    values: [...nodes],
    highlighted: [...highlighted],
    active: [...active],
    labels,
    note,
    positions: circlePositions(nodes.length, CANVAS_WIDTH, CANVAS_HEIGHT),
    edges: edges.map((e) => ({ from: e.from, to: e.to })),
    directed: false,
    edgeActive: [...edgeActive],
  });

  yield emit('initial graph — node ids are their positions around the circle');

  for (const op of ops) {
    switch (op.type) {
      case 'addNode': {
        nodes.push(op.value);
        yield emit(`add node ${nodes.length - 1} holding ${op.value}`, [], [nodes.length - 1]);
        break;
      }
      case 'addEdge': {
        const from = clampIndex(op.from, nodes.length - 1);
        const to = clampIndex(op.to, nodes.length - 1);
        if (from === to) {
          yield emit('a node cannot connect to itself', [], [from]);
          break;
        }
        if (edges.some((e) => e.from === from && e.to === to)) {
          yield emit(`edge ${from} → ${to} already exists`, [], [from, to]);
          break;
        }
        edges.push({ from, to });
        yield emit(`connect ${from} → ${to}`, [], [from, to], [edges.length - 1]);
        break;
      }
      case 'search': {
        const idx = nodes.indexOf(op.value);
        if (idx >= 0) yield emit(`found ${op.value} at node ${idx}`, [idx]);
        else yield emit(`${op.value} is not in the graph`, []);
        break;
      }
    }
  }
}

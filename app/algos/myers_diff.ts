export interface DiffStep {
  cursor: { x: number; y: number } | null;
  path: { x: number; y: number }[];
  d: number;
  k: number;
  note: string;
}

export type DiffRunner = (a: string[], b: string[]) => Generator<DiffStep>;

export function* myersDiff(a: string[], b: string[]): Generator<DiffStep> {
  const N = a.length;
  const M = b.length;
  const MAX = N + M;
  const off = MAX;
  const V: number[] = new Array(2 * MAX + 1).fill(0);
  V[off + 1] = 0;
  const trace = new Map<number, number[]>();
  let foundD = -1;

  for (let d = 0; d <= MAX && foundD < 0; d++) {
    trace.set(d, V.slice());
    for (let k = -d; k <= d; k += 2) {
      let x: number;
      if (k === -d || (k !== d && V[off + k - 1] < V[off + k + 1])) {
        x = V[off + k + 1];
      } else {
        x = V[off + k - 1] + 1;
      }
      let y = x - k;
      while (x < N && y < M && a[x] === b[y]) {
        x++;
        y++;
      }
      V[off + k] = x;
      yield {
        cursor: { x, y },
        path: [],
        d,
        k,
        note: `d=${d} k=${k} — reach (${x}, ${y})`,
      };
      if (x >= N && y >= M) {
        foundD = d;
        break;
      }
    }
  }

  const path: { x: number; y: number }[] = [{ x: N, y: M }];
  let x = N;
  let y = M;
  let d = foundD;

  while (d > 0) {
    const v = trace.get(d);
    if (!v) break;
    const k = x - y;
    let prevK: number;
    if (k === -d || (k !== d && v[off + k - 1] < v[off + k + 1])) {
      prevK = k + 1;
    } else {
      prevK = k - 1;
    }
    const prevX = v[off + prevK];
    const prevY = prevX - prevK;
    while (x > prevX && y > prevY) {
      x--;
      y--;
      path.unshift({ x, y });
      yield {
        cursor: { x, y },
        path: [...path],
        d,
        k,
        note: `diagonal — ${a[x]} = ${b[y]} stays`,
      };
    }
    if (x === prevX) {
      y--;
      path.unshift({ x, y });
      yield {
        cursor: { x, y },
        path: [...path],
        d,
        k,
        note: `backtrack — insert ${b[y]}`,
      };
    } else {
      x--;
      path.unshift({ x, y });
      yield {
        cursor: { x, y },
        path: [...path],
        d,
        k,
        note: `backtrack — delete ${a[x]}`,
      };
    }
    d--;
  }

  yield {
    cursor: { x: 0, y: 0 },
    path: [...path],
    d: 0,
    k: 0,
    note: `done — edit distance ${foundD}`,
  };
}

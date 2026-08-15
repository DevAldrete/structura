import { Link, useParams } from 'react-router';
import { ALGOS, type AlgoEntry } from '~/algos';
import { ArrayView } from './algos/array';
import { GraphView } from './algos/graph';
import { DiffView } from './algos/diff';

export default function AlgoPage() {
  const { slug } = useParams();
  const algo = slug ? ALGOS[slug] : undefined;

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

  return <AlgoView key={algo.slug} algo={algo} />;
}

function AlgoView({ algo }: { algo: AlgoEntry }) {
  if (algo.input === 'array') return <ArrayView algo={algo} />;
  if (algo.input === 'graph') return <GraphView algo={algo} />;
  return <DiffView algo={algo} />;
}

import { ALGOS } from '~/algos';

export default function Algos() {
  return (
    <div className="min-h-screen bg-white text-black flex flex-col items-center justify-center px-6 dark:bg-black dark:text-white">
      <h1 className="text-3xl font-mono font-bold tracking-tight mb-2">Algorithms</h1>
      <p className="text-sm text-gray-400 font-mono mb-10">pick one</p>

      <div className="w-full max-w-md flex flex-col gap-3">
        {Object.values(ALGOS).map((algo) => (
          <a
            key={algo.slug}
            href={`/algos/${algo.slug}`}
            className="flex items-center justify-between px-5 py-3 border border-gray-200 font-mono text-sm hover:border-black transition-colors dark:border-gray-800 dark:hover:border-white"
          >
            <span className="font-medium">{algo.name}</span>
            <span className="text-gray-400 text-xs">{algo.complexity}</span>
          </a>
        ))}
      </div>

      <a
        href="/"
        className="mt-10 text-xs font-mono text-gray-400 underline underline-offset-2 hover:text-black dark:hover:text-white"
      >
        &larr; home
      </a>
    </div>
  );
}

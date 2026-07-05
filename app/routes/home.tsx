export function meta() {
  return [
    { title: 'Structura — Logic Lab' },
    {
      name: 'description',
      content:
        'A logic lab for students, academics, and curious minds to learn about Algorithms and Data Structures in a visual way.',
    },
  ];
}

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-black flex flex-col items-center justify-center px-6 dark:bg-black dark:text-white">
      <h1 className="text-5xl sm:text-6xl font-mono font-bold tracking-tight mb-4">Structura</h1>
      <p className="text-sm text-gray-400 font-mono mb-1">a logic lab for curious minds</p>
      <p className="text-sm text-gray-400 font-mono mb-10">
        algorithms and data structures &mdash; visual &amp; interactive
      </p>

      <div className="flex flex-col items-center gap-3 text-sm font-mono">
        <a
          href="/algos"
          className="px-6 py-2 border border-black text-black hover:bg-black hover:text-white transition-colors dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-black"
        >
          Explore Algorithms
        </a>
        <a
          href="#"
          className="px-6 py-2 border border-gray-200 text-gray-400 hover:border-black hover:text-black transition-colors dark:border-gray-800 dark:hover:border-white dark:hover:text-white"
        >
          Data Structures
        </a>
      </div>
    </div>
  );
}

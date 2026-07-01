import type { Route } from './+types/home';

export function meta(_args: Route.MetaArgs) {
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
    <div className="relative min-h-screen overflow-hidden bg-white dark:bg-gray-950">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-blue-100/50 blur-3xl dark:bg-blue-900/20" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-purple-100/50 blur-3xl dark:bg-purple-900/20" />
      </div>

      <svg
        className="absolute inset-0 h-full w-full opacity-[0.03] dark:opacity-[0.05]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      <main className="relative flex min-h-screen flex-col items-center justify-center px-6">
        <div className="absolute top-20 left-10 hidden h-16 w-16 rotate-12 rounded-lg border-2 border-blue-200 opacity-40 md:block dark:border-blue-800" />
        <div className="absolute top-32 right-20 hidden h-12 w-12 rounded-full border-2 border-purple-200 opacity-40 md:block dark:border-purple-800" />
        <div className="absolute bottom-32 left-20 hidden h-20 w-20 -rotate-6 rounded-xl border-2 border-emerald-200 opacity-30 md:block dark:border-emerald-800" />

        <div className="mx-auto max-w-2xl text-center">
          <h1 className="mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-500 bg-clip-text text-6xl font-bold tracking-tight text-transparent sm:text-7xl md:text-8xl dark:from-blue-400 dark:via-purple-400 dark:to-emerald-400">
            Structura
          </h1>
          <p className="mb-4 text-lg leading-relaxed text-gray-600 sm:text-xl dark:text-gray-400">
            A logic lab for students, academics, and curious minds.
          </p>
          <p className="mx-auto max-w-lg text-base leading-relaxed text-gray-500 dark:text-gray-500">
            Learn about{' '}
            <span className="font-medium text-gray-700 dark:text-gray-300">Algorithms</span> and{' '}
            <span className="font-medium text-gray-700 dark:text-gray-300">Data Structures</span> in
            a visual, interactive way.
          </p>

          <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="#"
              className="rounded-xl bg-gray-900 px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
            >
              Explore Labs
            </a>
            <a
              href="#"
              className="rounded-xl border border-gray-200 px-8 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800/50"
            >
              Learn More
            </a>
          </div>
        </div>

        <footer className="absolute bottom-8 text-xs text-gray-400 dark:text-gray-600">
          <p>Structura &mdash; logic lab</p>
        </footer>
      </main>
    </div>
  );
}

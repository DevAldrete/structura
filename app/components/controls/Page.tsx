import type { ReactNode } from 'react';
import { Link } from 'react-router';

export function Page({
  title,
  meta,
  desc,
  backTo = '/',
  backLabel = '&larr; back',
  children,
}: {
  title: string;
  meta: string;
  desc?: string;
  backTo?: string;
  backLabel?: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white text-black flex flex-col items-center justify-center px-4 dark:bg-black dark:text-white">
      <h1 className="text-2xl font-mono font-bold tracking-tight mb-1">{title}</h1>
      <p className="text-sm text-gray-400 font-mono mb-1">{meta}</p>
      {desc && <p className="text-xs text-gray-400 font-mono mb-6 text-center max-w-sm">{desc}</p>}
      {children}
      <Link
        to={backTo}
        className="mt-8 text-xs font-mono text-gray-400 underline underline-offset-2 hover:text-black dark:hover:text-white"
      >
        {backLabel}
      </Link>
    </div>
  );
}

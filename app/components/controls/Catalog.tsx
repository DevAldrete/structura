import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router';

export interface CatalogItem {
  slug: string;
  name: string;
  desc: string;
  badge: string;
}

const PAGE_SIZE = 6;

export function Catalog({
  title,
  subtitle,
  items,
  basePath,
  searchPlaceholder,
}: {
  title: string;
  subtitle: string;
  items: CatalogItem[];
  basePath: string;
  searchPlaceholder: string;
}) {
  const [query, setQuery] = useState('');
  const [visible, setVisible] = useState(PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const updateQuery = (next: string) => {
    setQuery(next);
    setVisible(PAGE_SIZE);
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) =>
      `${item.name} ${item.desc} ${item.badge} ${item.slug}`.toLowerCase().includes(q),
    );
  }, [items, query]);

  const shown = filtered.slice(0, visible);
  const hasMore = visible < filtered.length;

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible((v) => Math.min(v + PAGE_SIZE, filtered.length));
        }
      },
      { rootMargin: '200px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [hasMore, filtered.length]);

  return (
    <div className="min-h-screen bg-white text-black flex flex-col items-center px-6 py-16 dark:bg-black dark:text-white">
      <h1 className="text-3xl font-mono font-bold tracking-tight mb-2">{title}</h1>
      <p className="text-sm text-gray-500 font-mono mb-6 dark:text-gray-400">{subtitle}</p>

      <div className="w-full max-w-md mb-4">
        <label htmlFor={`${basePath}-search`} className="sr-only">
          {searchPlaceholder}
        </label>
        <div className="flex gap-2">
          <input
            id={`${basePath}-search`}
            type="search"
            value={query}
            onChange={(e) => updateQuery(e.target.value)}
            placeholder={searchPlaceholder}
            className="flex-1 px-3 py-2 border border-gray-200 bg-transparent font-mono text-sm placeholder-gray-400 focus:border-black outline-none dark:border-gray-800 dark:focus:border-white"
          />
          {query && (
            <button
              type="button"
              onClick={() => updateQuery('')}
              className="px-3 py-2 border border-gray-200 font-mono text-sm text-gray-500 hover:border-black hover:text-black transition-colors dark:border-gray-800 dark:hover:border-white dark:hover:text-white"
              aria-label="clear search"
            >
              ×
            </button>
          )}
        </div>
        <p className="mt-2 font-mono text-xs text-gray-500 dark:text-gray-400" aria-live="polite">
          {filtered.length === items.length
            ? `${items.length} entries`
            : `${filtered.length} of ${items.length} entries`}
          {shown.length < filtered.length && ` — showing ${shown.length}`}
        </p>
      </div>

      {shown.length > 0 ? (
        <ul className="w-full max-w-md flex flex-col gap-3">
          {shown.map((item) => (
            <li key={item.slug}>
              <Link
                to={`${basePath}/${item.slug}`}
                prefetch="intent"
                className="flex items-center justify-between gap-4 px-5 py-3 border border-gray-200 font-mono text-sm hover:border-black transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current dark:border-gray-800 dark:hover:border-white"
              >
                <span className="font-medium">{item.name}</span>
                <span className="text-gray-500 text-xs text-right truncate max-w-[55%] dark:text-gray-400">
                  {item.badge}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="font-mono text-sm text-gray-500 dark:text-gray-400">
          No matches for “{query}”. Try another keyword or clear the search.
        </p>
      )}

      <div ref={sentinelRef} aria-hidden="true" className="h-1 w-full max-w-md" />

      {hasMore && (
        <button
          type="button"
          onClick={() => setVisible((v) => Math.min(v + PAGE_SIZE, filtered.length))}
          className="mt-4 px-5 py-2 border border-gray-200 font-mono text-sm text-gray-500 hover:border-black hover:text-black transition-colors dark:border-gray-800 dark:hover:border-white dark:hover:text-white"
        >
          Load more ({filtered.length - shown.length} remaining)
        </button>
      )}

      <Link
        to="/"
        className="mt-10 text-xs font-mono text-gray-500 underline underline-offset-2 hover:text-black dark:text-gray-400 dark:hover:text-white"
      >
        ← home
      </Link>
    </div>
  );
}

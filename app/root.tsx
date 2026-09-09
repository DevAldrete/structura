import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from 'react-router';

import type { Route } from './+types/root';
import './app.css';

export const links: Route.LinksFunction = () => [
  { rel: 'icon', href: '/favicon.ico', sizes: 'any' },
  { rel: 'icon', type: 'image/svg+xml', href: '/structura.svg' },
  { rel: 'apple-touch-icon', href: '/structura.png' },
  { rel: 'manifest', href: '/site.webmanifest' },
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous',
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap',
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" media="(prefers-color-scheme: light)" content="#ffffff" />
        <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#000000" />
        {/* Site-wide social tags as static tags: the `meta` export of the
            last matching leaf route replaces (not merges) ancestors' meta,
            so root `meta` would be shadowed on every page with its own meta.
            TODO: use an absolute URL (https://<domain>/structura.png) for
            og:image/twitter:image once the production domain is known. */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Structura" />
        <meta property="og:title" content="Structura — Logic Lab" />
        <meta
          property="og:description"
          content="A logic lab for students, academics, and curious minds to learn about Algorithms and Data Structures in a visual way."
        />
        <meta property="og:image" content="/structura.png" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Structura — Logic Lab" />
        <meta
          name="twitter:description"
          content="A logic lab for students, academics, and curious minds to learn about Algorithms and Data Structures in a visual way."
        />
        <meta name="twitter:image" content="/structura.png" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = 'Oops!';
  let details = 'An unexpected error occurred.';
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? '404' : 'Error';
    details =
      error.status === 404 ? 'The requested page could not be found.' : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}

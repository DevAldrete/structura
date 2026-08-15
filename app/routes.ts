import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [
  index('routes/home.tsx'),
  route('algos', 'routes/algos.tsx'),
  route('algos/:slug', 'routes/algo.tsx'),
  route('ds', 'routes/structures.tsx'),
  route('ds/:slug', 'routes/structure.tsx'),
] satisfies RouteConfig;

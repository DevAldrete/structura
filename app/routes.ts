import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [
  index('routes/home.tsx'),
  route('algos', 'routes/algos.tsx'),
  route('algos/bubble-sort', 'routes/bubble-sort.tsx'),
] satisfies RouteConfig;

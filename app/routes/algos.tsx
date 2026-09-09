import { ALGOS } from '~/algos';
import { Catalog } from '~/components/controls/Catalog';

export function meta() {
  return [{ title: 'Algorithms — Structura' }];
}

export default function Algos() {
  const items = Object.values(ALGOS).map((algo) => ({
    slug: algo.slug,
    name: algo.name,
    desc: algo.desc,
    badge: algo.complexity,
  }));
  return (
    <Catalog
      title="Algorithms"
      subtitle="pick one"
      items={items}
      basePath="/algos"
      searchPlaceholder="Search algorithms…"
    />
  );
}

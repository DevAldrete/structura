import { STRUCTURES } from '~/ds';
import { Catalog } from '~/components/controls/Catalog';

export function meta() {
  return [{ title: 'Data Structures — Structura' }];
}

export default function Structures() {
  const items = Object.values(STRUCTURES).map((ds) => ({
    slug: ds.slug,
    name: ds.name,
    desc: ds.desc,
    badge: ds.desc,
  }));
  return (
    <Catalog
      title="Data Structures"
      subtitle="pick one"
      items={items}
      basePath="/ds"
      searchPlaceholder="Search data structures…"
    />
  );
}

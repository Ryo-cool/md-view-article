import Link from 'next/link';
import { listMarkdownFiles } from '@/lib/content';

export const dynamic = 'force-static';

export default async function DocsIndex() {
  const files = await listMarkdownFiles();
  const dir = (process.env.CONTENT_DIR ?? '').replace(/\/+$/, '');

  const items = files.map((p: string) => {
    const rel = dir ? p.replace(new RegExp(`^${dir}/`), '') : p;
    return rel.replace(/\.mdx?$/, '');
  });

  // ディレクトリごとにグループ化
  const groupedItems = items.reduce((acc, slug) => {
    const parts = slug.split('/');
    const dir = parts.length > 1 ? parts[0] : 'その他';
    if (!acc[dir]) {
      acc[dir] = [];
    }
    acc[dir].push(slug);
    return acc;
  }, {} as Record<string, string[]>);

  return (
    <main className="prose prose-lg max-w-none mx-auto p-6">
      <h1>ドキュメント一覧</h1>
      {Object.entries(groupedItems)
        .sort(([a], [b]) => a.localeCompare(b, 'ja'))
        .map(([dir, slugs]) => (
          <section key={dir} className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 border-b pb-2">{dir}</h2>
            <ul>
              {slugs
                .sort((a, b) => a.localeCompare(b, 'ja'))
                .map((slug) => (
                  <li key={slug}>
                    <Link href={`/docs/${slug}`} className="text-blue-600 hover:text-blue-800 underline">
                      {slug.replace(`${dir}/`, '')}
                    </Link>
                  </li>
                ))}
            </ul>
          </section>
        ))}
    </main>
  );
}


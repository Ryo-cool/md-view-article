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
    <main className="min-h-screen" style={{ background: '#e0e5ec' }}>
      <div className="max-w-5xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold mb-8" style={{ color: '#2c3e50' }}>ドキュメント一覧</h1>
        <div className="grid gap-6">
          {Object.entries(groupedItems)
            .sort(([a], [b]) => a.localeCompare(b, 'ja'))
            .map(([dir, slugs]) => (
              <section key={dir} className="neu-card p-6">
                <h2 className="text-2xl font-bold mb-4 pb-3" style={{ 
                  color: '#2c3e50',
                  borderBottom: '2px solid rgba(163, 177, 198, 0.3)'
                }}>
                  📁 {dir}
                </h2>
                <ul className="space-y-2">
                  {slugs
                    .sort((a, b) => a.localeCompare(b, 'ja'))
                    .map((slug) => (
                      <li key={slug}>
                        <Link
                          href={`/docs/${slug}`}
                          className="neu-button inline-flex items-center space-x-2 px-4 py-2 font-medium w-full"
                          style={{ color: '#2c3e50' }}
                        >
                          <span>📄</span>
                          <span>{slug.replace(`${dir}/`, '')}</span>
                        </Link>
                      </li>
                    ))}
                </ul>
              </section>
            ))}
        </div>
      </div>
    </main>
  );
}


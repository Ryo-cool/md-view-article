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

  return (
    <main className="prose mx-auto p-6">
      <h1>Docs</h1>
      <ul>
        {items.map((slug) => (
          <li key={slug}>
            <Link href={`/docs/${slug}`}>{slug}</Link>
          </li>
        ))}
      </ul>
    </main>
  );
}


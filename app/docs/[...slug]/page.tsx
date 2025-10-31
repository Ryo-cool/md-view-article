import matter from 'gray-matter';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import rehypeGithubAlerts from 'rehype-github-alerts';
import rehypeMermaid from 'rehype-mermaid';
import { listMarkdownFiles, fetchMarkdown } from '@/lib/content';

export const dynamic = 'force-static';

function mdCandidatesFromSlug(slug: string[]): string[] {
  // 優先順位: .md → .mdx
  const base = slug.join('/');
  const dir = (process.env.CONTENT_DIR ?? '').replace(/\/+$/, '');
  const prefix = dir ? `${dir}/` : '';
  return [`${prefix}${base}.md`, `${prefix}${base}.mdx`];
}

export async function generateStaticParams() {
  const files = await listMarkdownFiles();
  const dir = (process.env.CONTENT_DIR ?? '').replace(/\/+$/, '');

  return files.map((p) => {
    const rel = dir ? p.replace(new RegExp(`^${dir}/`), '') : p;
    const slug = rel.replace(/\.mdx?$/, '').split('/');
    return { slug };
  });
}

export default async function DocPage({
  params,
}: {
  params: { slug: string[] };
}) {
  let raw: string | null = null;

  for (const candidate of mdCandidatesFromSlug(params.slug)) {
    try {
      raw = await fetchMarkdown(candidate);
      if (raw) break;
    } catch {
      // ファイルが見つからない場合は次の候補を試す
    }
  }

  if (!raw) {
    return (
      <main className="prose mx-auto p-6">
        <h1>Not found</h1>
        <p>指定されたドキュメントが見つかりませんでした。</p>
      </main>
    );
  }

  const { content } = matter(raw);

  return (
    <main className="prose mx-auto p-6">
      <MDXRemote
        source={content}
        options={{
          mdxOptions: {
            remarkPlugins: [remarkGfm],
            rehypePlugins: [
              rehypeGithubAlerts,
              [rehypeMermaid, { strategy: 'inline-svg' }],
            ],
          },
        }}
      />
    </main>
  );
}


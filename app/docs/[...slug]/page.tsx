import matter from 'gray-matter';
import { listMarkdownFiles, fetchMarkdown } from '@/lib/content';
import MarkdownRenderer from '@/components/MarkdownRenderer';

export const dynamic = 'force-static';

function mdCandidatesFromSlug(slug: string[] | undefined): string[] {
  // slug が undefined や空配列の場合の処理
  if (!slug || slug.length === 0) {
    return [];
  }
  
  // 優先順位: .md → .mdx
  const base = slug.filter((s) => s && s.length > 0).join('/');
  if (!base) {
    return [];
  }
  
  const dir = (process.env.CONTENT_DIR ?? '').replace(/\/+$/, '');
  const prefix = dir ? `${dir}/` : '';
  return [`${prefix}${base}.md`, `${prefix}${base}.mdx`];
}

export async function generateStaticParams() {
  try {
    const files = await listMarkdownFiles();
    const dir = (process.env.CONTENT_DIR ?? '').replace(/\/+$/, '');

    return files
      .map((p) => {
        const rel = dir ? p.replace(new RegExp(`^${dir}/`), '') : p;
        const slugStr = rel.replace(/\.mdx?$/, '');
        // 空の文字列や不正なパスを除外
        if (!slugStr || slugStr.trim() === '') {
          return null;
        }
        const slug = slugStr.split('/').filter((s) => s.length > 0);
        // slug が空配列の場合は除外
        if (slug.length === 0) {
          return null;
        }
        return { slug };
      })
      .filter((item): item is { slug: string[] } => item !== null);
  } catch (error) {
    console.error('generateStaticParams error:', error);
    return [];
  }
}


export default async function DocPage({
  params,
}: {
  params: Promise<{ slug: string[] }> | { slug: string[] };
}) {
  // Next.js 15 では params が Promise になる可能性があるため
  const resolvedParams = await Promise.resolve(params);
  
  // slug が undefined の場合の処理
  if (!resolvedParams?.slug || resolvedParams.slug.length === 0) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-200 text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">404 - Not Found</h1>
            <p className="text-gray-600 mb-6">指定されたドキュメントが見つかりませんでした。</p>
            <a href="/docs" className="text-blue-600 hover:text-blue-800 underline">
              ドキュメント一覧へ戻る
            </a>
          </div>
        </div>
      </main>
    );
  }
  
  let raw: string | null = null;
  const candidates = mdCandidatesFromSlug(resolvedParams.slug);
  
  if (candidates.length === 0) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-200 text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">404 - Not Found</h1>
            <p className="text-gray-600 mb-6">指定されたドキュメントが見つかりませんでした。</p>
            <a href="/docs" className="text-blue-600 hover:text-blue-800 underline">
              ドキュメント一覧へ戻る
            </a>
          </div>
        </div>
      </main>
    );
  }

  for (const candidate of candidates) {
    try {
      raw = await fetchMarkdown(candidate);
      if (raw) break;
    } catch {
      // ファイルが見つからない場合は次の候補を試す
    }
  }

  if (!raw) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-200 text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">404 - Not Found</h1>
            <p className="text-gray-600 mb-6">指定されたドキュメントが見つかりませんでした。</p>
            <a href="/docs" className="text-blue-600 hover:text-blue-800 underline">
              ドキュメント一覧へ戻る
            </a>
          </div>
        </div>
      </main>
    );
  }

  const { content } = matter(raw);

  return (
    <main className="min-h-screen" style={{ background: '#e0e5ec' }}>
      <div className="max-w-4xl mx-auto px-6 py-12">
        <article className="neu-card p-8 md:p-12">
          <MarkdownRenderer content={content} />
        </article>
      </div>
    </main>
  );
}


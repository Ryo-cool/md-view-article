import matter from 'gray-matter';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import { listMarkdownFiles, fetchMarkdown } from '@/lib/content';
import * as rehypeGithubAlertsModule from 'rehype-github-alerts';

const rehypeGithubAlerts = rehypeGithubAlertsModule.rehypeGithubAlerts;

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
      <main className="prose mx-auto p-6">
        <h1>Not found</h1>
        <p>指定されたドキュメントが見つかりませんでした。</p>
      </main>
    );
  }
  
  let raw: string | null = null;
  const candidates = mdCandidatesFromSlug(resolvedParams.slug);
  
  if (candidates.length === 0) {
    return (
      <main className="prose mx-auto p-6">
        <h1>Not found</h1>
        <p>指定されたドキュメントが見つかりませんでした。</p>
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
      <main className="prose mx-auto p-6">
        <h1>Not found</h1>
        <p>指定されたドキュメントが見つかりませんでした。</p>
      </main>
    );
  }

  const { content } = matter(raw);

  try {
    return (
      <main className="prose mx-auto p-6">
        <MDXRemote
          source={content}
          options={{
          mdxOptions: {
            remarkPlugins: [remarkGfm],
            rehypePlugins: [rehypeGithubAlerts],
            format: 'md', // MDXではなくMarkdownとして処理（より安全）
            development: false,
          },
            parseFrontmatter: false, // gray-matter で既にパース済み
          }}
        />
      </main>
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`MDX compilation error for ${resolvedParams.slug.join('/')}:`, errorMessage);
    
    // エラーが発生した場合、エラーメッセージを表示
    return (
      <main className="prose mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded p-4 mb-4">
          <h2 className="text-red-800 font-bold">MDX コンパイルエラー</h2>
          <p className="text-red-700 text-sm mt-2">
            このページのMDXコンパイル中にエラーが発生しました。
          </p>
          <details className="mt-2">
            <summary className="text-red-700 cursor-pointer text-sm font-semibold">
              エラー詳細を表示
            </summary>
            <pre className="mt-2 text-xs bg-red-100 p-2 rounded overflow-auto whitespace-pre-wrap">
              {errorMessage}
            </pre>
          </details>
          <p className="text-red-600 text-xs mt-2">
            このエラーは通常、Markdownファイル内の構文エラーが原因です。ファイルを確認してください。
          </p>
        </div>
      </main>
    );
  }
}


import matter from 'gray-matter';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import { listMarkdownFiles, fetchMarkdown } from '@/lib/content';
import * as rehypeGithubAlertsModule from 'rehype-github-alerts';
import Mermaid from '@/components/Mermaid';

const rehypeGithubAlerts = rehypeGithubAlertsModule.rehypeGithubAlerts;

// MDXコンポーネントのカスタム設定
const components = {
  // Mermaidコードブロックを処理
  code: ({ className, children, ...props }: any) => {
    const match = /language-(\w+)/.exec(className || '');
    const language = match && match[1];
    
    if (language === 'mermaid') {
      return <Mermaid chart={String(children).replace(/\n$/, '')} />;
    }
    
    return (
      <code className={className} {...props}>
        {children}
      </code>
    );
  },
};

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

  // エラーハンドリング：MDXコンパイルエラーをキャッチ
  try {
    // MDXRemoteはコンパイル時にエラーを投げる可能性があるため、
    // 事前にコンテンツを検証する
    return (
      <main className="prose prose-lg max-w-none mx-auto p-6">
        <MDXRemote
          source={content}
          components={components}
          options={{
            mdxOptions: {
              remarkPlugins: [remarkGfm],
              rehypePlugins: [rehypeGithubAlerts],
              format: 'md', // Markdownとして処理（より安全、MDX構文エラーを回避）
              development: false,
            },
            parseFrontmatter: false, // gray-matter で既にパース済み
          }}
        />
      </main>
    );
  } catch (error: unknown) {
    // ビルド時にエラーが発生した場合、エラーページを生成
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`MDX compilation error for ${resolvedParams.slug.join('/')}:`, errorMessage);
    
    // エラーページを返す（ビルドを続行するため）
    return (
      <main className="prose prose-lg max-w-none mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-4">
          <h2 className="text-yellow-800 font-bold text-xl mb-2">⚠️ コンパイルエラー</h2>
          <p className="text-yellow-700 mb-4">
            このページのMarkdownコンパイル中にエラーが発生しました。ファイルの内容を確認してください。
          </p>
          <details className="mt-4">
            <summary className="text-yellow-800 cursor-pointer font-semibold mb-2">
              エラー詳細を表示
            </summary>
            <div className="bg-yellow-100 rounded p-3 mt-2">
              <pre className="text-xs overflow-auto whitespace-pre-wrap font-mono">
                {errorMessage}
              </pre>
            </div>
          </details>
          <div className="mt-4 p-4 bg-white rounded border">
            <h3 className="font-semibold mb-2">ファイル情報</h3>
            <p className="text-sm text-gray-700">
              パス: <code className="bg-gray-100 px-2 py-1 rounded">{resolvedParams.slug.join('/')}</code>
            </p>
          </div>
        </div>
        {/* 生のMarkdownコンテンツをプレビュー表示 */}
        <div className="mt-6 border rounded-lg p-4 bg-gray-50">
          <h3 className="font-semibold mb-2">生のMarkdownコンテンツ（プレビュー）</h3>
          <pre className="text-xs overflow-auto whitespace-pre-wrap font-mono bg-white p-3 rounded">
            {content.substring(0, 1000)}
            {content.length > 1000 && '\n\n... (省略) ...'}
          </pre>
        </div>
      </main>
    );
  }
}


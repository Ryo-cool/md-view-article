import matter from 'gray-matter';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import rehypeRaw from 'rehype-raw';
import type { Components } from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { listMarkdownFiles, fetchMarkdown, fetchImage } from '@/lib/content';
import * as rehypeGithubAlertsModule from 'rehype-github-alerts';
import Mermaid from '@/components/Mermaid';
import Image from 'next/image';
import Link from 'next/link';

const rehypeGithubAlerts = rehypeGithubAlertsModule.rehypeGithubAlerts;

// Markdown レンダリング時のカスタムコンポーネント
/* eslint-disable @typescript-eslint/no-explicit-any */
const markdownComponents: Components = {
  h1: ({ children, ...props }: any) => (
    <h1 className="text-4xl font-bold mt-8 mb-4 leading-tight" style={{ color: '#2c3e50' }} {...props}>
      {children}
    </h1>
  ),
  h2: ({ children, ...props }: any) => (
    <h2 className="text-3xl font-bold mt-6 mb-3 leading-tight" style={{ color: '#2c3e50' }} {...props}>
      {children}
    </h2>
  ),
  h3: ({ children, ...props }: any) => (
    <h3 className="text-2xl font-semibold mt-5 mb-2 leading-tight" style={{ color: '#2c3e50' }} {...props}>
      {children}
    </h3>
  ),
  h4: ({ children, ...props }: any) => (
    <h4 className="text-xl font-semibold mt-4 mb-2 leading-tight" style={{ color: '#2c3e50' }} {...props}>
      {children}
    </h4>
  ),
  h5: ({ children, ...props }: any) => (
    <h5 className="text-lg font-semibold mt-3 mb-2 leading-tight" style={{ color: '#2c3e50' }} {...props}>
      {children}
    </h5>
  ),
  h6: ({ children, ...props }: any) => (
    <h6 className="text-base font-semibold mt-3 mb-2 leading-tight" style={{ color: '#2c3e50' }} {...props}>
      {children}
    </h6>
  ),
  p: ({ children, ...props }: any) => (
    <p className="mb-4 leading-7" style={{ color: '#5a6c7d' }} {...props}>
      {children}
    </p>
  ),
  ul: ({ children, ...props }: any) => (
    <ul className="list-disc list-inside mb-4 space-y-2 ml-4" style={{ color: '#5a6c7d' }} {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }: any) => (
    <ol className="list-decimal list-inside mb-4 space-y-2 ml-4" style={{ color: '#5a6c7d' }} {...props}>
      {children}
    </ol>
  ),
  li: ({ children, ...props }: any) => (
    <li className="mb-1" style={{ color: '#5a6c7d' }} {...props}>
      {children}
    </li>
  ),
  blockquote: ({ children, ...props }: any) => (
    <blockquote className="neu-pressed pl-6 pr-4 italic my-4 py-4" style={{ 
      color: '#5a6c7d',
      borderLeft: '4px solid rgba(74, 144, 226, 0.6)'
    }} {...props}>
      {children}
    </blockquote>
  ),
  table: ({ children, ...props }: any) => (
    <div className="overflow-x-auto my-4 neu-pressed p-4">
      <table className="min-w-full border-collapse" {...props}>
        {children}
      </table>
    </div>
  ),
  thead: ({ children, ...props }: any) => (
    <thead style={{ background: 'rgba(163, 177, 198, 0.2)' }} {...props}>
      {children}
    </thead>
  ),
  th: ({ children, ...props }: any) => (
    <th className="px-4 py-2 text-left font-bold" style={{ 
      color: '#2c3e50',
      borderBottom: '2px solid rgba(163, 177, 198, 0.3)'
    }} {...props}>
      {children}
    </th>
  ),
  td: ({ children, ...props }: any) => (
    <td className="px-4 py-2" style={{ 
      color: '#5a6c7d',
      borderBottom: '1px solid rgba(163, 177, 198, 0.2)'
    }} {...props}>
      {children}
    </td>
  ),
  code({ inline, className, children, ...props }: any) {
    const match = /language-(\w+)/.exec(className || '');
    const language = match && match[1];

    if (!inline && language === 'mermaid') {
      return <Mermaid chart={String(children).replace(/\n$/, '')} />;
    }

    if (inline) {
      return (
        <code className="neu-pressed px-2 py-1 rounded text-sm font-mono" style={{ 
          color: '#c7254e',
          display: 'inline-block'
        }} {...props}>
          {children}
        </code>
      );
    }

    // コードブロックにシンタックスハイライトを適用
    return (
      <div className="my-4 neu-pressed p-4 overflow-hidden">
        <SyntaxHighlighter
          language={language || 'text'}
          style={oneLight}
          customStyle={{
            margin: 0,
            padding: '1rem',
            fontSize: '0.875rem',
            lineHeight: '1.6',
            background: 'transparent',
          }}
          PreTag="div"
          codeTagProps={{
            style: {
              fontFamily: 'var(--font-geist-mono), "Fira Code", "SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace',
            },
          }}
          {...props}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      </div>
    );
  },
  a({ href, children, ...props }: any) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="font-semibold hover:opacity-70 transition-opacity"
        style={{ color: '#4a90e2' }}
        {...props}
      >
        {children}
      </a>
    );
  },
  strong: ({ children, ...props }: any) => (
    <strong className="font-bold" style={{ fontWeight: 700, color: '#2c3e50' }} {...props}>
      {children}
    </strong>
  ),
  em: ({ children, ...props }: any) => (
    <em className="italic" style={{ color: '#5a6c7d' }} {...props}>
      {children}
    </em>
  ),
  hr: ({ ...props }: any) => (
    <hr className="my-8" style={{ 
      border: 'none',
      height: '2px',
      background: 'linear-gradient(90deg, transparent, rgba(163, 177, 198, 0.5), transparent)'
    }} {...props} />
  ),
  img: ({ src, alt, ...props }: any) => {
    // 外部URLかデータURLかどうかチェック
    const isExternalUrl = src?.startsWith('http://') || src?.startsWith('https://');
    const isDataUrl = src?.startsWith('data:');
    
    if (!src) return null;

    return (
      <div className="my-6 flex justify-center">
        <div className="neu-card p-3 inline-block">
          {isExternalUrl || isDataUrl ? (
            // 外部画像またはデータURLの場合は通常のimgタグを使用
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={src}
              alt={alt || ''}
              className="max-w-full h-auto rounded-lg"
              style={{ maxHeight: '600px' }}
              {...props}
            />
          ) : (
            // 相対パスの場合はNext.js Imageを使用（通常はここには来ない）
            <Image
              src={src}
              alt={alt || ''}
              width={800}
              height={600}
              className="max-w-full h-auto rounded-lg"
              style={{ maxHeight: '600px' }}
              {...props}
            />
          )}
          {alt && (
            <p className="text-center text-sm mt-2 italic" style={{ color: '#5a6c7d' }}>
              {alt}
            </p>
          )}
        </div>
      </div>
    );
  },
};
/* eslint-enable @typescript-eslint/no-explicit-any */

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
      <main className="min-h-screen" style={{ background: '#e0e5ec' }}>
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="neu-card p-8 text-center">
            <h1 className="text-4xl font-bold mb-4" style={{ color: '#2c3e50' }}>404 - Not Found</h1>
            <p className="mb-6" style={{ color: '#5a6c7d' }}>指定されたドキュメントが見つかりませんでした。</p>
            <Link href="/docs" className="neu-button inline-block px-6 py-3 font-semibold" style={{ color: '#2c3e50' }}>
              ドキュメント一覧へ戻る
            </Link>
          </div>
        </div>
      </main>
    );
  }
  
  let raw: string | null = null;
  let mdFilePath = '';
  const candidates = mdCandidatesFromSlug(resolvedParams.slug);
  
  if (candidates.length === 0) {
    return (
      <main className="min-h-screen" style={{ background: '#e0e5ec' }}>
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="neu-card p-8 text-center">
            <h1 className="text-4xl font-bold mb-4" style={{ color: '#2c3e50' }}>404 - Not Found</h1>
            <p className="mb-6" style={{ color: '#5a6c7d' }}>指定されたドキュメントが見つかりませんでした。</p>
            <Link href="/docs" className="neu-button inline-block px-6 py-3 font-semibold" style={{ color: '#2c3e50' }}>
              ドキュメント一覧へ戻る
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Markdownファイルを取得し、成功したパスを記録
  for (const candidate of candidates) {
    try {
      raw = await fetchMarkdown(candidate);
      if (raw) {
        mdFilePath = candidate;
        break;
      }
    } catch {
      // ファイルが見つからない場合は次の候補を試す
    }
  }

  if (!raw || !mdFilePath) {
    return (
      <main className="min-h-screen" style={{ background: '#e0e5ec' }}>
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="neu-card p-8 text-center">
            <h1 className="text-4xl font-bold mb-4" style={{ color: '#2c3e50' }}>404 - Not Found</h1>
            <p className="mb-6" style={{ color: '#5a6c7d' }}>指定されたドキュメントが見つかりませんでした。</p>
            <Link href="/docs" className="neu-button inline-block px-6 py-3 font-semibold" style={{ color: '#2c3e50' }}>
              ドキュメント一覧へ戻る
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const { content } = matter(raw);

  // Markdownファイルのディレクトリパスを取得
  const mdDir = mdFilePath.includes('/') 
    ? mdFilePath.substring(0, mdFilePath.lastIndexOf('/'))
    : '';
  const dir = (process.env.CONTENT_DIR ?? '').replace(/\/+$/, '');

  // 画像のパスを解決して取得する関数
  const resolveImagePath = (imageSrc: string): string => {
    // 外部URLの場合はそのまま返す
    if (imageSrc.startsWith('http://') || imageSrc.startsWith('https://')) {
      return imageSrc;
    }

    // 絶対パス（/で始まる）の場合
    if (imageSrc.startsWith('/')) {
      const pathWithoutLeadingSlash = imageSrc.substring(1);
      return dir ? `${dir}/${pathWithoutLeadingSlash}` : pathWithoutLeadingSlash;
    }

    // 相対パス（./で始まる）の場合
    if (imageSrc.startsWith('./')) {
      const relativePath = imageSrc.substring(2);
      return mdDir ? `${mdDir}/${relativePath}` : relativePath;
    }

    // 相対パス（./なし）の場合
    return mdDir ? `${mdDir}/${imageSrc}` : imageSrc;
  };

  // Markdown内の画像パスを抽出して事前に取得
  const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  const imageMap = new Map<string, string | null>();
  let match;

  while ((match = imageRegex.exec(content)) !== null) {
    const imageSrc = match[2];
    if (!imageSrc.startsWith('http://') && !imageSrc.startsWith('https://')) {
      const resolvedPath = resolveImagePath(imageSrc);
      if (!imageMap.has(imageSrc)) {
        const imageData = await fetchImage(resolvedPath);
        imageMap.set(imageSrc, imageData);
      }
    }
  }

  // 画像パスをデータURLに置き換えたコンテンツを作成
  let processedContent = content;
  imageMap.forEach((dataUrl, originalSrc) => {
    if (dataUrl) {
      // 画像パスをデータURLに置き換え
      processedContent = processedContent.replace(
        new RegExp(`!\\[([^\\]]*)\\]\\(${originalSrc.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\)`, 'g'),
        `![$1](${dataUrl})`
      );
    }
  });

  return (
    <main className="min-h-screen" style={{ background: '#e0e5ec' }}>
      <div className="max-w-4xl mx-auto px-6 py-12">
        <article className="neu-card p-8 md:p-12">
          <MarkdownRenderer content={content} />
          <ReactMarkdown
            components={markdownComponents}
            remarkPlugins={[
              remarkGfm,
              remarkBreaks,
              // 太字の処理を改善（カッコや記号を含む場合でも正しく処理）
            ]}
            rehypePlugins={[rehypeGithubAlerts, rehypeRaw]}
          >
            {processedContent}
          </ReactMarkdown>
        </article>
      </div>
    </main>
  );
}


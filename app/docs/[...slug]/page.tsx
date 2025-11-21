import matter from 'gray-matter';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import { listMarkdownFiles, fetchMarkdown, fetchImage } from '@/lib/content';
import Link from 'next/link';

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
      // 画像パス解決のログ（本番でも確認できる）
      console.log('[image] resolved', {
        slug: resolvedParams.slug,
        original: imageSrc,
        resolved: resolvedPath,
      });
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
          <MarkdownRenderer content={processedContent} />
        </article>
      </div>
    </main>
  );
}

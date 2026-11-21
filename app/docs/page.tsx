import type { Metadata } from 'next';
import { listMarkdownFiles } from '@/lib/content';
import { buildDocCategories } from '@/lib/docsIndex';
import DocsExplorer from '@/components/DocsExplorer';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'ドキュメント一覧 | Markdown View Article',
  description:
    'カテゴリやキーワードから記事を検索・閲覧できるドキュメント一覧ページです。',
};

export default async function DocsIndex() {
  const files = await listMarkdownFiles();
  const contentDir = (process.env.CONTENT_DIR ?? '').replace(/\/+$/, '');
  const categories = buildDocCategories(files, contentDir);

  return <DocsExplorer categories={categories} />;
}

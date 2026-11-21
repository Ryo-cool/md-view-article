export interface DocItem {
  /** URL 遷移用の相対スラッグ（拡張子なし） */
  slug: string;
  /** 遷移先パス */
  href: string;
  /** 記事の表示タイトル（ファイル名から拡張子を除去したもの） */
  title: string;
  /** カテゴリ直下より深い階層にある場合のサブパス（例: "guides/setup"） */
  subPath: string | null;
  /** 所属カテゴリの ID（rawDir または "__other__"） */
  categoryId: string;
  /** 所属カテゴリの表示名 */
  categoryLabel: string;
  /** 元の拡張子（md / mdx） */
  extension: 'md' | 'mdx';
}

export interface DocCategory {
  /** 一意の識別子（rawDir または "__other__"） */
  id: string;
  /** 生のディレクトリ名（ルート直下の場合は空文字） */
  rawDir: string;
  /** 番号プレフィックス（例: "01"）。存在しない場合は null */
  prefix: string | null;
  /** 整形済みの表示用カテゴリ名 */
  label: string;
  /** ルート直下ファイル用の「その他」カテゴリかどうか */
  isOther: boolean;
  /** ドット始まりの隠しディレクトリかどうか（例: ".claude"） */
  isHidden: boolean;
  /** カテゴリ内の記事一覧 */
  items: DocItem[];
}

export interface ParsedCategoryName {
  prefix: string | null;
  label: string;
  isOther: boolean;
  isHidden: boolean;
}

export const OTHER_CATEGORY_ID = '__other__';

/**
 * ディレクトリ名から番号プレフィックスと表示名を抽出する。
 * 例: "01_コミュニケーション" -> { prefix: "01", label: "コミュニケーション", ... }
 */
export function parseCategoryName(rawDir: string): ParsedCategoryName {
  const trimmed = rawDir.trim();
  if (!trimmed) {
    return {
      prefix: null,
      label: 'その他',
      isOther: true,
      isHidden: false,
    };
  }

  const isHidden = trimmed.startsWith('.');
  // 1〜3桁の番号プレフィックス（01_ / 01- / 1_ 等）を抽出。4桁年号（2026_）はそのまま残す
  const prefixMatch = !isHidden ? trimmed.match(/^(\d{1,3})[_-](.+)$/) : null;
  if (prefixMatch) {
    return {
      prefix: prefixMatch[1],
      label: prefixMatch[2].trim(),
      isOther: false,
      isHidden: false,
    };
  }

  return {
    prefix: null,
    label: trimmed,
    isOther: false,
    isHidden,
  };
}

/**
 * スラッグから安全なドキュメントURLを生成する。
 * 既存ルーティング（/docs/[...slug]）と互換性を保ちつつ、特殊文字を含むパスにも対応。
 */
export function buildDocHref(slug: string): string {
  const safePath = slug
    .split('/')
    .map((segment) =>
      segment
        .replace(/%/g, '%25')
        .replace(/#/g, '%23')
        .replace(/\?/g, '%3F')
    )
    .join('/');
  return `/docs/${safePath}`;
}

function categorySortRank(cat: DocCategory): number {
  if (cat.isHidden) return 3;
  if (cat.isOther) return 2;
  if (cat.prefix !== null) return 0;
  return 1;
}

/**
 * Markdown ファイルパス一覧から、表示・ソート済みのカテゴリ構造を構築する。
 */
export function buildDocCategories(
  files: string[],
  contentDir = ''
): DocCategory[] {
  const normalizedDir = contentDir.replace(/^\/+|\/+$/g, '');
  const dirPrefix = normalizedDir ? `${normalizedDir}/` : '';

  const categoryMap = new Map<string, DocCategory>();

  for (const filePath of files) {
    const cleanPath = filePath.replace(/^\/+/, '');
    const relPath =
      dirPrefix && cleanPath.startsWith(dirPrefix)
        ? cleanPath.slice(dirPrefix.length)
        : cleanPath;

    const extMatch = relPath.match(/\.(mdx?)$/i);
    const extension: 'md' | 'mdx' =
      extMatch && extMatch[1].toLowerCase() === 'mdx' ? 'mdx' : 'md';
    const slug = relPath.replace(/\.mdx?$/i, '');

    if (!slug.trim()) continue;

    const parts = slug.split('/').filter((segment) => segment.length > 0);
    if (parts.length === 0) continue;

    const hasDir = parts.length > 1;
    const rawDir = hasDir ? parts[0] : '';
    const categoryId = hasDir ? rawDir : OTHER_CATEGORY_ID;
    const parsed = parseCategoryName(rawDir);

    const title = parts[parts.length - 1];
    const subParts = hasDir ? parts.slice(1, -1) : [];
    const subPath = subParts.length > 0 ? subParts.join(' / ') : null;

    let category = categoryMap.get(categoryId);
    if (!category) {
      category = {
        id: categoryId,
        rawDir,
        prefix: parsed.prefix,
        label: parsed.label,
        isOther: parsed.isOther,
        isHidden: parsed.isHidden,
        items: [],
      };
      categoryMap.set(categoryId, category);
    }

    category.items.push({
      slug,
      href: buildDocHref(slug),
      title,
      subPath,
      categoryId,
      categoryLabel: parsed.label,
      extension,
    });
  }

  const categories = Array.from(categoryMap.values());

  // カテゴリ内の記事を自然順でソート
  for (const category of categories) {
    category.items.sort((a, b) => {
      const subCompare = (a.subPath ?? '').localeCompare(
        b.subPath ?? '',
        'ja',
        { numeric: true }
      );
      if (subCompare !== 0) return subCompare;
      return a.title.localeCompare(b.title, 'ja', { numeric: true });
    });
  }

  // カテゴリ自体をソート（番号付き -> 通常 -> その他 -> 隠しフォルダ）
  categories.sort((a, b) => {
    const rankDiff = categorySortRank(a) - categorySortRank(b);
    if (rankDiff !== 0) return rankDiff;

    if (a.prefix !== null && b.prefix !== null) {
      const numDiff = Number(a.prefix) - Number(b.prefix);
      if (numDiff !== 0) return numDiff;
    }

    return a.rawDir.localeCompare(b.rawDir, 'ja', { numeric: true });
  });

  return categories;
}

/**
 * クエリ文字列を検索トークン配列に正規化する（全角スペース対応・小文字化）。
 */
export function tokenizeQuery(query: string): string[] {
  return query
    .trim()
    .toLowerCase()
    .split(/[\s\u3000]+/)
    .filter(Boolean);
}

/**
 * キーワード（複数語 AND 検索）とカテゴリ選択で記事を絞り込む。
 */
export function filterDocCategories(
  categories: DocCategory[],
  query: string,
  selectedCategoryId: string | null
): DocCategory[] {
  const tokens = tokenizeQuery(query);

  return categories
    .filter((cat) =>
      selectedCategoryId === null ? true : cat.id === selectedCategoryId
    )
    .map((cat) => {
      if (tokens.length === 0) return cat;

      const filteredItems = cat.items.filter((item) => {
        const haystack = [
          item.title,
          item.subPath ?? '',
          cat.label,
          cat.rawDir,
          cat.prefix ?? '',
        ]
          .join(' ')
          .toLowerCase();

        return tokens.every((token) => haystack.includes(token));
      });

      return {
        ...cat,
        items: filteredItems,
      };
    })
    .filter((cat) => cat.items.length > 0);
}

export interface HighlightSegment {
  text: string;
  highlighted: boolean;
}

/**
 * 検索クエリに一致する部分文字列をハイライト用セグメントに分割する。
 */
export function splitHighlightSegments(
  text: string,
  query: string
): HighlightSegment[] {
  const tokens = tokenizeQuery(query);
  if (tokens.length === 0 || !text) {
    return [{ text, highlighted: false }];
  }

  // 長いトークン優先で正規表現を構築
  const escaped = Array.from(new Set(tokens))
    .sort((a, b) => b.length - a.length)
    .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));

  const pattern = new RegExp(`(${escaped.join('|')})`, 'gi');
  const parts = text.split(pattern);

  const segments: HighlightSegment[] = [];
  for (const part of parts) {
    if (!part) continue;
    const isMatch = tokens.some((t) => part.toLowerCase() === t);
    segments.push({ text: part, highlighted: isMatch });
  }

  return segments.length > 0 ? segments : [{ text, highlighted: false }];
}

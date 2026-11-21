'use client';

import Link from 'next/link';
import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import {
  type DocCategory,
  type DocItem,
  filterDocCategories,
  splitHighlightSegments,
  tokenizeQuery,
} from '@/lib/docsIndex';

type ViewMode = 'grid' | 'list';

const CATEGORY_EVENT = 'docs-category-change';

function subscribeCategory(callback: () => void) {
  window.addEventListener('popstate', callback);
  window.addEventListener(CATEGORY_EVENT, callback);
  return () => {
    window.removeEventListener('popstate', callback);
    window.removeEventListener(CATEGORY_EVENT, callback);
  };
}

function getCategorySnapshot(): string | null {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  return params.get('category');
}

function getServerCategorySnapshot(): string | null {
  return null;
}

function updateCategoryUrl(categoryId: string | null) {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  if (categoryId) {
    url.searchParams.set('category', categoryId);
  } else {
    url.searchParams.delete('category');
  }
  const nextUrl = `${url.pathname}${url.search}${url.hash}`;
  window.history.replaceState(null, '', nextUrl);
  window.dispatchEvent(new Event(CATEGORY_EVENT));
}

function formatIndex(index: number): string {
  return String(index + 1).padStart(2, '0');
}

function HighlightedText({ text, query }: { text: string; query: string }) {
  const segments = useMemo(
    () => splitHighlightSegments(text, query),
    [text, query]
  );

  return (
    <>
      {segments.map((segment, idx) =>
        segment.highlighted ? (
          <mark key={idx} className="docs-mark font-semibold">
            {segment.text}
          </mark>
        ) : (
          <Fragment key={idx}>{segment.text}</Fragment>
        )
      )}
    </>
  );
}

function DocGridCard({
  item,
  index,
  query,
}: {
  item: DocItem;
  index: number;
  query: string;
}) {
  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLAnchorElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      e.currentTarget.style.setProperty('--mx', `${e.clientX - rect.left}px`);
      e.currentTarget.style.setProperty('--my', `${e.clientY - rect.top}px`);
    },
    []
  );

  return (
    <Link
      href={item.href}
      aria-label={item.subPath ? `${item.title} (${item.subPath})` : item.title}
      onPointerMove={handlePointerMove}
      className="docs-card group flex flex-col justify-start h-full rounded-2xl px-5 py-4.5 sm:px-5 sm:py-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
    >
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-mono text-[11px] font-medium tabular-nums text-[var(--article-muted)] group-hover:text-[var(--accent)] transition-colors">
            {formatIndex(index)}
          </span>
          {item.subPath && (
            <>
              <span
                aria-hidden="true"
                className="text-[var(--article-border)] select-none"
              >
                /
              </span>
              <span className="text-[11px] text-[var(--article-muted)] truncate">
                <HighlightedText text={item.subPath} query={query} />
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {item.extension === 'mdx' && (
            <span className="font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-[var(--docs-pill-bg)] text-[10px] text-[var(--article-muted)]">
              MDX
            </span>
          )}
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="w-4 h-4 text-[var(--article-muted)] opacity-55 group-hover:opacity-100 group-hover:text-[var(--accent)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200"
          >
            <path d="M7 17 17 7" />
            <path d="M8 7h9v9" />
          </svg>
        </div>
      </div>

      <h3 className="docs-title text-[14.5px] sm:text-[15px] font-semibold leading-[1.58] tracking-[-0.005em] text-[var(--article-heading)] group-hover:text-[var(--accent)] transition-colors duration-200">
        <HighlightedText text={item.title} query={query} />
      </h3>
    </Link>
  );
}

function DocListRow({
  item,
  index,
  query,
}: {
  item: DocItem;
  index: number;
  query: string;
}) {
  return (
    <Link
      href={item.href}
      aria-label={item.subPath ? `${item.title} (${item.subPath})` : item.title}
      className="docs-list-row group flex items-center justify-between gap-3 sm:gap-4 px-4 sm:px-5 py-3.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--accent)]"
    >
      <div className="flex items-baseline gap-3 sm:gap-4 min-w-0">
        <span className="w-6 shrink-0 font-mono text-xs tabular-nums text-[var(--article-muted)] group-hover:text-[var(--accent)] transition-colors">
          {formatIndex(index)}
        </span>
        <div className="min-w-0 flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
          <h3 className="docs-title text-[14.5px] sm:text-[15px] font-medium leading-snug text-[var(--article-heading)] group-hover:text-[var(--accent)] transition-colors">
            <HighlightedText text={item.title} query={query} />
          </h3>
          {item.subPath && (
            <span className="text-[11px] text-[var(--article-muted)] truncate">
              <HighlightedText text={item.subPath} query={query} />
            </span>
          )}
        </div>
      </div>

      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="w-4 h-4 shrink-0 text-[var(--article-muted)] opacity-45 group-hover:opacity-100 group-hover:text-[var(--accent)] group-hover:translate-x-1 transition-all duration-200"
      >
        <path d="M5 12h14" />
        <path d="m13 6 6 6-6 6" />
      </svg>
    </Link>
  );
}

export default function DocsExplorer({
  categories,
}: {
  categories: DocCategory[];
}) {
  const [query, setQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const rawSelectedCategory = useSyncExternalStore(
    subscribeCategory,
    getCategorySnapshot,
    getServerCategorySnapshot
  );

  // URL に存在しないカテゴリIDが入っていても安全にフォールバック
  const selectedCategoryId = useMemo(() => {
    if (!rawSelectedCategory) return null;
    const match = categories.find(
      (cat) =>
        cat.id === rawSelectedCategory ||
        cat.rawDir === rawSelectedCategory ||
        cat.label === rawSelectedCategory
    );
    return match ? match.id : null;
  }, [categories, rawSelectedCategory]);

  const selectCategory = useCallback((categoryId: string | null) => {
    updateCategoryUrl(categoryId);
    if (
      typeof window !== 'undefined' &&
      window.scrollY > 220 &&
      typeof window.scrollTo === 'function'
    ) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const totalArticles = useMemo(
    () => categories.reduce((sum, cat) => sum + cat.items.length, 0),
    [categories]
  );

  const hasQuery = tokenizeQuery(query).length > 0;

  // クエリ適用時のカテゴリ別ヒット件数（ナビのバッジ動的表示用）
  const categoryHitCountMap = useMemo(() => {
    const matchedAll = filterDocCategories(categories, query, null);
    const map = new Map<string, number>();
    for (const cat of matchedAll) {
      map.set(cat.id, cat.items.length);
    }
    return map;
  }, [categories, query]);

  const totalQueryHits = useMemo(() => {
    let sum = 0;
    categoryHitCountMap.forEach((count) => {
      sum += count;
    });
    return sum;
  }, [categoryHitCountMap]);

  const filteredCategories = useMemo(
    () => filterDocCategories(categories, query, selectedCategoryId),
    [categories, query, selectedCategoryId]
  );

  const visibleArticleCount = useMemo(
    () => filteredCategories.reduce((sum, cat) => sum + cat.items.length, 0),
    [filteredCategories]
  );

  const selectedCategory = useMemo(
    () =>
      selectedCategoryId
        ? categories.find((c) => c.id === selectedCategoryId) ?? null
        : null,
    [categories, selectedCategoryId]
  );

  const showCategoryNav = categories.length > 1;

  // "/" で検索フォーカスショートカット
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        e.key !== '/' ||
        e.metaKey ||
        e.ctrlKey ||
        e.altKey ||
        e.shiftKey
      ) {
        return;
      }
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }
      e.preventDefault();
      searchInputRef.current?.focus();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // トップへ戻るボタンの表示制御
  useEffect(() => {
    const onScroll = () => {
      setShowScrollTop(window.scrollY > 420);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleResetFilters = useCallback(() => {
    setQuery('');
    selectCategory(null);
    searchInputRef.current?.focus();
  }, [selectCategory]);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <main className="docs-page flex-1 min-h-screen sm:-mt-[92px] sm:pt-[92px] transition-colors duration-300">
      <div className="max-w-[1220px] mx-auto px-4 sm:px-6 pt-7 pb-16 sm:pt-10 sm:pb-24">
        {/* ============================================================
            Masthead — ページヘッダー
           ============================================================ */}
        <header className="pb-6 sm:pb-8 mb-6 sm:mb-8 border-b border-[var(--article-border)]">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold tracking-[0.26em] uppercase text-accent mb-2">
                Documentation
              </p>
              <h1 className="text-2xl sm:text-[2.15rem] font-bold tracking-tight leading-tight text-[var(--article-heading)]">
                ドキュメント一覧
              </h1>
              <p className="mt-2 text-sm sm:text-[15px] text-[var(--article-muted)] leading-relaxed max-w-2xl">
                カテゴリやキーワードから、読みたい記事をすばやく見つけられます。
              </p>
            </div>

            <div
              className="flex items-center gap-5 shrink-0 text-[var(--article-muted)]"
              aria-label={`全${totalArticles}記事、${categories.length}カテゴリ`}
            >
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl sm:text-2xl font-bold tabular-nums tracking-tight text-[var(--article-heading)]">
                  {totalArticles}
                </span>
                <span className="text-xs font-medium">記事</span>
              </div>
              <span
                aria-hidden="true"
                className="h-5 w-px bg-[var(--article-border)]"
              />
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl sm:text-2xl font-bold tabular-nums tracking-tight text-[var(--article-heading)]">
                  {categories.length}
                </span>
                <span className="text-xs font-medium">カテゴリ</span>
              </div>
            </div>
          </div>
        </header>

        {/* ============================================================
            モバイル / タブレット向け 横スクロール カテゴリフィルター
           ============================================================ */}
        {showCategoryNav && (
          <nav
            aria-label="カテゴリ絞り込み"
            className="lg:hidden -mx-4 px-4 mb-5 overflow-x-auto no-scrollbar docs-pill-scroll"
          >
            <div className="flex items-center gap-2 w-max pb-0.5 pr-8">
              <button
                type="button"
                onClick={() => selectCategory(null)}
                aria-pressed={selectedCategoryId === null}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                  selectedCategoryId === null
                    ? 'docs-chapter-badge font-semibold'
                    : 'bg-[var(--docs-pill-bg)] text-[var(--article-muted)] hover:bg-[var(--docs-pill-hover-bg)] hover:text-[var(--article-heading)] border border-transparent'
                }`}
              >
                <span>すべて</span>
                <span className="font-mono text-[11px] tabular-nums opacity-80">
                  {hasQuery ? totalQueryHits : totalArticles}
                </span>
              </button>

              {categories.map((cat) => {
                const isActive = selectedCategoryId === cat.id;
                const count = hasQuery
                  ? categoryHitCountMap.get(cat.id) ?? 0
                  : cat.items.length;
                const isDimmed = hasQuery && count === 0 && !isActive;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => selectCategory(isActive ? null : cat.id)}
                    aria-pressed={isActive}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                      isActive
                        ? 'docs-chapter-badge font-semibold'
                        : 'bg-[var(--docs-pill-bg)] text-[var(--article-muted)] hover:bg-[var(--docs-pill-hover-bg)] hover:text-[var(--article-heading)] border border-transparent'
                    } ${isDimmed ? 'opacity-45' : ''}`}
                  >
                    {cat.prefix && (
                      <span className="font-mono text-[11px] tabular-nums opacity-80">
                        {cat.prefix}
                      </span>
                    )}
                    <span>{cat.label}</span>
                    <span className="font-mono text-[11px] tabular-nums opacity-75">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </nav>
        )}

        {/* ============================================================
            メインワークスペース（左: スティッキーカテゴリナビ / 右: 記事一覧）
           ============================================================ */}
        <div className="flex flex-col lg:flex-row items-start gap-7 lg:gap-8">
          {showCategoryNav && (
            <aside className="hidden lg:block w-72 shrink-0 sticky top-24">
              <nav
                aria-label="カテゴリ一覧"
                className="docs-sidebar rounded-2xl p-3 max-h-[calc(100vh-7.5rem)] overflow-y-auto"
              >
                <p className="px-2.5 pt-1 pb-2.5 text-[11px] font-semibold tracking-[0.2em] uppercase text-[var(--article-muted)]">
                  Categories
                </p>

                <button
                  type="button"
                  onClick={() => selectCategory(null)}
                  aria-current={
                    selectedCategoryId === null ? 'true' : undefined
                  }
                  className={`relative w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-left text-[13px] transition-all cursor-pointer ${
                    selectedCategoryId === null
                      ? 'bg-[var(--docs-accent-bg)] text-[var(--article-heading)] font-semibold'
                      : 'text-[var(--article-muted)] hover:bg-[var(--docs-pill-bg)] hover:text-[var(--article-heading)]'
                  }`}
                >
                  {selectedCategoryId === null && (
                    <span
                      aria-hidden="true"
                      className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full bg-[var(--accent)]"
                    />
                  )}
                  <span className="truncate">すべての記事</span>
                  <span
                    className={`font-mono text-[11px] tabular-nums px-1.5 py-0.5 rounded-md ${
                      selectedCategoryId === null
                        ? 'text-[var(--accent)] font-semibold'
                        : 'text-[var(--article-muted)]'
                    }`}
                  >
                    {hasQuery ? totalQueryHits : totalArticles}
                  </span>
                </button>

                <div className="my-2.5 h-px bg-[var(--article-border)]" />

                <ul className="space-y-0.5">
                  {categories.map((cat) => {
                    const isActive = selectedCategoryId === cat.id;
                    const count = hasQuery
                      ? categoryHitCountMap.get(cat.id) ?? 0
                      : cat.items.length;
                    const isDimmed = hasQuery && count === 0 && !isActive;

                    return (
                      <li key={cat.id}>
                        <button
                          type="button"
                          onClick={() =>
                            selectCategory(isActive ? null : cat.id)
                          }
                          aria-current={isActive ? 'true' : undefined}
                          title={cat.label}
                          className={`relative w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-left text-[13px] transition-all cursor-pointer ${
                            isActive
                              ? 'bg-[var(--docs-accent-bg)] text-[var(--article-heading)] font-semibold'
                              : 'text-[var(--article-muted)] hover:bg-[var(--docs-pill-bg)] hover:text-[var(--article-heading)]'
                          } ${isDimmed ? 'opacity-40' : ''}`}
                        >
                          {isActive && (
                            <span
                              aria-hidden="true"
                              className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full bg-[var(--accent)]"
                            />
                          )}
                          <span className="flex items-center gap-2 min-w-0">
                            {cat.prefix ? (
                              <span
                                className={`font-mono text-[11px] tabular-nums shrink-0 ${
                                  isActive
                                    ? 'text-[var(--accent)] font-semibold'
                                    : 'text-[var(--article-muted)]'
                                }`}
                              >
                                {cat.prefix}
                              </span>
                            ) : (
                              <span
                                aria-hidden="true"
                                className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                  isActive
                                    ? 'bg-[var(--accent)]'
                                    : 'bg-[var(--article-muted)]/55'
                                }`}
                              />
                            )}
                            <span className="truncate">{cat.label}</span>
                          </span>
                          <span
                            className={`font-mono text-[11px] tabular-nums shrink-0 ${
                              isActive
                                ? 'text-[var(--accent)] font-semibold'
                                : 'opacity-85'
                            }`}
                          >
                            {count}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </aside>
          )}

          {/* 右側メイン領域 */}
          <div className="w-full flex-1 min-w-0">
            {/* 検索 + ビュー切替ツールバー */}
            <div className="flex items-center gap-2.5 sm:gap-3 mb-6">
              <div className="relative flex-1" role="search">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--article-muted)]"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.5-3.5" />
                </svg>

                <input
                  id="docs-search-input"
                  ref={searchInputRef}
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      if (query) {
                        setQuery('');
                      } else {
                        e.currentTarget.blur();
                      }
                    }
                  }}
                  placeholder="記事・カテゴリを検索..."
                  aria-label="記事を検索"
                  className="docs-search-input w-full pl-10 pr-10 py-2.5 sm:py-3 rounded-xl text-sm [&::-webkit-search-cancel-button]:hidden"
                />

                {query ? (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery('');
                      searchInputRef.current?.focus();
                    }}
                    aria-label="検索キーワードをクリア"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-[var(--article-muted)] hover:text-[var(--article-heading)] hover:bg-[var(--docs-pill-bg)] transition-colors cursor-pointer"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                      className="w-3.5 h-3.5"
                    >
                      <path d="M18 6 6 18" />
                      <path d="m6 6 12 12" />
                    </svg>
                  </button>
                ) : (
                  <kbd
                    aria-hidden="true"
                    className="hidden sm:inline-flex items-center justify-center pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[11px] font-mono text-[var(--article-muted)] bg-[var(--docs-pill-bg)] border border-[var(--article-border)] rounded"
                  >
                    /
                  </kbd>
                )}
              </div>

              {/* グリッド / リスト切替 */}
              <div
                className="docs-segment inline-flex items-center p-1 rounded-xl shrink-0"
                role="group"
                aria-label="表示形式の切り替え"
              >
                <button
                  id="docs-view-grid"
                  type="button"
                  onClick={() => setViewMode('grid')}
                  aria-pressed={viewMode === 'grid'}
                  aria-label="グリッド表示"
                  title="グリッド表示"
                  className={`p-2 rounded-lg transition-all cursor-pointer ${
                    viewMode === 'grid'
                      ? 'bg-[var(--docs-accent-bg)] text-[var(--accent)]'
                      : 'text-[var(--article-muted)] hover:text-[var(--article-heading)]'
                  }`}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    className="w-4 h-4"
                  >
                    <rect x="3" y="3" width="7" height="7" rx="1.5" />
                    <rect x="14" y="3" width="7" height="7" rx="1.5" />
                    <rect x="3" y="14" width="7" height="7" rx="1.5" />
                    <rect x="14" y="14" width="7" height="7" rx="1.5" />
                  </svg>
                </button>
                <button
                  id="docs-view-list"
                  type="button"
                  onClick={() => setViewMode('list')}
                  aria-pressed={viewMode === 'list'}
                  aria-label="リスト表示"
                  title="リスト表示"
                  className={`p-2 rounded-lg transition-all cursor-pointer ${
                    viewMode === 'list'
                      ? 'bg-[var(--docs-accent-bg)] text-[var(--accent)]'
                      : 'text-[var(--article-muted)] hover:text-[var(--article-heading)]'
                  }`}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    className="w-4 h-4"
                  >
                    <line x1="8" y1="6" x2="21" y2="6" />
                    <line x1="8" y1="12" x2="21" y2="12" />
                    <line x1="8" y1="18" x2="21" y2="18" />
                    <line x1="3" y1="6" x2="3.01" y2="6" />
                    <line x1="3" y1="12" x2="3.01" y2="12" />
                    <line x1="3" y1="18" x2="3.01" y2="18" />
                  </svg>
                </button>
              </div>
            </div>

            {/* アクティブなフィルタ条件ステータス */}
            {(hasQuery || selectedCategory) && (
              <div
                aria-live="polite"
                className="flex flex-wrap items-center justify-between gap-2 mb-6 px-3.5 py-2.5 rounded-xl bg-[var(--docs-pill-bg)] border border-[var(--article-border)] text-xs text-[var(--article-muted)]"
              >
                <p className="flex flex-wrap items-center gap-1.5">
                  {selectedCategory && (
                    <span className="inline-flex items-center gap-1 font-medium text-[var(--article-heading)]">
                      {selectedCategory.prefix && (
                        <span className="font-mono text-[11px] text-[var(--accent)]">
                          {selectedCategory.prefix}
                        </span>
                      )}
                      <span>{selectedCategory.label}</span>
                    </span>
                  )}
                  {selectedCategory && hasQuery && (
                    <span aria-hidden="true">/</span>
                  )}
                  {hasQuery && (
                    <span>
                      「
                      <span className="font-medium text-[var(--article-heading)]">
                        {query.trim()}
                      </span>
                      」の検索結果
                    </span>
                  )}
                  <span className="font-mono tabular-nums font-semibold text-[var(--accent)] ml-1">
                    {visibleArticleCount} 件
                  </span>
                </p>

                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-xs font-medium text-[var(--accent)] hover:underline cursor-pointer"
                >
                  フィルタを解除
                </button>
              </div>
            )}

            {/* ============================================================
                記事一覧本体 or Empty State
               ============================================================ */}
            {filteredCategories.length === 0 ? (
              <div className="docs-list-surface rounded-2xl px-6 py-16 text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-[var(--docs-accent-bg)] border border-[var(--docs-accent-border)] flex items-center justify-center text-[var(--accent)]">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    className="w-5 h-5"
                  >
                    <circle cx="11" cy="11" r="7" />
                    <path d="m20 20-3.5-3.5" />
                    <path d="M8.5 11h5" />
                  </svg>
                </div>

                {totalArticles === 0 ? (
                  <>
                    <h2 className="text-base font-semibold text-[var(--article-heading)] mb-1.5">
                      ドキュメントがまだありません
                    </h2>
                    <p className="text-sm text-[var(--article-muted)]">
                      Markdown ファイルが追加されると、ここに一覧が表示されます。
                    </p>
                  </>
                ) : (
                  <>
                    <h2 className="text-base font-semibold text-[var(--article-heading)] mb-1.5">
                      一致する記事が見つかりませんでした
                    </h2>
                    <p className="text-sm text-[var(--article-muted)] mb-5 max-w-md mx-auto leading-relaxed">
                      別のキーワードを試すか、カテゴリ絞り込みを解除してすべての記事から探してみてください。
                    </p>
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold docs-chapter-badge hover:brightness-110 transition-all cursor-pointer"
                    >
                      <span>すべての記事を表示</span>
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-10 sm:space-y-12">
                {filteredCategories.map((category) => (
                  <section
                    key={category.id}
                    aria-labelledby={`category-heading-${category.id}`}
                  >
                    {/* カテゴリ見出し */}
                    <div className="flex items-center justify-between gap-3 pb-3 mb-4 border-b border-[var(--article-border)]">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {category.prefix ? (
                          <span className="docs-chapter-badge inline-flex items-center justify-center px-2 py-0.5 rounded-md font-mono text-xs font-semibold tabular-nums shrink-0">
                            {category.prefix}
                          </span>
                        ) : (
                          <span
                            aria-hidden="true"
                            className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-[var(--docs-pill-bg)] text-[var(--article-muted)] shrink-0"
                          >
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="w-3.5 h-3.5"
                            >
                              <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
                            </svg>
                          </span>
                        )}

                        <h2
                          id={`category-heading-${category.id}`}
                          className="text-base sm:text-lg font-bold tracking-tight text-[var(--article-heading)] truncate"
                        >
                          <HighlightedText
                            text={category.label}
                            query={query}
                          />
                        </h2>
                      </div>

                      <span className="text-xs font-mono tabular-nums text-[var(--article-muted)] shrink-0">
                        {category.items.length} 記事
                      </span>
                    </div>

                    {/* グリッド表示 / リスト表示 */}
                    {viewMode === 'grid' ? (
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                        {category.items.map((item, idx) => (
                          <li key={item.slug} className="h-full">
                            <DocGridCard
                              item={item}
                              index={idx}
                              query={query}
                            />
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <ul className="docs-list-surface rounded-2xl overflow-hidden divide-y divide-[var(--article-border)]">
                        {category.items.map((item, idx) => (
                          <li key={item.slug}>
                            <DocListRow
                              item={item}
                              index={idx}
                              query={query}
                            />
                          </li>
                        ))}
                      </ul>
                    )}
                  </section>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ページトップへ戻るボタン */}
      <button
        type="button"
        onClick={scrollToTop}
        aria-label="ページの先頭へ戻る"
        className={`fixed bottom-6 right-5 sm:right-8 z-40 w-10 h-10 rounded-full docs-sidebar inline-flex items-center justify-center text-[var(--article-muted)] hover:text-[var(--accent)] hover:border-[var(--docs-surface-border-hover)] transition-all duration-300 cursor-pointer ${
          showScrollTop
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 translate-y-3 pointer-events-none'
        }`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className="w-4 h-4"
        >
          <path d="m18 15-6-6-6 6" />
        </svg>
      </button>
    </main>
  );
}

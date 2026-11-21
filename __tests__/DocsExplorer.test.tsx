import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import DocsExplorer from '@/components/DocsExplorer';
import {
  OTHER_CATEGORY_ID,
  buildDocCategories,
  filterDocCategories,
  parseCategoryName,
  splitHighlightSegments,
} from '@/lib/docsIndex';

describe('docsIndex utilities', () => {
  describe('parseCategoryName', () => {
    it('extracts numeric prefix and label from numbered directories', () => {
      expect(parseCategoryName('01_コミュニケーション')).toEqual({
        prefix: '01',
        label: 'コミュニケーション',
        isOther: false,
        isHidden: false,
      });
      expect(parseCategoryName('02-scalability')).toEqual({
        prefix: '02',
        label: 'scalability',
        isOther: false,
        isHidden: false,
      });
    });

    it('keeps 4-digit year prefixes intact', () => {
      expect(parseCategoryName('2026_notes')).toEqual({
        prefix: null,
        label: '2026_notes',
        isOther: false,
        isHidden: false,
      });
    });

    it('maps empty directory to その他', () => {
      expect(parseCategoryName('')).toEqual({
        prefix: null,
        label: 'その他',
        isOther: true,
        isHidden: false,
      });
    });

    it('marks dot-prefixed directories as hidden', () => {
      expect(parseCategoryName('.claude')).toEqual({
        prefix: null,
        label: '.claude',
        isOther: false,
        isHidden: true,
      });
    });
  });

  describe('buildDocCategories', () => {
    it('groups, cleans, and orders categories naturally', () => {
      const files = [
        'docs/.claude/agents/writer.md',
        'docs/進捗管理.md',
        'docs/10_発展/高度な設計.md',
        'docs/02_スケーラビリティ/オートスケール.md',
        'docs/01_コミュニケーション/リアルタイム双方向通信(WebSocket).md',
        'docs/guides/getting-started/install.mdx',
      ];

      const categories = buildDocCategories(files, 'docs');
      expect(categories.map((c) => c.id)).toEqual([
        '01_コミュニケーション',
        '02_スケーラビリティ',
        '10_発展',
        'guides',
        OTHER_CATEGORY_ID,
        '.claude',
      ]);

      const guideItem = categories.find((c) => c.id === 'guides')?.items[0];
      expect(guideItem).toMatchObject({
        title: 'install',
        subPath: 'getting-started',
        extension: 'mdx',
        href: '/docs/guides/getting-started/install',
      });
    });
  });

  describe('filterDocCategories and splitHighlightSegments', () => {
    const categories = buildDocCategories([
      '01_コミュニケーション/リアルタイム双方向通信(WebSocket).md',
      '01_コミュニケーション/Pub・Subで複数のサービスにメッセージ配信.md',
      '03_パフォーマンス/キャッシュを使ったパフォーマンスを向上.md',
    ]);

    it('supports multi-token AND search including full-width spaces', () => {
      const result = filterDocCategories(
        categories,
        'websocket　双方向',
        null
      );
      expect(result).toHaveLength(1);
      expect(result[0].items).toHaveLength(1);
      expect(result[0].items[0].title).toBe(
        'リアルタイム双方向通信(WebSocket)'
      );
    });

    it('safely splits highlight segments with regex metacharacters', () => {
      const segments = splitHighlightSegments(
        'リアルタイム双方向通信(WebSocket)',
        '(WebSocket)'
      );
      expect(segments).toEqual([
        { text: 'リアルタイム双方向通信', highlighted: false },
        { text: '(WebSocket)', highlighted: true },
      ]);
    });
  });
});

describe('DocsExplorer component', () => {
  const sampleCategories = buildDocCategories([
    '01_コミュニケーション/リアルタイム双方向通信(WebSocket).md',
    '01_コミュニケーション/Pub・Subで複数のサービスにメッセージ配信.md',
    '02_スケーラビリティ/オートスケール.md',
    '08_応用問題/Dropboxの設計.md',
  ]);

  beforeEach(() => {
    window.history.replaceState(null, '', '/docs');
  });

  it('renders masthead summary, categories, and article links', () => {
    render(<DocsExplorer categories={sampleCategories} />);

    expect(
      screen.getByRole('heading', { level: 1, name: 'ドキュメント一覧' })
    ).toBeInTheDocument();
    expect(screen.getByLabelText('全4記事、3カテゴリ')).toBeInTheDocument();

    const wsLink = screen.getByRole('link', {
      name: /リアルタイム双方向通信\(WebSocket\)/,
    });
    expect(wsLink).toHaveAttribute(
      'href',
      '/docs/01_コミュニケーション/リアルタイム双方向通信(WebSocket)'
    );
  });

  it('filters articles by keyword and highlights matches', () => {
    render(<DocsExplorer categories={sampleCategories} />);

    const searchInput = screen.getByRole('searchbox', { name: '記事を検索' });
    fireEvent.change(searchInput, { target: { value: 'Dropbox' } });

    expect(screen.getByRole('link', { name: /Dropboxの設計/ })).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: /オートスケール/ })
    ).not.toBeInTheDocument();

    const mark = document.querySelector('mark.docs-mark');
    expect(mark).toHaveTextContent('Dropbox');
  });

  it('shows empty state when no articles match and resets filters on button click', () => {
    render(<DocsExplorer categories={sampleCategories} />);

    const searchInput = screen.getByRole('searchbox', { name: '記事を検索' });
    fireEvent.change(searchInput, { target: { value: '存在しないキーワード' } });

    expect(
      screen.getByText('一致する記事が見つかりませんでした')
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'すべての記事を表示' }));
    expect(searchInput).toHaveValue('');
    expect(screen.getByRole('link', { name: /オートスケール/ })).toBeInTheDocument();
  });

  it('filters by category from sidebar navigation and toggles back', () => {
    render(<DocsExplorer categories={sampleCategories} />);

    const sidebarNav = screen.getByRole('navigation', { name: 'カテゴリ一覧' });
    const scalabilityBtn = within(sidebarNav).getByRole('button', {
      name: /スケーラビリティ/,
    });

    fireEvent.click(scalabilityBtn);

    expect(screen.getByRole('link', { name: /オートスケール/ })).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: /Dropboxの設計/ })
    ).not.toBeInTheDocument();
    expect(window.location.search).toContain('category=');

    // もう一度クリックで解除
    fireEvent.click(scalabilityBtn);
    expect(screen.getByRole('link', { name: /Dropboxの設計/ })).toBeInTheDocument();
  });

  it('reads initial category filter from URL search params', () => {
    window.history.replaceState(
      null,
      '',
      `/docs?category=${encodeURIComponent('08_応用問題')}`
    );

    render(<DocsExplorer categories={sampleCategories} />);

    expect(screen.getByRole('link', { name: /Dropboxの設計/ })).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: /オートスケール/ })
    ).not.toBeInTheDocument();
  });

  it('switches between grid and list views', () => {
    render(<DocsExplorer categories={sampleCategories} />);

    const gridBtn = screen.getByRole('button', { name: 'グリッド表示' });
    const listBtn = screen.getByRole('button', { name: 'リスト表示' });

    expect(gridBtn).toHaveAttribute('aria-pressed', 'true');
    expect(listBtn).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(listBtn);

    expect(gridBtn).toHaveAttribute('aria-pressed', 'false');
    expect(listBtn).toHaveAttribute('aria-pressed', 'true');
    expect(document.querySelector('.docs-list-surface')).toBeInTheDocument();
  });

  it('focuses search input on "/" shortcut and clears on Escape', () => {
    render(<DocsExplorer categories={sampleCategories} />);

    const searchInput = screen.getByRole('searchbox', { name: '記事を検索' });
    fireEvent.keyDown(window, { key: '/' });
    expect(searchInput).toHaveFocus();

    fireEvent.change(searchInput, { target: { value: 'WebSocket' } });
    expect(searchInput).toHaveValue('WebSocket');

    fireEvent.keyDown(searchInput, { key: 'Escape' });
    expect(searchInput).toHaveValue('');
  });
});

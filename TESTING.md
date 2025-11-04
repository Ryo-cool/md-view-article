# Markdownレンダリング - テストドキュメント

## 概要

このドキュメントでは、Markdownレンダリング機能のテスト方針と実装方法について説明します。

## 修正内容

### 1. 太字（Bold）の隣接記号対応

**問題**: `**強調**!!` のように太字の前後に句読点・括弧・絵文字等が隣接すると、レンダリングが崩れる。

**修正**:
- `lib/markdownComponents.tsx`: `strong`コンポーネントに`display: 'inline'`を明示的に設定
- `list-inside`を削除し、`ml-6 pl-1`に変更してリストマーカーと本文を適切に配置

**対応例**:
- `**強調**!!` - 太字の後に感嘆符
- `(**注意**):` - 括弧とコロン
- `**太字**。` - 日本語句点
- `こんにちは**世界**🙂` - 絵文字
- `「**重要**」` - 日本語括弧

### 2. 番号付きリストの修正

**問題**: `1. item` 形式のリストで、番号と本文が改行で分断される。

**修正**:
- `ol`と`ul`コンポーネントから`list-inside`クラスを削除
- `ml-6 pl-1`を使用してマージンとパディングを調整
- `li`コンポーネントに`leading-7`を追加して行の高さを統一

**対応形式**:
```markdown
1. りんご
2. みかん
3. ばなな
```

### 3. CommonMark/GFM準拠の確認

以下の基本機能が正しく動作することを確認:
- 強調（*イタリック*、**太字**）
- リンク（[text](url)）
- インラインコード（`code`）
- コードブロック（```language）
- リスト（順序付き・順序なし）
- 表（GFM tables）
- 引用（> quote）
- 水平線（---）
- 見出し（# H1 ~ ###### H6）

## テスト構成

### ディレクトリ構造

```
/
├── __tests__/
│   ├── MarkdownComponents.test.tsx  # コンポーネント単体テスト
│   └── MarkdownIntegration.test.tsx # 統合テスト
├── __mocks__/
│   ├── mermaid.ts                    # Mermaidのモック
│   └── react-syntax-highlighter.tsx # SyntaxHighlighterのモック
├── components/
│   └── MarkdownRenderer.tsx          # Markdownレンダラー
├── lib/
│   └── markdownComponents.tsx        # カスタムコンポーネント定義
└── jest.config.js                     # Jest設定
```

### テストファイル

#### 1. `__tests__/MarkdownComponents.test.tsx`

カスタムMarkdownコンポーネントの単体テスト。

**テスト内容**:
- 太字コンポーネントのスタイル検証
- リストコンポーネント（ol/ul/li）のクラス検証
- 見出しコンポーネント（h1-h6）のスタイル検証
- その他各種コンポーネント（p, a, code, em, blockquote, table, hr, img）

**実行例**:
```bash
npm test MarkdownComponents
```

#### 2. `__tests__/MarkdownIntegration.test.tsx`

Markdown構文の統合テスト。

**テスト内容**:
- 太字と隣接記号の組み合わせ検証
- 番号付きリストの形式検証
- CommonMark/GFM準拠の検証
- 複雑な混合コンテンツの検証
- エッジケースの検証

**実行例**:
```bash
npm test MarkdownIntegration
```

## テストの実行方法

### 全テスト実行

```bash
npm test
```

### 監視モードで実行

```bash
npm run test:watch
```

### カバレッジ測定

```bash
npm run test:coverage
```

### 特定のテストファイルを実行

```bash
npm test -- MarkdownComponents
npm test -- MarkdownIntegration
```

## テスト結果

```
Test Suites: 2 passed, 2 total
Tests:       41 passed, 41 total
Snapshots:   0 total
Time:        5.713 s
```

**内訳**:
- コンポーネント単体テスト: 14件
- 統合テスト: 27件

## モックの説明

### react-syntax-highlighter のモック

`__mocks__/react-syntax-highlighter.tsx` でSyntaxHighlighterをモック化しています。
これにより、ESモジュールの依存関係の問題を回避し、テストを高速化しています。

### mermaid のモック

`__mocks__/mermaid.ts` でMermaidライブラリをモック化しています。
Mermaidはブラウザ環境を想定しているため、Node.js環境でのテストでモックが必要です。

## 継続的改善

### 今後追加すべきテスト

1. **視覚的回帰テスト**: Storybookやplywrightを使用したスナップショットテスト
2. **パフォーマンステスト**: 大きなMarkdownファイルのレンダリング性能測定
3. **アクセシビリティテスト**: jest-axeを使用したa11yテスト
4. **E2Eテスト**: 実際のブラウザ環境でのレンダリング確認

### リファクタリングの提案

1. **型安全性の向上**: `any`型を具体的な型に置き換え
2. **コンポーネントの分離**: 大きなコンポーネントを小さく分割
3. **スタイルの統一**: Tailwindのユーティリティクラスとインラインスタイルの使い分けを明確化

## トラブルシューティング

### テストが失敗する場合

1. **依存関係の確認**:
   ```bash
   npm install
   ```

2. **キャッシュのクリア**:
   ```bash
   npm test -- --clearCache
   ```

3. **型定義の更新**:
   ```bash
   npm install --save-dev @types/jest @testing-library/jest-dom
   ```

### ビルドエラーが発生する場合

1. **環境変数の設定**: `.env.local`ファイルに必要な環境変数を設定
2. **Google Fontsの問題**: ネットワーク環境によっては一時的にフォントを無効化

## まとめ

このテストスイートにより、Markdownレンダリングの主要な機能と修正内容が回帰しないことを保証します。
テストは継続的に追加・改善し、コードの品質を維持していきます。

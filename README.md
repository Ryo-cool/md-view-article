# Markdown View Article - Next.js SSG

Private Markdown リポジトリ（Mermaid 含む）を GitHub API 経由で取得し、静的サイトとして配信する Next.js プロジェクトです。

## 概要

- **ソース・オブ・トゥルース**: Private の Markdown リポジトリ（Git で管理）
- **公開/配布**: Next.js（SSG）→ Vercel へ自動デプロイ
- **トリガー**: md リポジトリの main ブランチ変更時に Vercel Deploy Hook を呼び出し、自動再ビルド
- **取得方法**: ビルド時に GitHub API + PAT で Markdown をフェッチ
- **Mermaid**: `rehype-mermaid` の `strategy: 'inline-svg'` でビルド時に SVG 化（JS 不要）
- **GitHub Alerts**: `rehype-github-alerts` で GitHub 互換の Note/Warning 等を再現

## 機能

- Markdown/MDX のレンダリング（GFM、見出し、表、コード、Mermaid）
- 階層ディレクトリの静的化（`/docs/foo/bar`）
- 一覧ページと個別ページ
- 変更の自動反映（md リポジトリ → Deploy Hook → 生成 → デプロイ）

## セットアップ

### 1. 環境変数の設定

`.env.local` ファイルを作成し、以下の環境変数を設定してください：

```bash
# GitHub Personal Access Token (PAT)
# 権限: repo (read のみ)
# SSO 必須の組織では SSO Grant を忘れずに付与
GITHUB_TOKEN=ghp_xxxxxxxxx

# Markdown リポジトリの情報
CONTENT_REPO_OWNER=your-org
CONTENT_REPO_NAME=your-md-repo

# コンテンツディレクトリ（ルートの場合は空でも可）
CONTENT_DIR=md

# 対象ブランチ
CONTENT_BRANCH=main
```

### 2. 依存パッケージのインストール

```bash
npm install
```

### 3. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いて確認してください。

- 一覧ページ: [http://localhost:3000/docs](http://localhost:3000/docs)
- 個別ページ: [http://localhost:3000/docs/path/to/page](http://localhost:3000/docs/path/to/page)

## Vercel へのデプロイ

### 1. GitHub リポジトリを Vercel にインポート

1. [Vercel Dashboard](https://vercel.com/dashboard) にアクセス
2. "Add New..." → "Project" を選択
3. GitHub リポジトリを選択してインポート

### 2. 環境変数の設定

Vercel のプロジェクト設定（Settings → Environment Variables）で以下を追加：

- `GITHUB_TOKEN`: Private リポジトリ読み取り用 PAT（repo 権限、SSO Grant 必須なら付与）
- `CONTENT_REPO_OWNER`: md リポジトリのオーナー
- `CONTENT_REPO_NAME`: md リポジトリ名
- `CONTENT_DIR`: コンテンツディレクトリ（例: `md`）
- `CONTENT_BRANCH`: 対象ブランチ（例: `main`）

### 3. デプロイ

初回デプロイは自動で実行されます。以降は、main ブランチへの push または Vercel Deploy Hook の呼び出しで自動デプロイされます。

## md リポジトリ側の設定（参考）

md リポジトリ側で、main ブランチへのマージ時に Vercel Deploy Hook を呼び出す GitHub Actions を設定してください。

### GitHub Actions の例

`.github/workflows/deploy-next.yml`:

```yaml
name: Trigger Next.js Deployment

on:
  push:
    branches:
      - main

jobs:
  trigger-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Vercel Deploy Hook
        run: |
          curl -X POST ${{ secrets.VERCEL_DEPLOY_HOOK_URL }}
        env:
          VERCEL_DEPLOY_HOOK_URL: ${{ secrets.VERCEL_DEPLOY_HOOK_URL }}
```

### Vercel Deploy Hook URL の取得

1. Vercel プロジェクトの Settings → Git → Deploy Hooks
2. "Create Hook" で新しい Hook を作成
3. URL をコピーして、md リポジトリの GitHub Secrets に `VERCEL_DEPLOY_HOOK_URL` として登録

## セキュリティ

- **GITHUB_TOKEN**: 読み取り専用（`repo:read`）で発行し、SSO 必須組織では Grant を付与
- **md リポジトリ**: Deploy Hook URL 以外の秘密情報は持たない
- **Hook URL**: GitHub Secrets で管理し、ログ等に出力しない

## 技術スタック

- **Next.js 15** (App Router, SSG)
- **TypeScript**
- **Tailwind CSS** (@tailwindcss/typography)
- **next-mdx-remote**: MDX レンダリング
- **rehype-mermaid**: Mermaid 図の SVG 化（inline-svg strategy）
- **rehype-github-alerts**: GitHub 互換アラート
- **remark-gfm**: GitHub Flavored Markdown
- **ofetch**: GitHub API クライアント
- **gray-matter**: Frontmatter パース

## ディレクトリ構成

```
/
├── app/
│   ├── docs/
│   │   ├── page.tsx          # 一覧ページ
│   │   └── [...slug]/
│   │       └── page.tsx      # 個別ドキュメントページ
│   ├── layout.tsx
│   └── globals.css           # Alerts/Mermaid スタイル
├── lib/
│   └── content.ts            # GitHub API ユーティリティ
├── .env.local                # 環境変数（gitignore）
└── README.md
```

## 今後の拡張候補

- 複数 md リポジトリ対応: `/[repo]/[...slug]` のセグメント化で容易に拡張
- 全文検索: ビルド時に Lunr/FlexSearch でインデックス生成
- テーマ: ダークモード、パンくず、サイドバー自動生成
- 画像運用: `raw.githubusercontent.com` 経由参照 or 事前コピー
- 差分最適化: Tree 取得・本文取得のキャッシュ/並列化/指数バックオフ

## ライセンス

MIT
